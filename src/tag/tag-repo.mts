import { ChallengeId } from '@/challenge/challenge-schema.mjs';
import { CommonCountSchema } from '@/misc/common-count-schema.mjs';
import { FindManyResultSchema } from '@/misc/find-many-result-schema.mjs';
import { FindManyUrlParams } from '@/misc/find-many-url-params-schema.mjs';
import { PostId } from '@/post/post-schema.mjs';
import { SqlLive } from '@/sql/sql-live.mjs';
import { Model, SqlClient, SqlSchema } from '@effect/sql';
import { Effect, Layer, Option, pipe, Schema } from 'effect';
import { TagNotFound } from './tag-error.mjs';
import { Tag, TagId } from './tag-schema.mjs';
import { TagTarget } from './tag-target-schema.mjs';

const TABLE_NAME = 'tag';

const make = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const repo = yield* Model.makeRepository(Tag, {
    tableName: TABLE_NAME,
    spanPrefix: 'TagRepo',
    idColumn: 'id',
  });

  const findAll = (params: FindManyUrlParams) =>
    Effect.gen(function* () {
      const tags = yield* SqlSchema.findAll({
        Request: FindManyUrlParams,
        Result: Tag,
        execute: (req) =>
          sql`select * from ${sql(TABLE_NAME)} order by name limit ${params.limit} offset ${(params.page - 1) * params.limit}`,
      })(params);
      const { total } = yield* SqlSchema.single({
        Request: FindManyUrlParams,
        Result: CommonCountSchema,
        execute: () => sql`select count(*) as total from ${sql(TABLE_NAME)}`,
      })(params);

      const ResultSchema = FindManyResultSchema(Tag);

      return ResultSchema.make({
        data: tags,
        meta: {
          total,
          page: params.page,
          limit: params.limit,
          isLastPage: params.page * params.limit + tags.length >= total,
        },
      });
    }).pipe(Effect.orDie, Effect.withSpan('TagRepo.findAll'));

  const findManyByIds = (ids: readonly TagId[]) =>
    SqlSchema.findAll({
      Request: Schema.Array(TagId),
      Result: Tag,
      execute: (req) => sql`
SELECT * FROM ${sql(TABLE_NAME)}
WHERE ${sql.in('id', req)};
`,
    })(ids).pipe(Effect.orDie, Effect.withSpan('TagRepo.findManyByIds'));

  const findOne = (name: string) =>
    SqlSchema.findOne({
      Request: Schema.Struct({
        name: Schema.String,
      }),
      Result: Tag,
      execute: (req) => sql`
        SELECT * FROM ${sql(TABLE_NAME)}
        WHERE name = ${req.name}`,
    })({ name }).pipe(Effect.orDie, Effect.withSpan('TagRepo.findOne'));

  const getOrInsert = (payload: typeof Tag.jsonCreate.Type) =>
    SqlSchema.single({
      Request: Tag.jsonCreate,
      Result: Tag,
      execute: (req) => sql`
WITH inserted AS (
  INSERT INTO ${sql(TABLE_NAME)} (name, description)
  VALUES (${req.name}, ${req.description})
  ON CONFLICT (name) DO NOTHING
  RETURNING *
)
SELECT *
FROM inserted

UNION

SELECT *
FROM tag
WHERE name = ${req.name}
LIMIT 1;`,
    })(payload).pipe(Effect.orDie, Effect.withSpan('TagRepo.getOrInsert'));

  const connectTagsToPost = (payload: { postId: PostId; tagIds: TagId[] }) =>
    SqlSchema.findAll({
      Request: Schema.Struct({
        postId: PostId,
        tagIds: Schema.Array(TagId),
      }),
      Result: TagTarget,
      execute: (req) => sql`
WITH conflicted_rows AS (
  SELECT tt.*
  FROM tag_target tt
  JOIN (VALUES
    ${sql.unsafe(req.tagIds.map((tagId) => `('${tagId}'::uuid, '${req.postId}'::uuid)`).join(','))} 
  ) AS new_data(tag_id, post_id)
  ON tt.post_id = new_data.post_id
     AND tt.tag_id = new_data.tag_id
),
inserted_rows AS (
  INSERT INTO tag_target (tag_id, post_id)
  VALUES 
    ${sql.unsafe(req.tagIds.map((tagId) => `('${tagId}'::uuid, '${req.postId}'::uuid)`).join(','))} 
  ON CONFLICT (tag_id, post_id) DO NOTHING
  RETURNING *
)
SELECT * FROM inserted_rows
UNION ALL
SELECT * FROM conflicted_rows;`,
    })(payload).pipe(
      Effect.orDie,
      Effect.withSpan('TagRepo.connectTagsToPost'),
    );

  const getManyOrInsertMany = (names: readonly string[]) =>
    SqlSchema.findAll({
      Request: Schema.Array(Schema.String),
      Result: Tag,
      execute: (req) => sql`
WITH new_tags (name, description) AS (
  VALUES
    ${sql.unsafe(req.map((name) => `('${name}', '')`).join(','))}
),
inserted AS (
  INSERT INTO tag (name, description)
  SELECT name, description
  FROM new_tags
  ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    updated_at = NOW()
  RETURNING *
)
SELECT *
FROM inserted;    
    `,
    })(names).pipe(
      Effect.orDie,
      Effect.withSpan('TagRepo.getManyOrInsertMany'),
    );

  const connectTagsToChallenge = (payload: {
    challengeId: ChallengeId;
    tagIds: TagId[];
  }) =>
    SqlSchema.findAll({
      Request: Schema.Struct({
        challengeId: ChallengeId,
        tagIds: Schema.Array(TagId),
      }),
      Result: TagTarget,
      execute: (req) => sql`
WITH conflicted_rows AS (
  SELECT tt.*
  FROM tag_target tt
  JOIN (VALUES
    ${sql.unsafe(req.tagIds.map((tagId) => `('${tagId}'::uuid, '${req.challengeId}'::uuid)`).join(','))} 
  ) AS new_data(tag_id, challenge_id)
  ON tt.challenge_id = new_data.challenge_id
     AND tt.tag_id = new_data.tag_id
),
inserted_rows AS (
  INSERT INTO tag_target (tag_id, challenge_id)
  VALUES 
    ${sql.unsafe(req.tagIds.map((tagId) => `('${tagId}'::uuid, '${req.challengeId}'::uuid)`).join(','))} 
  ON CONFLICT (tag_id, challenge_id) DO NOTHING
  RETURNING *
)
SELECT * FROM inserted_rows
UNION ALL
SELECT * FROM conflicted_rows;
`,
    })(payload).pipe(
      Effect.orDie,
      Effect.withSpan('TagRepo.connectTagsToChallenge'),
    );

  const with_ = <A, E, R>(
    id: TagId,
    f: (tag: Tag) => Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E | TagNotFound, R> => {
    return pipe(
      repo.findById(id),
      Effect.flatMap(
        Option.match({
          onNone: () =>
            new TagNotFound({
              id,
            }),
          onSome: Effect.succeed,
        }),
      ),
      Effect.flatMap(f),
      sql.withTransaction,
      Effect.catchTag('SqlError', (err) => Effect.die(err)),
    );
  };

  const withName_ = <A, E, R>(
    name: string,
    f: (tag: Tag) => Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E | TagNotFound, R> => {
    return pipe(
      findOne(name),
      Effect.flatMap(
        Option.match({
          onNone: () =>
            new TagNotFound({
              id: TagId.make(''),
            }),
          onSome: Effect.succeed,
        }),
      ),
      Effect.flatMap(f),
      sql.withTransaction,
      Effect.catchTag('SqlError', (err) => Effect.die(err)),
    );
  };

  return {
    ...repo,
    findAll,
    findManyByIds,
    findOne,
    getManyOrInsertMany,
    getOrInsert,
    connectTagsToPost,
    connectTagsToChallenge,
    with: with_,
    withName: withName_,
  } as const;
});

export class TagRepo extends Effect.Tag('TagRepo')<
  TagRepo,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(TagRepo, make);

  static Live = this.layer.pipe(Layer.provide(SqlLive));
}

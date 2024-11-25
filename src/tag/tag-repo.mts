import { Model, SqlClient, SqlSchema } from '@effect/sql';
import { Effect, Layer, Option, pipe, Schema } from 'effect';
import { Tag, TagId } from './tag-schema.mjs';
import { TagNotFound } from './tag-error.mjs';
import { SqlLive } from '@/sql/sql-live.mjs';
import { FindManyUrlParams } from '@/misc/find-many-url-params-schema.mjs';

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
        Result: Schema.Struct({
          total: Schema.Number,
        }),
        execute: () => sql`select count(*) as total from ${sql(TABLE_NAME)}`,
      })(params);

      return {
        data: tags,
        meta: {
          total,
          page: params.page,
          limit: params.limit,
          isLastPage: params.page * params.limit + tags.length >= total,
        },
      };
    }).pipe(Effect.orDie, Effect.withSpan('TagRepo.findAll'));

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
WHERE name = 'tag_name'
LIMIT 1;`,
    })(payload).pipe(Effect.orDie, Effect.withSpan('TagRepo.getOrInsert'));

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
    findOne,
    getOrInsert,
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
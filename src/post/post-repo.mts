import { CommonCountSchema } from '@/misc/common-count-schema.mjs';
import { FindManyResultSchema } from '@/misc/find-many-result-schema.mjs';
import { FindManyUrlParams } from '@/misc/find-many-url-params-schema.mjs';
import { makeTestLayer } from '@/misc/test-layer.mjs';
import { CREATED_AT, DESC } from '@/sql/order-by.mjs';
import { SqlLive } from '@/sql/sql-live.mjs';
import { Model, SqlClient, SqlSchema } from '@effect/sql';
import { Effect, Layer, Option, pipe } from 'effect';
import { PostNotFound } from './post-error.mjs';
import { Post, PostId, PostView } from './post-schema.mjs';

const TABLE_NAME = 'post';
const VIEW_NAME = 'post_like_counts';

const make = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const repo = yield* Model.makeRepository(Post, {
    tableName: TABLE_NAME,
    spanPrefix: 'PostRepo',
    idColumn: 'id',
  });

  const viewRepo = yield* Model.makeRepository(PostView, {
    tableName: VIEW_NAME,
    spanPrefix: 'PostViewRepo',
    idColumn: 'id',
  });

  const findAllWithView = (params: FindManyUrlParams) =>
    Effect.gen(function* () {
      const posts = yield* SqlSchema.findAll({
        Request: FindManyUrlParams,
        Result: PostView,
        execute: () =>
          sql`select * from ${sql(VIEW_NAME)} where ${sql('is_deleted')} = false order by ${sql(CREATED_AT)} ${sql.unsafe(DESC)} limit ${params.limit} offset ${(params.page - 1) * params.limit}`,
      })(params);
      const { total } = yield* SqlSchema.single({
        Request: FindManyUrlParams,
        Result: CommonCountSchema,
        execute: () =>
          sql`select count(*) as total from ${sql(TABLE_NAME)} where ${sql('is_deleted')} = false`,
      })(params);

      const ResultSchema = FindManyResultSchema(PostView);

      const result = ResultSchema.make({
        data: posts,
        meta: {
          total,
          page: params.page,
          limit: params.limit,
          isLastPage: params.page * params.limit + posts.length >= total,
        },
      });

      return result;
    }).pipe(Effect.orDie, Effect.withSpan('PostRepo.findAll'));

  const with_ = <A, E, R>(
    id: PostId,
    f: (post: Post) => Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E | PostNotFound, R> => {
    return pipe(
      repo.findById(id),
      Effect.flatMap(
        Option.match({
          onNone: () => new PostNotFound({ id }),
          onSome: Effect.succeed,
        }),
      ),
      Effect.flatMap(f),
      sql.withTransaction,
      Effect.catchTag('SqlError', (err) => Effect.die(err)),
    );
  };

  const withView_ = <A, E, R>(
    id: PostId,
    f: (post: PostView) => Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E | PostNotFound, R> => {
    return pipe(
      viewRepo.findById(id),
      Effect.flatMap(
        Option.match({
          onNone: () => new PostNotFound({ id }),
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
    viewRepo,
    findAllWithView,
    with: with_,
    withView: withView_,
  } as const;
});

export class PostRepo extends Effect.Tag('PostRepo')<
  PostRepo,
  Effect.Effect.Success<typeof make>
>() {
  static Live = Layer.effect(PostRepo, make).pipe(Layer.provide(SqlLive));
  static Test = makeTestLayer(PostRepo)({});
}

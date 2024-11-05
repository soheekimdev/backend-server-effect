import { Model, SqlClient, SqlSchema } from '@effect/sql';
import { Effect, pipe, Option, Layer, Schema } from 'effect';
import { Post, PostId } from './post-schema.mjs';
import { PostNotFound } from './post-error.mjs';
import { SqlLive } from '@/sql/sql-live.mjs';
import { makeTestLayer } from '@/misc/test-layer.mjs';
import { FindManyUrlParams } from '@/misc/find-many-url-params-schema.mjs';
import { DESC } from '@/sql/order-by.mjs';

const TABLE_NAME = 'post';

const make = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const repo = yield* Model.makeRepository(Post, {
    tableName: TABLE_NAME,
    spanPrefix: 'PostRepo',
    idColumn: 'id',
  });

  const findAll = (params: FindManyUrlParams) =>
    Effect.gen(function* () {
      const posts = yield* SqlSchema.findAll({
        Request: FindManyUrlParams,
        Result: Post,
        execute: () =>
          sql`select * from ${sql(TABLE_NAME)} limit ${params.limit} offset ${params.page * params.limit} created_at ${sql.unsafe(DESC)}`,
      })(params);
      const { total } = yield* SqlSchema.single({
        Request: FindManyUrlParams,
        Result: Schema.Struct({
          total: Schema.Number,
        }),
        execute: () => sql`select count(*) as total from ${sql(TABLE_NAME)}`,
      })(params);

      return {
        data: posts,
        meta: {
          total,
          page: params.page,
          limit: params.limit,
          isLastPage: params.page * params.limit + posts.length >= total,
        },
      };
    });

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

  return {
    ...repo,
    findAll,
    with: with_,
  } as const;
});

export class PostRepo extends Effect.Tag('PostRepo')<
  PostRepo,
  Effect.Effect.Success<typeof make>
>() {
  static Live = Layer.effect(PostRepo, make).pipe(Layer.provide(SqlLive));
  static Test = makeTestLayer(PostRepo)({});
}

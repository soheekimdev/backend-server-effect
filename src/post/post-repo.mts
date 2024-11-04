import { Model, SqlClient } from '@effect/sql';
import { Effect, pipe, Option, Layer } from 'effect';
import { Post, PostId } from './post-schema.mjs';
import { PostNotFound } from './post-error.mjs';
import { SqlLive } from '@/sql/sql-live.mjs';
import { makeTestLayer } from '@/misc/test-layer.mjs';

const make = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const repo = yield* Model.makeRepository(Post, {
    tableName: 'post',
    spanPrefix: 'PostRepo',
    idColumn: 'id',
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

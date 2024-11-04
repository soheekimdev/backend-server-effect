import { Model, SqlClient } from '@effect/sql';
import { Effect, Layer, Option, pipe } from 'effect';
import { makeTestLayer } from '@/misc/test-layer.mjs';
import { SqlLive } from '@/sql/sql-live.mjs';
import { Comment, CommentId } from './comment-schema.mjs';
import { CommentNotFound } from './comment-error.mjs';

const make = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const repo = yield* Model.makeRepository(Comment, {
    tableName: 'comment',
    spanPrefix: 'CommentRepo',
    idColumn: 'id',
  });

  const with_ = <A, E, R>(
    id: CommentId,
    f: (post: Comment) => Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E | CommentNotFound, R> => {
    return pipe(
      repo.findById(id),
      Effect.flatMap(
        Option.match({
          onNone: () => new CommentNotFound({ id }),
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

export class CommentRepo extends Effect.Tag('CommentRepo')<
  CommentRepo,
  Effect.Effect.Success<typeof make>
>() {
  static Live = Layer.effect(CommentRepo, make).pipe(Layer.provide(SqlLive));
  static Test = makeTestLayer(CommentRepo)({});
}

import { Model, SqlClient } from '@effect/sql';
import { Effect, Layer, Option, pipe } from 'effect';
import { makeTestLayer } from '@/misc/test-layer.mjs';
import { SqlLive } from '@/sql/sql-live.mjs';
import { LikeNotFound } from './like-error.mjs';
import { Like, LikeId } from './like-schema.mjs';

const make = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const repo = yield* Model.makeRepository(Like, {
    tableName: 'like',
    spanPrefix: 'LikeRepo',
    idColumn: 'id',
  });

  const with_ = <A, E, R>(
    id: LikeId,
    f: (post: Like) => Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E | LikeNotFound, R> => {
    return pipe(
      repo.findById(id),
      Effect.flatMap(
        Option.match({
          onNone: () => new LikeNotFound({ id }),
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

export class LikeRepo extends Effect.Tag('LikeRepo')<
  LikeRepo,
  Effect.Effect.Success<typeof make>
>() {
  static Live = Layer.effect(LikeRepo, make).pipe(Layer.provide(SqlLive));
  static Test = makeTestLayer(LikeRepo)({});
}

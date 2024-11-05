import { Model, SqlClient } from '@effect/sql';
import { Effect, Layer, Option, pipe } from 'effect';
import { makeTestLayer } from '@/misc/test-layer.mjs';
import { SqlLive } from '@/sql/sql-live.mjs';
import { Challenge, ChallengeId } from './challenge-schema.mjs';
import { ChallengeNotFound } from './challenge-error.mjs';
const make = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const repo = yield* Model.makeRepository(Challenge, {
    tableName: 'challenge',
    spanPrefix: 'ChallengeRepo',
    idColumn: 'id',
  });

  const with_ = <A, E, R>(
    id: ChallengeId,
    f: (post: Challenge) => Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E | ChallengeNotFound, R> => {
    return pipe(
      repo.findById(id),
      Effect.flatMap(
        Option.match({
          onNone: () => new ChallengeNotFound({ id }),
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

export class ChallengeRepo extends Effect.Tag('ChallengeRepo')<
  ChallengeRepo,
  Effect.Effect.Success<typeof make>
>() {
  static Live = Layer.effect(ChallengeRepo, make).pipe(Layer.provide(SqlLive));
  static Test = makeTestLayer(ChallengeRepo)({});
}

import { makeTestLayer } from '@/misc/test-layer.mjs';
import { SqlLive } from '@/sql/sql-live.mjs';
import { Model, SqlClient } from '@effect/sql';
import { Effect, Layer, Option, pipe } from 'effect';
import { ChallengeEventNotFound } from './challenge-event-error.mjs';
import { ChallengeEvent, ChallengeEventId } from './challenge-event-schema.mjs';

const TABLE_NAME = 'challenge_event';

const make = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const repo = yield* Model.makeRepository(ChallengeEvent, {
    tableName: TABLE_NAME,
    spanPrefix: 'ChallengeEventRepo',
    idColumn: 'id',
  });

  const with_ = <A, E, R>(
    id: ChallengeEventId,
    f: (event: ChallengeEvent) => Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E | ChallengeEventNotFound, R> =>
    pipe(
      repo.findById(id),
      Effect.flatMap(
        Option.match({
          onNone: () =>
            new ChallengeEventNotFound({
              id,
              challengeId: null,
              accountId: null,
            }),
          onSome: Effect.succeed,
        }),
      ),
      Effect.flatMap(f),
      sql.withTransaction,
      Effect.catchTag('SqlError', (err) => Effect.die(err)),
    );

  return {
    ...repo,
    with: with_,
  } as const;
});

export class ChallengeEventRepo extends Effect.Tag('ChallengeEventRepo')<
  ChallengeEventRepo,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(ChallengeEventRepo, make);

  static Live = this.layer.pipe(Layer.provide(SqlLive));

  static Test = makeTestLayer(ChallengeEventRepo)({});
}

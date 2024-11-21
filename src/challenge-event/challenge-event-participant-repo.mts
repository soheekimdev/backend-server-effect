import { Model, SqlClient } from '@effect/sql';
import { Option, Effect, Layer, pipe } from 'effect';
import {
  ChallengeEventParticipant,
  ChallengeEventParticipantId,
} from './challenge-event-participant-schema.mjs';
import { makeTestLayer } from '@/misc/test-layer.mjs';
import { ChallengeEventParticipantNotFound } from './challenge-event-participant-error.mjs';

const TABLE_NAME = 'challenge_event_participant';

const make = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const repo = yield* Model.makeRepository(ChallengeEventParticipant, {
    tableName: TABLE_NAME,
    spanPrefix: 'ChallengeEventParticipantRepo',
    idColumn: 'id',
  });

  const with_ = <A, E, R>(
    id: ChallengeEventParticipantId,
    f: (participant: ChallengeEventParticipant) => Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E | ChallengeEventParticipantNotFound, R> =>
    pipe(
      repo.findById(id),
      Effect.flatMap(
        Option.match({
          onNone: () =>
            new ChallengeEventParticipantNotFound({
              id,
              challengeEventId: null,
              accountId: null,
              challengeId: null,
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

export class ChallengeEventParticipantRepo extends Effect.Tag(
  'ChallengeEventParticipantRepo',
)<ChallengeEventParticipantRepo, Effect.Effect.Success<typeof make>>() {
  static layer = Layer.effect(ChallengeEventParticipantRepo, make);

  static Live = this.layer;

  static Test = makeTestLayer(ChallengeEventParticipantRepo)({});
}

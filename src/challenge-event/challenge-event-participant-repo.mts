import { Model, SqlClient, SqlSchema } from '@effect/sql';
import { Option, Effect, Layer, pipe } from 'effect';
import {
  ChallengeEventParticipant,
  ChallengeEventParticipantId,
} from './challenge-event-participant-schema.mjs';
import { makeTestLayer } from '@/misc/test-layer.mjs';
import { ChallengeEventParticipantNotFound } from './challenge-event-participant-error.mjs';
import { SqlLive } from '@/sql/sql-live.mjs';

const TABLE_NAME = 'challenge_event_participant';

const make = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const repo = yield* Model.makeRepository(ChallengeEventParticipant, {
    tableName: TABLE_NAME,
    spanPrefix: 'ChallengeEventParticipantRepo',
    idColumn: 'id',
  });

  const upsert = (participant: typeof ChallengeEventParticipant.insert.Type) =>
    SqlSchema.single({
      Request: ChallengeEventParticipant.insert,
      Result: ChallengeEventParticipant,
      execute: (request) =>
        sql`insert into ${sql(TABLE_NAME)} ${sql.insert(request).returning('*')} on conflict (challenge_event_id, account_id) do update set ${sql.update(request).returning('*')}`,
    })(participant).pipe(
      Effect.orDie,
      Effect.withSpan('ChallengeEventParticipantRepo.upsert'),
    );

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
    upsert,
    with: with_,
  } as const;
});

export class ChallengeEventParticipantRepo extends Effect.Tag(
  'ChallengeEventParticipantRepo',
)<ChallengeEventParticipantRepo, Effect.Effect.Success<typeof make>>() {
  static layer = Layer.effect(ChallengeEventParticipantRepo, make);

  static Live = this.layer.pipe(Layer.provide(SqlLive));

  static Test = makeTestLayer(ChallengeEventParticipantRepo)({});
}

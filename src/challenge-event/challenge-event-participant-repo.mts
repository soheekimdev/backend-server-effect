import { Model, SqlClient, SqlSchema } from '@effect/sql';
import { Option, Effect, Layer, pipe, Schema } from 'effect';
import {
  ChallengeEventParticipant,
  ChallengeEventParticipantId,
} from './challenge-event-participant-schema.mjs';
import { makeTestLayer } from '@/misc/test-layer.mjs';
import { ChallengeEventParticipantNotFound } from './challenge-event-participant-error.mjs';
import { SqlLive } from '@/sql/sql-live.mjs';
import { AccountId } from '@/account/account-schema.mjs';
import { ChallengeEventId } from './challenge-event-schema.mjs';

const TABLE_NAME = 'challenge_event_participant';

const make = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const repo = yield* Model.makeRepository(ChallengeEventParticipant, {
    tableName: TABLE_NAME,
    spanPrefix: 'ChallengeEventParticipantRepo',
    idColumn: 'id',
  });

  const findByTarget = (target: {
    accountId: AccountId;
    challengeEventId: ChallengeEventId;
  }) =>
    SqlSchema.findOne({
      Request: Schema.Struct({
        accountId: Schema.String,
        challengeEventId: Schema.String,
      }),
      Result: ChallengeEventParticipant,
      execute: (request) =>
        sql`select * from ${sql(TABLE_NAME)} where account_id = ${request.accountId} and challenge_event_id = ${request.challengeEventId}`,
    })(target).pipe(
      Effect.orDie,
      Effect.withSpan(
        'ChallengeEventParticipantRepo.findByAccountIdAndChallengeEventId',
      ),
    );

  const findAllByChallengeEventId = (challengeEventId: ChallengeEventId) =>
    SqlSchema.findAll({
      Request: ChallengeEventId,
      Result: ChallengeEventParticipant,
      execute: (request) =>
        sql`select * from ${sql(TABLE_NAME)} where challenge_event_id = ${request}`,
    })(challengeEventId).pipe(
      Effect.orDie,
      Effect.withSpan(
        'ChallengeEventParticipantRepo.findAllByChallengeEventId',
      ),
    );

  const upsert = (participant: typeof ChallengeEventParticipant.insert.Type) =>
    SqlSchema.single({
      Request: ChallengeEventParticipant.insert,
      Result: ChallengeEventParticipant,
      execute: (request) =>
        sql`insert into ${sql(TABLE_NAME)} ${sql.insert(request)} on conflict (challenge_event_id, account_id) do update set ${sql.update(request).returning('*')}`,
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
    findByTarget,
    findAllByChallengeEventId,
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

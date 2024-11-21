import { makeTestLayer } from '@/misc/test-layer.mjs';
import { SqlLive } from '@/sql/sql-live.mjs';
import { Model, SqlClient, SqlSchema } from '@effect/sql';
import { Effect, Layer, Option, pipe, Schema } from 'effect';
import {
  ChallengeParticipantConflict,
  ChallengeParticipantNotFound,
} from './challenge-participant-error.mjs';
import {
  ChallengeParticipant,
  ChallengeParticipantId,
} from './challenge-participant-schema.mjs';
import { Account } from '@/account/account-schema.mjs';
import { ChallengeId } from './challenge-schema.mjs';

const TABLE_NAME = 'challenge_participant';

const Target = ChallengeParticipant.pipe(
  Schema.pick('accountId', 'challengeId'),
);

const make = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  const repo = yield* Model.makeRepository(ChallengeParticipant, {
    tableName: TABLE_NAME,
    spanPrefix: 'ChallengeParticipantRepo',
    idColumn: 'id',
  });

  const findParticipantByTarget = (target: typeof Target.Type) =>
    SqlSchema.findOne({
      Request: Target,
      Result: ChallengeParticipant,
      execute: (req) =>
        sql`select * from ${sql(TABLE_NAME)} where account_id = ${req.accountId} and challenge_id = ${req.challengeId}`,
    })(target).pipe(
      Effect.orDie,
      Effect.withSpan('ChallengeParticipantRepo.findParticipantByTarget'),
    );

  const findParticipantsByChallengeId = (challengeId: ChallengeId) =>
    SqlSchema.findAll({
      Request: ChallengeId,
      Result: Account,
      execute: (req) =>
        sql`select challenge_participant.challenge_id as challenge_id, account.* from ${sql(TABLE_NAME)} left join account on account.id = challenge_participant.account_id where challenge_participant.challenge_id = ${req}`,
    })(challengeId).pipe(
      Effect.orDie,
      Effect.withSpan('ChallengeParticipantRepo.findParticipantsByChallengeId'),
    );

  const with_ = <A, E, R>(
    id: ChallengeParticipantId,
    f: (participant: ChallengeParticipant) => Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E | ChallengeParticipantNotFound, R> =>
    pipe(
      repo.findById(id),
      Effect.flatMap(
        Option.match({
          onSome: Effect.succeed,
          onNone: () => new ChallengeParticipantNotFound({ id }),
        }),
      ),
      Effect.flatMap(f),
      sql.withTransaction,
      Effect.catchTag('SqlError', (err) => Effect.die(err)),
    );

  const withoutTarget_ = <A, E, R>(
    target: typeof Target.Type,
    f: (result: boolean) => Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E | ChallengeParticipantConflict, R> =>
    pipe(
      findParticipantByTarget(target),
      Effect.flatMap(
        Option.match({
          onSome: () => new ChallengeParticipantConflict(target),
          onNone: () => Effect.succeed(true),
        }),
      ),
      Effect.flatMap(f),
      sql.withTransaction,
      Effect.catchTag('SqlError', (err) => Effect.die(err)),
    );

  const withTarget_ = <A, E, R>(
    target: typeof Target.Type,
    f: (participant: ChallengeParticipant) => Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E | ChallengeParticipantNotFound, R> =>
    pipe(
      findParticipantByTarget(target),
      Effect.flatMap(
        Option.match({
          onSome: Effect.succeed,
          onNone: () =>
            new ChallengeParticipantNotFound({
              id: ChallengeParticipantId.make(''),
            }),
        }),
      ),
      Effect.flatMap(f),
      sql.withTransaction,
      Effect.catchTag('SqlError', (err) => Effect.die(err)),
    );

  return {
    ...repo,
    findParticipantsByChallengeId,
    findParticipantByTarget,
    with: with_,
    withTarget: withTarget_,
    withoutTarget: withoutTarget_,
  } as const;
});

export class ChallengeParticipantRepo extends Effect.Tag(
  'ChallengeParticipantRepo',
)<ChallengeParticipantRepo, Effect.Effect.Success<typeof make>>() {
  static layer = Layer.effect(ChallengeParticipantRepo, make);
  static Live = this.layer.pipe(Layer.provide(SqlLive));
  static Test = makeTestLayer(ChallengeParticipantRepo)({});
}

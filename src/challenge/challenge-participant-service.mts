import { CurrentAccount } from '@/account/account-schema.mjs';
import { policyRequire } from '@/auth/authorization.mjs';
import { Effect, Layer, pipe } from 'effect';
import { ChallengeParticipantRepo } from './challenge-participant-repo.mjs';
import {
  ChallengeParticipant,
  ChallengeParticipantId,
} from './challenge-participant-schema.mjs';
import { ChallengeId } from './challenge-schema.mjs';
import { SqlTest } from '@/sql/sql-test.mjs';
import { ChallengeRepo } from './challenge-repo.mjs';

const make = Effect.gen(function* () {
  const repo = yield* ChallengeParticipantRepo;
  const challengeRepo = yield* ChallengeRepo;

  const findIdFromRepo = (id: ChallengeParticipantId) => repo.findById(id);

  const join = (challengeId: ChallengeId) =>
    pipe(
      CurrentAccount,
      Effect.flatMap(({ id: accountId }) =>
        repo.withoutTarget(
          {
            accountId,
            challengeId,
          },
          () =>
            repo.insert(
              ChallengeParticipant.insert.make({
                challengeId,
                accountId,
                isDeleted: false,
                isFinished: false,
                isWinner: false,
                updatedAt: undefined,
                createdAt: undefined,
              }),
            ),
        ),
      ),
      Effect.withSpan('ChallengeParticipantService.join'),
      policyRequire('challenge', 'join'),
    );

  const leave = (challengeId: ChallengeId) =>
    pipe(
      CurrentAccount,
      Effect.flatMap(({ id: accountId }) =>
        repo.withTarget(
          {
            accountId,
            challengeId,
          },
          (participant) => repo.delete(participant.id),
        ),
      ),
      Effect.withSpan('ChallengeParticipantService.leave'),
      policyRequire('challenge', 'join'),
    );

  const getChallengeMembers = (challengeId: ChallengeId) =>
    challengeRepo
      .with(challengeId, (challenge) =>
        repo.findParticipantsByChallengeId(challenge.id),
      )
      .pipe(Effect.withSpan('ChallengeParticipantService.getChallengeMembers'));

  return {
    findIdFromRepo,
    getChallengeMembers,
    join,
    leave,
  } as const;
});

export class ChallengeParticipantService extends Effect.Tag(
  'ChallengeParticipantService',
)<ChallengeParticipantService, Effect.Effect.Success<typeof make>>() {
  static layer = Layer.effect(ChallengeParticipantService, make);

  static Live = this.layer.pipe(
    Layer.provide(ChallengeParticipantRepo.Live),
    Layer.provide(ChallengeRepo.Live),
  );

  static Test = this.layer.pipe(Layer.provideMerge(SqlTest));
}

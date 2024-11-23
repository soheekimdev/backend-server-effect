import { CurrentAccount } from '@/account/account-schema.mjs';
import { policyRequire } from '@/auth/authorization.mjs';
import { LikeService } from '@/like/like-service.mjs';
import { FindManyUrlParams } from '@/misc/find-many-url-params-schema.mjs';
import { SqlTest } from '@/sql/sql-test.mjs';
import { Effect, Layer, pipe } from 'effect';
import { ChallengeRepo } from './challenge-repo.mjs';
import { Challenge, ChallengeId } from './challenge-schema.mjs';

const make = Effect.gen(function* () {
  const challengeRepo = yield* ChallengeRepo;
  const likeService = yield* LikeService;

  const findByIdWithView = (id: ChallengeId) =>
    challengeRepo.withView(id, (challenge) => Effect.succeed(challenge));

  const findByIdFromRepo = (id: ChallengeId) => challengeRepo.findById(id);

  const findChallenges = (params: FindManyUrlParams) =>
    challengeRepo
      .findAllWithView(params)
      .pipe(Effect.withSpan('ChallengeService.findChallenges'));

  const create = (challenge: typeof Challenge.jsonCreate.Type) =>
    pipe(
      CurrentAccount,
      Effect.flatMap(({ id: accountId }) =>
        challengeRepo.insert(
          Challenge.insert.make({
            ...challenge,
            accountId,
            updatedAt: undefined,
            createdAt: undefined,
          }),
        ),
      ),
      Effect.withSpan('ChallengeService.createChallenge'),
      policyRequire('challenge', 'create'),
      Effect.flatMap((challenge) => findByIdWithView(challenge.id)),
    );

  const updateById = (
    challengeId: ChallengeId,
    challenge: Partial<typeof Challenge.jsonUpdate.Type>,
  ) =>
    challengeRepo.with(challengeId, (existing) =>
      pipe(
        challengeRepo.update({
          ...existing,
          ...challenge,
          updatedAt: undefined,
        }),
        Effect.withSpan('ChallengeService.updateChallenge'),
        policyRequire('challenge', 'update'),
        Effect.flatMap((challenge) => findByIdWithView(challenge.id)),
      ),
    );

  const deleteById = (id: ChallengeId) =>
    challengeRepo.with(id, (challenge) =>
      pipe(
        challengeRepo.update({
          ...challenge,
          isDeleted: true,
          updatedAt: undefined,
        }),
        Effect.withSpan('ChallengeService.deleteById'),
        policyRequire('challenge', 'delete'),
      ),
    );

  const findLikeStatus = (challengeId: ChallengeId) =>
    pipe(likeService.getLikeStatusByChallengeId(challengeId));

  const addLikeChallengeById = (challengeId: ChallengeId) =>
    challengeRepo.with(challengeId, (challenge) =>
      likeService.addLikeChallengeById(challenge.id).pipe(
        Effect.withSpan('ChallengeService.addLikeChallengeById'),
        Effect.flatMap(() => findByIdWithView(challenge.id)),
      ),
    );

  const removeLikeChallengeById = (challengeId: ChallengeId) =>
    challengeRepo.with(challengeId, (challenge) =>
      likeService.removeLikeChallengeById(challenge.id).pipe(
        Effect.withSpan('ChallengeService.removeLikeChallengeById'),
        Effect.flatMap(() => findByIdWithView(challenge.id)),
      ),
    );

  const addDislikeChallengeById = (challengeId: ChallengeId) =>
    challengeRepo.with(challengeId, (challenge) =>
      likeService.addDislikeChallengeById(challenge.id).pipe(
        Effect.withSpan('ChallengeService.addDislikeChallengeById'),
        policyRequire('challenge', 'dislike'),
        Effect.flatMap(() => findByIdWithView(challenge.id)),
      ),
    );

  const removeDislikeChallengeById = (challengeId: ChallengeId) =>
    challengeRepo.with(challengeId, (challenge) =>
      likeService.removeDislikeChallengeById(challenge.id).pipe(
        Effect.withSpan('ChallengeService.removeDislikeChallengeById'),
        policyRequire('challenge', 'dislike'),
        Effect.flatMap(() => findByIdWithView(challenge.id)),
      ),
    );

  return {
    findByIdWithView,
    findByIdFromRepo,
    findChallenges,
    findLikeStatus,
    addLikeChallengeById,
    removeLikeChallengeById,
    addDislikeChallengeById,
    removeDislikeChallengeById,
    create,
    updateById,
    deleteById,
  } as const;
});

export class ChallengeService extends Effect.Tag('ChallengeService')<
  ChallengeService,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(ChallengeService, make);

  static Live = this.layer.pipe(
    Layer.provide(ChallengeRepo.Live),
    Layer.provide(LikeService.Live),
  );

  static Test = this.layer.pipe(Layer.provideMerge(SqlTest));
}

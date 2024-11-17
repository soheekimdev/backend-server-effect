import { Api } from '@/api.mjs';
import { HttpApiBuilder } from '@effect/platform';
import { Effect, Layer } from 'effect';
import { ChallengeService } from './challenge-service.mjs';
import { AuthenticationLive } from '@/auth/authentication.mjs';
import { policyUse } from '@/auth/authorization.mjs';
import { ChallengePolicy } from './challenge-policy.mjs';

export const ChallengeApiLive = HttpApiBuilder.group(
  Api,
  'challenge',
  (handlers) =>
    Effect.gen(function* () {
      const challengeService = yield* ChallengeService;
      const challengePolicy = yield* ChallengePolicy;
      return handlers
        .handle('findAll', ({ urlParams }) =>
          challengeService.findChallenges(urlParams),
        )
        .handle('findById', ({ path }) =>
          challengeService.findByIdWithView(path.id),
        )
        .handle('create', ({ payload }) =>
          challengeService
            .create(payload)
            .pipe(policyUse(challengePolicy.canCreate(payload))),
        )
        .handle('updateById', ({ path, payload }) =>
          challengeService
            .updateById(path.id, payload)
            .pipe(policyUse(challengePolicy.canUpdate(path.id))),
        )
        .handle('deleteById', ({ path }) =>
          challengeService
            .deleteById(path.id)
            .pipe(policyUse(challengePolicy.canDelete(path.id))),
        )
        .handle('findLikeStatus', ({ path }) =>
          challengeService.findLikeStatus(path.id),
        )
        .handle('likeChallengeById', ({ path }) =>
          challengeService
            .addLikeChallengeById(path.id)
            .pipe(policyUse(challengePolicy.canLike(path.id))),
        )
        .handle('removeLikeChallengeById', ({ path }) =>
          challengeService
            .removeLikeChallengeById(path.id)
            .pipe(policyUse(challengePolicy.canLike(path.id))),
        )
        .handle('dislikeChallengeById', ({ path }) =>
          challengeService
            .addDislikeChallengeById(path.id)
            .pipe(policyUse(challengePolicy.canDislike(path.id))),
        )
        .handle('removeDislikeChallengeById', ({ path }) =>
          challengeService
            .removeDislikeChallengeById(path.id)
            .pipe(policyUse(challengePolicy.canDislike(path.id))),
        )
        .handle('getChallengeMembers', ({ path }) =>
          Effect.gen(function* () {
            return yield* Effect.succeed('not implemented yet' as const);
          }),
        )
        .handle('joinChallengeById', ({ path }) =>
          Effect.gen(function* () {
            return yield* Effect.succeed('not implemented yet' as const);
          }),
        )
        .handle('leaveChallengeById', ({ path }) =>
          Effect.gen(function* () {
            return yield* Effect.succeed('not implemented yet' as const);
          }),
        );
    }),
).pipe(
  Layer.provide(AuthenticationLive),
  Layer.provide(ChallengeService.Live),
  Layer.provide(ChallengePolicy.Live),
);

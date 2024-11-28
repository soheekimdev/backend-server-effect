import { Api } from '@/api.mjs';
import { HttpApiBuilder } from '@effect/platform';
import { Effect, Layer } from 'effect';
import { ChallengeService } from './challenge-service.mjs';
import { AuthenticationLive } from '@/auth/authentication.mjs';
import { policyUse } from '@/auth/authorization.mjs';
import { ChallengePolicy } from './challenge-policy.mjs';
import { ChallengeParticipantService } from './challenge-participant-service.mjs';
import { TagPolicy } from '@/tag/tag-policy.mjs';

export const ChallengeApiLive = HttpApiBuilder.group(
  Api,
  'challenge',
  (handlers) =>
    Effect.gen(function* () {
      const challengeService = yield* ChallengeService;
      const challengeParticipantService = yield* ChallengeParticipantService;
      const challengePolicy = yield* ChallengePolicy;
      const tagPolicy = yield* TagPolicy;

      return handlers
        .handle('findAll', ({ urlParams }) =>
          challengeService.findChallenges(urlParams),
        )
        .handle('findById', ({ path }) =>
          challengeService.findByIdWithView(path.challengeId),
        )
        .handle('findTags', ({ path }) =>
          challengeService.findTags(path.challengeId),
        )
        .handle('addTags', ({ path, payload }) =>
          challengeService
            .addTags({ challengeId: path.challengeId, names: payload.names })
            .pipe(policyUse(tagPolicy.canConnectChallenge(path.challengeId))),
        )
        .handle('create', ({ payload }) =>
          challengeService
            .create(payload)
            .pipe(policyUse(challengePolicy.canCreate(payload))),
        )
        .handle('updateById', ({ path, payload }) =>
          challengeService
            .updateById(path.challengeId, payload)
            .pipe(policyUse(challengePolicy.canUpdate(path.challengeId))),
        )
        .handle('deleteById', ({ path }) =>
          challengeService
            .deleteById(path.challengeId)
            .pipe(policyUse(challengePolicy.canDelete(path.challengeId))),
        )
        .handle('findLikeStatus', ({ path }) =>
          challengeService.findLikeStatus(path.challengeId),
        )
        .handle('likeChallengeById', ({ path }) =>
          challengeService
            .addLikeChallengeById(path.challengeId)
            .pipe(policyUse(challengePolicy.canLike(path.challengeId))),
        )
        .handle('removeLikeChallengeById', ({ path }) =>
          challengeService
            .removeLikeChallengeById(path.challengeId)
            .pipe(policyUse(challengePolicy.canLike(path.challengeId))),
        )
        .handle('dislikeChallengeById', ({ path }) =>
          challengeService
            .addDislikeChallengeById(path.challengeId)
            .pipe(policyUse(challengePolicy.canDislike(path.challengeId))),
        )
        .handle('removeDislikeChallengeById', ({ path }) =>
          challengeService
            .removeDislikeChallengeById(path.challengeId)
            .pipe(policyUse(challengePolicy.canDislike(path.challengeId))),
        )
        .handle('getChallengeMembers', ({ path }) =>
          challengeParticipantService.getChallengeMembers(path.challengeId),
        )
        .handle('joinChallengeById', ({ path }) =>
          challengeParticipantService
            .join(path.challengeId)
            .pipe(policyUse(challengePolicy.canJoin(path.challengeId))),
        )
        .handle('leaveChallengeById', ({ path }) =>
          challengeParticipantService
            .leave(path.challengeId)
            .pipe(policyUse(challengePolicy.canJoin(path.challengeId))),
        );
    }),
).pipe(
  Layer.provide(AuthenticationLive),
  Layer.provide(ChallengeService.Live),
  Layer.provide(ChallengeParticipantService.Live),
  Layer.provide(ChallengePolicy.Live),
  Layer.provide(TagPolicy.Live),
);

import { Api } from '@/api.mjs';
import { AuthenticationLive } from '@/auth/authentication.mjs';
import { HttpApiBuilder } from '@effect/platform';
import { Effect, Layer } from 'effect';
import { ChallengeEventService } from './challenge-event-service.mjs';
import { policyUse } from '@/auth/authorization.mjs';
import { ChallengeEventPolicy } from './challenge-event-policy.mjs';

export const ChallengeEventApiLive = HttpApiBuilder.group(
  Api,
  'challenge-event',
  (handlers) =>
    Effect.gen(function* () {
      const challengeEventService = yield* ChallengeEventService;
      const challengeEventPolicy = yield* ChallengeEventPolicy;

      return handlers
        .handle('findAll', ({ path }) =>
          challengeEventService.findAllByChallengeId(path.challengeId),
        )
        .handle('findById', ({ path }) =>
          challengeEventService.findById(path.challengeEventId),
        )
        .handle('create', ({ path, payload }) =>
          challengeEventService
            .create(path.challengeId, payload)
            .pipe(
              policyUse(
                challengeEventPolicy.canCreate(path.challengeId, payload),
              ),
            ),
        )
        .handle('updateById', ({ path, payload }) =>
          challengeEventService
            .update(path.challengeEventId, payload)
            .pipe(
              policyUse(challengeEventPolicy.canUpdate(path.challengeEventId)),
            ),
        )
        .handle('deleteById', ({ path }) =>
          challengeEventService
            .deleteById(path.challengeEventId)
            .pipe(
              policyUse(challengeEventPolicy.canDelete(path.challengeEventId)),
            ),
        )
        .handle('check', ({ path, payload }) =>
          challengeEventService
            .check(path.challengeId, path.challengeEventId, payload)
            .pipe(
              policyUse(challengeEventPolicy.canCheck(path.challengeEventId)),
            ),
        )
        .handle('getChecks', ({ path }) =>
          challengeEventService.getChecks(path.challengeEventId),
        );
    }),
).pipe(
  Layer.provide(AuthenticationLive),
  Layer.provide(ChallengeEventService.Live),
  Layer.provide(ChallengeEventPolicy.Live),
);

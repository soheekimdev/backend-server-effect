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
          Effect.succeed('not implemented' as const),
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
        .handle('updateById', ({ path }) =>
          Effect.succeed('not implemented' as const),
        )
        .handle('deleteById', ({ path }) =>
          Effect.succeed('not implemented' as const),
        )
        .handle('check', () => Effect.succeed('not implemented' as const));
    }),
).pipe(
  Layer.provide(AuthenticationLive),
  Layer.provide(ChallengeEventService.Live),
  Layer.provide(ChallengeEventPolicy.Live),
);

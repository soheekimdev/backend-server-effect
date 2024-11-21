import { Api } from '@/api.mjs';
import { AuthenticationLive } from '@/auth/authentication.mjs';
import { HttpApiBuilder } from '@effect/platform';
import { Effect, Layer } from 'effect';
import { ChallengeEventService } from './challenge-event-service.mjs';

export const ChallengeEventApiLive = HttpApiBuilder.group(
  Api,
  'challenge-event',
  (handlers) =>
    Effect.gen(function* () {
      const challengeEventService = yield* ChallengeEventService;

      return handlers
        .handle('findAll', () => Effect.succeed('not implemented' as const))
        .handle('findById', ({ path }) =>
          Effect.succeed('not implemented' as const),
        )
        .handle('create', ({}) => Effect.succeed('not implemented' as const))
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
);

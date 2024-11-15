import { Api } from '@/api.mjs';
import { HttpApiBuilder } from '@effect/platform';
import { Effect, Layer } from 'effect';
import { ChallengeService } from './challenge-service.mjs';
import { AuthenticationLive } from '@/auth/authentication.mjs';

export const ChallengeApiLive = HttpApiBuilder.group(
  Api,
  'challenge',
  (handlers) =>
    Effect.gen(function* () {
      const challengeService = yield* ChallengeService;
      return handlers
        .handle('findAll', ({ urlParams }) =>
          challengeService.findChallenges(urlParams),
        )
        .handle('findById', ({ path }) =>
          challengeService.findByIdWithView(path.id),
        )
        .handle('create', ({ payload }) => challengeService.create(payload))
        .handle('updateById', ({ path }) =>
          Effect.gen(function* () {
            return yield* Effect.succeed('not implemented yet' as const);
          }),
        )
        .handle('deleteById', ({ path }) =>
          Effect.gen(function* () {
            return yield* Effect.succeed('not implemented yet' as const);
          }),
        )
        .handle('likeChallengeById', ({ path }) =>
          Effect.gen(function* () {
            return yield* Effect.succeed('not implemented yet' as const);
          }),
        )
        .handle('removeLikeChallengeById', ({ path }) =>
          Effect.gen(function* () {
            return yield* Effect.succeed('not implemented yet' as const);
          }),
        )
        .handle('dislikeChallengeById', ({ path }) =>
          Effect.gen(function* () {
            return yield* Effect.succeed('not implemented yet' as const);
          }),
        )
        .handle('removeDislikeChallengeById', ({ path }) =>
          Effect.gen(function* () {
            return yield* Effect.succeed('not implemented yet' as const);
          }),
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
        )

        .handle('findLikeStatus', ({}) =>
          Effect.gen(function* () {
            return yield* Effect.succeed('not implemented yet' as const);
          }),
        );
    }),
).pipe(Layer.provide(AuthenticationLive), Layer.provide(ChallengeService.Live));

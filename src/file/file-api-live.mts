import { Api } from '@/api.mjs';
import { AuthenticationLive } from '@/auth/authentication.mjs';
import { HttpApiBuilder } from '@effect/platform';
import { Effect, Layer } from 'effect';

export const FileApiLive = HttpApiBuilder.group(Api, 'file', (handlers) =>
  Effect.gen(function* () {
    return handlers.handle('upload', ({ payload }) =>
      Effect.gen(function* () {
        return yield* Effect.succeed({
          urls: [],
        });
      }),
    );
  }),
).pipe(Layer.provide(AuthenticationLive));

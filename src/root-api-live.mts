import { HttpApiBuilder } from '@effect/platform';
import { Effect, Layer } from 'effect';
import { Api } from './api.mjs';
import { RootService } from './root-service.mjs';

export const RootApiLive = HttpApiBuilder.group(Api, 'root', (handlers) =>
  Effect.gen(function* () {
    const service = yield* RootService;
    return handlers
      .handle('health', () => service.getHealth())
      .handle('home', () => service.getHome());
  }),
).pipe(Layer.provide(RootService.Live));

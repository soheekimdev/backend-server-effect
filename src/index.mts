import {
  HttpApiBuilder,
  HttpApiSwagger,
  HttpMiddleware,
  HttpServer,
} from '@effect/platform';
import { NodeHttpServer, NodeRuntime } from '@effect/platform-node';
import { Config, Effect, Layer } from 'effect';
import { createServer } from 'node:http';
import { ApiLive } from './api-live.mjs';

const configProgram = Effect.gen(function* () {
  const port = yield* Config.number('PORT').pipe(
    Config.withDefault(3000),
    Config.validate({
      message: 'PORT must be a number between 0 and 65535',
      validation: (port) =>
        typeof port === 'number' && port >= 0 && port <= 65535,
    }),
  );

  return port;
});

HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiSwagger.layer()),
  Layer.provide(HttpApiBuilder.middlewareOpenApi()),
  Layer.provide(ApiLive),
  Layer.provide(HttpApiBuilder.middlewareCors()),
  HttpServer.withLogAddress,
  Layer.provide(
    NodeHttpServer.layer(createServer, {
      port: Effect.runSync(configProgram),
    }),
  ),
  Layer.launch,
  NodeRuntime.runMain,
);

import {
  HttpApiBuilder,
  HttpApiSwagger,
  HttpMiddleware,
  HttpServer,
} from '@effect/platform';
import { NodeHttpServer, NodeRuntime } from '@effect/platform-node';
import { Effect, Layer } from 'effect';
import { createServer } from 'node:http';
import { ApiLive } from './api-live.mjs';
import { ConfigService } from './misc/config-service.mjs';

HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiSwagger.layer()),
  Layer.provide(HttpApiBuilder.middlewareOpenApi()),
  Layer.provide(ApiLive),
  Layer.provide(HttpApiBuilder.middlewareCors()),
  HttpServer.withLogAddress,
  Layer.provide(
    NodeHttpServer.layer(createServer, {
      port: Effect.runSync(
        Effect.provide(
          Effect.gen(function* () {
            const config = yield* ConfigService;
            return config.port;
          }),
          ConfigService.Live,
        ),
      ),
    }),
  ),
  Layer.launch,
  NodeRuntime.runMain,
);

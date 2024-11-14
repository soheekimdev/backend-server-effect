import {
  HttpApiBuilder,
  HttpApiSwagger,
  HttpMiddleware,
  HttpServer,
  Etag,
} from '@effect/platform';
import { NodeHttpServer, NodeRuntime, NodeSocket } from '@effect/platform-node';
import { Console, Effect, Layer } from 'effect';
import { createServer } from 'node:http';
import { ApiLive } from './api-live.mjs';
import { ConfigService } from './misc/config-service.mjs';
import { DevTools } from '@effect/experimental';

const DevToolsLive = DevTools.layerWebSocket().pipe(
  Layer.provide(NodeSocket.layerWebSocketConstructor),
);

HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiSwagger.layer()),
  Layer.provide(HttpApiBuilder.middlewareOpenApi()),
  Layer.provide(ApiLive),

  Layer.provide(
    HttpApiBuilder.middlewareCors({
      allowedOrigins: ['*'],
    }),
  ),
  Layer.provide(Etag.layerWeak),
  HttpServer.withLogAddress,
  Layer.provide(
    NodeHttpServer.layer(createServer, {
      port: Effect.runSync(
        Effect.provide(
          Effect.gen(function* () {
            const config = yield* ConfigService;
            yield* Console.log(`Listening on http://localhost:${config.port}`);
            return config.port;
          }),
          ConfigService.Live,
        ),
      ),
    }),
  ),
  Layer.launch,
  Effect.provide(DevToolsLive),
  NodeRuntime.runMain,
);

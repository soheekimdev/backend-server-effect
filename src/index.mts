import { HttpRouter, HttpServer, HttpServerResponse } from '@effect/platform';
import { NodeHttpServer, NodeRuntime, NodeSocket } from '@effect/platform-node';
import { Layer } from 'effect';
import { createServer } from 'node:http';
import { DevTools } from '@effect/experimental';

// Define the router with a single route for the root URL
const router = HttpRouter.empty.pipe(
  HttpRouter.get('/', HttpServerResponse.text('Hello World')),
);

// Set up the application server with logging
const app = router.pipe(HttpServer.serve(), HttpServer.withLogAddress);

// Specify the port
const port = 3000;

// Create a server layer with the specified port
const HttpServerLive = NodeHttpServer.layer(() => createServer(), { port });

const DevToolsLive = DevTools.layerWebSocket().pipe(
  Layer.provide(NodeSocket.layerWebSocketConstructor),
);

// Run the application
NodeRuntime.runMain(
  Layer.launch(Layer.provide(app, Layer.merge(HttpServerLive, DevToolsLive))),
);

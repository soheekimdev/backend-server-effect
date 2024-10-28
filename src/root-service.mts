import { SqlClient } from '@effect/sql';
import { Effect, Layer } from 'effect';
import { SqlLive } from './sql/sql-live.mjs';
import { makeTestLayer } from './misc/test-layer.mjs';

const make = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const getHealth = () =>
    Effect.gen(function* () {
      const checkDb = yield* sql`SELECT 1`;

      return {
        status: 'ok',
        db: {
          status: checkDb,
        },
      };
    }).pipe(Effect.orDie);

  const getHome = () =>
    Effect.gen(function* () {
      return yield* Effect.succeed(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Advanced Class Server</title>
</head>
<body>
  <h1>Advanced Class Server</h1>
   <a href="/docs">API 문서로 바로가기</a>
</body>

</html>
`);
    });

  return {
    getHome,
    getHealth,
  } as const;
});

export class RootService extends Effect.Tag('RootApiService')<
  RootService,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(RootService, make);

  static Test = makeTestLayer(RootService)({});

  static Live = this.layer.pipe(Layer.provide(SqlLive));
}

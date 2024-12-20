import { FileSystem } from '@effect/platform';
import { NodeContext } from '@effect/platform-node';
import { SqlClient } from '@effect/sql';
import { Effect, Layer } from 'effect';
import { makeTestLayer } from './misc/test-layer.mjs';
import { SqlLive } from './sql/sql-live.mjs';

const make = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const getHealth = () =>
    Effect.gen(function* () {
      const checkDb = yield* sql`SELECT 1`;
      const dbStatus = checkDb.length > 0 ? 'ok' : 'error';

      // 다른 서비스가 정상인지 체크하는 로직을 추가할 수 있습니다.

      return {
        status: dbStatus,
        db: {
          status: dbStatus,
        },
      };
    }).pipe(Effect.orDie);

  const getHome = () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const content = yield* fs.readFileString('./package.json', 'utf8');
      const packageJson = JSON.parse(content);

      return yield* Effect.succeed(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Advanced Class Server</title>
</head>
<body>
  <h1>Advanced Class Server, version: ${packageJson.version as string}</h1>
   <a href="/docs">API 문서로 바로가기</a>
</body>

</html>
`);
    }).pipe(Effect.orDie);

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

  static Live = this.layer.pipe(
    Layer.provide(SqlLive),
    Layer.provide(NodeContext.layer),
  );
}

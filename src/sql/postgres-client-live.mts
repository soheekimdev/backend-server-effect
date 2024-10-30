import { PgClient } from '@effect/sql-pg';
import { String, Config } from 'effect';

export const PostgresClientLive = PgClient.layer({
  url: Config.redacted('DIRECT_URL'),
  ssl: Config.succeed(false),
  transformQueryNames: Config.succeed(String.camelToSnake),
  transformResultNames: Config.succeed(String.snakeToCamel),
});

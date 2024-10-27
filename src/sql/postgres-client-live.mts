import { PgClient } from '@effect/sql-pg';
import { Config } from 'effect';

export const PostgresClientLive = PgClient.layer({
  url: Config.redacted('DIRECT_URL'),
  ssl: Config.succeed(false),
});

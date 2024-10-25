import { PgClient } from '@effect/sql-pg';
import { Config, Redacted } from 'effect';

export const PostgresClientLive = PgClient.layer({
  url: Config.succeed(Redacted.make(process.env.DIRECT_URL || '')),
});

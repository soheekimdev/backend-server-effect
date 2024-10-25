import { PgClient } from '@effect/sql-pg';
import { Config } from 'effect';

export const PostgresClientLive = PgClient.layer({
  database: Config.succeed('DATABASE_URL'),
});

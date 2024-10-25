import { Layer } from 'effect';
import { PostgresMigratorLive } from './postgres-migrator-live.mjs';
import { PostgresClientLive } from './postgres-client-live.mjs';

export const SqlLive = PostgresMigratorLive.pipe(
  Layer.provideMerge(PostgresClientLive),
);

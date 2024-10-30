import { Layer } from 'effect';
import { PostgresClientLive } from './postgres-client-live.mjs';
import { PostgresMigratorLive } from './postgres-migrator-live.mjs';

export const SqlLive = PostgresMigratorLive.pipe(
  Layer.provideMerge(PostgresClientLive),
);

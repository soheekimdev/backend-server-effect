import { NodeContext } from '@effect/platform-node';
import { PgMigrator } from '@effect/sql-pg';
import { Layer } from 'effect';
import { fileURLToPath } from 'url';

export const PostgresMigratorLive = PgMigrator.layer({
  loader: PgMigrator.fromFileSystem(
    fileURLToPath(new URL('./migrations', import.meta.url)),
  ),
}).pipe(Layer.provide(NodeContext.layer));

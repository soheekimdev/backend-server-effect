import { SqlClient } from '@effect/sql';
import { Effect } from 'effect';

const program = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  yield* sql.onDialectOrElse({
    pg: () =>
      sql`      
      ALTER TABLE account
      ADD COLUMN username TEXT DEFAULT NULL,
      ADD COLUMN birthday DATE DEFAULT NULL;
`,
    orElse: () => sql``,
  });
});

export default program;

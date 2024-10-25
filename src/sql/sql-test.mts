import { makeTestLayer } from '@/misc/test-layer.mjs';
import { SqlClient } from '@effect/sql';
import { identity } from 'effect';

export const SqlTest = makeTestLayer(SqlClient.SqlClient)({
  withTransaction: identity,
});

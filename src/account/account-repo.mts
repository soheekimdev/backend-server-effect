import { SqlLive } from '@/sql/sql-live.mjs';
import { Model, SqlClient, SqlSchema } from '@effect/sql';
import { Context, Effect, Layer } from 'effect';
import { Account } from './account-schema.mjs';
import { makeTestLayer } from '@/misc/test-layer.mjs';
import { Email } from '@/misc/email-schema.mjs';

const make = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const repo = yield* Model.makeRepository(Account, {
    tableName: 'account',
    spanPrefix: 'AccountRepo',
    idColumn: 'id',
  });

  const findByEmail = (email: Email) =>
    SqlSchema.findOne({
      Request: Email,
      Result: Account,
      execute: (key) => sql`select * from account where email = ${key}`,
    })(email).pipe(Effect.orDie, Effect.withSpan('AccountRepo.findByEmail'));

  return {
    ...repo,
    findByEmail,
  } as const;
});

export class AccountRepo extends Context.Tag('Account/AccountRepo')<
  AccountRepo,
  Effect.Effect.Success<typeof make>
>() {
  static Live = Layer.effect(AccountRepo, make).pipe(Layer.provide(SqlLive));
  static Test = makeTestLayer(AccountRepo)({});
}

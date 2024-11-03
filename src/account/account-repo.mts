import { SqlLive } from '@/sql/sql-live.mjs';
import { Model, SqlClient, SqlSchema } from '@effect/sql';
import { Context, Effect, Layer, Option, pipe } from 'effect';
import { Account, AccountId } from './account-schema.mjs';
import { makeTestLayer } from '@/misc/test-layer.mjs';
import { Email } from '@/misc/email-schema.mjs';
import { AccountNotFound } from './account-error.mjs';

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

  const updateById = (
    existing: Account,
    target: Partial<typeof Account.jsonUpdate.Type>,
  ) =>
    repo.update({
      ...existing,
      ...target,
      updatedAt: undefined,
    });

  const with_ = <A, E, R>(
    id: AccountId,
    f: (account: Account) => Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E | AccountNotFound, R> => {
    return pipe(
      repo.findById(id),
      Effect.flatMap(
        Option.match({
          onNone: () => new AccountNotFound({ id }),
          onSome: Effect.succeed,
        }),
      ),
      Effect.flatMap(f),
      sql.withTransaction,
      Effect.catchTag('SqlError', (err) => Effect.die(err)),
    );
  };

  return {
    ...repo,
    findByEmail,
    updateById,
    with: with_,
  } as const;
});

export class AccountRepo extends Context.Tag('Account/AccountRepo')<
  AccountRepo,
  Effect.Effect.Success<typeof make>
>() {
  static Live = Layer.effect(AccountRepo, make).pipe(Layer.provide(SqlLive));
  static Test = makeTestLayer(AccountRepo)({});
}

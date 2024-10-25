import { Email } from '@/misc/email-schema.mjs';
import { SqlClient } from '@effect/sql';
import { Effect, Layer, Option } from 'effect';
import {
  AccountAlreadyExists,
  AccountByEmailNotFound,
  AccountNotFound,
} from './account-error.mjs';
import { AccountRepo } from './account-repo.mjs';
import { Account, AccountId } from './account-schema.mjs';
import { SqlLive } from '@/sql/sql-live.mjs';
import { SqlTest } from '@/sql/sql-test.mjs';
import { policyRequire } from '@/auth/authorization.mjs';

const make = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const accountRepo = yield* AccountRepo;

  const createAccount = (account: typeof Account.jsonCreate.Type) => {
    const program = Effect.gen(function* () {
      yield* Effect.annotateCurrentSpan('account', account);

      const existingAccount = yield* accountRepo.findByEmail(account.email);

      if (existingAccount) {
        return yield* Effect.fail(
          new AccountAlreadyExists({ email: account.email }),
        );
      }

      const newAccount = yield* accountRepo.insert(
        Account.insert.make({
          ...account,
        }),
      );

      return newAccount;
    });

    return program.pipe(
      sql.withTransaction,
      Effect.orDie,
      Effect.withSpan('AccountService.createAccount', {
        attributes: { account },
      }),
      policyRequire('account', 'create'),
    );
  };

  const findAccountByEmail = (email: Email) =>
    Effect.gen(function* () {
      yield* Effect.annotateCurrentSpan('account', email);

      const account = yield* accountRepo.findByEmail(email);

      const matched = yield* Option.match(account, {
        onNone: () => Effect.fail(new AccountByEmailNotFound({ email })),
        onSome: (account) => Effect.succeed(account),
      });

      return matched;
    }).pipe(Effect.orDie, policyRequire('account', 'read'));

  const findAccountById = (id: AccountId) =>
    Effect.gen(function* () {
      yield* Effect.annotateCurrentSpan('account', id);

      const account = yield* accountRepo.findById(id);

      const matched = yield* Option.match(account, {
        onNone: () => Effect.fail(new AccountNotFound({ id })),
        onSome: (account) => Effect.succeed(account),
      });

      return matched;
    }).pipe(Effect.orDie, policyRequire('account', 'read'));

  const embellishAccount = (account: Account) =>
    Effect.gen(function* () {
      const acc = yield* accountRepo.findById(account.id);
      if (!acc) {
        return yield* Effect.fail(new AccountNotFound({ id: account.id }));
      }
      return acc;
    }).pipe(policyRequire('account', 'readSensitive'));

  return {
    createAccount,
    findAccountByEmail,
    findAccountById,
    embellishAccount,
  } as const;
});

export class AccountService extends Effect.Tag('AccountService')<
  AccountService,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(AccountService, make);

  static Live = this.layer.pipe(
    Layer.provide(SqlLive),
    Layer.provide(AccountRepo.Live),
  );

  static Test = this.layer.pipe(Layer.provideMerge(SqlTest));
}

import { Email } from '@/misc/email-schema.mjs';
import { makeTestLayer } from '@/misc/test-layer.mjs';
import { SqlLive } from '@/sql/sql-live.mjs';
import { Tag } from '@/tag/tag-schema.mjs';
import { Model, SqlClient, SqlSchema } from '@effect/sql';
import { Context, Effect, Layer, Option, pipe } from 'effect';
import { AccountNotFound } from './account-error.mjs';
import { Account, AccountId } from './account-schema.mjs';

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

  const findTags = (accountId: AccountId) =>
    SqlSchema.findAll({
      Request: AccountId,
      Result: Tag,
      execute: (req) => sql`
SELECT DISTINCT t.*
FROM tag t
left join tag_target tt on tt.tag_id = t.id
left join challenge_participant cp on tt.challenge_id = cp.challenge_id 
LEFT JOIN post p ON tt.post_id = p.id
LEFT JOIN challenge c ON tt.challenge_id = c.id
WHERE p.account_id = ${req}
   OR c.account_id = ${req};`,
    })(accountId).pipe(Effect.orDie, Effect.withSpan('AccountRepo.findTags'));

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
    findTags,
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

import { policy } from '@/auth/authorization.mjs';
import { Effect, Layer } from 'effect';
import { AccountRepo } from './account-repo.mjs';
import { AccountId } from './account-schema.mjs';

const make = Effect.gen(function* () {
  const accountRepo = yield* AccountRepo;

  const canUpdate = (toUpdate: AccountId) =>
    policy('account', 'update', (actor) =>
      Effect.succeed(actor.id === toUpdate || actor.role === 'admin'),
    );

  const canRead = (toRead: AccountId) =>
    policy(
      'account',
      'read',
      (actor) =>
        Effect.gen(function* () {
          if (actor.id === toRead || actor.role === 'admin') {
            return yield* Effect.succeed(true);
          }
          const isPrivate = yield* accountRepo.with(toRead, (account) =>
            Effect.succeed(account.isPrivate),
          );

          if (isPrivate) {
            return yield* Effect.succeed(false);
          }

          return false;
        }),
      '대상의 계정이 비공개상태이거나, 유효한 권한이 없습니다.',
    );

  const canReadSensitive = (toRead: AccountId) =>
    policy('account', 'readSensitive', (actor) =>
      Effect.succeed(actor.id === toRead || actor.role === 'admin'),
    );

  return {
    canUpdate,
    canRead,
    canReadSensitive,
  } as const;
});

export class AccountPolicy extends Effect.Tag('Account/AccountPolicy')<
  AccountPolicy,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(AccountPolicy, make);

  static Live = this.layer.pipe(Layer.provide(AccountRepo.Live));
}

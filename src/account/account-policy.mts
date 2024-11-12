import { Effect, Layer } from 'effect';
import { AccountId } from './account-schema.mjs';
import { policy } from '@/auth/authorization.mjs';

const make = Effect.gen(function* () {
  const canUpdate = (toUpdate: AccountId) =>
    policy('account', 'update', (actor) =>
      Effect.succeed(actor.id === toUpdate || actor.role === 'admin'),
    );

  // const canRead = (toRead: AccountId) =>
  //   policy('account', 'read', (actor) =>
  //     Effect.succeed(actor.id === toRead || actor.role === 'admin'),
  //   );

  const canReadSensitive = (toRead: AccountId) =>
    policy('account', 'readSensitive', (actor) =>
      Effect.succeed(actor.id === toRead || actor.role === 'admin'),
    );

  return {
    canUpdate,
    // canRead,
    canReadSensitive,
  } as const;
});

export class AccountPolicy extends Effect.Tag('Account/AccountPolicy')<
  AccountPolicy,
  Effect.Effect.Success<typeof make>
>() {
  static Live = Layer.effect(AccountPolicy, make);
}

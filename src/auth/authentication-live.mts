import { Account } from '@/account/account-schema.mjs';
import { Layer, Effect, Redacted } from 'effect';
import { Authentication } from './authentication.mjs';

export const AuthenticationLive = Layer.succeed(
  Authentication,
  Authentication.of({
    bearer: (token) =>
      Effect.succeed(
        new Account({
          id: 1000,
          name: `Authenticated with ${Redacted.value(token)}`,
        }),
      ),
  }),
);

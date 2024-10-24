import {
  Account,
  CurrentAccount,
  Unauthorized,
} from '@/account/account-schema.mjs';
import { HttpApiMiddleware, HttpApiSecurity } from '@effect/platform';
import { Effect, Layer, Redacted } from 'effect';

export class Authentication extends HttpApiMiddleware.Tag<Authentication>()(
  'Authentication',
  {
    failure: Unauthorized,
    provides: CurrentAccount,
    security: {
      bearer: HttpApiSecurity.bearer,
    },
  },
) {}

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

import { Api } from '@/api.mjs';
import { HttpApiBuilder, HttpApiSecurity } from '@effect/platform';
import { Effect, Layer, pipe, Schema } from 'effect';
import { Account, CurrentAccount } from './account-schema.mjs';
import { AuthenticationLive } from '@/auth/authentication-live.mjs';
import { AccountService } from './account-service.mjs';
import { policy, policyUse, withSystemActor } from '@/auth/authorization.mjs';
import { security } from '@/misc/security.mjs';
import { AccountPolicy } from './account-policy.mjs';

export const AccountApiLive = HttpApiBuilder.group(
  Api,
  'accounts',
  (handlers) =>
    Effect.gen(function* () {
      const accountService = yield* AccountService;
      const accountPolicy = yield* AccountPolicy;

      HttpApiBuilder.middleware

      return handlers
        .handle('signUp', ({ payload }) =>
          accountService.createAccount(payload).pipe(
            withSystemActor
          ),
        )
        .handle('findById', ({ headers, path }) =>
          accountService.findAccountById(path.id).pipe(
            policyUse(accountPolicy.canRead(path.id))
          )
        )
        .handle('me', () =>
          Effect.gen(function* () {
            const current = yield* CurrentAccount.
            return current;
          }),
        );
    }),
).pipe(Layer.provide(AuthenticationLive), Layer.provide(AccountPolicy.Live));

import { Api } from '@/api.mjs';
import { policyUse, withSystemActor } from '@/auth/authorization.mjs';
import { HttpApiBuilder, HttpApiSecurity } from '@effect/platform';
import { Effect, Layer } from 'effect';
import { AccountPolicy } from './account-policy.mjs';
import { CurrentAccount } from './account-schema.mjs';
import { AccountService } from './account-service.mjs';
import { AuthenticationLive } from '@/auth/authentication.mjs';

export const AccountApiLive = HttpApiBuilder.group(
  Api,
  'accounts',
  (handlers) =>
    Effect.gen(function* () {
      const accountService = yield* AccountService;
      const accountPolicy = yield* AccountPolicy;

      return handlers
        .handle('signUp', ({ payload }) =>
          accountService.signUp(payload).pipe(withSystemActor),
        )
        .handle('findById', ({ path }) =>
          accountService
            .findAccountById(path.id)
            .pipe(policyUse(accountPolicy.canRead(path.id))),
        )
        .handle('updateById', ({ path, payload }) => {})
        .handle('signIn', ({ payload }) =>
          accountService.signIn(payload).pipe(
            withSystemActor,
            Effect.tap((result) =>
              HttpApiBuilder.securitySetCookie(
                HttpApiSecurity.apiKey({
                  in: 'cookie',
                  key: 'access-token',
                }),
                result.accessToken,
              ),
            ),
            Effect.tap((result) =>
              HttpApiBuilder.securitySetCookie(
                HttpApiSecurity.apiKey({
                  in: 'cookie',
                  key: 'refresh-token',
                }),
                result.refreshToken,
              ),
            ),
          ),
        )
        .handle('me', () => CurrentAccount);
    }),
).pipe(
  Layer.provide(AuthenticationLive),
  Layer.provide(AccountService.Live),
  Layer.provide(AccountPolicy.Live),
);

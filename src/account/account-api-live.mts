import { Api } from '@/api.mjs';
import { AuthenticationLive } from '@/auth/authentication.mjs';
import { policyUse, withSystemActor } from '@/auth/authorization.mjs';
import { securityRemoveCookie } from '@/misc/security-remove-cookie.mjs';
import { HttpApiBuilder, HttpApiSecurity } from '@effect/platform';
import { Effect, Layer } from 'effect';
import { AccountPolicy } from './account-policy.mjs';
import { CurrentAccount } from './account-schema.mjs';
import { AccountService } from './account-service.mjs';

export const AccountApiLive = HttpApiBuilder.group(Api, 'account', (handlers) =>
  Effect.gen(function* () {
    const accountService = yield* AccountService;
    const accountPolicy = yield* AccountPolicy;

    return handlers
      .handle('signUp', ({ payload }) =>
        accountService.signUp(payload).pipe(withSystemActor),
      )
      .handle('findById', ({ path }) => accountService.findAccountById(path.id))
      .handle('updateById', ({ path, payload }) =>
        accountService
          .updateAccountById(path.id, payload)
          .pipe(policyUse(accountPolicy.canUpdate(path.id))),
      )
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
              {
                path: '/',
              },
            ),
          ),
          Effect.tap((result) =>
            HttpApiBuilder.securitySetCookie(
              HttpApiSecurity.apiKey({
                in: 'cookie',
                key: 'refresh-token',
              }),
              result.refreshToken,
              {
                path: '/',
              },
            ),
          ),
        ),
      )
      .handle('signOut', () =>
        Effect.gen(function* () {
          yield* securityRemoveCookie(
            HttpApiSecurity.apiKey({
              in: 'cookie',
              key: 'access-token',
            }),
          );
          yield* securityRemoveCookie(
            HttpApiSecurity.apiKey({
              in: 'cookie',
              key: 'refresh-token',
            }),
          );
        }),
      )
      .handle('me', () => CurrentAccount)
      .handle('invalidate', ({ headers }) =>
        accountService.invalidate(headers['refresh-token']),
      );
  }),
).pipe(
  Layer.provide(AuthenticationLive),
  Layer.provide(AccountService.Live),
  Layer.provide(AccountPolicy.Live),
);

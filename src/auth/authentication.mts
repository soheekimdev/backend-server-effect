import { AccountRepo } from '@/account/account-repo.mjs';
import { CurrentAccount } from '@/account/account-schema.mjs';
import { TokenService } from '@/crypto/token-service.mjs';
import { HttpApiMiddleware, HttpApiSecurity } from '@effect/platform';
import { Effect, Layer, Option, Redacted } from 'effect';
import { Unauthenticated } from './error-401.mjs';

export class Authentication extends HttpApiMiddleware.Tag<Authentication>()(
  'Authentication',
  {
    failure: Unauthenticated,
    provides: CurrentAccount,
    security: {
      bearer: HttpApiSecurity.apiKey({
        key: 'access-token',
        in: 'cookie',
      }),
    },
  },
) {}

export const AuthenticationLive = Layer.effect(
  Authentication,

  Effect.gen(function* () {
    yield* Effect.log('creating Authorization middleware');

    // return the security handlers
    return Authentication.of({
      bearer: (serializedToken) =>
        Effect.provide(
          Effect.gen(function* () {
            const accountRepo = yield* AccountRepo;
            const tokenService = yield* TokenService;
            const decoded = yield* tokenService.verifyToken(
              Redacted.value(serializedToken),
            );

            const maybeAccount = yield* accountRepo.findByEmail(decoded.sub);

            const account = yield* Option.match(maybeAccount, {
              onNone: () =>
                Effect.fail(
                  new Unauthenticated({
                    message: 'Token Account not found',
                  }),
                ),
              onSome: (account) => Effect.succeed(account),
            });

            return account;
          }),
          Layer.merge(AccountRepo.Live, TokenService.Live),
        ).pipe(
          Effect.catchAll((error) =>
            Effect.fail(
              new Unauthenticated({
                message: 'Token Account not found',
              }),
            ),
          ),
        ),
    });
  }),
);

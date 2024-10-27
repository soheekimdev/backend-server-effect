import { AccountRepo } from '@/account/account-repo.mjs';
import { Email } from '@/misc/email-schema.mjs';
import { Effect, Layer, Option } from 'effect';
import { Authentication } from './authentication.mjs';
import { Unauthenticated } from './error-401.mjs';

export const AuthenticationLive = Layer.succeed(
  Authentication,
  Authentication.of({
    bearer: (token) => {
      const program = Effect.gen(function* () {
        const accountRepo = yield* AccountRepo;
        const maybeAccount = yield* accountRepo.findByEmail(
          Email.make('email'),
        );
        const account = yield* Option.match(maybeAccount, {
          onNone: () =>
            Effect.fail(new Unauthenticated({ message: '401 Error' })),
          onSome: (account) => Effect.succeed(account),
        });
        return account;
      }).pipe(
        Effect.withSpan('Authentication.bearer'),
        Effect.provide(AccountRepo.Live),
        Effect.orDieWith((e) => new Unauthenticated({ message: '401 Error' })),
      );

      return program;
    },
  }),
);

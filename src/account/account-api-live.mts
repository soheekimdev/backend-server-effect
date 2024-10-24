import { Api } from '@/api.mjs';
import { AuthenticationLive } from '@/auth/authentication.mjs';
import { HttpApiBuilder, HttpApiSecurity } from '@effect/platform';
import { Effect, Layer } from 'effect';
import { Account, CurrentAccount } from './account-schema.mjs';

export const AccountApiLive = HttpApiBuilder.group(
  Api,
  'accounts',
  (handlers) =>
    handlers
      .handle('create', ({ payload }) =>
        Effect.succeed(new Account({ ...payload, id: 123 })),
      )
      .handle('findById', ({ headers, path }) =>
        Effect.as(
          HttpApiBuilder.securitySetCookie(
            HttpApiSecurity.apiKey({
              in: 'cookie',
              key: 'token',
            }),
            'secret123',
          ),
          new Account({
            id: path.id,
            name: `John Doe (${headers.page})`,
          }),
        ),
      )
      .handle('me', (_) => CurrentAccount),
).pipe(Layer.provide(AuthenticationLive));

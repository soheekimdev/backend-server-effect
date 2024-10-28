import { HttpMiddleware, HttpServerRequest } from '@effect/platform';
import { Context, Effect, Redacted, Schema } from 'effect';
import { AccessToken } from './access-token.mjs';

class Session extends Context.Tag('Sesion')<
  Session,
  {
    readonly token: Redacted.Redacted;
  }
>() {}

const AuthCookie = HttpServerRequest.schemaCookies(
  Schema.Struct({
    'access-token': AccessToken,
  }).pipe(Schema.pluck('access-token')),
);

export const authMiddleware = HttpMiddleware.make(
  Effect.provideServiceEffect(
    Session,
    AuthCookie.pipe(
      Effect.map((token) => {
        console.log(Redacted.value(token));
        return { token };
      }),
    ),
  ),
);

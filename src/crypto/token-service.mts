import { Account } from '@/account/account-schema.mjs';
import { ConfigService } from '@/misc/config-service.mjs';
import { Effect, Layer } from 'effect';
import { SignJWT, jwtVerify } from 'jose';
import {
  AccessTokenGenerationError,
  RefreshTokenGenerationError,
  VerifyTokenError,
} from './token-error.mjs';
import { Token } from './token-schema.mjs';

const make = Effect.gen(function* () {
  const configService = yield* ConfigService;
  const { jwtSecret, host } = configService;
  const secret = new TextEncoder().encode(jwtSecret);

  const generateAccessToken = (target: Account) => {
    return Effect.gen(function* () {
      const accessToken = yield* Effect.tryPromise({
        try: async () =>
          await new SignJWT({
            type: 'access',
          })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setIssuer(host)
            .setSubject(target.email)
            .setExpirationTime('7days')
            .sign(secret),

        catch: (error) => new AccessTokenGenerationError(),
      });

      return accessToken;
    });
  };

  const generateRefreshToken = (target: Account) => {
    return Effect.gen(function* () {
      const refreshToken = yield* Effect.tryPromise({
        try: async () =>
          await new SignJWT({
            type: 'refresh',
          })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setIssuer(host)
            .setSubject(target.email)
            .setExpirationTime('30days')
            .sign(secret),
        catch: (error) => new RefreshTokenGenerationError(),
      });

      return refreshToken;
    });
  };

  const verifyToken = (serializedToken: string) =>
    Effect.gen(function* () {
      const decoded = yield* Effect.tryPromise({
        try: async () => {
          return (
            await jwtVerify(serializedToken, secret, {
              issuer: host,
            })
          ).payload as Token;
        },
        catch: (error) => new VerifyTokenError(),
      });

      return decoded;
    });

  return { generateAccessToken, generateRefreshToken, verifyToken } as const;
});

export class TokenService extends Effect.Tag('TokenService')<
  TokenService,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(TokenService, make);

  static Live = this.layer.pipe(Layer.provide(ConfigService.Live));

  static Test = this.layer;
}

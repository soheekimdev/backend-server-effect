import { NodeContext } from '@effect/platform-node';
import { Effect, Layer } from 'effect';
import { GeneratingSaltError, HashingPasswordError } from './crypto-error.mjs';

const make = Effect.gen(function* () {
  const getRandomSalt = function (size = 16) {
    return Effect.gen(function* () {
      const salt = yield* Effect.try({
        try: () => {
          const array = new Uint8Array(size);
          crypto.getRandomValues(array);
          return Buffer.from(array);
        },
        catch: (error) => new GeneratingSaltError(),
      });
      return salt.toString('hex');
    });
  };

  const hashPassword = function (password: string, salt: string) {
    return Effect.gen(function* () {
      const enc = new TextEncoder();
      const passwordKey = yield* Effect.promise(async () =>
        crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, [
          'deriveBits',
          'deriveKey',
        ]),
      );

      const saltBuffer = Buffer.from(salt, 'hex');

      const key = yield* Effect.promise(async () =>
        crypto.subtle.deriveKey(
          {
            name: 'PBKDF2',
            salt: saltBuffer,
            iterations: 1000,
            hash: 'SHA-512',
          },
          passwordKey,
          { name: 'HMAC', hash: 'SHA-512', length: 512 },
          true,
          ['sign'],
        ),
      );

      const derivedKey = yield* Effect.promise(async () =>
        crypto.subtle.exportKey('raw', key),
      );

      const buffer = Buffer.from(derivedKey);

      return yield* Effect.succeed(buffer);
    }).pipe(
      Effect.catchAll((error) => {
        return Effect.fail(new HashingPasswordError());
      }),
    );
  };

  return {
    getRandomSalt,
    hashPassword,
  } as const;
});

export class CryptoService extends Effect.Tag('CryptoService')<
  CryptoService,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(CryptoService, make);

  static Live = this.layer.pipe(Layer.provide(NodeContext.layer));

  static Test = this.layer;
}

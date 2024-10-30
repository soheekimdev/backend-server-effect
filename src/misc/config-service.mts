import { Config, Effect, Layer } from 'effect';

const make = Effect.gen(function* () {
  const port = yield* Config.number('PORT').pipe(
    Config.withDefault(3000),
    Config.validate({
      message: 'PORT must be a number between 0 and 65535',
      validation: (port) =>
        typeof port === 'number' && port >= 0 && port <= 65535,
    }),
  );

  const jwtSecret = yield* Config.string('JWT_SECRET').pipe(
    Config.withDefault('jwt-secret'),
  );

  const host = yield* Config.string('HOST').pipe(
    Config.withDefault('127.0.0.1'),
  );

  const dbDirectUrl = yield* Config.string('DIRECT_URL').pipe(
    Config.validate({
      message: 'DIRECT_URL must be a valid URL',
      validation: (url) => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      },
    }),
  );

  return { port, jwtSecret, host, dbDirectUrl } as const;
});

export class ConfigService extends Effect.Tag('ConfigService')<
  ConfigService,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(ConfigService, make);

  static Live = this.layer;
}

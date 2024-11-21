import { Effect, Layer } from 'effect';
import { ChallengeEventRepo } from './challenge-event-repo.mjs';

const make = Effect.gen(function* () {
  const repo = yield* ChallengeEventRepo;

  return {} as const;
});

export class ChallengeEventService extends Effect.Tag('ChallengeEventService')<
  ChallengeEventService,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(ChallengeEventService, make);

  static Live = this.layer.pipe(Layer.provide(ChallengeEventRepo.Live));

  static Test = this.layer.pipe(Layer.provide(ChallengeEventRepo.Test));
}

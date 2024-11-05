import { SqlTest } from '@/sql/sql-test.mjs';
import { Effect, Layer } from 'effect';
import { ChallengeRepo } from './challenge-repo.mjs';

const make = Effect.gen(function* () {
  const challengeRepo = yield* ChallengeRepo;

  return {} as const;
});

export class ChallengeService extends Effect.Tag('ChallengeService')<
  ChallengeService,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(ChallengeService, make);

  static Live = this.layer.pipe(Layer.provide(ChallengeRepo.Live));

  static Test = this.layer.pipe(Layer.provideMerge(SqlTest));
}

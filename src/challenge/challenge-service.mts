import { SqlTest } from '@/sql/sql-test.mjs';
import { Effect, Layer } from 'effect';
import { ChallengeRepo } from './challenge-repo.mjs';
import { ChallengeId } from './challenge-schema.mjs';

const make = Effect.gen(function* () {
  const challengeRepo = yield* ChallengeRepo;

  const findByIdWithView = (id: ChallengeId) =>
    challengeRepo.withView(id, (challenge) => Effect.succeed(challenge));

  const findByIdFromRepo = (id: ChallengeId) => challengeRepo.findById(id);

  return {
    findByIdWithView,
    findByIdFromRepo,
  } as const;
});

export class ChallengeService extends Effect.Tag('ChallengeService')<
  ChallengeService,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(ChallengeService, make);

  static Live = this.layer.pipe(Layer.provide(ChallengeRepo.Live));

  static Test = this.layer.pipe(Layer.provideMerge(SqlTest));
}

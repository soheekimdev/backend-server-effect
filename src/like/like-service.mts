import { SqlTest } from '@/sql/sql-test.mjs';
import { Effect, Layer } from 'effect';
import { LikeRepo } from './like-repo.mjs';

const make = Effect.gen(function* () {
  const likeRepo = yield* LikeRepo;

  return {} as const;
});

export class PostService extends Effect.Tag('PostService')<
  PostService,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(PostService, make);

  static Live = this.layer.pipe(Layer.provide(LikeRepo.Live));

  static Test = this.layer.pipe(Layer.provideMerge(SqlTest));
}

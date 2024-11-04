import { SqlTest } from '@/sql/sql-test.mjs';
import { Effect, Layer } from 'effect';
import { PostRepo } from './post-repo.mjs';

const make = Effect.gen(function* () {
  const postRepo = yield* PostRepo;

  return {} as const;
});

export class PostService extends Effect.Tag('PostService')<
  PostService,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(PostService, make);

  static Live = this.layer.pipe(Layer.provide(PostRepo.Live));

  static Test = this.layer.pipe(Layer.provideMerge(SqlTest));
}

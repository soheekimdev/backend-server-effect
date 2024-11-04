import { SqlTest } from '@/sql/sql-test.mjs';
import { Effect, Layer } from 'effect';
import { CommentRepo } from './comment-repo.mjs';

const make = Effect.gen(function* () {
  const commentRepo = yield* CommentRepo;

  return {} as const;
});

export class CommentService extends Effect.Tag('CommentService')<
  CommentService,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(CommentService, make);

  static Live = this.layer.pipe(Layer.provide(CommentRepo.Live));

  static Test = this.layer.pipe(Layer.provideMerge(SqlTest));
}

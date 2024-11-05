import { policyRequire } from '@/auth/authorization.mjs';
import { SqlTest } from '@/sql/sql-test.mjs';
import { Effect, Layer, pipe } from 'effect';
import { PostRepo } from './post-repo.mjs';
import { Post, PostId } from './post-schema.mjs';
import { FindManyUrlParams } from '@/misc/find-many-url-params-schema.mjs';

const make = Effect.gen(function* () {
  const postRepo = yield* PostRepo;

  const findPosts = (params: FindManyUrlParams) =>
    postRepo.findAll(params).pipe(Effect.withSpan('PostService.findPosts'));

  const createPost = (post: typeof Post.insert.Type) =>
    postRepo
      .insert(Post.insert.make(post))
      .pipe(
        Effect.withSpan('PostService.createPost'),
        policyRequire('post', 'create'),
      );

  const updatePost = (post: typeof Post.update.Type) =>
    postRepo.with(post.id, (existing) =>
      pipe(
        postRepo.update({ ...existing, ...post }),
        Effect.withSpan('PostService.updatePost'),
        policyRequire('post', 'update'),
      ),
    );

  const deletePost = (id: PostId) =>
    postRepo.with(id, (post) =>
      pipe(
        postRepo.delete(id),
        Effect.withSpan('PostService.deletePost'),
        policyRequire('post', 'delete'),
      ),
    );

  return {
    findPosts,
    createPost,
    updatePost,
    deletePost,
  } as const;
});

export class PostService extends Effect.Tag('PostService')<
  PostService,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(PostService, make);

  static Live = this.layer.pipe(Layer.provide(PostRepo.Live));

  static Test = this.layer.pipe(Layer.provideMerge(SqlTest));
}

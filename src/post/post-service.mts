import { CurrentAccount } from '@/account/account-schema.mjs';
import { policyRequire } from '@/auth/authorization.mjs';
import { LikeService } from '@/like/like-service.mjs';
import { FindManyUrlParams } from '@/misc/find-many-url-params-schema.mjs';
import { SqlTest } from '@/sql/sql-test.mjs';
import { Effect, Layer, pipe } from 'effect';
import { PostRepo } from './post-repo.mjs';
import { Post, PostId } from './post-schema.mjs';

const make = Effect.gen(function* () {
  const postRepo = yield* PostRepo;
  const likeService = yield* LikeService;

  const findPosts = (params: FindManyUrlParams) =>
    postRepo.findAll(params).pipe(Effect.withSpan('PostService.findPosts'));

  const findById = (id: PostId) => postRepo.findById(id);

  const create = (post: typeof Post.jsonCreate.Type) =>
    pipe(
      CurrentAccount,
      Effect.flatMap(({ id: accountId }) =>
        postRepo.insert(
          Post.insert.make({
            ...post,
            accountId,
          }),
        ),
      ),
      Effect.withSpan('PostService.createPost'),
      policyRequire('post', 'create'),
    );

  const updateById = (postId: PostId, post: typeof Post.jsonUpdate.Type) =>
    postRepo.with(postId, (existing) =>
      pipe(
        postRepo.update({ ...existing, ...post, updatedAt: undefined }),
        Effect.withSpan('PostService.updatePost'),
        policyRequire('post', 'update'),
      ),
    );

  const deleteById = (id: PostId) =>
    postRepo.with(id, (post) =>
      pipe(
        postRepo.delete(id),
        Effect.withSpan('PostService.deleteById'),
        policyRequire('post', 'delete'),
      ),
    );

  const likePostById = (postId: PostId) =>
    postRepo.with(postId, (post) =>
      likeService
        .likePostById(postId)
        .pipe(
          Effect.withSpan('PostService.likePostById'),
          policyRequire('post', 'like'),
        ),
    );

  const removePostLikeById = (postId: PostId) =>
    postRepo.with(postId, (post) =>
      likeService
        .removeLikePostById(postId)
        .pipe(
          Effect.withSpan('PostService.dislikePostById'),
          policyRequire('post', 'dislike'),
        ),
    );

  const dislikePostById = (postId: PostId) =>
    postRepo.with(postId, (post) =>
      likeService
        .likePostById(postId)
        .pipe(
          Effect.withSpan('PostService.dislikePostById'),
          policyRequire('post', 'dislike'),
        ),
    );

  const removePostDislikeById = (postId: PostId) =>
    postRepo.with(postId, (post) =>
      likeService
        .removeLikePostById(postId)
        .pipe(
          Effect.withSpan('PostService.removePostDislikeById'),
          policyRequire('post', 'dislike'),
        ),
    );

  return {
    findPosts,
    findById,
    likePostById,
    removePostLikeById,
    dislikePostById,
    removePostDislikeById,
    create,
    updateById,
    deleteById,
  } as const;
});

export class PostService extends Effect.Tag('PostService')<
  PostService,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(PostService, make);

  static Live = this.layer.pipe(
    Layer.provide(PostRepo.Live),
    Layer.provide(LikeService.Live),
  );

  static Test = this.layer.pipe(Layer.provideMerge(SqlTest));
}

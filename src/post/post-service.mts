import { AccountId, CurrentAccount } from '@/account/account-schema.mjs';
import { policyRequire } from '@/auth/authorization.mjs';
import { LikeService } from '@/like/like-service.mjs';
import { FindManyUrlParams } from '@/misc/find-many-url-params-schema.mjs';
import { SqlTest } from '@/sql/sql-test.mjs';
import { TagService } from '@/tag/tag-service.mjs';
import { Effect, Layer, pipe } from 'effect';
import { PostRepo } from './post-repo.mjs';
import { Post, PostId } from './post-schema.mjs';
import { TagId } from '@/tag/tag-schema.mjs';

const make = Effect.gen(function* () {
  const postRepo = yield* PostRepo;
  const likeService = yield* LikeService;
  const tagService = yield* TagService;

  const findByIdFromRepo = (postId: PostId) => postRepo.findById(postId);

  const findPosts = (params: FindManyUrlParams, accountId?: AccountId) =>
    postRepo
      .findAllWithView(params, accountId)
      .pipe(Effect.withSpan('PostService.findPosts'));

  const findByIdWithView = (postId: PostId) =>
    postRepo.withView(postId, (post) =>
      pipe(Effect.succeed(post), Effect.withSpan('PostService.findById')),
    );

  const findTags = (postId: PostId) => postRepo.findTags(postId);

  const addTags = (payload: { postId: PostId; names: readonly string[] }) =>
    tagService.connectPostByNames(payload);

  const deleteTag = (payload: { postId: PostId; tagId: TagId }) =>
    tagService.deletePostTagConnection(payload);

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
      Effect.flatMap((post) => findByIdWithView(post.id)),
    );

  const updateById = (
    postId: PostId,
    post: Partial<typeof Post.jsonUpdate.Type>,
  ) =>
    postRepo.with(postId, (existing) =>
      pipe(
        postRepo.update({
          ...existing,
          ...post,
          updatedAt: undefined,
        }),
        Effect.withSpan('PostService.updatePost'),
        policyRequire('post', 'update'),
        Effect.flatMap((post) => findByIdWithView(post.id)),
      ),
    );

  const deleteById = (postId: PostId) =>
    postRepo.with(postId, (post) =>
      pipe(
        postRepo.update({
          ...post,
          isDeleted: true,
          updatedAt: undefined,
        }),
        Effect.withSpan('PostService.deleteById'),
        policyRequire('post', 'delete'),
      ),
    );

  const findLikeStatus = (postId: PostId) =>
    pipe(likeService.getLikeStatusByPostId(postId));

  const addLikePostById = (postId: PostId) =>
    postRepo.with(postId, (post) =>
      likeService
        .addLikePostById(post.id)
        .pipe(
          Effect.withSpan('PostService.addLikePostById'),
          policyRequire('post', 'like'),
        )
        .pipe(Effect.flatMap(() => findByIdWithView(post.id))),
    );

  const removePostLikeById = (postId: PostId) =>
    postRepo.with(postId, (post) =>
      likeService
        .removeLikePostById(post.id)
        .pipe(
          Effect.withSpan('PostService.addDislikePostById'),
          policyRequire('post', 'like'),
        )
        .pipe(Effect.flatMap(() => findByIdWithView(post.id))),
    );

  const addDislikePostById = (postId: PostId) =>
    postRepo.with(postId, (post) =>
      likeService
        .addDislikePostById(post.id)
        .pipe(
          Effect.withSpan('PostService.addDislikePostById'),
          policyRequire('post', 'dislike'),
        )
        .pipe(Effect.flatMap(() => findByIdWithView(post.id))),
    );

  const removePostDislikeById = (postId: PostId) =>
    postRepo.with(postId, (post) =>
      likeService
        .removeDislikePostById(post.id)
        .pipe(
          Effect.withSpan('PostService.removePostDislikeById'),
          policyRequire('post', 'dislike'),
        )
        .pipe(Effect.flatMap(() => findByIdWithView(post.id))),
    );

  const increaseViewCountById = (postId: PostId) =>
    postRepo.with(postId, (post) =>
      pipe(
        postRepo.update({
          ...post,
          viewCount: post.viewCount + 1,
          updatedAt: undefined,
        }),
        Effect.withSpan('PostService.increaseViewCountById'),
        Effect.flatMap((post) => findByIdWithView(post.id)),
      ),
    );

  return {
    findByIdFromRepo,
    findPosts,
    findByIdWithView,
    findLikeStatus,
    findTags,
    addTags,
    deleteTag,
    increaseViewCountById,
    addLikePostById,
    removePostLikeById,
    addDislikePostById,
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
    Layer.provide(TagService.Live),
  );

  static Test = this.layer.pipe(Layer.provideMerge(SqlTest));
}

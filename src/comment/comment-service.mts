import { FindManyUrlParams } from '@/misc/find-many-url-params-schema.mjs';
import { PostRepo } from '@/post/post-repo.mjs';
import { PostId } from '@/post/post-schema.mjs';
import { SqlTest } from '@/sql/sql-test.mjs';
import { Effect, Layer, Option, pipe } from 'effect';
import { CommentRepo } from './comment-repo.mjs';
import { Comment, CommentId } from './comment-schema.mjs';
import { CurrentAccount } from '@/account/account-schema.mjs';
import { policyRequire } from '@/auth/authorization.mjs';
import { LikeService } from '@/like/like-service.mjs';
import { PostNotFound } from '@/post/post-error.mjs';

const make = Effect.gen(function* () {
  const likeService = yield* LikeService;
  const commentRepo = yield* CommentRepo;
  const postRepo = yield* PostRepo;

  const findAllByPostId = (postId: PostId, params: FindManyUrlParams) =>
    commentRepo.likeViewRepo.findAllByPostId(postId, params);

  const findByIdWithView = (commentId: CommentId) =>
    commentRepo.withView(commentId, (comment) =>
      pipe(Effect.succeed(comment), Effect.withSpan('CommentService.findById')),
    );

  const getCommentCount = (postId: PostId) =>
    commentRepo.commentViewRepo.findById(postId).pipe(
      Effect.flatMap(
        Option.match({
          onNone: () => Effect.fail(new PostNotFound({ id: postId })),
          onSome: Effect.succeed,
        }),
      ),
    );

  const create = (postId: PostId, toCreate: typeof Comment.jsonCreate.Type) =>
    pipe(
      CurrentAccount,
      Effect.flatMap((account) =>
        postRepo.with(postId, (post) =>
          commentRepo.insert(
            Comment.insert.make({
              ...toCreate,
              isDeleted: false,
              postId: post.id,
              accountId: account.id,
            }),
          ),
        ),
      ),
      Effect.flatMap((comment) =>
        findByIdWithView(comment.id).pipe(Effect.orDie),
      ),
      Effect.withSpan('CommentService.create'),
      policyRequire('comment', 'create'),
    );

  const update = (
    postId: PostId,
    commentId: CommentId,
    toUpdate: Partial<typeof Comment.jsonUpdate.Type>,
  ) =>
    postRepo.with(postId, (post) =>
      pipe(
        commentRepo.with(commentId, (comment) =>
          pipe(
            commentRepo.update({
              ...comment,
              ...toUpdate,
              updatedAt: undefined,
            }),
            Effect.withSpan('CommentService.update'),
            policyRequire('comment', 'update'),
            Effect.flatMap(() => findByIdWithView(comment.id)),
          ),
        ),
      ),
    );

  const deleteById = (commentId: CommentId) =>
    commentRepo.with(commentId, (comment) =>
      pipe(
        commentRepo.delete(comment.id),
        Effect.withSpan('CommentService.delete'),
        policyRequire('comment', 'delete'),
      ),
    );

  const findLikeStatus = (commentId: CommentId) =>
    pipe(likeService.getLikeStatusByCommentId(commentId));

  const addLikeCommentById = (commentId: CommentId) =>
    commentRepo.with(commentId, (comment) =>
      likeService.addLikeCommentById(comment.id).pipe(
        Effect.withSpan('CommentService.addLikeCommentById'),
        policyRequire('comment', 'like'),
        Effect.flatMap(() => findByIdWithView(comment.id)),
      ),
    );

  const removeLikeCommentById = (commentId: CommentId) =>
    commentRepo.with(commentId, (comment) =>
      likeService.removeLikeCommentById(comment.id).pipe(
        Effect.withSpan('CommentService.removeLikeCommentById'),
        policyRequire('comment', 'like'),
        Effect.flatMap(() => findByIdWithView(comment.id)),
      ),
    );

  const addDislikeCommentById = (commentId: CommentId) =>
    commentRepo.with(commentId, (comment) =>
      likeService.addDislikeCommentById(comment.id).pipe(
        Effect.withSpan('CommentService.addDislikeCommentById'),
        policyRequire('comment', 'dislike'),
        Effect.flatMap(() => findByIdWithView(comment.id)),
      ),
    );

  const removeDislikeCommentById = (commentId: CommentId) =>
    commentRepo.with(commentId, (comment) =>
      likeService.removeDislikeCommentById(comment.id).pipe(
        Effect.withSpan('CommentService.removeDislikeCommentById'),
        policyRequire('comment', 'dislike'),
        Effect.flatMap(() => findByIdWithView(comment.id)),
      ),
    );

  return {
    create,
    update,
    deleteById,
    findAllByPostId,
    findLikeStatus,
    findByIdWithView,
    getCommentCount,
    addLikeCommentById,
    removeLikeCommentById,
    addDislikeCommentById,
    removeDislikeCommentById,
  } as const;
});

export class CommentService extends Effect.Tag('CommentService')<
  CommentService,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(CommentService, make);

  static Live = this.layer.pipe(
    Layer.provide(CommentRepo.Live),
    Layer.provide(PostRepo.Live),
    Layer.provide(LikeService.Live),
  );

  static Test = this.layer.pipe(Layer.provideMerge(SqlTest));
}

import { Api } from '@/api.mjs';
import { AuthenticationLive } from '@/auth/authentication.mjs';
import { policyUse, withSystemActor } from '@/auth/authorization.mjs';
import { HttpApiBuilder } from '@effect/platform';
import { Effect, Layer } from 'effect';
import { CommentPolicy } from './comment-policy.mjs';
import { CommentService } from './comment-service.mjs';

export const CommentApiLive = HttpApiBuilder.group(Api, 'comment', (handlers) =>
  Effect.gen(function* () {
    const commentService = yield* CommentService;
    const commentPolicy = yield* CommentPolicy;

    return handlers
      .handle('findAll', ({ path, urlParams }) =>
        commentService.findAllByPostId(path.postId, urlParams),
      )
      .handle('findById', ({ path }) =>
        commentService.findByIdWithView(path.commentId),
      )
      .handle('getCommentCount', ({ path }) =>
        commentService.getCommentCount(path.postId),
      )
      .handle('create', ({ path, payload }) =>
        commentService.create(path.postId, payload).pipe(withSystemActor),
      )
      .handle('updateById', ({ path, payload }) =>
        commentService
          .update(path.postId, path.commentId, payload)
          .pipe(policyUse(commentPolicy.canUpdate(path.commentId))),
      )
      .handle('deleteById', ({ path }) =>
        commentService
          .deleteById(path.commentId)
          .pipe(policyUse(commentPolicy.canDelete(path.commentId))),
      )
      .handle('findLikeStatus', ({ path }) =>
        commentService.findLikeStatus(path.commentId),
      )
      .handle('likeCommentById', ({ path }) =>
        commentService
          .addLikeCommentById(path.commentId)
          .pipe(policyUse(commentPolicy.canLike(path.commentId))),
      )
      .handle('removeLikeCommentById', ({ path }) =>
        commentService
          .removeLikeCommentById(path.commentId)
          .pipe(policyUse(commentPolicy.canLike(path.commentId))),
      )
      .handle('dislikeCommentById', ({ path }) =>
        commentService
          .addDislikeCommentById(path.commentId)
          .pipe(policyUse(commentPolicy.canDislike(path.commentId))),
      )
      .handle('removeDislikeCommentById', ({ path }) =>
        commentService
          .removeDislikeCommentById(path.commentId)
          .pipe(policyUse(commentPolicy.canDislike(path.commentId))),
      );
  }),
).pipe(
  Layer.provide(AuthenticationLive),
  Layer.provide(CommentService.Live),
  Layer.provide(CommentPolicy.Live),
);

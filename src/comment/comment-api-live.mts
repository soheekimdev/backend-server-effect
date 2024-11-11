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
        commentService.findByIdWithView(path.id),
      )
      .handle('getCommentCount', ({ path }) =>
        commentService.getCommentCount(path.postId),
      )
      .handle('create', ({ path, payload }) =>
        commentService.create(path.postId, payload).pipe(withSystemActor),
      )
      .handle('updateById', ({ path, payload }) =>
        commentService
          .update(path.postId, path.id, payload)
          .pipe(policyUse(commentPolicy.canUpdate(path.id))),
      )
      .handle('deleteById', ({ path }) =>
        commentService
          .deleteById(path.id)
          .pipe(policyUse(commentPolicy.canDelete(path.id))),
      )
      .handle('findLikeStatus', ({ path }) =>
        commentService.findLikeStatus(path.id),
      )
      .handle('likeCommentById', ({ path }) =>
        commentService
          .addLikeCommentById(path.id)
          .pipe(policyUse(commentPolicy.canLike(path.id))),
      )
      .handle('removeLikeCommentById', ({ path }) =>
        commentService
          .removeLikeCommentById(path.id)
          .pipe(policyUse(commentPolicy.canLike(path.id))),
      )
      .handle('dislikeCommentById', ({ path }) =>
        commentService
          .addDislikeCommentById(path.id)
          .pipe(policyUse(commentPolicy.canDislike(path.id))),
      )
      .handle('removeDislikeCommentById', ({ path }) =>
        commentService
          .removeDislikeCommentById(path.id)
          .pipe(policyUse(commentPolicy.canDislike(path.id))),
      );
  }),
).pipe(
  Layer.provide(AuthenticationLive),
  Layer.provide(CommentService.Live),
  Layer.provide(CommentPolicy.Live),
);

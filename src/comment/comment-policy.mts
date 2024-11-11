import { Effect, Layer, pipe } from 'effect';
import { CommentRepo } from './comment-repo.mjs';
import { Comment, CommentId } from './comment-schema.mjs';
import { policy } from '@/auth/authorization.mjs';

const make = Effect.gen(function* () {
  const commentRepo = yield* CommentRepo;

  const canCreate = (_toCreate: typeof Comment.jsonCreate.Type) =>
    policy('comment', 'create', (actor) => Effect.succeed(true));

  const canUpdate = (id: CommentId) =>
    policy(
      'comment',
      'update',
      (actor) =>
        pipe(
          commentRepo.with(id, (comment) =>
            pipe(
              Effect.succeed(
                actor.id === comment.accountId || actor.role === 'admin',
              ),
            ),
          ),
        ),
      '댓글 작성자나 관리자만 댓글을 수정할 수 있습니다.',
    );

  const canDelete = (id: CommentId) =>
    policy(
      'comment',
      'delete',
      (actor) =>
        pipe(
          commentRepo.with(id, (comment) =>
            pipe(
              Effect.succeed(
                actor.id === comment.accountId || actor.role === 'admin',
              ),
            ),
          ),
        ),
      '댓글 작성자나 관리자만 댓글을 삭제할 수 있습니다.',
    );

  const canLike = (toLike: CommentId) =>
    policy(
      'comment',
      'like',
      (actor) =>
        pipe(
          commentRepo.with(toLike, (comment) =>
            pipe(Effect.succeed(actor.id !== comment.accountId)),
          ),
        ),
      '댓글 작성자는 좋아요를 누를 수 없습니다.',
    );

  const canDislike = (toDislike: CommentId) =>
    policy(
      'comment',
      'dislike',
      (actor) =>
        pipe(
          commentRepo.with(toDislike, (comment) =>
            pipe(Effect.succeed(actor.id !== comment.accountId)),
          ),
        ),
      '댓글 작성자는 싫어요를 누를 수 없습니다.',
    );

  return {
    canCreate,
    canUpdate,
    canDelete,
    canLike,
    canDislike,
  } as const;
});

export class CommentPolicy extends Effect.Tag('Comment/CommentPolicy')<
  CommentPolicy,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(CommentPolicy, make);

  static Live = this.layer.pipe(Layer.provide(CommentRepo.Live));
}

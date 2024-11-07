import { policy } from '@/auth/authorization.mjs';
import { Effect, Layer, pipe } from 'effect';
import { PostRepo } from './post-repo.mjs';
import { Post, PostId } from './post-schema.mjs';

const make = Effect.gen(function* () {
  const postRepo = yield* PostRepo;

  const canCreate = (_toCreate: typeof Post.jsonCreate.Type) =>
    policy('post', 'create', (actor) => Effect.succeed(true));

  const canRead = (id: PostId) =>
    policy('post', 'read', (_actor) => Effect.succeed(true));

  const canUpdate = (id: PostId) =>
    policy(
      'post',
      'update',
      (actor) =>
        pipe(
          postRepo.with(id, (post) =>
            pipe(
              Effect.succeed(
                actor.id === post.accountId || actor.role === 'admin',
              ),
            ),
          ),
        ),
      '글 작성자나 관리자만 글을 수정할 수 있습니다.',
    );

  const canDelete = (id: PostId) =>
    policy(
      'post',
      'delete',
      (actor) =>
        pipe(
          postRepo.with(id, (post) =>
            pipe(
              Effect.succeed(
                actor.id === post.accountId || actor.role === 'admin',
              ),
            ),
          ),
        ),
      '글 작성자나 관리자만 글을 삭제할 수 있습니다.',
    );

  const canLike = (toLike: PostId) =>
    policy(
      'post',
      'like',
      (actor) =>
        pipe(
          postRepo.with(toLike, (post) =>
            pipe(
              Effect.succeed(actor.id !== post.accountId && post.isLikeAllowed),
            ),
          ),
        ),
      '글에 좋아요를 누를 수 없게 설정되어있거나, 글 작성자는 좋아요를 누를 수 없습니다.',
    );

  const canDislike = (toDislike: PostId) =>
    policy(
      'post',
      'dislike',
      (actor) =>
        pipe(
          postRepo.with(toDislike, (post) =>
            pipe(
              Effect.succeed(actor.id !== post.accountId && post.isLikeAllowed),
            ),
          ),
        ),
      '글에 싫어요를 누를 수 없게 설정되어있거나, 글 작성자는 싫어요를 누를 수 없습니다.',
    );

  const canComment = (toComment: PostId) =>
    policy(
      'post',
      'comment',
      (actor) =>
        pipe(
          postRepo.with(toComment, (post) =>
            pipe(Effect.succeed(post.isCommentAllowed)),
          ),
        ),
      '글에 댓글을 달 수 없게 설정되어있습니다.',
    );

  return {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canLike,
    canDislike,
    canComment,
  } as const;
});

// NOTE: PostPolicy는 Service의 일종으로 여김으로써, PostService가 아닌 PostRepo를 제공받아야 합니다.

export class PostPolicy extends Effect.Tag('Post/PostPolicy')<
  PostPolicy,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(PostPolicy, make);

  static Live = this.layer.pipe(Layer.provide(PostRepo.Live));
}

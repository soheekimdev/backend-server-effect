import { CurrentAccount } from '@/account/account-schema.mjs';
import { PostId } from '@/post/post-schema.mjs';
import { SqlTest } from '@/sql/sql-test.mjs';
import { Effect, Layer, pipe } from 'effect';
import { LikeRepo } from './like-repo.mjs';

const make = Effect.gen(function* () {
  const likeRepo = yield* LikeRepo;

  const getLikeStatusByPostId = (postId: PostId) =>
    pipe(
      CurrentAccount,
      Effect.flatMap((curr) =>
        likeRepo.withTarget(
          {
            postId,
            accountId: curr.id,
          },
          [],
          (existing) => Effect.succeed(existing),
        ),
      ),
    );

  const addLikePostById = (postId: PostId) =>
    pipe(
      CurrentAccount,
      Effect.flatMap((curr) =>
        likeRepo.withoutTarget({ postId, accountId: curr.id }, [], () =>
          pipe(
            likeRepo.createPostLike(postId, curr.id),
            Effect.withSpan('LikeService.likePostById'),
          ),
        ),
      ),
    );

  const removeLikePostById = (postId: PostId) =>
    pipe(
      CurrentAccount,
      Effect.flatMap((account) =>
        likeRepo.withTarget(
          {
            postId,
            accountId: account.id,
          },
          ['like'],
          (existing) =>
            pipe(
              likeRepo.delete(existing.id),
              Effect.withSpan('LikeService.removeLikePostById'),
            ),
        ),
      ),
    );

  const addDislikePostById = (postId: PostId) =>
    pipe(
      CurrentAccount,
      Effect.flatMap((curr) =>
        likeRepo.withoutTarget(
          { postId, accountId: curr.id },
          ['dislike'],
          () =>
            pipe(
              likeRepo.createPostDislike(postId, curr.id),
              Effect.withSpan('LikeService.addDislikePostById'),
            ),
        ),
      ),
    );

  const removeDislikePostById = (postId: PostId) =>
    pipe(
      CurrentAccount,
      Effect.flatMap((account) =>
        likeRepo.withTarget(
          {
            postId,
            accountId: account.id,
          },
          ['dislike'],
          (existing) =>
            pipe(
              likeRepo.delete(existing.id),
              Effect.withSpan('LikeService.removeDislikePostById'),
            ),
        ),
      ),
    );

  return {
    addLikePostById,
    removeLikePostById,
    addDislikePostById,
    removeDislikePostById,
    getLikeStatusByPostId,
  } as const;
});

export class LikeService extends Effect.Tag('LikeService')<
  LikeService,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(LikeService, make);

  static Live = this.layer.pipe(Layer.provide(LikeRepo.Live));

  static Test = this.layer.pipe(Layer.provideMerge(SqlTest));
}

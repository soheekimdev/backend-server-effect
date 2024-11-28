import { AccountId, CurrentAccount } from '@/account/account-schema.mjs';
import { PostId } from '@/post/post-schema.mjs';
import { SqlTest } from '@/sql/sql-test.mjs';
import { Effect, Layer, pipe } from 'effect';
import { LikeRepo } from './like-repo.mjs';
import { CommentId } from '@/comment/comment-schema.mjs';
import { ChallengeId } from '@/challenge/challenge-schema.mjs';
import { ChallengeEventId } from '@/challenge-event/challenge-event-schema.mjs';
import { FindManyUrlParams } from '@/misc/find-many-url-params-schema.mjs';

const make = Effect.gen(function* () {
  const likeRepo = yield* LikeRepo;

  const findAllLikes = (params: FindManyUrlParams, accountId?: AccountId) =>
    likeRepo.findAllLikes(params, accountId);

  const getLikeStatusByPostId = (postId: PostId) =>
    pipe(
      CurrentAccount,
      Effect.flatMap((curr) =>
        likeRepo.withTarget(
          {
            postId,
            accountId: curr.id,
            challengeEventId: null,
            commentId: null,
            challengeId: null,
          },
          [],
          (existing) => Effect.succeed(existing),
        ),
      ),
      Effect.catchAll((err) => Effect.succeed({})),
    );

  const addLikePostById = (postId: PostId) =>
    pipe(
      CurrentAccount,
      Effect.flatMap((curr) =>
        likeRepo.withoutTarget(
          {
            postId,
            accountId: curr.id,
            challengeEventId: null,
            commentId: null,
            challengeId: null,
          },
          [],
          () =>
            pipe(
              likeRepo.createPostLike(postId, curr.id),
              Effect.withSpan('LikeService.addLikePostById'),
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
            challengeEventId: null,
            commentId: null,
            challengeId: null,
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
          {
            postId,
            accountId: curr.id,
            challengeEventId: null,
            commentId: null,
            challengeId: null,
          },
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
            challengeEventId: null,
            commentId: null,
            challengeId: null,
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

  const getLikeStatusByCommentId = (commentId: CommentId) =>
    pipe(
      CurrentAccount,
      Effect.flatMap((curr) =>
        likeRepo.withTarget(
          {
            commentId,
            accountId: curr.id,
            challengeEventId: null,
            postId: null,
            challengeId: null,
          },
          [],
          (existing) => Effect.succeed(existing),
        ),
      ),
      Effect.catchAll((err) => Effect.succeed({})),
    );

  const addLikeCommentById = (commentId: CommentId) =>
    pipe(
      CurrentAccount,
      Effect.flatMap((curr) =>
        likeRepo.withoutTarget(
          {
            commentId,
            accountId: curr.id,
            challengeEventId: null,
            postId: null,
            challengeId: null,
          },
          [],
          () =>
            pipe(
              likeRepo.createCommentLike(commentId, curr.id),
              Effect.withSpan('LikeService.addLikeCommentById'),
            ),
        ),
      ),
    );

  const removeLikeCommentById = (commentId: CommentId) =>
    pipe(
      CurrentAccount,
      Effect.flatMap((account) =>
        likeRepo.withTarget(
          {
            commentId,
            accountId: account.id,
            challengeEventId: null,
            postId: null,
            challengeId: null,
          },
          ['like'],
          (existing) =>
            pipe(
              likeRepo.delete(existing.id),
              Effect.withSpan('LikeService.removeLikeCommentById'),
            ),
        ),
      ),
    );

  const addDislikeCommentById = (commentId: CommentId) =>
    pipe(
      CurrentAccount,
      Effect.flatMap((curr) =>
        likeRepo.withoutTarget(
          {
            commentId,
            accountId: curr.id,
            challengeEventId: null,
            postId: null,
            challengeId: null,
          },
          ['dislike'],
          () =>
            pipe(
              likeRepo.createCommentDislike(commentId, curr.id),
              Effect.withSpan('LikeService.addDislikeCommentById'),
            ),
        ),
      ),
    );

  const removeDislikeCommentById = (commentId: CommentId) =>
    pipe(
      CurrentAccount,
      Effect.flatMap((account) =>
        likeRepo.withTarget(
          {
            commentId,
            accountId: account.id,
            challengeEventId: null,
            postId: null,
            challengeId: null,
          },
          ['dislike'],
          (existing) =>
            pipe(
              likeRepo.delete(existing.id),
              Effect.withSpan('LikeService.removeDislikeCommentById'),
            ),
        ),
      ),
    );

  const getLikeStatusByChallengeId = (challengeId: ChallengeId) =>
    pipe(
      CurrentAccount,
      Effect.flatMap((curr) =>
        likeRepo.withTarget(
          {
            challengeId,
            accountId: curr.id,
            challengeEventId: null,
            commentId: null,
            postId: null,
          },
          [],
          (existing) => Effect.succeed(existing),
        ),
      ),
      Effect.withSpan('LikeService.getLikeStatusByChallengeId'),
      Effect.catchAll((err) => Effect.succeed({})),
    );

  const addLikeChallengeById = (challengeId: ChallengeId) =>
    pipe(
      CurrentAccount,
      Effect.flatMap((curr) =>
        likeRepo.withoutTarget(
          {
            challengeId,
            accountId: curr.id,
            challengeEventId: null,
            commentId: null,
            postId: null,
          },
          [],
          () =>
            pipe(
              likeRepo.createChallengeLike(challengeId, curr.id),
              Effect.withSpan('LikeService.addLikeChallengeById'),
            ),
        ),
      ),
    );

  const removeLikeChallengeById = (challengeId: ChallengeId) =>
    pipe(
      CurrentAccount,
      Effect.flatMap((account) =>
        likeRepo.withTarget(
          {
            challengeId,
            accountId: account.id,
            challengeEventId: null,
            commentId: null,
            postId: null,
          },
          ['like'],
          (existing) =>
            pipe(
              likeRepo.delete(existing.id),
              Effect.withSpan('LikeService.removeLikeChallengeById'),
            ),
        ),
      ),
    );

  const addDislikeChallengeById = (challengeId: ChallengeId) =>
    pipe(
      CurrentAccount,
      Effect.flatMap((curr) =>
        likeRepo.withoutTarget(
          {
            challengeId,
            accountId: curr.id,
            challengeEventId: null,
            commentId: null,
            postId: null,
          },
          ['dislike'],
          () =>
            pipe(
              likeRepo.createChallengeDislike(challengeId, curr.id),
              Effect.withSpan('LikeService.addDislikeChallengeById'),
            ),
        ),
      ),
    );

  const removeDislikeChallengeById = (challengeId: ChallengeId) =>
    pipe(
      CurrentAccount,
      Effect.flatMap((account) =>
        likeRepo.withTarget(
          {
            challengeId,
            accountId: account.id,
            challengeEventId: null,
            commentId: null,
            postId: null,
          },
          ['dislike'],
          (existing) =>
            pipe(
              likeRepo.delete(existing.id),
              Effect.withSpan('LikeService.removeDislikeChallengeById'),
            ),
        ),
      ),
    );
  const getLikeStatusByChallengeEventId = (
    challengeEventId: ChallengeEventId,
  ) =>
    pipe(
      CurrentAccount,
      Effect.flatMap((curr) =>
        likeRepo.withTarget(
          {
            challengeEventId,
            accountId: curr.id,
            commentId: null,
            postId: null,
            challengeId: null,
          },
          [],
          (existing) => Effect.succeed(existing),
        ),
      ),
      Effect.withSpan('LikeService.getLikeStatusByChallengeEventId'),
      Effect.catchAll((err) => Effect.succeed({})),
    );

  const addLikeChallengeEventById = (challengeEventId: ChallengeEventId) =>
    pipe(
      CurrentAccount,
      Effect.flatMap((curr) =>
        likeRepo.withoutTarget(
          {
            challengeEventId,
            accountId: curr.id,
            commentId: null,
            postId: null,
            challengeId: null,
          },
          [],
          () =>
            pipe(
              likeRepo.createChallengeEventLike(challengeEventId, curr.id),
              Effect.withSpan('LikeService.addLikeChallengeEventById'),
            ),
        ),
      ),
    );

  const removeLikeChallengeEventById = (challengeEventId: ChallengeEventId) =>
    pipe(
      CurrentAccount,
      Effect.flatMap((account) =>
        likeRepo.withTarget(
          {
            challengeEventId,
            accountId: account.id,
            commentId: null,
            postId: null,
            challengeId: null,
          },
          ['like'],
          (existing) =>
            pipe(
              likeRepo.delete(existing.id),
              Effect.withSpan('LikeService.removeLikeChallengeEventById'),
            ),
        ),
      ),
    );

  const addDislikeChallengeEventById = (challengeEventId: ChallengeEventId) =>
    pipe(
      CurrentAccount,
      Effect.flatMap((curr) =>
        likeRepo.withoutTarget(
          {
            challengeEventId,
            accountId: curr.id,
            commentId: null,
            postId: null,
            challengeId: null,
          },
          ['dislike'],
          () =>
            pipe(
              likeRepo.createChallengeEventDislike(challengeEventId, curr.id),
              Effect.withSpan('LikeService.addDislikeChallengeEventById'),
            ),
        ),
      ),
    );

  const removeDislikeChallengeEventById = (
    challengeEventId: ChallengeEventId,
  ) =>
    pipe(
      CurrentAccount,
      Effect.flatMap((account) =>
        likeRepo.withTarget(
          {
            challengeEventId,
            accountId: account.id,
            commentId: null,
            postId: null,
            challengeId: null,
          },
          ['dislike'],
          (existing) =>
            pipe(
              likeRepo.delete(existing.id),
              Effect.withSpan('LikeService.removeDislikeChallengeEventById'),
            ),
        ),
      ),
    );

  return {
    findAllLikes,

    addLikePostById,
    removeLikePostById,
    addDislikePostById,
    removeDislikePostById,
    getLikeStatusByPostId,

    addLikeCommentById,
    removeLikeCommentById,
    addDislikeCommentById,
    removeDislikeCommentById,
    getLikeStatusByCommentId,

    addLikeChallengeById,
    removeLikeChallengeById,
    addDislikeChallengeById,
    removeDislikeChallengeById,
    getLikeStatusByChallengeId,

    addLikeChallengeEventById,
    removeLikeChallengeEventById,
    addDislikeChallengeEventById,
    removeDislikeChallengeEventById,
    getLikeStatusByChallengeEventId,
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

import { policy } from '@/auth/authorization.mjs';
import { ChallengeNotFound } from '@/challenge/challenge-error.mjs';
import { ChallengeRepo } from '@/challenge/challenge-repo.mjs';
import { ChallengeId } from '@/challenge/challenge-schema.mjs';
import { PostNotFound } from '@/post/post-error.mjs';
import { PostRepo } from '@/post/post-repo.mjs';
import { PostId } from '@/post/post-schema.mjs';
import { Option, Effect, Layer } from 'effect';

const make = Effect.gen(function* () {
  const postRepo = yield* PostRepo;
  const challengeRepo = yield* ChallengeRepo;

  const canCreate = () =>
    policy('tag', 'create', (actor) => Effect.succeed(true));

  const canRead = () => policy('tag', 'read', (_actor) => Effect.succeed(true));

  const canUpdate = () =>
    policy('tag', 'update', (actor) => Effect.succeed(actor.role === 'admin'));

  const canDelete = () =>
    policy('tag', 'delete', (actor) => Effect.succeed(actor.role === 'admin'));

  const canConnectPost = (postId: PostId) =>
    policy(
      'tag',
      'connectPost',
      (actor) =>
        Effect.gen(function* () {
          const maybePost = yield* postRepo.findById(postId);
          const post = yield* Option.match(maybePost, {
            onSome: Effect.succeed,
            onNone: () =>
              new PostNotFound({
                id: postId,
              }),
          });

          return yield* Effect.succeed(
            actor.role === 'admin' || post.accountId === actor.id,
          );
        }),
      'Post 작성자 또는 관리자만 태그를 연결하거나 삭제할 수 있습니다.',
    );

  const canConnectChallenge = (challengeId: ChallengeId) =>
    policy(
      'tag',
      'connectChallenge',
      (actor) =>
        Effect.gen(function* () {
          const maybeChallenge = yield* challengeRepo.findById(challengeId);
          const challenge = yield* Option.match(maybeChallenge, {
            onSome: Effect.succeed,
            onNone: () => new ChallengeNotFound({ id: challengeId }),
          });
          return yield* Effect.succeed(
            actor.role === 'admin' || challenge.accountId === actor.id,
          );
        }),
      'Challenge 작성자 또는 관리자만 태그를 연결하거나 삭제할 수 있습니다.',
    );

  return {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canConnectPost,
    canConnectChallenge,
  } as const;
});

export class TagPolicy extends Effect.Tag('TagPolicy')<
  TagPolicy,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(TagPolicy, make);

  static Live = this.layer.pipe(
    Layer.provide(PostRepo.Live),
    Layer.provide(ChallengeRepo.Live),
  );
}

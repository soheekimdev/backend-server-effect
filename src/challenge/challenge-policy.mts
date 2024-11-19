import { Effect, Layer, pipe } from 'effect';
import { ChallengeRepo } from './challenge-repo.mjs';
import { Challenge, ChallengeId } from './challenge-schema.mjs';
import { policy } from '@/auth/authorization.mjs';

const make = Effect.gen(function* () {
  const challengeRepo = yield* ChallengeRepo;

  const canCreate = (_toCreate: typeof Challenge.jsonCreate.Type) =>
    policy('challenge', 'create', (actor) => Effect.succeed(true));

  const canRead = (id: ChallengeId) =>
    policy('challenge', 'read', (_actor) => Effect.succeed(true));

  const canUpdate = (id: ChallengeId) =>
    policy(
      'challenge',
      'update',
      (actor) =>
        pipe(
          challengeRepo.with(id, (challenge) =>
            pipe(
              Effect.succeed(
                actor.id === challenge.accountId || actor.role === 'admin',
              ),
            ),
          ),
        ),
      '챌린지 작성자나 관리자만 챌린지를 수정할 수 있습니다.',
    );

  const canDelete = (id: ChallengeId) =>
    policy(
      'challenge',
      'delete',
      (actor) =>
        pipe(
          challengeRepo.with(id, (challenge) =>
            pipe(
              Effect.succeed(
                actor.id === challenge.accountId || actor.role === 'admin',
              ),
            ),
          ),
        ),
      '챌린지 작성자나 관리자만 챌린지를 삭제할 수 있습니다.',
    );

  const canLike = (toLike: ChallengeId) =>
    policy(
      'challenge',
      'like',
      (actor) =>
        pipe(
          challengeRepo.with(toLike, (challenge) =>
            pipe(Effect.succeed(actor.id !== challenge.accountId)),
          ),
        ),
      '챌린지 작성자는 챌린지를 좋아요 할 수 없습니다.',
    );

  const canDislike = (toDislike: ChallengeId) =>
    policy(
      'challenge',
      'dislike',
      (actor) =>
        pipe(
          challengeRepo.with(toDislike, (challenge) =>
            pipe(Effect.succeed(actor.id !== challenge.accountId)),
          ),
        ),
      '챌린지 작성자는 챌린지를 좋아요 취소할 수 없습니다.',
    );

  const canJoin = (_toJoin: ChallengeId) =>
    policy('challenge', 'join', () => Effect.succeed(true));

  return {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canLike,
    canDislike,
    canJoin,
  } as const;
});

export class ChallengePolicy extends Effect.Tag('Challenge/ChallengePolicy')<
  ChallengePolicy,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(ChallengePolicy, make);
  static Live = this.layer.pipe(Layer.provide(ChallengeRepo.Live));
}

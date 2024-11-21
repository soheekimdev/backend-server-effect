import { policy } from '@/auth/authorization.mjs';
import { ChallengeParticipantRepo } from '@/challenge/challenge-participant-repo.mjs';
import { ChallengeRepo } from '@/challenge/challenge-repo.mjs';
import { Effect, Layer, Option, pipe } from 'effect';
import { ChallengeEventNotFound } from './challenge-event-error.mjs';
import { ChallengeEventRepo } from './challenge-event-repo.mjs';
import { ChallengeEvent, ChallengeEventId } from './challenge-event-schema.mjs';
import {
  ChallengeParticipantNotFound,
  ChallengeParticipantTargetNotFound,
} from '@/challenge/challenge-participant-error.mjs';

const make = Effect.gen(function* () {
  const challengeEventRepo = yield* ChallengeEventRepo;
  const challengeRepo = yield* ChallengeRepo;
  const challengeParticipantRepo = yield* ChallengeParticipantRepo;

  const canCreate = (toCreate: typeof ChallengeEvent.jsonCreate.Type) =>
    policy(
      'challenge-event',
      'create',
      (actor) =>
        challengeRepo.with(toCreate.challengeId, (challenge) =>
          Effect.succeed(
            actor.id === challenge.accountId || actor.role === 'admin',
          ),
        ),
      '챌린지 작성자나 관리자만 챌린지 이벤트를 생성할 수 있습니다.',
    );

  const canRead = (id: ChallengeEventId) =>
    policy(
      'challenge-event',
      'read',
      (_actor) => Effect.succeed(true),
      '모두가 챌린지 이벤트를 읽을 수 있습니다',
    );

  const canUpdate = (id: ChallengeEventId) =>
    policy(
      'challenge-event',
      'update',
      (actor) =>
        pipe(
          challengeEventRepo.with(id, (challengeEvent) =>
            Effect.succeed(
              actor.id === challengeEvent.accountId || actor.role === 'admin',
            ),
          ),
        ),
      '챌린지 이벤트 작성자나 관리자만 챌린지 이벤트를 수정할 수 있습니다.',
    );

  const canDelete = (id: ChallengeEventId) =>
    policy(
      'challenge-event',
      'delete',
      (actor) =>
        pipe(
          challengeEventRepo.with(id, (challengeEvent) =>
            Effect.succeed(
              actor.id === challengeEvent.accountId || actor.role === 'admin',
            ),
          ),
        ),
      '챌린지 이벤트 작성자나 관리자만 챌린지 이벤트를 삭제할 수 있습니다.',
    );

  const canCheck = (id: ChallengeEventId) =>
    policy(
      'challenge-event',
      'check',
      (actor) =>
        Effect.gen(function* () {
          const maybeChallengeEvent = yield* challengeEventRepo.findById(id);

          if (Option.isNone(maybeChallengeEvent)) {
            return yield* Effect.succeed(false);
          }

          const challengeEvent = maybeChallengeEvent.value;

          const maybeParticipant =
            yield* challengeParticipantRepo.findParticipantByTarget({
              accountId: actor.id,
              challengeId: challengeEvent.challengeId,
            });

          if (Option.isNone(maybeParticipant)) {
            return yield* Effect.succeed(false);
          }

          return yield* Effect.succeed(true);
        }),
      '챌린지 참가자만 챌린지 이벤트를 체크할 수 있습니다.',
    );

  return {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canCheck,
  } as const;
});

export class ChallengeEventPolicy extends Effect.Tag(
  'ChallengeEvent/ChallengeEventPolicy',
)<ChallengeEventPolicy, Effect.Effect.Success<typeof make>>() {
  static layer = Layer.effect(ChallengeEventPolicy, make);
  static Live = this.layer.pipe(
    Layer.provide(ChallengeEventRepo.Live),
    Layer.provide(ChallengeRepo.Live),
    Layer.provide(ChallengeParticipantRepo.Live),
  );
}

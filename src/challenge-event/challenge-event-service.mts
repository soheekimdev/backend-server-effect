import { CurrentAccount } from '@/account/account-schema.mjs';
import { policyRequire } from '@/auth/authorization.mjs';
import { ChallengeId } from '@/challenge/challenge-schema.mjs';
import { Effect, Layer, Schema } from 'effect';
import { ChallengeEventRepo } from './challenge-event-repo.mjs';
import {
  ChallengeEvent,
  FromStringToCoordinate,
} from './challenge-event-schema.mjs';

const make = Effect.gen(function* () {
  const repo = yield* ChallengeEventRepo;

  const findAllByChallengeId = (challengeId: ChallengeId) =>
    repo
      .findAllByChallengeId(challengeId)
      .pipe(Effect.withSpan('ChallengeEventService.findAllByChallengeId'));

  const create = (
    challengeId: ChallengeId,
    challengeEvent: typeof ChallengeEvent.jsonCreate.Type,
  ) =>
    CurrentAccount.pipe(
      Effect.flatMap((account) =>
        repo.insert(
          ChallengeEvent.insert.make({
            title: challengeEvent.title,
            description: challengeEvent.description,
            accountId: account.id,
            challengeId,
            checkType: challengeEvent.checkType,
            coordinate: Schema.encodeUnknownSync(FromStringToCoordinate)(
              challengeEvent.coordinate,
            ),
            endDatetime: challengeEvent.endDatetime,
            startDatetime: challengeEvent.startDatetime,
            isDeleted: challengeEvent.isDeleted,
            isFinished: challengeEvent.isFinished,
            isPublished: challengeEvent.isPublished,
            updatedAt: undefined,
            createdAt: undefined,
          }),
        ),
      ),
      Effect.withSpan('ChallengeEventService.create'),
      policyRequire('challenge-event', 'create'),
    );

  return {
    findAllByChallengeId,
    create,
  } as const;
});

export class ChallengeEventService extends Effect.Tag('ChallengeEventService')<
  ChallengeEventService,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(ChallengeEventService, make);

  static Live = this.layer.pipe(Layer.provide(ChallengeEventRepo.Live));

  static Test = this.layer.pipe(Layer.provide(ChallengeEventRepo.Test));
}

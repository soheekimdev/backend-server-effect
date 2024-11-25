import { CurrentAccount } from '@/account/account-schema.mjs';
import { policyRequire } from '@/auth/authorization.mjs';
import { ChallengeId } from '@/challenge/challenge-schema.mjs';
import { Effect, Layer, Option, pipe, Schema } from 'effect';
import {
  ChallengeEventCheckRequestDateBadRequest,
  ChallengeEventCheckRequestLocationBadRequest,
} from './challenge-event-error.mjs';
import { ChallengeEventParticipantRepo } from './challenge-event-participant-repo.mjs';
import { ChallengeEventRepo } from './challenge-event-repo.mjs';
import { ChallengeEvent, ChallengeEventId } from './challenge-event-schema.mjs';
import {
  ChallengeEventCheckRequest,
  ChallengeEventCheckResponse,
  FromStringToCoordinate,
} from './helper-schema.mjs';

const DISTANCE_THRESHOLD = 1000;

const make = Effect.gen(function* () {
  const repo = yield* ChallengeEventRepo;
  const challengeEventParticipantRepo = yield* ChallengeEventParticipantRepo;

  const findAllByChallengeId = (challengeId: ChallengeId) =>
    repo
      .findAllByChallengeId(challengeId)
      .pipe(Effect.withSpan('ChallengeEventService.findAllByChallengeId'));

  const findById = (challengeEventId: ChallengeEventId) =>
    repo.with(challengeEventId, (event) => Effect.succeed(event));

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

  const update = (
    challengeEventId: ChallengeEventId,
    toUpdate: Partial<typeof ChallengeEvent.jsonUpdate.Type>,
  ) =>
    repo.with(challengeEventId, (event) =>
      pipe(
        repo.update({
          ...event,
          ...toUpdate,
          coordinate: Schema.encodeUnknownSync(FromStringToCoordinate)(
            event.coordinate,
          ),
          updatedAt: undefined,
        }),
        Effect.withSpan('ChallengeEventService.update'),
        policyRequire('challenge-event', 'update'),
      ),
    );

  const deleteById = (challengeEventId: ChallengeEventId) =>
    repo.with(challengeEventId, (event) =>
      pipe(
        repo.update({
          ...event,
          coordinate: Schema.encodeUnknownSync(FromStringToCoordinate)(
            event.coordinate,
          ),
          isDeleted: true,
          updatedAt: undefined,
        }),
        Effect.withSpan('ChallengeEventService.delete'),
        policyRequire('challenge-event', 'delete'),
      ),
    );

  const check = (
    challengeId: ChallengeId,
    challengeEventId: ChallengeEventId,
    payload: typeof ChallengeEventCheckRequest.Type,
  ) =>
    Effect.gen(function* () {
      const account = yield* CurrentAccount;

      const event = yield* repo.with(challengeEventId, (ev) =>
        Effect.succeed(ev),
      );

      if (event.checkType !== payload.checkType) {
        return yield* Effect.succeed(
          ChallengeEventCheckResponse.make({
            result: 'fail',
            message: 'checkType does not match',
          }),
        );
      }

      const maybeEvParticipant =
        yield* challengeEventParticipantRepo.findByTarget({
          accountId: account.id,
          challengeEventId,
        });

      const evParticipant = Option.getOrElse(
        Option.flatMapNullable(maybeEvParticipant, (ev) => ev.isChecked),
        () => {
          return false;
        },
      );

      if (evParticipant) {
        return yield* Effect.succeed(
          ChallengeEventCheckResponse.make({
            result: 'success',
            message: 'Already checked to success',
          }),
        );
      }

      if (event.checkType === 'manual') {
        // check manually
        yield* challengeEventParticipantRepo.upsert({
          accountId: account.id,
          challengeEventId,
          isChecked: true,
          createdAt: undefined,
          updatedAt: undefined,
        });
        return yield* Effect.succeed(
          ChallengeEventCheckResponse.make({
            result: 'success',
            message: 'Checked successfully',
          }),
        );
      }

      if (event.checkType === 'location') {
        const location = Option.getOrThrowWith(
          Option.fromNullable(payload.location),
          () => new ChallengeEventCheckRequestLocationBadRequest(),
        );

        const { distance } = yield* repo.getDistanceFromChallengeEvent(
          challengeEventId,
          location,
        );

        yield* challengeEventParticipantRepo.upsert({
          accountId: account.id,
          challengeEventId,
          isChecked: distance < DISTANCE_THRESHOLD,
          createdAt: undefined,
          updatedAt: undefined,
        });

        return yield* Effect.succeed(
          ChallengeEventCheckResponse.make({
            result: distance < DISTANCE_THRESHOLD ? 'success' : 'fail',
            message:
              distance < DISTANCE_THRESHOLD
                ? 'Checked successfully'
                : `Too far from the event location; ${distance} meters away`,
          }),
        );
      }

      if (event.checkType === 'duration') {
        const now = new Date();
        const startDate = Option.getOrThrowWith(
          Option.fromNullable(event.startDatetime),
          () => new ChallengeEventCheckRequestDateBadRequest(),
        );
        const endDate = Option.getOrThrowWith(
          Option.fromNullable(event.endDatetime),
          () => new ChallengeEventCheckRequestDateBadRequest(),
        );
        const nowMillis = now.getTime();
        const startDateMillis = startDate.epochMillis;
        const endDateMillis = endDate.epochMillis + 24 * 60 * 60 * 1000; // add 24 hours

        const isGood =
          nowMillis >= startDateMillis && nowMillis <= endDateMillis;

        yield* challengeEventParticipantRepo.upsert({
          accountId: account.id,
          challengeEventId,
          isChecked: isGood,
          createdAt: undefined,
          updatedAt: undefined,
        });

        return yield* Effect.succeed(
          ChallengeEventCheckResponse.make({
            result: isGood ? 'success' : 'fail',
            message: isGood
              ? 'Checked successfully'
              : 'Not in the event duration',
          }),
        );
      }

      return yield* Effect.succeed(
        ChallengeEventCheckResponse.make({
          result: 'fail',
          message: 'Unknown checkType',
        }),
      );
    });

  const getChecks = (challengeEventId: ChallengeEventId) =>
    challengeEventParticipantRepo.findAllByChallengeEventId(challengeEventId);

  return {
    findById,
    findAllByChallengeId,
    create,
    update,
    deleteById,
    check,
    getChecks,
  } as const;
});

export class ChallengeEventService extends Effect.Tag('ChallengeEventService')<
  ChallengeEventService,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(ChallengeEventService, make);

  static Live = this.layer.pipe(
    Layer.provide(ChallengeEventRepo.Live),
    Layer.provide(ChallengeEventParticipantRepo.Live),
  );

  static Test = this.layer.pipe(Layer.provide(ChallengeEventRepo.Test));
}

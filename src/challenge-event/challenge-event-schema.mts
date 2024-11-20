import {
  CustomDateTimeInsert,
  CustomDateTimeUpdate,
} from '@/misc/date-schema.mjs';
import { Model } from '@effect/sql';
import { Schema } from 'effect';
import { ChallengeId } from '../challenge/challenge-schema.mjs';

export const ChallengeEventId = Schema.String.pipe(
  Schema.brand('ChallengeEventId'),
);

export type ChallengeEventId = typeof ChallengeEventId.Type;

export class ChallengeEvent extends Model.Class<ChallengeEvent>(
  'ChallengeEvent',
)({
  id: Model.Generated(ChallengeEventId),
  checkType: Schema.Literal('distance', 'duration', 'manual', 'other'),
  challengeId: ChallengeId,
  isDeleted: Schema.Boolean,
  isPublished: Schema.Boolean,
  isFinished: Schema.Boolean,
  startDatetime: Schema.DateTimeUtc,
  endDatetime: Schema.DateTimeUtc,
  coordinate: Schema.Any,
  createdAt: CustomDateTimeInsert,
  updatedAt: CustomDateTimeUpdate,
}) {}

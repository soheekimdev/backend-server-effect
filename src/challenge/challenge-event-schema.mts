import {
  CustomDateTimeInsert,
  CustomDateTimeUpdate,
} from '@/misc/date-schema.mjs';
import { Model } from '@effect/sql';
import { Schema } from 'effect';
import { ChallengeId } from './challenge-schema.mjs';
import { AccountId } from '@/account/account-schema.mjs';

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
  challengeWriterId: AccountId,
  isPublished: Schema.Boolean,
  isFinished: Schema.Boolean,
  startDatetime: Schema.DateTimeUtc,
  endDatetime: Schema.DateTimeUtc,
  createdAt: CustomDateTimeInsert,
  updatedAt: CustomDateTimeUpdate,
}) {}

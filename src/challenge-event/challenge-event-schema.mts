import { AccountId } from '@/account/account-schema.mjs';
import {
  CustomDateTimeInsert,
  CustomDateTimeUpdate,
  DateTimeFromDate,
} from '@/misc/date-schema.mjs';
import { Model } from '@effect/sql';
import { Schema } from 'effect';
import { ChallengeId } from '../challenge/challenge-schema.mjs';
import {
  CoordinateForFrontend,
  FromStringToCoordinate,
} from './helper-schema.mjs';

export const ChallengeEventId = Schema.String.pipe(
  Schema.brand('ChallengeEventId'),
);

export type ChallengeEventId = typeof ChallengeEventId.Type;

export class ChallengeEvent extends Model.Class<ChallengeEvent>(
  'ChallengeEvent',
)({
  id: Model.Generated(ChallengeEventId),
  checkType: Schema.Literal('location', 'duration', 'manual', 'other'),
  title: Schema.String,
  description: Schema.String,
  accountId: Model.Sensitive(AccountId),
  challengeId: Model.Sensitive(ChallengeId),
  isDeleted: Schema.Boolean.pipe(
    Schema.annotations({
      description:
        '챌린지 이벤트가 삭제되었는지 여부 (사용하지 않습니다; 추후 확장성을 위해 만들어둠)',
      default: false,
    }),
  ),
  isPublished: Schema.Boolean.pipe(
    Schema.annotations({
      description:
        '챌린지 이벤트가 챌린지 참가자에게 공개되었는지 여부 (사용하지 않습니다; 추후 확장성을 위해 만들어둠)',
      default: false,
    }),
  ),
  isFinished: Schema.Boolean.pipe(
    Schema.annotations({
      description:
        '챌린지 이벤트가 종료되었는지 여부 (사용하지 않습니다; 추후 확장성을 위해 만들어둠)',
      default: false,
    }),
  ),
  startDatetime: Schema.NullishOr(DateTimeFromDate),
  endDatetime: Schema.NullishOr(DateTimeFromDate),
  coordinate: Model.Field({
    select: Schema.NullishOr(FromStringToCoordinate.to),
    insert: Schema.NullishOr(FromStringToCoordinate.from),
    update: Schema.NullishOr(FromStringToCoordinate.from),
    json: Schema.NullishOr(FromStringToCoordinate.to),
    jsonCreate: Schema.NullishOr(CoordinateForFrontend),
    jsonUpdate: Schema.NullishOr(CoordinateForFrontend),
  }),
  createdAt: CustomDateTimeInsert,
  updatedAt: CustomDateTimeUpdate,
}) {}

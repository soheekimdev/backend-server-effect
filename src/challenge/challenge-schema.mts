import { AccountId } from '@/account/account-schema.mjs';
import {
  CustomDateTimeInsert,
  CustomDateTimeUpdate,
} from '@/misc/date-schema.mjs';
import { Model } from '@effect/sql';
import { Schema } from 'effect';

export const ChallengeId = Schema.String.pipe(Schema.brand('ChallengeId'));

export type ChallengeId = typeof ChallengeId.Type;

export class Challenge extends Model.Class<Challenge>('Challenge')({
  id: Model.Generated(ChallengeId),
  title: Schema.String,
  description: Schema.String,
  type: Schema.String,
  startDate: Schema.Date,
  endDate: Schema.Date,
  writerAccountId: AccountId,
  isDeleted: Schema.Boolean.annotations({
    default: false,
  }),
  isPublished: Schema.Boolean.annotations({
    default: false,
  }),
  isFinished: Schema.Boolean.annotations({
    default: false,
  }),
  createdAt: CustomDateTimeInsert,
  updatedAt: CustomDateTimeUpdate,
}) {}

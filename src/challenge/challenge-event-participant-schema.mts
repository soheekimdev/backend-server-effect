import { Model } from '@effect/sql';
import { Schema } from 'effect';
import { ChallengeEventId } from './challenge-event-schema.mjs';
import { AccountId } from '@/account/account-schema.mjs';
import {
  CustomDateTimeInsert,
  CustomDateTimeUpdate,
} from '@/misc/date-schema.mjs';

export const ChallengeEventParticipantId = Schema.String.pipe(
  Schema.brand('ChallengeEventParticipantId'),
);

export type ChallengeEventParticipantId =
  typeof ChallengeEventParticipantId.Type;

export class ChallengeEventParticipant extends Model.Class<ChallengeEventParticipant>(
  'ChallengeEventParticipant',
)({
  id: Model.Generated(ChallengeEventParticipantId),
  accountId: AccountId,
  challengeEventId: ChallengeEventId,
  isDeleted: Schema.Boolean,
  status: Schema.String,
  isWinner: Schema.Boolean,
  createdAt: CustomDateTimeInsert,
  updatedAt: CustomDateTimeUpdate,
}) {}

import { Model } from '@effect/sql';
import { Schema } from 'effect';
import { ChallengeEventId } from './challenge-event-schema.mjs';
import { AccountId } from '@/account/account-schema.mjs';
import { ChallengeId } from './challenge-schema.mjs';
import {
  CustomDateTimeInsert,
  CustomDateTimeUpdate,
} from '@/misc/date-schema.mjs';

export const ChallengeParticipantId = Schema.String.pipe(
  Schema.brand('ChallengeParticipantId'),
);

export type ChallengeParticipantId = typeof ChallengeParticipantId.Type;

export class ChallengeParticipant extends Model.Class<ChallengeParticipant>(
  'ChallengeParticipant',
)({
  id: Model.Generated(ChallengeParticipantId),
  challengeEventId: ChallengeEventId,
  accountId: AccountId,
  ChallengeId: ChallengeId,
  isDeleted: Schema.Boolean,
  isFinished: Schema.Boolean,
  isWinner: Schema.Boolean,
  createdAt: CustomDateTimeInsert,
  updatedAt: CustomDateTimeUpdate,
}) {}

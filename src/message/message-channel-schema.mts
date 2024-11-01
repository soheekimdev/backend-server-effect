import { AccountId } from '@/account/account-schema.mjs';
import { ChallengeId } from '@/challenge/challenge-schema.mjs';
import {
  CustomDateTimeInsert,
  CustomDateTimeUpdate,
} from '@/misc/date-schema.mjs';
import { Model } from '@effect/sql';
import { Schema } from 'effect';

export const MessageChannelId = Schema.String.pipe(
  Schema.brand('MessageChannelId'),
);

export type MessageChannelId = typeof MessageChannelId.Type;

export class MessageChannel extends Model.Class<MessageChannel>(
  'MessageChannel',
)({
  id: Model.Generated(MessageChannelId),
  accountId: AccountId,
  createdAt: CustomDateTimeInsert,
  updatedAt: CustomDateTimeUpdate,
  isDeleted: Schema.Boolean.annotations({
    default: false,
  }),
  name: Schema.String,
  description: Schema.String,
  imageUrl: Schema.String,
  isPrivate: Schema.Boolean.annotations({
    default: false,
  }),
  challengeId: ChallengeId,
}) {}

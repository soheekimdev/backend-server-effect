import { AccountId } from '@/account/account-schema.mjs';
import { MessageChannelId } from '@/message/message-channel-schema.mjs';
import {
  CustomDateTimeInsert,
  CustomDateTimeUpdate,
} from '@/misc/date-schema.mjs';
import { Model } from '@effect/sql';
import { Schema } from 'effect';

export const MessageChannelMemberId = Schema.String.pipe(
  Schema.brand('MessageChannelMemberId'),
);

export type MessageChannelMemberId = typeof MessageChannelMemberId.Type;

export class MessageChannelMember extends Model.Class<MessageChannelMember>(
  'MessageChannelMember',
)({
  id: Model.Generated(MessageChannelMemberId),
  accountId: AccountId,
  messageChannelId: MessageChannelId,
  createdAt: CustomDateTimeInsert,
  updatedAt: CustomDateTimeUpdate,
  isDeleted: Schema.Boolean.annotations({
    default: false,
  }),
  isBlocked: Schema.Boolean.annotations({
    default: false,
  }),
  isMuted: Schema.Boolean.annotations({
    default: false,
  }),
  role: Schema.Literal('admin', 'member').annotations({
    default: 'member',
  }),
}) {}

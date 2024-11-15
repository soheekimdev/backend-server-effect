import { AccountId } from '@/account/account-schema.mjs';
import {
  CustomDateTimeInsert,
  CustomDateTimeUpdate,
} from '@/misc/date-schema.mjs';
import { Model } from '@effect/sql';
import { Schema } from 'effect';
import { MessageChannelId } from './message-channel-schema.mjs';

export const MessageId = Schema.String.pipe(Schema.brand('MessageId'));

export type MessageId = typeof MessageId.Type;

export class Message extends Model.Class<Message>('Message')({
  id: Model.Generated(MessageId),
  senderAccountId: AccountId,
  receiverAccountId: AccountId,
  content: Schema.String,
  isDeleted: Schema.Boolean,
  isRead: Schema.Boolean,
  isSent: Schema.Boolean,
  isReceived: Schema.Boolean,
  isSystemMessage: Schema.Boolean,
  childMessageId: Schema.NullishOr(MessageId),
  messageChannelId: MessageChannelId,
  createdAt: CustomDateTimeInsert,
  updatedAt: CustomDateTimeUpdate,
}) {}

import { AccountId } from '@/account/account-schema.mjs';
import {
  CustomDateTimeInsert,
  CustomDateTimeUpdate,
} from '@/misc/date-schema.mjs';
import { Model } from '@effect/sql';
import { Schema } from 'effect';

export const NotificationId = Schema.String.pipe(
  Schema.brand('NotificationId'),
);

export type NotificationId = typeof NotificationId.Type;

export class Notification extends Model.Class<Notification>('Notification')({
  id: Model.Generated(NotificationId),
  senderAccountId: AccountId,
  receiverAccountId: AccountId,
  type: Schema.Literal(
    'like',
    'comment',
    'follow',
    'mention',
    'reply',
    'share',
    'system',
    'message',
    'advertisement',
    'other',
  ),
  message: Schema.String,
  linkTo: Schema.UndefinedOr(Schema.String),
  isRead: Schema.Boolean,
  isDeleted: Schema.Boolean,
  createdAt: CustomDateTimeInsert,
  updatedAt: CustomDateTimeUpdate,
}) {}

import {
  CustomDateTimeInsert,
  CustomDateTimeUpdate,
} from '@/misc/date-schema.mjs';
import { Model } from '@effect/sql';
import { Schema } from 'effect';
import { AccountId } from './account-schema.mjs';

export const AccountBlockId = Schema.String.pipe(
  Schema.brand('AccountBlockId'),
);

export type AccountBlockId = typeof AccountBlockId.Type;

export class AccountBlock extends Model.Class<AccountBlock>('AccountBlock')({
  id: Model.Generated(AccountBlockId),
  blockerAccountId: AccountId,
  blockedAccountId: AccountId,
  isDeleted: Schema.Boolean,
  createdAt: CustomDateTimeInsert,
  updatedAt: CustomDateTimeUpdate,
}) {}

import { AccountId } from '@/account/account-schema.mjs';
import { Model } from '@effect/sql';
import { Schema } from 'effect';
import { TagId } from './tag-schema.mjs';
import {
  CustomDateTimeInsert,
  CustomDateTimeUpdate,
} from '@/misc/date-schema.mjs';

export const AccountInterestTagId = Schema.String.pipe(
  Schema.brand('AccountInterestTagId'),
);

export type AccountInterestTagId = typeof AccountInterestTagId.Type;

export class AccountInterestTag extends Model.Class<AccountInterestTag>(
  'AccountInterestTag',
)({
  id: Model.Generated(AccountInterestTagId),
  accountId: AccountId,
  tagId: TagId,
  isDeleted: Schema.Boolean,
  createdAt: CustomDateTimeInsert,
  updatedAt: CustomDateTimeUpdate,
}) {}

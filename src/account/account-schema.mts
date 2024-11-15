import {
  CustomDateTimeInsert,
  CustomDateTimeUpdate,
} from '@/misc/date-schema.mjs';
import { Email } from '@/misc/email-schema.mjs';
import { Model } from '@effect/sql';
import { Context, Schema } from 'effect';

export const AccountId = Schema.String.pipe(Schema.brand('AccountId'));

export type AccountId = typeof AccountId.Type;

export class Account extends Model.Class<Account>('Account')({
  id: Model.Generated(AccountId),
  email: Email,
  passwordHash: Model.Sensitive(Schema.String),
  passwordSalt: Model.Sensitive(Schema.String),
  profileImageUrl: Schema.NullishOr(Schema.String),
  mainLanguage: Schema.NullishOr(Schema.String),
  nationality: Schema.NullishOr(Schema.String),
  bio: Schema.NullishOr(Schema.String),
  externalUrls: Schema.NullishOr(Schema.Array(Schema.String)),
  isEmailVerified: Schema.NullishOr(Schema.Boolean),
  isPrivate: Schema.NullishOr(Schema.Boolean),
  role: Schema.Literal('admin', 'user').annotations({
    default: 'user',
  }),
  username: Schema.NullishOr(Schema.String),
  birthday: Schema.NullishOr(Schema.Date),
  createdAt: CustomDateTimeInsert,
  updatedAt: CustomDateTimeUpdate,
}) {}

export class CurrentAccount extends Context.Tag('CurrentAccount')<
  CurrentAccount,
  Account
>() {}

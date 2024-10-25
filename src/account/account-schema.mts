import { Email } from '@/misc/email-schema.mjs';
import { Model } from '@effect/sql';
import { Context, Schema } from 'effect';

export const AccountId = Schema.Number.pipe(Schema.brand('AccountId'));

export type AccountId = typeof AccountId.Type;

export const AccountIdFromString = Schema.NumberFromString.pipe(
  Schema.compose(AccountId),
);

export class Account extends Model.Class<Account>('Account')({
  id: Model.Generated(AccountId),
  email: Email,
  passwordHash: Schema.String,
  passwordSalt: Schema.String,
  profileImageUrl: Schema.optional(Schema.String),
  mainLanguage: Schema.optional(Schema.String),
  nationality: Schema.optional(Schema.String),
  bio: Schema.optional(Schema.String),
  externalUrls: Schema.optional(Schema.Array(Schema.String)),
  interests: Schema.optional(Schema.Array(Schema.String)),
  isEmailVerified: Schema.Boolean,
  createdAt: Model.DateTimeInsert,
  updatedAt: Model.DateTimeUpdate,
}) {}

export class CurrentAccount extends Context.Tag('CurrentAccount')<
  CurrentAccount,
  Account
>() {}

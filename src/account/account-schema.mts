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
  profileImageUrl: Schema.optionalWith(Schema.String, {
    nullable: true,
    onNoneEncoding: () => undefined,
  }),
  mainLanguage: Schema.optionalWith(Schema.String, {
    nullable: true,
    onNoneEncoding: () => undefined,
  }),
  nationality: Schema.optionalWith(Schema.String, {
    nullable: true,
    onNoneEncoding: () => undefined,
  }),
  bio: Schema.optionalWith(Schema.String, {
    nullable: true,
    onNoneEncoding: () => undefined,
  }),
  externalUrls: Schema.optionalWith(Schema.Array(Schema.String), {
    nullable: true,
    onNoneEncoding: () => undefined,
  }),
  isEmailVerified: Schema.optionalWith(Schema.Boolean, {
    nullable: true,
    onNoneEncoding: () => undefined,
  }),
  isPrivate: Schema.optionalWith(Schema.Boolean, {
    nullable: true,
    onNoneEncoding: () => undefined,
  }),
  role: Schema.Literal('admin', 'user').annotations({
    default: 'user',
  }),
  createdAt: CustomDateTimeInsert,
  updatedAt: CustomDateTimeUpdate,
}) {}

export class CurrentAccount extends Context.Tag('CurrentAccount')<
  CurrentAccount,
  Account
>() {}

import { Schema } from 'effect';
import { AccountId } from './account-schema.mjs';
import { HttpApiSchema } from '@effect/platform';
import { Email } from '@/misc/email-schema.mjs';

export class AccountNotFound extends Schema.TaggedError<AccountNotFound>()(
  'AccountNotFound',
  { id: AccountId },
  HttpApiSchema.annotations({ status: 404 }),
) {}

export class AccountByEmailNotFound extends Schema.TaggedError<AccountByEmailNotFound>()(
  'AccountByEmailNotFound',
  { email: Email },
  HttpApiSchema.annotations({ status: 404 }),
) {}

export class AccountAlreadyExists extends Schema.TaggedError<AccountAlreadyExists>()(
  'AccountAlreadyExists',
  { email: Email },
  HttpApiSchema.annotations({ status: 409 }),
) {}

export class InvalidPassword extends Schema.TaggedError<InvalidPassword>()(
  'InvalidPassword',
  {},
  HttpApiSchema.annotations({ status: 400 }),
) {}

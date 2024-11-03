import { Schema } from 'effect';
import { AccountId } from './account-schema.mjs';
import { HttpApiSchema } from '@effect/platform';
import { Email } from '@/misc/email-schema.mjs';

export class AccountNotFound extends Schema.TaggedError<AccountNotFound>()(
  'AccountNotFound',
  { id: AccountId },
  HttpApiSchema.annotations({
    status: 404,
    title: 'Account Not Found',
    description: 'ID에 해당하는 계정이 존재하지 않습니다.',
  }),
) {}

export class AccountByEmailNotFound extends Schema.TaggedError<AccountByEmailNotFound>()(
  'AccountByEmailNotFound',
  { email: Email },
  HttpApiSchema.annotations({
    status: 404,
    title: 'Account Not Found',
    description: 'Email에 해당하는 계정이 존재하지 않습니다.',
  }),
) {}

export class AccountAlreadyExists extends Schema.TaggedError<AccountAlreadyExists>()(
  'AccountAlreadyExists',
  { email: Email },
  HttpApiSchema.annotations({
    status: 409,
    title: 'Account Already Exists',
    description: '이미 존재하는 계정입니다.',
  }),
) {}

export class InvalidPassword extends Schema.TaggedError<InvalidPassword>()(
  'InvalidPassword',
  {},
  HttpApiSchema.annotations({
    status: 400,
    title: 'Invalid Password',
    description: '비밀번호가 올바르지 않거나, 계정이 존재하지 않습니다.',
  }),
) {}

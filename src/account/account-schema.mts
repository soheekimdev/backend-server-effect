import { HttpApiSchema } from '@effect/platform';
import { Context, Schema } from 'effect';

export class Account extends Schema.Class<Account>('Account')({
  id: Schema.Number,
  name: Schema.String,
}) {}

export class CurrentAccount extends Context.Tag('CurrentAccount')<
  CurrentAccount,
  Account
>() {}

export class Unauthorized extends Schema.TaggedError<Unauthorized>()(
  'Unauthorized',
  {
    message: Schema.String,
  },
  HttpApiSchema.annotations({ status: 401 }),
) {}

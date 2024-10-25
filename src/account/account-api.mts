import { Authentication } from '@/auth/authentication.mjs';
import {
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
  OpenApi,
} from '@effect/platform';
import { Schema } from 'effect';
import { Account, AccountIdFromString } from './account-schema.mjs';
import { AccountNotFound } from './account-error.mjs';
import { Unauthorized } from '@/auth/error-403.mjs';

export class AccountApi extends HttpApiGroup.make('accounts')
  .add(
    HttpApiEndpoint.get('findById', '/:id')
      .setPath(
        Schema.Struct({
          id: AccountIdFromString,
        }),
      )
      .addSuccess(Account)
      .setHeaders(
        Schema.Struct({
          page: Schema.NumberFromString.pipe(
            Schema.optionalWith({ default: () => 1 }),
          ),
        }),
      )
      .addError(AccountNotFound)
      .addError(Unauthorized),
  )
  .add(
    HttpApiEndpoint.post('signUp', '/sign-up')
      .setPayload(Account.jsonCreate)
      .addSuccess(Account),
  )
  .add(HttpApiEndpoint.get('me', '/me').addSuccess(Account))
  .middleware(Authentication)
  .prefix('/api/accounts')
  .annotateContext(
    OpenApi.annotations({
      title: '계정 API',
    }),
  ) {}

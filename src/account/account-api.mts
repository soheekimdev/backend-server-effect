import { Authentication } from '@/auth/authentication.mjs';
import { Unauthorized } from '@/auth/error-403.mjs';
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from '@effect/platform';
import { Schema } from 'effect';
import { AccountNotFound } from './account-error.mjs';
import { Account, AccountIdFromString } from './account-schema.mjs';
import { SignIn } from './sign-in-schema.mjs';
import { SignUp } from './sign-up-schema.mjs';

export class AccountApi extends HttpApiGroup.make('accounts')
  .add(
    HttpApiEndpoint.get('findById', '/:id')
      .setPath(
        Schema.Struct({
          id: AccountIdFromString,
        }),
      )
      .middleware(Authentication)
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
      .setPayload(SignUp)
      .addSuccess(Account),
  )
  .add(
    HttpApiEndpoint.get('signIn', '/sign-in')
      .setPayload(SignIn)
      .addSuccess(Account),
  )
  .add(
    HttpApiEndpoint.get('me', '/me')
      .middleware(Authentication)
      .addSuccess(Account),
  )
  .prefix('/api/accounts')
  .annotateContext(
    OpenApi.annotations({
      title: '계정 API',
    }),
  ) {}

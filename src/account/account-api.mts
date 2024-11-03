import { Authentication } from '@/auth/authentication.mjs';
import { Unauthenticated } from '@/auth/error-401.mjs';
import { Unauthorized } from '@/auth/error-403.mjs';
import {
  GeneratingSaltError,
  HashingPasswordError,
} from '@/crypto/crypto-error.mjs';
import { VerifyTokenError } from '@/crypto/token-error.mjs';
import { ServerError } from '@/misc/common-error.mjs';
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from '@effect/platform';
import { Schema } from 'effect';
import {
  AccountAlreadyExists,
  AccountNotFound,
  InvalidPassword,
} from './account-error.mjs';
import { Account, AccountId } from './account-schema.mjs';
import { SignIn } from './sign-in-schema.mjs';
import { SignUp } from './sign-up-schema.mjs';

export class AccountApi extends HttpApiGroup.make('accounts')
  .add(
    HttpApiEndpoint.get('findById', '/:id')
      .setPath(
        Schema.Struct({
          id: AccountId,
        }),
      )
      .middleware(Authentication)
      .addSuccess(Account.json)
      .addError(AccountNotFound)
      .addError(Unauthorized),
  )
  .add(
    HttpApiEndpoint.patch('updateById', '/:id')
      .setPath(
        Schema.Struct({
          id: AccountId,
        }),
      )
      .middleware(Authentication)
      .setPayload(Account.update)
      .addSuccess(Account.json)
      .addError(AccountNotFound)
      .addError(Unauthorized),
  )
  .add(
    HttpApiEndpoint.post('signUp', '/sign-up')
      .setPayload(SignUp)
      .addSuccess(Account.json)
      .addError(GeneratingSaltError)
      .addError(HashingPasswordError)
      .addError(ServerError)
      .addError(AccountAlreadyExists),
  )
  .add(
    HttpApiEndpoint.post('signIn', '/sign-in')
      .setPayload(SignIn)
      .addSuccess(
        Schema.Struct({
          account: Account.json,
          accessToken: Schema.String,
          refreshToken: Schema.String,
        }),
      )
      .addError(AccountNotFound)
      .addError(InvalidPassword)
      .addError(Unauthenticated),
  )
  .add(
    HttpApiEndpoint.get('me', '/me')
      .middleware(Authentication)
      .addSuccess(Account.json)
      .addError(AccountNotFound),
  )
  .add(
    HttpApiEndpoint.post('signOut', '/sign-out')
      .middleware(Authentication)
      .addSuccess(Schema.Void),
  )
  .add(
    HttpApiEndpoint.post('invalidate', '/invalidate')
      .setHeaders(
        Schema.Struct({
          'refresh-token': Schema.String,
        }),
      )
      .middleware(Authentication)
      .addError(VerifyTokenError)
      .addSuccess(
        Schema.Struct({
          accessToken: Schema.String,
          refreshToken: Schema.String,
        }),
      ),
  )
  .prefix('/api/accounts')
  .annotateContext(
    OpenApi.annotations({
      title: '계정 API',
    }),
  ) {}

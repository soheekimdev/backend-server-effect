import { Authentication } from '@/auth/authentication.mjs';
import { Unauthenticated } from '@/auth/error-401.mjs';
import { Unauthorized } from '@/auth/error-403.mjs';
import {
  GeneratingSaltError,
  HashingPasswordError,
} from '@/crypto/crypto-error.mjs';
import { ServerError } from '@/misc/common-error.mjs';
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from '@effect/platform';
import { Schema } from 'effect';
import { AccountAlreadyExists, AccountNotFound } from './account-error.mjs';
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
      .setPayload(
        Schema.Struct({
          name: Schema.String,
          email: Schema.String,
          password: Schema.String,
        }),
      )
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
      .addError(Unauthenticated),
  )
  .add(
    HttpApiEndpoint.get('me', '/me')
      .middleware(Authentication)
      .addSuccess(Account.json)
      .addError(Unauthenticated),
  )
  .add(
    HttpApiEndpoint.patch('update', '/me')
      .middleware(Authentication)
      .setPayload(Account.jsonUpdate)
      .addSuccess(Account.json),
  )
  .add(
    HttpApiEndpoint.post('signOut', '/sign-out')
      .middleware(Authentication)
      .addSuccess(Schema.Void),
  )
  .add(
    HttpApiEndpoint.post('refresh', '/refresh')
      .middleware(Authentication)
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

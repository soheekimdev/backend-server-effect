import { Authentication } from '@/auth/authentication.mjs';
import {
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
  OpenApi,
} from '@effect/platform';
import { Schema } from 'effect';
import { Account } from './account-schema.mjs';

export class AccountApi extends HttpApiGroup.make('accounts')
  .add(
    HttpApiEndpoint.get('findById', '/:id')
      .setPath(
        Schema.Struct({
          id: Schema.NumberFromString,
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
      .addError(
        Schema.String.pipe(
          HttpApiSchema.asEmpty({ status: 413, decode: () => 'boom' }),
        ),
      ),
  )
  .add(
    HttpApiEndpoint.post('create', '/')
      .setPayload(
        HttpApiSchema.Multipart(
          Schema.Struct({
            name: Schema.String,
          }),
        ),
      )
      .addSuccess(Account),
  )
  .add(HttpApiEndpoint.get('me', '/me').addSuccess(Account))
  .middleware(Authentication)
  .prefix('/accounts')
  .annotateContext(
    OpenApi.annotations({
      title: 'Accounts API',
      description: 'API for managing accounts',
    }),
  ) {}

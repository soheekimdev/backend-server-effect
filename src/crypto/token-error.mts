import { HttpApiSchema } from '@effect/platform';
import { Schema } from 'effect';

export class AccessTokenGenerationError extends Schema.TaggedError<AccessTokenGenerationError>()(
  'AccessTokenGenerationError',
  {},
  HttpApiSchema.annotations({ status: 500 }),
) {}

export class RefreshTokenGenerationError extends Schema.TaggedError<AccessTokenGenerationError>()(
  'RefreshTokenGenerationError',
  {},
  HttpApiSchema.annotations({ status: 500 }),
) {}

export class VerifyTokenError extends Schema.TaggedError<VerifyTokenError>()(
  'VerifyTokenError',
  {},
  HttpApiSchema.annotations({ status: 401 }),
) {}

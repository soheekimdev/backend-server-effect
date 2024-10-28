import { HttpApiSchema } from '@effect/platform';
import { Schema } from 'effect';

export class GeneratingSaltError extends Schema.TaggedError<GeneratingSaltError>()(
  'GeneratingSaltError',
  {},
  HttpApiSchema.annotations({ status: 500 }),
) {}

export class HashingPasswordError extends Schema.TaggedError<HashingPasswordError>()(
  'HashingPasswordError',
  {},
  HttpApiSchema.annotations({ status: 500 }),
) {}

import { HttpApiSchema } from '@effect/platform';
import { Schema } from 'effect';

export class ServerError extends Schema.TaggedError<ServerError>()(
  'ServerError',
  {
    message: Schema.NullishOr(Schema.String),
  },
  HttpApiSchema.annotations({ status: 500 }),
) {}

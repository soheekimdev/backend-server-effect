import { HttpApiSchema } from '@effect/platform';
import { Schema } from 'effect';

export class ServerError extends Schema.TaggedError<ServerError>()(
  'ServerError',
  {
    message: Schema.optionalWith(Schema.String, {
      default: () => 'An error occurred',
      nullable: true,
    }),
  },
  HttpApiSchema.annotations({ status: 500 }),
) {}

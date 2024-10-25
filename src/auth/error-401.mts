import { HttpApiSchema } from '@effect/platform';
import { Schema } from 'effect';

export class Unauthenticated extends Schema.TaggedError<Unauthenticated>()(
  'Unauthenticated',
  {
    message: Schema.String,
  },
  HttpApiSchema.annotations({ status: 401 }),
) {}

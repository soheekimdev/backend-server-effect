import { Schema } from 'effect';

export const FindManyUrlParams = Schema.Struct({
  page: Schema.optionalWith(
    Schema.NumberFromString.pipe(Schema.int(), Schema.positive()),
    {
      default: () => 1,
    },
  ),
  limit: Schema.optionalWith(
    Schema.NumberFromString.pipe(Schema.int(), Schema.positive()),
    {
      default: () => 20,
    },
  ),
}).annotations({
  description: 'Find many items with pagination',
});

export type FindManyUrlParams = typeof FindManyUrlParams.Type;

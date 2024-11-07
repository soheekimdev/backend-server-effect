import { Schema } from 'effect';

export const CommonCountSchema = Schema.Struct({
  total: Schema.NumberFromString.pipe(Schema.int(), Schema.nonNegative()),
});

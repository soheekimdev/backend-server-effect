import { DateTimeWithNow, Field } from '@effect/sql/Model';
import { DateTime, Schema } from 'effect';

export const DateTimeFromDate = Schema.transform(
  Schema.ValidDateFromSelf.annotations({ identifier: 'DateTimeFromDate' }),
  Schema.DateTimeUtcFromSelf.annotations({ identifier: 'DateTimeUtc' }),
  {
    decode: DateTime.unsafeFromDate,
    encode: DateTime.toDateUtc,
  },
).annotations({
  identifier: 'DateTimeUtc',
  jsonSchema: { type: 'string' },
});

export const CustomDateTimeInsert = Field({
  select: DateTimeFromDate,
  insert: DateTimeWithNow,
  json: DateTimeFromDate,
});

export const CustomDateTimeUpdate = Field({
  select: DateTimeFromDate,
  insert: DateTimeWithNow,
  update: DateTimeWithNow,
  json: DateTimeFromDate,
});

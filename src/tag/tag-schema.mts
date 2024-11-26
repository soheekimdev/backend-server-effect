import {
  CustomDateTimeInsert,
  CustomDateTimeUpdate,
} from '@/misc/date-schema.mjs';
import { Model } from '@effect/sql';
import { Schema } from 'effect';

export const TagId = Schema.String.pipe(Schema.brand('TagId'));

export type TagId = typeof TagId.Type;

export class Tag extends Model.Class<Tag>('Tag')({
  id: Model.Generated(TagId),
  name: Model.FieldExcept('jsonUpdate')(Schema.String.pipe(Schema.trimmed())),
  description: Schema.String,
  createdAt: CustomDateTimeInsert,
  updatedAt: CustomDateTimeUpdate,
}) {}

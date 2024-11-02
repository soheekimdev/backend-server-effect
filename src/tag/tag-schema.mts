import { Model } from '@effect/sql';
import { Schema } from 'effect';

export const TagId = Schema.String.pipe(Schema.brand('TagId'));

export type TagId = typeof TagId.Type;

export class Tag extends Model.Class<Tag>('Tag')({
  id: Model.Generated(TagId),
  name: Schema.String,
  description: Schema.String,
  isDeleted: Schema.Boolean,
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.DateTimeUtc,
}) {}

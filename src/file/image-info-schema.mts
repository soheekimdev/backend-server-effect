import { Schema } from 'effect';

export const ImageInfoSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  version: Schema.String,
  size: Schema.Number,
  cacheControl: Schema.String,
  contentType: Schema.String,
  etag: Schema.String,
  metadata: Schema.NullishOr(
    Schema.Record({
      key: Schema.String,
      value: Schema.Union(Schema.String, Schema.Number),
    }),
  ),
  createdAt: Schema.String,
  url: Schema.String,
});

export type ImageInfo = typeof ImageInfoSchema.Type;

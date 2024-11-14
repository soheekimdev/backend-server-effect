import { ImageUploadTargetSchema } from './image-target-schema.mjs';

export const ImagePath = ImageUploadTargetSchema.pick(
  'filename',
  'id',
  'type',
  'extension',
);

export type ImagePath = typeof ImagePath.Type;

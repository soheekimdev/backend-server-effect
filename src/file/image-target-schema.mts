import { Schema } from 'effect';

export const ImageUploadTargetSchema = Schema.Struct({
  type: Schema.Literal('post', 'challenge'),
  id: Schema.String.pipe(
    Schema.annotations({ description: 'challengeId / postId 둘 중 하나' }),
  ),
  filename: Schema.String.pipe(
    Schema.annotations({ description: '파일 이름' }),
    Schema.minLength(1),
  ),
  extension: Schema.Literal('jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'),
  sizeInKb: Schema.NumberFromString.pipe(
    Schema.int(),
    Schema.positive(),
    Schema.annotations({
      description: '파일 크기, 항상 0보다 큰 정수여야 함',
      default: 0,
    }),
  ),
  width: Schema.NumberFromString.pipe(
    Schema.int(),
    Schema.positive(),
    Schema.annotations({
      description: '가로 픽셀, 항상 0보다 큰 정수여야 함',
      default: 0,
    }),
  ),
  height: Schema.NumberFromString.pipe(
    Schema.int(),
    Schema.positive(),
    Schema.annotations({
      description: '세로 픽셀, 항상 0보다 큰 정수여야 함',
      default: 0,
    }),
  ),
});

export type ImageUploadTarget = typeof ImageUploadTargetSchema.Type;

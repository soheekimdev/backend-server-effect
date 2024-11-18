import { Schema } from 'effect';

export const ImageUploadTargetSchema = Schema.Struct({
  type: Schema.Literal('post', 'challenge', 'account'),
  id: Schema.String.pipe(
    Schema.annotations({ description: 'challengeId / postId 둘 중 하나' }),
  ),
  filename: Schema.String.pipe(
    Schema.annotations({
      description:
        '파일 이름, 업로드한 파일의 파일명과 똑같이 해주되 확장자는 따로 빼서 아래 extension에 넣어주세요. 예: jaerong.png -> jaerong 만',
    }),
    Schema.minLength(1),
  ),
  extension: Schema.Literal(
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp',
    'svg',
    'bmp',
  ).pipe(
    Schema.annotations({ description: '파일 확장자 예: jaerong.png -> png' }),
  ),
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

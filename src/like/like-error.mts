import { HttpApiSchema } from '@effect/platform';
import { Schema } from 'effect';
import { LikeId } from './like-schema.mjs';

export class LikeNotFound extends Schema.TaggedError<LikeNotFound>()(
  'LikeNotFound',
  { id: LikeId },
  HttpApiSchema.annotations({
    status: 404,
    title: 'Like Not Found',
    description: 'ID에 해당하는 좋아요/싫어요가 존재하지 않습니다.',
  }),
) {}

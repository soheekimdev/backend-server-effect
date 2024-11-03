import { HttpApiSchema } from '@effect/platform';
import { Schema } from 'effect';
import { PostId } from './post-schema.mjs';

export class PostNotFound extends Schema.TaggedError<PostNotFound>()(
  'PostNotFound',
  { id: PostId },
  HttpApiSchema.annotations({
    status: 404,
    title: 'Post Not Found',
    description: 'ID에 해당하는 포스트가 존재하지 않습니다.',
  }),
) {}

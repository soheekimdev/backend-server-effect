import { HttpApiSchema } from '@effect/platform';
import { Schema } from 'effect';
import { CommentId } from './comment-schema.mjs';

export class CommentNotFound extends Schema.TaggedError<CommentNotFound>()(
  'CommentNotFound',
  { id: CommentId },
  HttpApiSchema.annotations({
    status: 404,
    title: 'Comment Not Found',
    description: 'ID에 해당하는 댓글이 존재하지 않습니다.',
  }),
) {}

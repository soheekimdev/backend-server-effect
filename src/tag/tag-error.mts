import { Schema } from 'effect';
import { TagId } from './tag-schema.mjs';
import { HttpApiSchema } from '@effect/platform';

export class TagNotFound extends Schema.TaggedError<TagNotFound>()(
  'TagNotFound',
  { id: TagId },
  HttpApiSchema.annotations({
    status: 404,
    title: 'Tag Not Found',
    description: 'ID에 해당하는 태그가 존재하지 않습니다.',
  }),
) {}

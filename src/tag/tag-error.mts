import { Schema } from 'effect';
import { TagId } from './tag-schema.mjs';
import { HttpApiSchema } from '@effect/platform';
import { PostId } from '@/post/post-schema.mjs';
import { ChallengeId } from '@/challenge/challenge-schema.mjs';

export class TagNotFound extends Schema.TaggedError<TagNotFound>()(
  'TagNotFound',
  { id: TagId },
  HttpApiSchema.annotations({
    status: 404,
    title: 'Tag Not Found',
    description: 'ID에 해당하는 태그가 존재하지 않습니다.',
  }),
) {}

export class TagTargetNotFound extends Schema.TaggedError<TagTargetNotFound>()(
  'TagTargetNotFound',
  {
    tagId: TagId,
    postId: Schema.NullishOr(PostId),
    challengeId: Schema.NullishOr(ChallengeId),
  },
  HttpApiSchema.annotations({
    status: 404,
    title: 'Tag Target Not Found',
    description: 'ID에 해당하는 태그 연결이 존재하지 않습니다.',
  }),
) {}

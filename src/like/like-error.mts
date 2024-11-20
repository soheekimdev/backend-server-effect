import { HttpApiSchema } from '@effect/platform';
import { Schema } from 'effect';
import { LikeId } from './like-schema.mjs';
import { PostId } from '@/post/post-schema.mjs';
import { CommentId } from '@/comment/comment-schema.mjs';
import { ChallengeId } from '@/challenge/challenge-schema.mjs';
import { ChallengeEventId } from '@/challenge-event/challenge-event-schema.mjs';

export class LikeNotFound extends Schema.TaggedError<LikeNotFound>()(
  'LikeNotFound',
  {
    id: Schema.NullishOr(LikeId),
    postId: Schema.NullishOr(PostId),
    commentId: Schema.NullishOr(CommentId),
    challengeId: Schema.NullishOr(ChallengeId),
    challengeEventId: Schema.NullishOr(ChallengeEventId),
  },
  HttpApiSchema.annotations({
    status: 404,
    title: 'Like Not Found',
    description: 'ID에 해당하는 좋아요/싫어요가 존재하지 않습니다.',
  }),
) {}

export class LikeConflict extends Schema.TaggedError<LikeConflict>()(
  'LikeConflict',
  {
    id: Schema.NullishOr(LikeId),
  },
  HttpApiSchema.annotations({
    status: 409,
    title: 'Like Conflict',
    description: '이미 좋아요/싫어요가 존재합니다.',
  }),
) {}

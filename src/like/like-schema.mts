import { AccountId } from '@/account/account-schema.mjs';
import { ChallengeEventId } from '@/challenge/challenge-event-schema.mjs';
import { ChallengeId } from '@/challenge/challenge-schema.mjs';
import { CommentId } from '@/comment/comment-schema.mjs';
import {
  CustomDateTimeInsert,
  CustomDateTimeUpdate,
} from '@/misc/date-schema.mjs';
import { PostId } from '@/post/post-schema.mjs';
import { Model } from '@effect/sql';
import { Schema } from 'effect';

export const LikeId = Schema.String.pipe(Schema.brand('LikeId'));

export type LikeId = typeof LikeId.Type;

export class Like extends Model.Class<Like>('Like')({
  id: Model.Generated(LikeId),
  postId: Schema.NullishOr(PostId),
  accountId: AccountId,
  commentId: Schema.NullishOr(CommentId),
  challengeId: Schema.NullishOr(ChallengeId),
  challengeEventId: Schema.NullishOr(ChallengeEventId),
  type: Schema.Literal('like', 'dislike'),
  count: Schema.Number,
  createdAt: CustomDateTimeInsert,
  updatedAt: CustomDateTimeUpdate,
}) {}

export type LikeType = (typeof Like.Type)['type'];

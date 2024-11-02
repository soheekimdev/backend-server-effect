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
  postId: Schema.UndefinedOr(PostId),
  accountId: Schema.UndefinedOr(AccountId),
  commentId: Schema.UndefinedOr(CommentId),
  challengeId: Schema.UndefinedOr(ChallengeId),
  challengeEventId: Schema.UndefinedOr(ChallengeEventId),
  isDeleted: Schema.Boolean,
  type: Schema.Literal('like', 'dislike'),
  count: Schema.Number,
  createdAt: CustomDateTimeInsert,
  updatedAt: CustomDateTimeUpdate,
}) {}

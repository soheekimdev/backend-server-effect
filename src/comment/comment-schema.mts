import { AccountId } from '@/account/account-schema.mjs';
import {
  CustomDateTimeInsert,
  CustomDateTimeUpdate,
} from '@/misc/date-schema.mjs';
import { PostId } from '@/post/post-schema.mjs';
import { Model } from '@effect/sql';
import { Schema } from 'effect';

export const CommentId = Schema.String.pipe(Schema.brand('CommentId'));

export type CommentId = typeof CommentId.Type;

export class Comment extends Model.Class<Comment>('Comment')({
  id: Model.Generated(CommentId),
  postId: PostId,
  accountId: AccountId,
  content: Schema.String,
  parentCommentId: CommentId,
  isDeleted: Schema.Boolean,
  createdAt: CustomDateTimeInsert,
  updatedAt: CustomDateTimeUpdate,
}) {}

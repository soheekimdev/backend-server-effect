import { AccountId } from '@/account/account-schema.mjs';
import {
  CustomDateTimeInsert,
  CustomDateTimeUpdate,
} from '@/misc/date-schema.mjs';
import { Model } from '@effect/sql';
import { Schema } from 'effect';

export const PostId = Schema.String.pipe(Schema.brand('PostId'));

export type PostId = typeof PostId.Type;

export class Post extends Model.Class<Post>('Post')({
  id: Model.Generated(PostId),
  title: Schema.String,
  content: Schema.String,
  contentType: Schema.String,
  externalLink: Schema.String,
  isDeleted: Schema.Boolean,
  type: Schema.String,
  isCommentAllowed: Schema.Boolean,
  isLikeAllowed: Schema.Boolean,
  challengeId: Schema.String,
  accountId: AccountId,
  createdAt: CustomDateTimeInsert,
  updatedAt: CustomDateTimeUpdate,
}) {}

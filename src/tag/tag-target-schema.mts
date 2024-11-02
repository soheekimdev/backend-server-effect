import { ChallengeEventId } from '@/challenge/challenge-event-schema.mjs';
import { ChallengeId } from '@/challenge/challenge-schema.mjs';
import {
  CustomDateTimeInsert,
  CustomDateTimeUpdate,
} from '@/misc/date-schema.mjs';
import { PostId } from '@/post/post-schema.mjs';
import { Model } from '@effect/sql';
import { Schema } from 'effect';
import { TagId } from './tag-schema.mjs';

export const TagTargetId = Schema.String.pipe(Schema.brand('TagTargetId'));

export type TagTargetId = typeof TagTargetId.Type;

export class TagTarget extends Model.Class<TagTarget>('TagTarget')({
  id: Model.Generated(TagTargetId),
  tagId: TagId,
  postId: PostId,
  challengeId: ChallengeId,
  challengeEventId: ChallengeEventId,
  isDeleted: Schema.Boolean,
  createdAt: CustomDateTimeInsert,
  updatedAt: CustomDateTimeUpdate,
}) {}

import { Model } from '@effect/sql';
import { Schema } from 'effect';
import { AccountId } from './account-schema.mjs';

export const FollowId = Schema.String.pipe(Schema.brand('FollowId'));

export type FollowId = typeof FollowId.Type;

export class Follow extends Model.Class<Follow>('Follow')({
  id: Model.Generated(FollowId),
  followerId: AccountId,
  followingId: AccountId,
  isFollowAccepted: Schema.Boolean,
  isFollowRequested: Schema.Boolean,
  isDeleted: Schema.Boolean,
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.DateTimeUtc,
}) {}

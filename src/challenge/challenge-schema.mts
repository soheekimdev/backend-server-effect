import { AccountId } from '@/account/account-schema.mjs';
import {
  CustomDateTimeInsert,
  CustomDateTimeUpdate,
} from '@/misc/date-schema.mjs';
import { Model } from '@effect/sql';
import { Schema } from 'effect';

export const ChallengeId = Schema.String.pipe(Schema.brand('ChallengeId'));

export type ChallengeId = typeof ChallengeId.Type;

export class Challenge extends Model.Class<Challenge>('Challenge')({
  id: Model.Generated(ChallengeId),
  title: Schema.String,
  description: Schema.String,
  type: Schema.String,
  startDate: Schema.Date,
  endDate: Schema.Date,
  writerAccountId: AccountId,
  isDeleted: Schema.Boolean.annotations({
    default: false,
  }),
  isPublished: Schema.Boolean.annotations({
    default: false,
  }),
  isFinished: Schema.Boolean.annotations({
    default: false,
  }),
  createdAt: CustomDateTimeInsert,
  updatedAt: CustomDateTimeUpdate,
}) {}

export class ChallengeView extends Model.Class<ChallengeView>('ChallengeView')({
  ...Challenge.fields,
  accountUsername: Model.FieldExcept(
    'update',
    'insert',
    'jsonUpdate',
    'jsonCreate',
  )(
    Schema.optionalWith(
      Schema.String.pipe(
        Schema.annotations({
          description: '이 게시글을 쓴 유저의 username',
        }),
      ),
      {
        nullable: true,
        onNoneEncoding: () => undefined,
      },
    ),
  ),
  likeCount: Model.FieldExcept(
    'update',
    'insert',
    'jsonUpdate',
    'jsonCreate',
  )(
    Schema.Number.pipe(
      Schema.int(),
      Schema.nonNegative(),
      Schema.annotations({
        default: 0,
        description: '이 게시글에 달린 좋아요의 수',
      }),
    ),
  ),
  dislikeCount: Model.FieldExcept(
    'update',
    'insert',
    'jsonUpdate',
    'jsonCreate',
  )(
    Schema.Number.pipe(
      Schema.int(),
      Schema.nonNegative(),
      Schema.annotations({
        default: 0,
        description: '이 게시글에 달린 싫어요의 수',
      }),
    ),
  ),
  pureLikeCount: Model.FieldExcept(
    'update',
    'insert',
    'jsonUpdate',
    'jsonCreate',
  )(
    Schema.Number.pipe(
      Schema.int(),
      Schema.nonNegative(),
      Schema.annotations({
        default: 0,
        description: '이 게시글에 달린 댓글의 수',
      }),
    ),
  ),
  challengeEventCount: Model.FieldExcept(
    'update',
    'insert',
    'jsonUpdate',
    'jsonCreate',
  )(
    Schema.Number.pipe(
      Schema.int(),
      Schema.nonNegative(),
      Schema.annotations({
        default: 0,
        description: '이 게시글에 달린 댓글의 수',
      }),
    ),
  ),
}) {}

import { AccountId } from '@/account/account-schema.mjs';
import {
  CustomDateTimeInsert,
  CustomDateTimeUpdate,
} from '@/misc/date-schema.mjs';
import { Model } from '@effect/sql';
import { Schema } from 'effect';

export const ChallengeId = Schema.String.pipe(Schema.brand('ChallengeId'));

export type ChallengeId = typeof ChallengeId.Type;
const today = new Date().toISOString().split('T')[0];
const twoWeeksLater = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
  .toISOString()
  .split('T')[0];
export class Challenge extends Model.Class<Challenge>('Challenge')({
  id: Model.Generated(ChallengeId),
  title: Schema.String,
  description: Schema.String,
  challengeImageUrl: Schema.NullishOr(Schema.String),
  type: Schema.String.pipe(
    Schema.annotations({
      description: '챌린지의 종류',
      examples: ['self-check', 'time-based', 'event-based', 'etc'],
      default: 'self-check',
    }),
  ),
  startDate: Schema.NullishOr(Schema.Any).pipe(
    Schema.annotations({
      description: '챌린지 시작일',
      default: today,
    }),
  ),
  endDate: Schema.NullishOr(Schema.Any).pipe(
    Schema.annotations({
      description: '챌린지 종료일',
      default: twoWeeksLater,
    }),
  ),

  accountId: Model.Sensitive(AccountId),
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
  createdAt: Schema.Any,
  updatedAt: Schema.Any,
  accountUsername: Model.FieldExcept(
    'update',
    'insert',
    'jsonUpdate',
    'jsonCreate',
  )(
    Schema.NullishOr(
      Schema.String.pipe(
        Schema.annotations({
          description: '이 챌린지을 쓴 유저의 username',
        }),
      ),
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
        description: '이 챌린지에 달린 좋아요의 수',
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
        description: '이 챌린지에 달린 싫어요의 수',
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
        description: '이 챌린지에 달린 순 좋아요의 수',
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
        description: '이 챌린지에 달린 이벤트의 수',
      }),
    ),
  ),
}) {}

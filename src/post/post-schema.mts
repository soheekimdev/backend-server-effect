import { AccountId } from '@/account/account-schema.mjs';
import { ChallengeId } from '@/challenge/challenge-schema.mjs';
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
  title: Schema.String.pipe(
    Schema.annotations({
      description:
        '게시글의 제목입니다. 프론트엔드에서 적절히 짤라주세요. 최대길이는 200자로 우선 해두었습니다만, DB에서는 제한이 없습니다.',
      default: '제목입니다',
    }),
    Schema.maxLength(200),
    Schema.nonEmptyString(),
  ),
  content: Schema.String.pipe(
    Schema.annotations({
      description:
        'contentType에 따라 작성된 게시글의 내용입니다. 지금은 markdown만 있습니다. 내용에 따라 렌더링을 다르게 해주셔야합니다.',
      default: `
# 제목입니다

내용입니다

* 리스트 1
* 리스트 2
* 리스트 3
      `,
    }),
    Schema.nonEmptyString(),
  ),
  contentType: Schema.optional(
    Schema.String.pipe(
      Schema.annotations({
        description:
          '게시글의 내용의 타입; 현재는 markdown 고정입니다. 나중에 plain_text (그냥 텍스트)등의 다른 타입이 추가될 수 있습니다.',
        default: 'markdown',
        examples: ['markdown'],
      }),
    ),
  ),
  externalLink: Schema.optional(
    Schema.String.pipe(
      Schema.annotations({
        description:
          '게시글의 외부 링크입니다. 없어도 됩니다. 필요할 때 사용하세요.',
        default: 'https://google.com',
      }),
    ),
  ),
  isDeleted: Schema.Boolean.pipe(
    Schema.annotations({
      default: false,
      description: '이 게시글이 삭제되었는지 여부',
    }),
  ),
  type: Schema.String.pipe(
    Schema.annotations({
      description:
        '게시글의 타입; 수많은 타입이 있을 수 있지만 대표적으로 post, challenge, notice가 있습니다.',
      default: 'post',
      examples: ['post', 'challenge', 'notice'],
    }),
  ),
  isCommentAllowed: Schema.Boolean.pipe(
    Schema.annotations({
      default: true,
      description: '이 게시글에 댓글을 달 수 있는지 여부',
    }),
  ),
  isLikeAllowed: Schema.Boolean.pipe(
    Schema.annotations({
      default: true,
      description: '이 게시글에 좋아요를 누를 수 있는지 여부',
    }),
  ),
  challengeId: Model.Sensitive(
    Schema.optionalWith(ChallengeId, {
      nullable: true,
      onNoneEncoding: () => undefined,
    }),
  ),
  likeCount: Schema.Number.pipe(
    Schema.int(),
    Schema.nonNegative(),
    Schema.annotations({
      default: 0,
      description: '이 게시글에 달린 좋아요의 수',
    }),
  ),
  dislikeCount: Schema.Number.pipe(
    Schema.int(),
    Schema.nonNegative(),
    Schema.annotations({
      default: 0,
      description: '이 게시글에 달린 싫어요의 수',
    }),
  ),
  accountId: Model.Sensitive(AccountId),
  createdAt: CustomDateTimeInsert,
  updatedAt: CustomDateTimeUpdate,
}) {}

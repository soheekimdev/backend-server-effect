import { Authentication } from '@/auth/authentication.mjs';
import { Unauthorized } from '@/auth/error-403.mjs';
import { ChallengeEventView } from '@/challenge-event/challenge-event-schema.mjs';
import { ChallengeView } from '@/challenge/challenge-schema.mjs';
import { CommentView } from '@/comment/comment-schema.mjs';
import {
  GeneratingSaltError,
  HashingPasswordError,
} from '@/crypto/crypto-error.mjs';
import { VerifyTokenError } from '@/crypto/token-error.mjs';
import { ServerError } from '@/misc/common-error.mjs';
import { FindManyResultSchema } from '@/misc/find-many-result-schema.mjs';
import { FindManyUrlParams } from '@/misc/find-many-url-params-schema.mjs';
import { PostView } from '@/post/post-schema.mjs';
import { Tag } from '@/tag/tag-schema.mjs';
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from '@effect/platform';
import { Schema } from 'effect';
import {
  AccountAlreadyExists,
  AccountNotFound,
  InvalidPassword,
} from './account-error.mjs';
import { Account, AccountId } from './account-schema.mjs';
import { SignIn } from './sign-in-schema.mjs';
import { SignUp } from './sign-up-schema.mjs';

export class AccountApi extends HttpApiGroup.make('account')
  .add(
    HttpApiEndpoint.get('findById', '/:accountId')
      .setPath(
        Schema.Struct({
          accountId: AccountId,
        }),
      )
      .addError(AccountNotFound)
      .addSuccess(Account.json)
      .annotateContext(
        OpenApi.annotations({
          title: '계정 조회',
          description:
            '계정을 조회합니다. 계정이 존재하지 않는 경우 404를 반환합니다. 다른 사람의 계정을 조회할 수 있습니다. 로그인하지 않아도 사용할 수 있습니다.',
          override: {
            summary: '(사용가능) 단일 계정 조회',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.get('findTags', '/:accountId/tags')
      .setPath(
        Schema.Struct({
          accountId: AccountId,
        }),
      )
      .addError(AccountNotFound)
      .addSuccess(Schema.Array(Tag.json))
      .annotateContext(
        OpenApi.annotations({
          title: '계정 태그 조회',
          description: '내 계정의 태그를 조회합니다.',
          override: {
            summary: '(사용가능) 계정 태그 조회',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.get('findChallenges', '/:accountId/challenges')
      .setPath(
        Schema.Struct({
          accountId: AccountId,
        }),
      )
      .setUrlParams(FindManyUrlParams)
      .addError(AccountNotFound)
      .addSuccess(FindManyResultSchema(ChallengeView))
      .annotateContext(
        OpenApi.annotations({
          title: '작성한 챌린지 조회',
          description:
            '이 사용자가 작성한 챌린지를 조회합니다. 계정이 존재하지 않는 경우 404를 반환합니다. 다른 사람의 계정을 조회할 수 있습니다. 로그인하지 않아도 사용할 수 있습니다.',
          override: {
            summary: '(사용가능) 작성한 챌린지 조회',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.get('findPosts', '/:accountId/posts')
      .setPath(
        Schema.Struct({
          accountId: AccountId,
        }),
      )
      .setUrlParams(FindManyUrlParams)
      .addError(AccountNotFound)
      .addSuccess(FindManyResultSchema(PostView))
      .annotateContext(
        OpenApi.annotations({
          title: '작성한 게시글 조회',
          description:
            '이 사용자가 작성한 포스트를 조회합니다. 계정이 존재하지 않는 경우 404를 반환합니다. 다른 사람의 계정을 조회할 수 있습니다. 로그인하지 않아도 사용할 수 있습니다.',
          override: {
            summary: '(사용가능) 작성한 게시글 조회',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.get('findLikes', '/:accountId/likes')
      .setPath(
        Schema.Struct({
          accountId: AccountId,
        }),
      )
      .setUrlParams(FindManyUrlParams)
      .addError(AccountNotFound)
      .addSuccess(FindManyResultSchema(Schema.Any))
      .annotateContext(
        OpenApi.annotations({
          title: '좋아요한 이력 조회',
          description:
            '이 사용자가 좋아요한 내용들을 조회합니다. 계정이 존재하지 않는 경우 404를 반환합니다. 다른 사람의 계정을 조회할 수 있습니다. 로그인하지 않아도 사용할 수 있습니다.',
          override: {
            summary: '(사용가능) 좋아요한 이력 조회',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.get('findComments', '/:accountId/comments')
      .setPath(
        Schema.Struct({
          accountId: AccountId,
        }),
      )
      .setUrlParams(FindManyUrlParams)
      .addError(AccountNotFound)
      .addSuccess(FindManyResultSchema(CommentView.json))
      .annotateContext(
        OpenApi.annotations({
          title: '댓글한 이력 조회',
          description:
            '이 사용자가 댓글단 내용을 조회합니다. 계정이 존재하지 않는 경우 404를 반환합니다. 다른 사람의 계정을 조회할 수 있습니다. 로그인하지 않아도 사용할 수 있습니다.',
          override: {
            summary: '(사용가능) 댓글한 이력 조회',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.get('findChallengeEvents', '/:accountId/challenge-events')
      .setPath(
        Schema.Struct({
          accountId: AccountId,
        }),
      )
      .setUrlParams(FindManyUrlParams)
      .addError(AccountNotFound)
      .addSuccess(FindManyResultSchema(ChallengeEventView.json))
      .annotateContext(
        OpenApi.annotations({
          title: '참여한 챌린지 이벤트 조회',
          description:
            '이 사용자가 참여한 챌린지 이벤트를 조회합니다. 계정이 존재하지 않는 경우 404를 반환합니다. 다른 사람의 계정을 조회할 수 있습니다. 로그인하지 않아도 사용할 수 있습니다.',
          override: {
            summary: '(사용가능) 참여한 챌린지 이벤트 조회',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.patch('updateById', '/:accountId')
      .setPath(
        Schema.Struct({
          accountId: AccountId,
        }),
      )
      .middleware(Authentication)
      .setPayload(
        Schema.partialWith(
          Account.jsonUpdate.pick(
            'profileImageUrl',
            'mainLanguage',
            'nationality',
            'bio',
            'externalUrls',
            'birthday',
            'username',
            'isPrivate',
          ),
          {
            exact: true,
          },
        ),
      )
      .addSuccess(Account.json)
      .addError(AccountNotFound)
      .addError(Unauthorized)
      .annotateContext(
        OpenApi.annotations({
          title: '계정 상세 수정',
          description:
            '계정의 상세 정보를 수정합니다. 다른 사람의 계정을 수정할 수 없습니다. 로그인해야 사용할 수 있습니다. 어드민은 다른 사람의 계정을 수정할 수 있습니다.',
          override: {
            summary: '(사용가능) 단일 계정 수정',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.post('signUp', '/sign-up')
      .setPayload(SignUp)
      .addSuccess(Account.json)
      .addError(GeneratingSaltError)
      .addError(HashingPasswordError)
      .addError(ServerError)
      .addError(AccountAlreadyExists)
      .annotateContext(
        OpenApi.annotations({
          title: '회원 가입',
          description:
            '회원 가입합니다. 이미 가입된 이메일인 경우 409를 반환합니다. 로그인하지 않아도 사용할 수 있습니다.',
          override: {
            summary: '(사용가능) 회원 가입',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.post('signIn', '/sign-in')
      .setPayload(SignIn)
      .addSuccess(
        Schema.Struct({
          account: Account.json,
          accessToken: Schema.String,
          refreshToken: Schema.String,
        }),
      )
      .addError(AccountNotFound)
      .addError(InvalidPassword)
      .annotateContext(
        OpenApi.annotations({
          title: '로그인',
          description:
            '로그인합니다. 계정이 존재하지 않거나 비밀번호가 틀린 경우 404를 반환합니다.',
          override: {
            summary: '(사용가능) Email / 비밀번호 로그인',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.get('me', '/me')
      .middleware(Authentication)
      .addSuccess(Account.json)
      .addError(AccountNotFound)
      .annotateContext(
        OpenApi.annotations({
          title: '내 계정 조회',
          description: '내 계정을 조회합니다. 로그인해야 사용할 수 있습니다.',
          override: {
            summary: '(사용가능) 내 계정 조회',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.post('invalidate', '/invalidate')
      .setHeaders(
        Schema.Struct({
          'refresh-token': Schema.String,
        }),
      )
      .middleware(Authentication)
      .addError(VerifyTokenError)
      .addSuccess(
        Schema.Struct({
          accessToken: Schema.String,
          refreshToken: Schema.String,
        }),
      )
      .annotateContext(
        OpenApi.annotations({
          title: '토큰 재발급',
          description:
            '리프레시 토큰을 이용하여 액세스 토큰과 리프레시 토큰을 재발급합니다. 로그인해야 사용할 수 있습니다.',
          override: {
            summary: '(사용가능) 토큰 재발급',
          },
        }),
      ),
  )
  .prefix('/api/accounts')
  .annotateContext(
    OpenApi.annotations({
      title: '(사용가능) 계정 API',
    }),
  ) {}

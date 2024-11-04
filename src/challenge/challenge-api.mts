import { HttpApiEndpoint, HttpApiGroup, OpenApi } from '@effect/platform';
import { Schema } from 'effect';
import { Challenge, ChallengeId } from './challenge-schema.mjs';
import { ChallengeNotFound } from './challenge-error.mjs';
import { Authentication } from '@/auth/authentication.mjs';

export class ChallengeApi extends HttpApiGroup.make('challenge')
  .add(
    HttpApiEndpoint.get('findAll', '/')
      .setUrlParams(
        Schema.Struct({
          page: Schema.NumberFromString,
          limit: Schema.NumberFromString,
        }),
      )
      .annotateContext(
        OpenApi.annotations({
          description:
            '(미구현) 챌린지 목록을 조회합니다. 페이지와 한 페이지당 챌린지 수를 지정할 수 있습니다.',
        }),
      ),
  )
  .add(
    HttpApiEndpoint.get('findById', '/:id')
      .setPath(
        Schema.Struct({
          id: ChallengeId,
        }),
      )
      .addError(ChallengeNotFound)
      .annotateContext(
        OpenApi.annotations({
          description:
            '(미구현) 챌린지를 조회합니다. 챌린지가 존재하지 않는 경우 404를 반환합니다.',
        }),
      ),
  )
  .add(
    HttpApiEndpoint.post('likeChallengeById', '/:id/like')
      .middleware(Authentication)
      .setPath(
        Schema.Struct({
          id: ChallengeId,
        }),
      )
      .addError(ChallengeNotFound)
      .annotateContext(
        OpenApi.annotations({
          description:
            '(미구현) 챌린지에 좋아요를 누릅니다. 챌린지가 존재하지 않는 경우 404를 반환합니다.',
        }),
      ),
  )
  .add(
    HttpApiEndpoint.del('removeLikeChallengeById', '/:id/like')
      .middleware(Authentication)
      .setPath(
        Schema.Struct({
          id: ChallengeId,
        }),
      )
      .addError(ChallengeNotFound)
      .annotateContext(
        OpenApi.annotations({
          description:
            '(미구현) 챌린지에 좋아요를 취소합니다. 챌린지가 존재하지 않는 경우 404를 반환합니다.',
        }),
      ),
  )
  .add(
    HttpApiEndpoint.post('dislikeChallengeById', '/:id/dislike')
      .middleware(Authentication)
      .setPath(
        Schema.Struct({
          id: ChallengeId,
        }),
      )
      .addError(ChallengeNotFound)
      .annotateContext(
        OpenApi.annotations({
          description:
            '(미구현) 챌린지에 싫어요를 누릅니다. 챌린지가 존재하지 않는 경우 404를 반환합니다.',
        }),
      ),
  )
  .add(
    HttpApiEndpoint.del('removeDislikeChallengeById', '/:id/dislike')
      .middleware(Authentication)
      .setPath(
        Schema.Struct({
          id: ChallengeId,
        }),
      )
      .addError(ChallengeNotFound)
      .annotateContext(
        OpenApi.annotations({
          description:
            '(미구현) 챌린지에 싫어요를 취소합니다. 챌린지가 존재하지 않는 경우 404를 반환합니다.',
        }),
      ),
  )
  .add(
    HttpApiEndpoint.get('getChallengeMembers', '/:id/member')
      .setPath(
        Schema.Struct({
          id: ChallengeId,
        }),
      )
      .addError(ChallengeNotFound)
      .annotateContext(
        OpenApi.annotations({
          description:
            '(미구현) 챌린지에 참여한 사용자 목록을 조회합니다. 챌린지가 존재하지 않는 경우 404를 반환합니다.',
        }),
      ),
  )
  .add(
    HttpApiEndpoint.post('joinChallengeById', '/:id/member')
      .middleware(Authentication)
      .setPath(
        Schema.Struct({
          id: ChallengeId,
        }),
      )
      .addError(ChallengeNotFound)
      .annotateContext(
        OpenApi.annotations({
          description:
            '(미구현) 챌린지에 참여합니다. 챌린지가 존재하지 않는 경우 404를 반환합니다.',
        }),
      ),
  )
  .add(
    HttpApiEndpoint.del('leaveChallengeById', '/:id/member')
      .middleware(Authentication)
      .setPath(
        Schema.Struct({
          id: ChallengeId,
        }),
      )
      .addError(ChallengeNotFound)
      .annotateContext(
        OpenApi.annotations({
          description:
            '(미구현) 챌린지에서 탈퇴합니다. 챌린지가 존재하지 않는 경우 404를 반환합니다.',
        }),
      ),
  )
  .add(
    HttpApiEndpoint.post('createChallenge', '/')
      .middleware(Authentication)
      .setPayload(Challenge.jsonCreate)
      .annotateContext(
        OpenApi.annotations({
          description: '(미구현) 챌린지를 생성합니다.',
        }),
      ),
  )
  .prefix('/api/challenges')
  .annotateContext(
    OpenApi.annotations({
      title: '(미구현 있음) 챌린지 API',
    }),
  ) {}

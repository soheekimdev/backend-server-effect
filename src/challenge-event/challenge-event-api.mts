import { ChallengeId } from '@/challenge/challenge-schema.mjs';
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from '@effect/platform';
import { Schema } from 'effect';
import { ChallengeEventId } from './challenge-event-schema.mjs';
import { Authentication } from '@/auth/authentication.mjs';

export class ChallengeEventApi extends HttpApiGroup.make('challenge-event')
  .add(
    HttpApiEndpoint.get('findAll', '/:challengeId/events')
      .setPath(
        Schema.Struct({
          challengeId: ChallengeId,
        }),
      )
      .annotateContext(
        OpenApi.annotations({
          description:
            '(미구현) 챌린지 이벤트 목록을 조회합니다. 페이지와 한 페이지당 이벤트 수를 지정할 수 있습니다.',
          override: {
            summary: '(미구현) 챌린지 이벤트 목록 조회',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.get('findById', '/:challengeId/events/:challengeEventId')
      .setPath(
        Schema.Struct({
          challengeId: ChallengeId,
          challengeEventId: ChallengeEventId,
        }),
      )
      .annotateContext(
        OpenApi.annotations({
          description:
            '(미구현) 챌린지 이벤트를 조회합니다. 챌린지 이벤트가 존재하지 않는 경우 404를 반환합니다.',
          override: {
            summary: '(미구현) 단일 챌린지 이벤트 조회',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.post('create', '/:challengeId/events')
      .middleware(Authentication)
      .setPath(
        Schema.Struct({
          challengeId: ChallengeId,
          challengeEventId: ChallengeEventId,
        }),
      )
      .annotateContext(
        OpenApi.annotations({
          description: '(미구현) 챌린지 이벤트를 생성합니다.',
          override: {
            summary: '(미구현) 챌린지 이벤트 생성',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.patch(
      'updateById',
      '/:challengeId/events/:challengeEventId',
    )
      .middleware(Authentication)
      .setPath(
        Schema.Struct({
          challengeId: ChallengeId,
          challengeEventId: ChallengeEventId,
        }),
      )
      .annotateContext(
        OpenApi.annotations({
          title: '(미구현) 챌린지 이벤트 수정 API',
          override: {
            summary: '(미구현) 챌린지 이벤트 수정',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.del('deleteById', '/:challengeId/events/:challengeEventId')
      .middleware(Authentication)
      .setPath(
        Schema.Struct({
          challengeId: ChallengeId,
          challengeEventId: ChallengeEventId,
        }),
      )
      .annotateContext(
        OpenApi.annotations({
          title: '(미구현) 챌린지 이벤트 삭제 API',
          override: {
            summary: '(미구현) 챌린지 이벤트 삭제',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.post(
      'check',
      '/:challengeId/events/:challengeEventId/check',
    )
      .middleware(Authentication)
      .setPath(
        Schema.Struct({
          challengeId: ChallengeId,
          challengeEventId: ChallengeEventId,
        }),
      )
      .annotateContext(
        OpenApi.annotations({
          title: '(미구현) 챌린지 이벤트 체크 API',
          description:
            '(미구현) 챌린지 참가자가 이벤트를 진행중인지 체크하고 챌린지 상황을 업데이트합니다.',
          override: {
            summary: '(미구현) 챌린지 이벤트 체크',
          },
        }),
      ),
  )
  .prefix('/api/challenges')
  .annotateContext(
    OpenApi.annotations({
      title: '(미구현 있음) 챌린지 이벤트 API',
    }),
  ) {}

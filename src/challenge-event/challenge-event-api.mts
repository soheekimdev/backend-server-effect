import { ChallengeId } from '@/challenge/challenge-schema.mjs';
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from '@effect/platform';
import { Schema } from 'effect';
import {
  ChallengeEvent,
  ChallengeEventId,
  ChallengeEventView,
} from './challenge-event-schema.mjs';
import { Authentication } from '@/auth/authentication.mjs';
import { ChallengeNotFound } from '@/challenge/challenge-error.mjs';
import { Unauthorized } from '@/auth/error-403.mjs';
import {
  ChallengeEventCheckRequestLocationBadRequest,
  ChallengeEventNotFound,
} from './challenge-event-error.mjs';
import {
  ChallengeEventCheckRequest,
  ChallengeEventCheckResponse,
} from './helper-schema.mjs';
import { ChallengeEventParticipant } from './challenge-event-participant-schema.mjs';

export class ChallengeEventApi extends HttpApiGroup.make('challenge-event')
  .add(
    HttpApiEndpoint.get('findAll', '/:challengeId/events')
      .setPath(
        Schema.Struct({
          challengeId: ChallengeId,
        }),
      )
      .addError(ChallengeNotFound)
      .addSuccess(Schema.Array(ChallengeEventView.json))
      .annotateContext(
        OpenApi.annotations({
          description:
            '(사용가능) 챌린지 이벤트 목록을 조회합니다. 페이지와 한 페이지당 이벤트 수를 지정할 수 있습니다.',
          override: {
            summary: '(사용가능) 챌린지 이벤트 목록 조회',
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
      .addError(ChallengeNotFound)
      .addError(ChallengeEventNotFound)
      .addSuccess(ChallengeEventView.json)
      .annotateContext(
        OpenApi.annotations({
          description:
            '(사용가능) 챌린지 이벤트를 조회합니다. 챌린지 이벤트가 존재하지 않는 경우 404를 반환합니다.',
          override: {
            summary: '(사용가능) 단일 챌린지 이벤트 조회',
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
        }),
      )
      .setPayload(ChallengeEvent.jsonCreate)
      .addError(Unauthorized)
      .addError(ChallengeNotFound)
      .addSuccess(ChallengeEvent.json)
      .annotateContext(
        OpenApi.annotations({
          description: `(사용가능) 챌린지 이벤트를 생성합니다. 
* 챌린지 작성자와 이벤트 생성자가 일치해야 합니다. 그렇지 않으면 Unauthorized 에러가 납니다.

* checkType은 'location', 'duration', 'manual' 중 하나여야 합니다.

* manual 이벤트의 경우 참가자가 임의로 이벤트를 완료할 수 있습니다.

* duration 이벤트의 경우 startDatetime과 endDatetime을 넣어주셔야 합니다. 이벤트 참가자가 저 시간 안에 체크를 진행할 경우 그 참가자는 이벤트를 완료한 것으로 인정됩니다.
          
* location 이벤트의 경우 coordinate를 넣어주셔야 합니다. location 이벤트가 아닌데도 coordinate를 넣으면 무시됩니다. 
          
* 이벤트 참가자가 저 좌표 근처(1km이내)에서 체크를 진행할 경우 그 참가자는 이벤트를 완료한 것으로 인정됩니다.

* coordinate는 [위도, 경도] 순으로 넣어주셔야 합니다. 

* 위도는 -90 ~ 90, 경도는 -180 ~ 180 사이의 값이어야 합니다. 예를들어 김포공항은 [37.5585, 126.7906] 입니다.`,
          override: {
            summary: '(사용가능) 챌린지 이벤트 생성',
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
      .setPayload(
        Schema.partialWith(ChallengeEvent.jsonUpdate, { exact: true }),
      )
      .addError(Unauthorized)
      .addError(ChallengeEventNotFound)
      .addSuccess(ChallengeEvent.json)
      .annotateContext(
        OpenApi.annotations({
          title: '(사용가능) 챌린지 이벤트 수정 API',
          override: {
            summary: '(사용가능) 챌린지 이벤트 수정',
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
      .addError(Unauthorized)
      .addError(ChallengeEventNotFound)
      .annotateContext(
        OpenApi.annotations({
          title: '(사용가능) 챌린지 이벤트 삭제 API',
          description: `
* 주의: 이 API는 챌린지 이벤트 자체를 완전 삭제하지 않고, isDeleted를 true로 변경합니다. (soft delete)

* 삭제된 이벤트는 챌린지 참가자에게 삭제되었음을 알려야합니다.

* 전체 순위 등을 계산할 때 삭제된 이벤트는 제외해야합니다.
          `,
          override: {
            summary: '(사용가능) 챌린지 이벤트 삭제',
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
      .setPayload(ChallengeEventCheckRequest)
      .addError(Unauthorized)
      .addError(ChallengeEventNotFound)
      .addError(ChallengeEventCheckRequestLocationBadRequest)
      .addSuccess(ChallengeEventCheckResponse)
      .annotateContext(
        OpenApi.annotations({
          title: '(사용가능) 챌린지 이벤트 체크 API',
          description:
            '(사용가능) 챌린지 참가자가 이벤트를 진행중인지 체크하고 챌린지 상황을 업데이트합니다.',
          override: {
            summary: '(사용가능) 챌린지 이벤트 체크',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.get(
      'getChecks',
      '/:challengeId/events/:challengeEventId/check',
    )
      .middleware(Authentication)
      .setPath(
        Schema.Struct({
          challengeId: ChallengeId,
          challengeEventId: ChallengeEventId,
        }),
      )
      .addError(Unauthorized)
      .addError(ChallengeEventNotFound)
      .addSuccess(Schema.Array(ChallengeEventParticipant.json))
      .annotateContext(
        OpenApi.annotations({
          title: '(사용가능) 챌린지 이벤트 참가 조회 API',
          description:
            '(사용가능) 해당 챌린지 이벤트에 참가중인 사용자의 현황을 조회합니다.',
          override: {
            summary: '(사용가능) 챌린지 이벤트 참가 조회',
          },
        }),
      ),
  )
  .prefix('/api/challenges')
  .annotateContext(
    OpenApi.annotations({
      title: '(사용가능/테스트중) 챌린지 이벤트 API',
    }),
  ) {}

import { HttpApi, OpenApi } from '@effect/platform';
import { AccountApi } from './account/account-api.mjs';
import { ChallengeEventApi } from './challenge-event/challenge-event-api.mjs';
import { ChallengeApi } from './challenge/challenge-api.mjs';
import { CommentApi } from './comment/comment-api.mjs';
import { FileApi } from './file/file-api.mjs';
import { PostApi } from './post/post-api.mjs';
import { RootApi } from './root-api.mjs';

export class Api extends HttpApi.empty
  .add(RootApi)
  .add(AccountApi)
  .add(PostApi)
  .add(CommentApi)
  .add(FileApi)
  .add(ChallengeApi)
  .add(ChallengeEventApi)
  .annotateContext(
    OpenApi.annotations({
      title: '오즈 6기 심화반 챌린지 서비스를 위한 백엔드',
      description: `최신변경점:
* 챌린지 이벤트 인터페이스 추가
* post의 count들 올바르게 수정

예정변경점:
* 챌린지 이벤트 CRUD API 추가
* 챌린지 썸네일 추가
* 챌린지 이벤트에 챌린지 참가자가 이벤트 업데이트하는 기능 추가
* account, post, challenge에 태그 기능      
      `,
      version: '0.0.2 (2024-11-21.002)',
      override: {},
    }),
  ) {}

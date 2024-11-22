import { FileSystem, HttpApi, OpenApi } from '@effect/platform';
import { NodeContext } from '@effect/platform-node';
import { Effect } from 'effect';
import { AccountApi } from './account/account-api.mjs';
import { ChallengeEventApi } from './challenge-event/challenge-event-api.mjs';
import { ChallengeApi } from './challenge/challenge-api.mjs';
import { CommentApi } from './comment/comment-api.mjs';
import { FileApi } from './file/file-api.mjs';
import { PostApi } from './post/post-api.mjs';
import { RootApi } from './root-api.mjs';

const program = Effect.provide(
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const content = yield* fs.readFileString('./package.json', 'utf8');
    const packageJson = JSON.parse(content);

    return yield* Effect.succeed(packageJson.version as string);
  }),
  NodeContext.layer,
);

const version = await Effect.runPromise(program);

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
* 챌린지 이벤트 목록검색 구현 (2024-11-22.002)
* 챌린지 이벤트 생성 구현 (2024-11-22.002)
* 챌린지 이벤트 인터페이스 추가 (2024-11-22.001)
* post의 count들 올바르게 수정 (2024-11-22.001)

예정변경점:
* 챌린지 이벤트 CRUD API 추가
* 챌린지 썸네일 추가
* 챌린지 이벤트에 챌린지 참가자가 이벤트 업데이트하는 기능 추가
* account, post, challenge에 태그 기능
      `,
      version: version,
      override: {},
    }),
  ) {}

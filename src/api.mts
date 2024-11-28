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
import { TagApi } from './tag/tag-api.mjs';

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
  .add(TagApi)
  .annotateContext(
    OpenApi.annotations({
      title: '오즈 6기 심화반 챌린지 서비스를 위한 백엔드',
      description: `최신변경점:
* 챌린지 태그조회 api 위치변경: tag -> challenge (2024-11-28.002)
* 게시글 태그조회 api 위치변경: tag -> post (2024-11-28.002)
* 특정 유저의 태그조회 api 위치변경: tag -> account (2024-11-28.002)
* 챌린지 / 게시글 isDeleted 반영 (2024-11-28.001)
* 태그 db에 색을 받을 수있게 함 (2024-11-27.002)
* [유저가 참여한 챌린지]와 [유저가 쓴 글], [유저가 만든 챌린지]의 태그를 찾아, 그를 프로필에 표시할 수 있게 지원하는 기능 (2024-11-27.001)

예정변경점:
* 챌린지 / 게시글의 태그를 삭제하는 기능
* 내가 만든 챌린지 목록을 가져오는 기능
* 내가 참여중인 챌린지 목록을 가져오는 기능
* 내가 참여중인 챌린지 이벤트를 가져오는 기능
* 내가 쓴 글 목록을 가져오는 기능
* 내가 좋아요/싫어요한 글 목록을 가져오는 기능
* 내가 쓴 댓글 목록을 가져오는 기능
      `,
      version: version,
      override: {},
    }),
  ) {}

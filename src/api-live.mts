import { HttpApiBuilder } from '@effect/platform';
import { Layer } from 'effect';
import { AccountApiLive } from './account/account-api-live.mjs';
import { Api } from './api.mjs';
import { PostApiLive } from './post/post-api-live.mjs';
import { RootApiLive } from './root-api-live.mjs';
import { CommentApiLive } from './comment/comment-api-live.mjs';
import { FileApiLive } from './file/file-api-live.mjs';
import { ChallengeApiLive } from './challenge/challenge-api-live.mjs';

export const ApiLive = HttpApiBuilder.api(Api).pipe(
  Layer.provide([
    RootApiLive,
    AccountApiLive,
    PostApiLive,
    CommentApiLive,
    FileApiLive,
    ChallengeApiLive,
  ]),
);

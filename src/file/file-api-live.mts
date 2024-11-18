import { Api } from '@/api.mjs';
import { AuthenticationLive } from '@/auth/authentication.mjs';
import { ChallengeId } from '@/challenge/challenge-schema.mjs';
import { ChallengeService } from '@/challenge/challenge-service.mjs';
import { PostId } from '@/post/post-schema.mjs';
import { PostService } from '@/post/post-service.mjs';
import { FileSystem, HttpApiBuilder } from '@effect/platform';
import { Effect, Layer, Option } from 'effect';
import { FileUploadError } from './file-error.mjs';
import { FileService } from './file-service.mjs';
import { AccountService } from '@/account/account-service.mjs';
import { AccountId } from '@/account/account-schema.mjs';

export const FileApiLive = HttpApiBuilder.group(Api, 'file', (handlers) =>
  Effect.gen(function* () {
    const fileService = yield* FileService;
    const challengeService = yield* ChallengeService;
    const postService = yield* PostService;
    const accountService = yield* AccountService;
    const fs = yield* FileSystem.FileSystem;

    return handlers
      .handle('uploadImage', ({ payload: { file, ...target } }) =>
        Effect.gen(function* () {
          const temp = yield* fs.readFile(file.path).pipe(Effect.orDie);

          const maybePost = yield* postService.findByIdFromRepo(
            PostId.make(target.id),
          );
          if (Option.isSome(maybePost)) {
            const url = yield* fileService.uploadImage(
              new File([temp], target.filename, {
                type: `image/${target.extension}`,
              }),
              target,
            );
            return yield* Effect.succeed({
              url,
            });
          }

          const maybeChallenge = yield* challengeService.findByIdFromRepo(
            ChallengeId.make(target.id),
          );

          if (Option.isSome(maybeChallenge)) {
            const url = yield* fileService.uploadImage(
              new File([temp], target.filename, {
                type: `image/${target.extension}`,
              }),
              target,
            );
            return yield* Effect.succeed({
              url,
            });
          }

          const maybeAccount = yield* accountService.findByIdFromRepo(
            AccountId.make(target.id),
          );

          if (Option.isSome(maybeAccount)) {
            const url = yield* fileService.uploadImage(
              new File([temp], target.filename, {
                type: `image/${target.extension}`,
              }),
              target,
            );
            return yield* Effect.succeed({
              url,
            });
          }

          return yield* Effect.fail(
            new FileUploadError({
              name: 'FileUploadError',
              message: `ID ${target.id} not found in post or challenge`,
            }),
          );
        }),
      )
      .handle('getImageAllInfo', ({ payload }) =>
        fileService.getImageAllInfo(payload),
      );
  }),
).pipe(
  Layer.provide(AuthenticationLive),
  Layer.provide(FileService.Live),
  Layer.provide(ChallengeService.Live),
  Layer.provide(PostService.Live),
  Layer.provide(AccountService.Live),
);

import { Api } from '@/api.mjs';
import { AuthenticationLive } from '@/auth/authentication.mjs';
import { policyUse, withSystemActor } from '@/auth/authorization.mjs';
import { HttpApiBuilder } from '@effect/platform';
import { Effect, Layer } from 'effect';
import { AccountPolicy } from './account-policy.mjs';
import { CurrentAccount } from './account-schema.mjs';
import { AccountService } from './account-service.mjs';

export const AccountApiLive = HttpApiBuilder.group(Api, 'account', (handlers) =>
  Effect.gen(function* () {
    const accountService = yield* AccountService;
    const accountPolicy = yield* AccountPolicy;

    return handlers
      .handle('signUp', ({ payload }) =>
        accountService.signUp(payload).pipe(withSystemActor),
      )
      .handle('findById', ({ path }) =>
        accountService.findAccountById(path.accountId),
      )
      .handle('findTags', ({ path }) => accountService.findTags(path.accountId))
      .handle('updateById', ({ path, payload }) =>
        accountService
          .updateAccountById(path.accountId, payload)
          .pipe(policyUse(accountPolicy.canUpdate(path.accountId))),
      )
      .handle('signIn', ({ payload }) =>
        accountService.signIn(payload).pipe(withSystemActor),
      )
      .handle('me', () => CurrentAccount)
      .handle('findPosts', ({ path, urlParams }) =>
        accountService.findPosts(urlParams, path.accountId),
      )
      .handle('findComments', ({ path, urlParams }) =>
        accountService.findComments(urlParams, path.accountId),
      )
      .handle('findChallenges', ({ path, urlParams }) =>
        accountService.findChallenges(urlParams, path.accountId),
      )
      .handle('findChallengeEvents', ({ path, urlParams }) =>
        accountService.findAllChallengeEvents(urlParams, path.accountId),
      )
      .handle('findLikes', ({ path, urlParams }) =>
        accountService.findAllLikes(urlParams, path.accountId),
      )
      .handle('invalidate', ({ headers }) =>
        accountService.invalidate(headers['refresh-token']),
      );
  }),
).pipe(
  Layer.provide(AuthenticationLive),
  Layer.provide(AccountService.Live),
  Layer.provide(AccountPolicy.Live),
);

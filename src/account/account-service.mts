import { policyRequire } from '@/auth/authorization.mjs';
import { CryptoService } from '@/crypto/crypto-service.mjs';
import { TokenService } from '@/crypto/token-service.mjs';
import { ServerError } from '@/misc/common-error.mjs';
import { Email } from '@/misc/email-schema.mjs';
import { SqlTest } from '@/sql/sql-test.mjs';
import { Effect, Layer, Option, pipe } from 'effect';
import {
  AccountAlreadyExists,
  AccountByEmailNotFound,
  AccountNotFound,
  InvalidPassword,
} from './account-error.mjs';
import { AccountRepo } from './account-repo.mjs';
import { Account, AccountId } from './account-schema.mjs';
import { SignIn } from './sign-in-schema.mjs';
import { SignUp } from './sign-up-schema.mjs';
import { VerifyTokenError } from '@/crypto/token-error.mjs';
import { ChallengeEventService } from '@/challenge-event/challenge-event-service.mjs';
import { CommentService } from '@/comment/comment-service.mjs';
import { LikeService } from '@/like/like-service.mjs';
import { PostService } from '@/post/post-service.mjs';
import { FindManyUrlParams } from '@/misc/find-many-url-params-schema.mjs';
import { ChallengeService } from '@/challenge/challenge-service.mjs';

const make = Effect.gen(function* () {
  const accountRepo = yield* AccountRepo;
  const cryptoService = yield* CryptoService;
  const tokenService = yield* TokenService;
  const postService = yield* PostService;
  const commentService = yield* CommentService;
  const challengeService = yield* ChallengeService;
  const challengeEventService = yield* ChallengeEventService;
  const likeService = yield* LikeService;

  const signUp = (signUp: SignUp) => {
    const program = Effect.gen(function* () {
      yield* Effect.annotateCurrentSpan('account', signUp);

      const maybeAccount = yield* accountRepo.findByEmail(signUp.email);

      yield* Option.match(maybeAccount, {
        onNone: () => Effect.succeed(null),
        onSome: (account) =>
          Effect.fail(new AccountAlreadyExists({ email: account.email })),
      });

      const salt = yield* cryptoService.getRandomSalt();
      const hashedPassword = yield* cryptoService.hashPassword(
        signUp.password,
        salt,
      );

      const newAccount = yield* accountRepo
        .insert(
          Account.insert.make({
            email: signUp.email,
            passwordHash: hashedPassword.toString('hex'),
            passwordSalt: salt,
            isEmailVerified: false,
            role: 'user',
            username: signUp.username,
            bio: null,
            birthday: null,
            externalUrls: null,
            isPrivate: false,
            mainLanguage: null,
            profileImageUrl: null,
            nationality: null,
          }),
        )
        .pipe(
          Effect.catchAll((error) => {
            return Effect.fail(
              new ServerError({
                message: `Failed to create account: ${signUp.email}`,
              }),
            );
          }),
          Effect.withSpan('AccountService.signUp.insert'),
        );

      return newAccount;
    });

    return program.pipe(
      Effect.withSpan('AccountService.signUp', {
        attributes: { signUp },
      }),
      policyRequire('account', 'create'),
    );
  };

  const signIn = (signIn: SignIn) =>
    Effect.gen(function* () {
      const maybeAccount = yield* accountRepo.findByEmail(signIn.email);

      const account = yield* Option.match(maybeAccount, {
        onNone: () => Effect.fail(new InvalidPassword()),
        onSome: (account) => Effect.succeed(account),
      });

      const hashedPasswordBuffer = yield* cryptoService.hashPassword(
        signIn.password,
        account.passwordSalt,
      );

      const hashedPassword = hashedPasswordBuffer.toString('hex');

      if (hashedPassword !== account.passwordHash) {
        return yield* Effect.fail(new InvalidPassword());
      }

      const accessToken = yield* tokenService.generateAccessToken(account);
      const refreshToken = yield* tokenService.generateRefreshToken(account);

      return { account, accessToken, refreshToken };
    }).pipe(
      Effect.catchAll((error) => {
        return Effect.fail(new InvalidPassword());
      }),
      Effect.withSpan('AccountService.signIn', {
        attributes: { email: signIn.email },
      }),
    );

  const findAccountByEmail = (email: Email) =>
    Effect.gen(function* () {
      yield* Effect.annotateCurrentSpan('account', email);

      const account = yield* accountRepo.findByEmail(email);

      const matched = yield* Option.match(account, {
        onNone: () => Effect.fail(new AccountByEmailNotFound({ email })),
        onSome: (account) => Effect.succeed(account),
      });

      return matched;
    }).pipe(
      Effect.orDie,
      policyRequire('account', 'read'),
      Effect.withSpan('AccountService.findAccountByEmail', {
        attributes: { email },
      }),
    );

  const findByIdFromRepo = (id: AccountId) => accountRepo.findById(id);

  const findAccountById = (id: AccountId) =>
    Effect.gen(function* () {
      yield* Effect.annotateCurrentSpan('account', id);

      const account = yield* accountRepo.findById(id);

      const matched = yield* Option.match(account, {
        onNone: () => Effect.fail(new AccountNotFound({ id })),
        onSome: (account) => Effect.succeed(account),
      });

      return matched;
    }).pipe(
      Effect.orDie,
      Effect.withSpan('AccountService.findAccountById', {
        attributes: { id },
      }),
    );

  const findTags = (accountId: AccountId) =>
    accountRepo
      .findTags(accountId)
      .pipe(Effect.withSpan('AccountService.findTags'));

  const embellishAccount = (target: Account) =>
    Effect.gen(function* () {
      const maybeAccount = yield* accountRepo.findById(target.id);

      const account = yield* Option.match(maybeAccount, {
        onNone: () => Effect.fail(new AccountNotFound({ id: target.id })),
        onSome: (account) => Effect.succeed(account),
      });

      return account;
    }).pipe(
      policyRequire('account', 'readSensitive'),
      Effect.withSpan('AccountService.embellishAccount', {
        attributes: { target },
      }),
    );

  const updateAccountById = (
    id: AccountId,
    account: Partial<typeof Account.jsonUpdate.Type>,
  ) =>
    accountRepo.with(id, (existing) =>
      pipe(
        accountRepo.updateById(existing, account),
        policyRequire('account', 'update'),
      ),
    );

  const invalidate = (refreshToken: string) =>
    Effect.gen(function* () {
      const decoded = yield* tokenService.verifyToken(refreshToken);

      const maybeAccount = yield* accountRepo.findByEmail(decoded.sub);

      const account = yield* Option.match(maybeAccount, {
        onNone: () =>
          Effect.fail(
            new AccountByEmailNotFound({
              email: decoded.sub,
            }),
          ),
        onSome: (account) => Effect.succeed(account),
      });

      const accessToken = yield* tokenService.generateAccessToken(account);
      const newRefreshToken = yield* tokenService.generateRefreshToken(account);

      return { accessToken, refreshToken: newRefreshToken };
    }).pipe(
      Effect.catchAll((error) => {
        return Effect.fail(new VerifyTokenError());
      }),
      Effect.withSpan('AccountService.invalidate', {
        attributes: { refreshToken },
      }),
    );

  const findPosts = (params: FindManyUrlParams, accountId: AccountId) =>
    postService
      .findPosts(params, accountId)
      .pipe(Effect.withSpan('AccountService.findPosts'));

  const findComments = (params: FindManyUrlParams, accountId: AccountId) =>
    commentService
      .findAllPossiblyByAccountId(params, accountId)
      .pipe(Effect.withSpan('AccountService.findPosts'));

  const findChallenges = (params: FindManyUrlParams, accountId: AccountId) =>
    challengeService
      .findChallenges(params, accountId)
      .pipe(Effect.withSpan('AccountService.findChallenges'));

  const findAllChallengeEvents = (
    params: FindManyUrlParams,
    accountId: AccountId,
  ) =>
    challengeEventService
      .findChallengeEvents(params, accountId)
      .pipe(Effect.withSpan('AccountService.findAllChallengeEvents'));

  const findAllLikes = (params: FindManyUrlParams, accountId: AccountId) =>
    likeService
      .findAllLikes(params, accountId)
      .pipe(Effect.withSpan('AccountService.findAllLikes'));

  return {
    signUp,
    signIn,
    findByIdFromRepo,
    findTags,
    findAccountByEmail,
    findAccountById,
    updateAccountById,
    embellishAccount,
    invalidate,
    findPosts,
    findComments,
    findChallenges,
    findAllChallengeEvents,
    findAllLikes,
  } as const;
});

export class AccountService extends Effect.Tag('AccountService')<
  AccountService,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(AccountService, make);

  static Live = this.layer.pipe(
    Layer.provide(AccountRepo.Live),
    Layer.provide(CryptoService.Live),
    Layer.provide(TokenService.Live),
    Layer.provide(PostService.Live),
    Layer.provide(CommentService.Live),
    Layer.provide(LikeService.Live),
    Layer.provide(ChallengeService.Live),
    Layer.provide(ChallengeEventService.Live),
  );

  static Test = this.layer.pipe(Layer.provideMerge(SqlTest));
}

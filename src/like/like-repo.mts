import { AccountId } from '@/account/account-schema.mjs';
import { makeTestLayer } from '@/misc/test-layer.mjs';
import { PostId } from '@/post/post-schema.mjs';
import { SqlLive } from '@/sql/sql-live.mjs';
import { Model, SqlClient, SqlSchema } from '@effect/sql';
import { Effect, Layer, Option, pipe } from 'effect';
import { LikeConflict, LikeNotFound } from './like-error.mjs';
import { Like, LikeId, LikeType } from './like-schema.mjs';
import { LikeSelector, likeSelectorsToWhere } from './like-selector-schema.mjs';
import { CommentId } from '@/comment/comment-schema.mjs';
import { ChallengeId } from '@/challenge/challenge-schema.mjs';
import { ChallengeEventId } from '@/challenge/challenge-event-schema.mjs';

const LIKE_TABLE = 'like';

const make = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const repo = yield* Model.makeRepository(Like, {
    tableName: LIKE_TABLE,
    spanPrefix: 'LikeRepo',
    idColumn: 'id',
  });

  const with_ = <A, E, R>(
    id: LikeId,
    f: (like: Like) => Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E | LikeNotFound, R> => {
    return pipe(
      repo.findById(id),
      Effect.flatMap(
        Option.match({
          onNone: () => new LikeNotFound({ id }),
          onSome: Effect.succeed,
        }),
      ),
      Effect.flatMap(f),
      sql.withTransaction,
      Effect.catchTag('SqlError', (err) => Effect.die(err)),
    );
  };

  const withoutTarget_ = <A, E, R>(
    ids: LikeSelector,
    types: LikeType[] = ['like'],
    f: () => Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E | LikeConflict, R> => {
    return pipe(
      findLikeByTargets(ids, types),
      Effect.flatMap(
        Option.match({
          onNone: () => Effect.succeed(true),
          onSome: (like) =>
            Effect.fail(
              new LikeConflict({
                id: like.id,
              }),
            ),
        }),
      ),
      Effect.flatMap(f),
      sql.withTransaction,
      Effect.catchTag('SqlError', (err) => Effect.die(err)),
    );
  };

  const createPostLike = (postId: PostId, accountId: AccountId) =>
    repo
      .insert(
        Like.insert.make({
          postId,
          accountId,
          count: 1,
          type: 'like',
        }),
      )
      .pipe(Effect.withSpan('LikeRepo.createPostLike'), Effect.orDie);

  const createPostDislike = (postId: PostId, accountId: AccountId) =>
    repo
      .insert(
        Like.insert.make({
          postId,
          accountId,
          count: 1,
          type: 'dislike',
        }),
      )
      .pipe(Effect.withSpan('LikeRepo.createPostLike'), Effect.orDie);

  const createCommentLike = (commentId: CommentId, accountId: AccountId) =>
    repo
      .insert(
        Like.insert.make({
          commentId,
          accountId,
          count: 1,
          type: 'like',
        }),
      )
      .pipe(Effect.withSpan('LikeRepo.createCommentLike'), Effect.orDie);

  const createCommentDislike = (commentId: CommentId, accountId: AccountId) =>
    repo
      .insert(
        Like.insert.make({
          commentId,
          accountId,
          count: 1,
          type: 'dislike',
        }),
      )
      .pipe(Effect.withSpan('LikeRepo.createCommentDislike'), Effect.orDie);

  const createChallengeLike = (
    challengeId: ChallengeId,
    accountId: AccountId,
  ) =>
    repo
      .insert(
        Like.insert.make({
          challengeId,
          accountId,
          count: 1,
          type: 'like',
        }),
      )
      .pipe(Effect.withSpan('LikeRepo.createChallengeLike'), Effect.orDie);

  const createChallengeDislike = (
    challengeId: ChallengeId,
    accountId: AccountId,
  ) =>
    repo
      .insert(
        Like.insert.make({
          challengeId,
          accountId,
          count: 1,
          type: 'dislike',
        }),
      )
      .pipe(Effect.withSpan('LikeRepo.createChallengeDislike'), Effect.orDie);

  const createChallengeEventLike = (
    challengeEventId: ChallengeEventId,
    accountId: AccountId,
  ) =>
    repo
      .insert(
        Like.insert.make({
          challengeEventId,
          accountId,
          count: 1,
          type: 'like',
        }),
      )
      .pipe(Effect.withSpan('LikeRepo.createChallengeEventLike'), Effect.orDie);

  const createChallengeEventDislike = (
    challengeEventId: ChallengeEventId,
    accountId: AccountId,
  ) =>
    repo
      .insert(
        Like.insert.make({
          challengeEventId,
          accountId,
          count: 1,
          type: 'dislike',
        }),
      )
      .pipe(
        Effect.withSpan('LikeRepo.createChallengeEventDislike'),
        Effect.orDie,
      );

  const findLikeByTargets = (ids: LikeSelector, types: LikeType[] = ['like']) =>
    SqlSchema.findOne({
      Request: LikeSelector,
      Result: Like,
      execute: (req) =>
        sql`select * from ${sql(LIKE_TABLE)} where ${sql.and(
          likeSelectorsToWhere(req).map(([key, value]) =>
            sql.unsafe(`${key} = '${value}'`),
          ),
        )} and ${sql.unsafe(
          types.length > 0
            ? `type in (${types.map((v) => "'" + v + "'").join(', ')})`
            : `1 = 1`,
        )}`,
    })(ids).pipe(Effect.withSpan('LikeRepo.findLikeByTargets'), Effect.orDie);

  const withTarget_ = <A, E, R>(
    ids: LikeSelector,
    types: LikeType[] = ['like'],
    f: (like: Like) => Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E | LikeNotFound, R> => {
    return pipe(
      findLikeByTargets(ids, types),
      Effect.flatMap(
        Option.match({
          onNone: () => new LikeNotFound({}),
          onSome: Effect.succeed,
        }),
      ),
      Effect.flatMap(f),
      sql.withTransaction,
      Effect.catchTag('SqlError', (err) => Effect.die(err)),
    );
  };

  return {
    ...repo,
    createPostLike,
    createPostDislike,
    createCommentLike,
    createCommentDislike,
    createChallengeLike,
    createChallengeDislike,
    createChallengeEventLike,
    createChallengeEventDislike,
    with: with_,
    withTarget: withTarget_,
    withoutTarget: withoutTarget_,
  } as const;
});

export class LikeRepo extends Effect.Tag('LikeRepo')<
  LikeRepo,
  Effect.Effect.Success<typeof make>
>() {
  static Live = Layer.effect(LikeRepo, make).pipe(Layer.provide(SqlLive));
  static Test = makeTestLayer(LikeRepo)({});
}

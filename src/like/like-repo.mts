import { AccountId } from '@/account/account-schema.mjs';
import { ChallengeEventId } from '@/challenge-event/challenge-event-schema.mjs';
import { ChallengeId } from '@/challenge/challenge-schema.mjs';
import { CommentId } from '@/comment/comment-schema.mjs';
import { CommonCountSchema } from '@/misc/common-count-schema.mjs';
import { FindManyResultSchema } from '@/misc/find-many-result-schema.mjs';
import { FindManyUrlParams } from '@/misc/find-many-url-params-schema.mjs';
import { makeTestLayer } from '@/misc/test-layer.mjs';
import { PostId } from '@/post/post-schema.mjs';
import { CREATED_AT, DESC } from '@/sql/order-by.mjs';
import { SqlLive } from '@/sql/sql-live.mjs';
import { Model, SqlClient, SqlSchema } from '@effect/sql';
import { Effect, Layer, Option, pipe, Schema } from 'effect';
import { LikeConflict, LikeNotFound } from './like-error.mjs';
import { Like, LikeId, LikeType } from './like-schema.mjs';
import { LikeSelector, likeSelectorsToWhere } from './like-selector-schema.mjs';

const LIKE_TABLE = 'like';

const make = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const repo = yield* Model.makeRepository(Like, {
    tableName: LIKE_TABLE,
    spanPrefix: 'LikeRepo',
    idColumn: 'id',
  });

  const findAllLikes = (params: FindManyUrlParams, accountId?: AccountId) =>
    Effect.gen(function* () {
      const likes = yield* SqlSchema.findAll({
        Request: FindManyUrlParams,
        Result: Like,
        execute: () =>
          sql`select * from ${sql(LIKE_TABLE)} where 
      ${sql.and(accountId ? [sql`account_id = ${accountId}`] : [])}
      order by ${sql(CREATED_AT)} ${sql.unsafe(DESC)} 
      limit ${params.limit} 
      offset ${(params.page - 1) * params.limit}`,
      })(params);

      const { total } = yield* SqlSchema.single({
        Request: FindManyUrlParams,
        Result: CommonCountSchema,
        execute: () =>
          sql`select count(*) as total from ${sql(LIKE_TABLE)} where ${sql.and(
            accountId ? [sql`account_id = ${accountId}`] : [],
          )}`,
      })(params);

      const ResultSchema = FindManyResultSchema(Schema.Any);

      const result = ResultSchema.make({
        data: likes,
        meta: {
          total,
          page: params.page,
          limit: params.limit,
          isLastPage: params.page * params.limit + likes.length >= total,
        },
      });

      return result;
    }).pipe(Effect.orDie, Effect.withSpan('LikeRepo.findAllLikes'));

  const with_ = <A, E, R>(
    id: LikeId,
    f: (like: Like) => Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E | LikeNotFound, R> => {
    return pipe(
      repo.findById(id),
      Effect.flatMap(
        Option.match({
          onNone: () =>
            new LikeNotFound({
              id,
              challengeEventId: null,
              commentId: null,
              postId: null,
              challengeId: null,
            }),
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
          challengeEventId: null,
          commentId: null,
          challengeId: null,
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
          challengeEventId: null,
          commentId: null,
          challengeId: null,
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
          challengeEventId: null,
          postId: null,
          challengeId: null,
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
          challengeEventId: null,
          postId: null,
          challengeId: null,
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
          challengeEventId: null,
          commentId: null,
          postId: null,
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
          challengeEventId: null,
          commentId: null,
          postId: null,
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
          commentId: null,
          postId: null,
          challengeId: null,
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
          commentId: null,
          postId: null,
          challengeId: null,
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
          onNone: () =>
            new LikeNotFound({
              id: null,
              ...ids,
            }),
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
    findAllLikes,
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

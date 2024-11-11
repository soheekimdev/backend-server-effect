import { CommonCountSchema } from '@/misc/common-count-schema.mjs';
import { FindManyResultSchema } from '@/misc/find-many-result-schema.mjs';
import { FindManyUrlParams } from '@/misc/find-many-url-params-schema.mjs';
import { makeTestLayer } from '@/misc/test-layer.mjs';
import { PostCommentView, PostId } from '@/post/post-schema.mjs';
import { CREATED_AT, DESC } from '@/sql/order-by.mjs';
import { SqlLive } from '@/sql/sql-live.mjs';
import { Model, SqlClient, SqlSchema } from '@effect/sql';
import { Effect, Layer, Option, pipe } from 'effect';
import { CommentNotFound } from './comment-error.mjs';
import { Comment, CommentId, CommentView } from './comment-schema.mjs';

const TABLE_NAME = 'comment';
const LIKE_VIEW_NAME = 'comment_like_counts';
const POST_COMMENT_VIEW_NAME = 'post_comment_counts';

const make = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const repo = yield* Model.makeRepository(Comment, {
    tableName: TABLE_NAME,
    spanPrefix: 'CommentRepo',
    idColumn: 'id',
  });

  const likeViewRepo = yield* Model.makeRepository(CommentView, {
    tableName: LIKE_VIEW_NAME,
    spanPrefix: 'CommentViewRepo',
    idColumn: 'id',
  });

  const commentViewRepo = yield* Model.makeRepository(PostCommentView, {
    tableName: POST_COMMENT_VIEW_NAME,
    spanPrefix: 'PostCommentViewRepo',
    idColumn: 'id',
  });

  const findAllByPostIdWithView = (postId: PostId, params: FindManyUrlParams) =>
    Effect.gen(function* () {
      const comments = yield* SqlSchema.findAll({
        Request: PostId,
        Result: CommentView,
        execute: () =>
          sql`select * from ${sql(LIKE_VIEW_NAME)} where post_id = ${postId} order by ${sql(CREATED_AT)} ${sql.unsafe(DESC)} limit ${params.limit} offset ${(params.page - 1) * params.limit}`,
      })(postId);
      const { total } = yield* SqlSchema.single({
        Request: FindManyUrlParams,
        Result: CommonCountSchema,
        execute: () => sql`select count(*) as total from ${sql(TABLE_NAME)}`,
      })(params);

      const ResultSchema = FindManyResultSchema(CommentView);

      const result = ResultSchema.make({
        data: comments,
        meta: {
          total,
          page: params.page,
          limit: params.limit,
          isLastPage: params.page * params.limit + comments.length >= total,
        },
      });

      return result;
    }).pipe(
      Effect.orDie,
      Effect.withSpan('CommentRepo.findAllByPostIdWithView'),
    );

  const with_ = <A, E, R>(
    id: CommentId,
    f: (post: Comment) => Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E | CommentNotFound, R> => {
    return pipe(
      repo.findById(id),
      Effect.flatMap(
        Option.match({
          onNone: () => new CommentNotFound({ id }),
          onSome: Effect.succeed,
        }),
      ),
      Effect.flatMap(f),
      sql.withTransaction,
      Effect.catchTag('SqlError', (err) => Effect.die(err)),
    );
  };

  const withView_ = <A, E, R>(
    id: CommentId,
    f: (post: CommentView) => Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E | CommentNotFound, R> => {
    return pipe(
      likeViewRepo.findById(id),
      Effect.flatMap(
        Option.match({
          onNone: () => new CommentNotFound({ id }),
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
    likeViewRepo: {
      ...likeViewRepo,
      findAllByPostId: findAllByPostIdWithView,
    },
    commentViewRepo,
    with: with_,
    withView: withView_,
  } as const;
});

export class CommentRepo extends Effect.Tag('CommentRepo')<
  CommentRepo,
  Effect.Effect.Success<typeof make>
>() {
  static Live = Layer.effect(CommentRepo, make).pipe(Layer.provide(SqlLive));
  static Test = makeTestLayer(CommentRepo)({});
}

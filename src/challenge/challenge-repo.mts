import { CommonCountSchema } from '@/misc/common-count-schema.mjs';
import { FindManyResultSchema } from '@/misc/find-many-result-schema.mjs';
import { FindManyUrlParams } from '@/misc/find-many-url-params-schema.mjs';
import { makeTestLayer } from '@/misc/test-layer.mjs';
import { SqlLive } from '@/sql/sql-live.mjs';
import { Model, SqlClient, SqlSchema } from '@effect/sql';
import { Effect, Layer, Option, pipe, Schema } from 'effect';
import { ChallengeNotFound } from './challenge-error.mjs';
import { Challenge, ChallengeId, ChallengeView } from './challenge-schema.mjs';

const snakeCase = (str: string) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const TABLE_NAME = 'challenge';
const VIEW_NAME = 'challenge_like_counts';

const make = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const repo = yield* Model.makeRepository(Challenge, {
    tableName: TABLE_NAME,
    spanPrefix: 'ChallengeRepo',
    idColumn: 'id',
  });

  const viewRepo = yield* Model.makeRepository(ChallengeView, {
    tableName: VIEW_NAME,
    spanPrefix: 'ChallengeViewRepo',
    idColumn: 'id',
  });

  const findAllWithView = (params: FindManyUrlParams) =>
    Effect.gen(function* () {
      const challenges = yield* SqlSchema.findAll({
        Request: FindManyUrlParams,
        Result: ChallengeView,
        execute: (req) =>
          sql`select * 
from ${sql(VIEW_NAME)} 
order by ${sql(snakeCase(params.sortBy))} 
 ${sql.unsafe(params.order)} 
limit ${params.limit} 
offset ${(params.page - 1) * params.limit}`,
      })(params);
      const { total } = yield* SqlSchema.single({
        Request: FindManyUrlParams,
        Result: CommonCountSchema,
        execute: () => sql`select count(*) as total from ${sql(TABLE_NAME)}`,
      })(params);

      const ResultSchema = FindManyResultSchema(ChallengeView);

      const result = ResultSchema.make({
        data: challenges,
        meta: {
          total,
          page: params.page,
          limit: params.limit,
          isLastPage: params.page * params.limit + challenges.length >= total,
        },
      });

      return result;
    }).pipe(Effect.orDie, Effect.withSpan('ChallengeRepo.findAll'));

  const insert = (challenge: typeof Challenge.insert.Type) =>
    SqlSchema.single({
      Request: Challenge.insert,
      Result: Schema.Any,
      execute: (request) =>
        sql`insert into ${sql(TABLE_NAME)} ${sql
          .insert(request)
          .returning('*')}`,
    })(challenge).pipe(Effect.orDie);

  const with_ = <A, E, R>(
    id: ChallengeId,
    f: (post: Challenge) => Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E | ChallengeNotFound, R> => {
    return pipe(
      repo.findById(id),
      Effect.flatMap(
        Option.match({
          onNone: () => new ChallengeNotFound({ id }),
          onSome: Effect.succeed,
        }),
      ),
      Effect.flatMap(f),
      sql.withTransaction,
      Effect.catchTag('SqlError', (err) => Effect.die(err)),
    );
  };

  const withView_ = <A, E, R>(
    id: ChallengeId,
    f: (post: ChallengeView) => Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E | ChallengeNotFound, R> => {
    return pipe(
      viewRepo.findById(id),
      Effect.flatMap(
        Option.match({
          onNone: () => new ChallengeNotFound({ id }),
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
    insert,
    viewRepo,
    findAllWithView,
    with: with_,
    withView: withView_,
  } as const;
});

export class ChallengeRepo extends Effect.Tag('ChallengeRepo')<
  ChallengeRepo,
  Effect.Effect.Success<typeof make>
>() {
  static Live = Layer.effect(ChallengeRepo, make).pipe(Layer.provide(SqlLive));
  static Test = makeTestLayer(ChallengeRepo)({});
}

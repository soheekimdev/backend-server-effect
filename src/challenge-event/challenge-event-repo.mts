import { ChallengeId } from '@/challenge/challenge-schema.mjs';
import { makeTestLayer } from '@/misc/test-layer.mjs';
import { SqlLive } from '@/sql/sql-live.mjs';
import { Model, SqlClient, SqlSchema } from '@effect/sql';
import { Effect, Layer, Option, pipe, Schema } from 'effect';
import { ChallengeEventNotFound } from './challenge-event-error.mjs';
import {
  ChallengeEvent,
  ChallengeEventId,
  ChallengeEventView,
} from './challenge-event-schema.mjs';
import { FromStringToCoordinate, Meters } from './helper-schema.mjs';
import { FindManyUrlParams } from '@/misc/find-many-url-params-schema.mjs';
import { AccountId } from '@/account/account-schema.mjs';
import { CREATED_AT, DESC } from '@/sql/order-by.mjs';
import { CommonCountSchema } from '@/misc/common-count-schema.mjs';
import { FindManyResultSchema } from '@/misc/find-many-result-schema.mjs';

const TABLE_NAME = 'challenge_event';

const VIEW_NAME = 'challenge_event_counts';

const make = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const repo = yield* Model.makeRepository(ChallengeEvent, {
    tableName: TABLE_NAME,
    spanPrefix: 'ChallengeEventRepo',
    idColumn: 'id',
  });

  const findAllChallengeEvents = (
    params: FindManyUrlParams,
    accountId?: AccountId,
  ) =>
    Effect.gen(function* () {
      const posts = yield* SqlSchema.findAll({
        Request: FindManyUrlParams,
        Result: Schema.Struct({
          ...ChallengeEventView.fields,
          coordinate: Schema.NullishOr(FromStringToCoordinate),
        }),
        execute: () =>
          sql`
SELECT 
  ce.*, 
  ST_AsText(${sql('coordinate')}) as coordinate 
FROM 
  challenge_event_participant cep
LEFT JOIN 
  ${sql(VIEW_NAME)} ce ON cep.challenge_event_id = ce.id
where 
  ${sql.and(
    accountId
      ? [sql`cep.account_id = ${accountId}`, sql`ce.is_deleted = false`]
      : [sql`ce.is_deleted = false`],
  )}
order by ${sql(CREATED_AT)} ${sql.unsafe(DESC)} 
limit ${params.limit} 
offset ${(params.page - 1) * params.limit}`,
      })(params);
      const { total } = yield* SqlSchema.single({
        Request: FindManyUrlParams,
        Result: CommonCountSchema,
        execute: () =>
          sql`
select 
  count(*) as total 
FROM 
  challenge_event_participant cep
LEFT JOIN 
  ${sql(VIEW_NAME)} ce ON cep.challenge_event_id = ce.id
where 
  ${sql.and(
    accountId
      ? [sql`cep.account_id = ${accountId}`, sql`ce.is_deleted = false`]
      : [sql`ce.is_deleted = false`],
  )}`,
      })(params);

      const ResultSchema = FindManyResultSchema(
        Schema.Struct({
          ...ChallengeEventView.fields,
          coordinate: Schema.NullishOr(FromStringToCoordinate),
        }),
      );

      const result = ResultSchema.make({
        data: posts,
        meta: {
          total,
          page: params.page,
          limit: params.limit,
          isLastPage: params.page * params.limit + posts.length >= total,
        },
      });

      return result;
    }).pipe(Effect.orDie, Effect.withSpan('PostRepo.findAll'));

  const findById = (id: ChallengeEventId) =>
    SqlSchema.findOne({
      Request: ChallengeEventId,
      Result: Schema.Struct({
        ...ChallengeEventView.fields,
        coordinate: Schema.NullishOr(FromStringToCoordinate),
      }),
      execute: (id) =>
        sql`select *, ST_AsText(${sql('coordinate')}) as coordinate from ${sql(VIEW_NAME)} where ${sql('id')} = ${id};`,
    })(id).pipe(Effect.orDie, Effect.withSpan('ChallengeEventRepo.findById'));

  const findAllByChallengeId = (challengeId: ChallengeId) =>
    Effect.gen(function* () {
      const events = yield* SqlSchema.findAll({
        Request: ChallengeId,
        Result: Schema.Struct({
          ...ChallengeEventView.fields,
          coordinate: Schema.NullishOr(FromStringToCoordinate),
        }),
        execute: () =>
          sql`select *, ST_AsText(${sql('coordinate')}) as coordinate from ${sql(VIEW_NAME)} where challenge_id = ${challengeId};`,
      })(challengeId);

      return events;
    }).pipe(
      Effect.orDie,
      Effect.withSpan('ChallengeEventRepo.findAllByChallengeId'),
    );

  const insert = (event: typeof ChallengeEvent.insert.Type) =>
    SqlSchema.single({
      Request: ChallengeEvent.insert,
      Result: Schema.Struct({
        ...ChallengeEvent.fields,
        coordinate: FromStringToCoordinate,
      }),
      execute: (request) =>
        sql`insert into ${sql(TABLE_NAME)} ${sql.insert(request).returning('*, ST_AsText(coordinate) as coordinate')}`,
    })(event).pipe(
      Effect.tap((event) => Effect.log(event)),
      Effect.orDie,
      Effect.withSpan('ChallengeEventRepo.insert'),
    );

  const update = (event: typeof ChallengeEvent.update.Type) =>
    SqlSchema.single({
      Request: ChallengeEvent.update,
      Result: Schema.Struct({
        ...ChallengeEvent.fields,
        coordinate: FromStringToCoordinate,
      }),
      execute: (request) =>
        sql`
update ${sql(TABLE_NAME)} 
set ${sql.update(request, ['id'])} 
where ${sql('id')} = ${request.id} 
returning *, ST_AsText(coordinate) as coordinate;
;`,
    })(event).pipe(Effect.orDie, Effect.withSpan('ChallengeEventRepo.update'));

  const getDistanceFromChallengeEvent = (
    id: ChallengeEventId,
    coordinate: readonly [number, number],
  ) =>
    SqlSchema.single({
      Request: Schema.Struct({
        id: ChallengeEventId,
        coordinate: Schema.Tuple(Schema.Number, Schema.Number),
      }),
      Result: Schema.Struct({ distance: Meters }), // distance in meters
      execute: (request) => sql`
SELECT
*,
ST_Distance(
  ${sql('coordinate')},
  ST_SetSRID(ST_MakePoint(${coordinate[1]},${coordinate[0]}), 4326)::geography
) AS distance
from ${sql(TABLE_NAME)}
where ${sql('id')} = ${request.id};
`,
    })({
      id,
      coordinate,
    }).pipe(
      Effect.orDie,
      Effect.withSpan('ChallengeEventRepo.getDistanceFromChallengeEvent'),
    );

  const with_ = <A, E, R>(
    id: ChallengeEventId,
    f: (event: ChallengeEventView) => Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E | ChallengeEventNotFound, R> =>
    pipe(
      findById(id),
      Effect.flatMap(
        Option.match({
          onNone: () =>
            new ChallengeEventNotFound({
              id,
              challengeId: null,
              accountId: null,
            }),
          onSome: Effect.succeed,
        }),
      ),
      Effect.flatMap(f),
      sql.withTransaction,
      Effect.catchTag('SqlError', (err) => Effect.die(err)),
    );

  return {
    ...repo,
    findById,
    insert,
    update,
    with: with_,
    findAllByChallengeId,
    findAllChallengeEvents,
    getDistanceFromChallengeEvent,
  } as const;
});

export class ChallengeEventRepo extends Effect.Tag('ChallengeEventRepo')<
  ChallengeEventRepo,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(ChallengeEventRepo, make);

  static Live = this.layer.pipe(Layer.provide(SqlLive));

  static Test = makeTestLayer(ChallengeEventRepo)({});
}

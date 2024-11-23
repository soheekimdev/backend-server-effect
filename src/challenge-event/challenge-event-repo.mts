import { ChallengeId } from '@/challenge/challenge-schema.mjs';
import { makeTestLayer } from '@/misc/test-layer.mjs';
import { SqlLive } from '@/sql/sql-live.mjs';
import { Model, SqlClient, SqlSchema } from '@effect/sql';
import { Effect, Layer, Option, pipe, Schema } from 'effect';
import { ChallengeEventNotFound } from './challenge-event-error.mjs';
import {
  ChallengeEvent,
  ChallengeEventId,
  FromStringToCoordinate,
} from './challenge-event-schema.mjs';

const TABLE_NAME = 'challenge_event';

const make = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const repo = yield* Model.makeRepository(ChallengeEvent, {
    tableName: TABLE_NAME,
    spanPrefix: 'ChallengeEventRepo',
    idColumn: 'id',
  });

  const findById = (id: ChallengeEventId) =>
    SqlSchema.findOne({
      Request: ChallengeEventId,
      Result: Schema.Struct({
        ...ChallengeEvent.fields,
        coordinate: FromStringToCoordinate,
      }),
      execute: (id) =>
        sql`select *, ST_AsText(${sql('coordinate')}) as coordinate from ${sql(TABLE_NAME)} where ${sql('id')} = ${id};`,
    })(id).pipe(Effect.orDie, Effect.withSpan('ChallengeEventRepo.findById'));

  const findAllByChallengeId = (challengeId: ChallengeId) =>
    Effect.gen(function* () {
      const events = yield* SqlSchema.findAll({
        Request: ChallengeId,
        Result: Schema.Struct({
          ...ChallengeEvent.fields,
          coordinate: FromStringToCoordinate,
        }),
        execute: () =>
          sql`select *, ST_AsText(${sql('coordinate')}) as coordinate from ${sql(TABLE_NAME)} where challenge_id = ${challengeId};`,
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

  const with_ = <A, E, R>(
    id: ChallengeEventId,
    f: (event: ChallengeEvent) => Effect.Effect<A, E, R>,
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

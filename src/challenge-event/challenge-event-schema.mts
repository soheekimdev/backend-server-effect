import { AccountId } from '@/account/account-schema.mjs';
import {
  CustomDateTimeInsert,
  CustomDateTimeUpdate,
} from '@/misc/date-schema.mjs';
import { Model } from '@effect/sql';
import { Schema } from 'effect';
import { ChallengeId } from '../challenge/challenge-schema.mjs';

export const ChallengeEventId = Schema.String.pipe(
  Schema.brand('ChallengeEventId'),
);

export type ChallengeEventId = typeof ChallengeEventId.Type;

const CoordinateForFrontend = Schema.Tuple(Schema.Number, Schema.Number).pipe(
  Schema.annotations({
    description: '위도, 경도; 경도가 -이면 영국 서쪽, +이면 영국 동쪽부터',
    example: [37.1234, 127.1234],
    jsonSchema: {
      type: 'array',
      items: { type: 'number', minimum: -180, maximum: 180 },
      minItems: 2,
      maxItems: 2,
      default: [37.1234, 127.1234],
    },
  }),
);

export const FromStringToCoordinate = Schema.transform(
  Schema.String,
  CoordinateForFrontend,
  {
    strict: true,
    decode: (fromA) => {
      // POINT(경도 위도) 형태로 들어옴
      const match = fromA.match(/POINT\(([^ ]+) ([^ ]+)\)/);
      if (!match) {
        throw new Error('Invalid coordinate format');
      }

      const [longitude, latitude] = [Number(match[1]), Number(match[2])];
      // FE에 줄 때는 위도(latitude), 경도(longitude) 순으로 줘야 함
      return [latitude, longitude] as const;
    },
    encode: (toA) => {
      // FE로부터 받아왔을 때 위도(latitude), 경도(longitude) 순으로 받음
      const [latitude, longitude] = toA;
      // DB에 넣을때는 경도(longitude), 위도(latitude) 순서로 넣어야 함
      return `POINT(${longitude} ${latitude})`;
    },
  },
);

export class ChallengeEvent extends Model.Class<ChallengeEvent>(
  'ChallengeEvent',
)({
  id: Model.Generated(ChallengeEventId),
  checkType: Schema.Literal('location', 'duration', 'manual', 'other'),
  title: Schema.String,
  description: Schema.String,
  accountId: Model.Sensitive(AccountId),
  challengeId: Model.Sensitive(ChallengeId),
  isDeleted: Schema.Boolean.pipe(
    Schema.annotations({
      description: '챌린지 이벤트가 삭제되었는지 여부',
      default: false,
    }),
  ),
  isPublished: Schema.Boolean.pipe(
    Schema.annotations({
      description: '챌린지 이벤트가 챌린지 참가자에게 공개되었는지 여부',
      default: false,
    }),
  ),
  isFinished: Schema.Boolean.pipe(
    Schema.annotations({
      description: '챌린지 이벤트가 종료되었는지 여부',
      default: false,
    }),
  ),
  startDatetime: Schema.NullishOr(Schema.DateTimeUtc),
  endDatetime: Schema.NullishOr(Schema.DateTimeUtc),
  coordinate: Model.Field({
    select: Schema.NullishOr(FromStringToCoordinate.to),
    insert: Schema.NullishOr(FromStringToCoordinate.from),
    update: Schema.NullishOr(FromStringToCoordinate.from),
    json: Schema.NullishOr(FromStringToCoordinate.to),
    jsonCreate: Schema.NullishOr(CoordinateForFrontend),
    jsonUpdate: Schema.NullishOr(CoordinateForFrontend),
  }),
  createdAt: CustomDateTimeInsert,
  updatedAt: CustomDateTimeUpdate,
}) {}

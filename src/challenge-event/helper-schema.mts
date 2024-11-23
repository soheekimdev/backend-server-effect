import { Schema } from 'effect';

export const CoordinateForFrontend = Schema.Tuple(
  Schema.Number,
  Schema.Number,
).pipe(
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

export const ChallengeEventCheckRequest = Schema.Struct({
  checkType: Schema.Literal('location', 'duration', 'manual', 'other'),
  manualOrDuration: Schema.NullishOr(Schema.Boolean),
  location: Schema.NullishOr(CoordinateForFrontend),
});

export const ChallengeEventCheckResponse = Schema.Struct({
  result: Schema.Literal('success', 'fail'),
  message: Schema.NullishOr(Schema.String),
});

export const Meters = Schema.Number.pipe(Schema.brand('Meters'));

export type Meters = typeof Meters.Type;

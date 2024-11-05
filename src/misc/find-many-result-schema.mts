import { Schema } from 'effect';

export const FindManyResultSchema = <A, I, R>(s: Schema.Schema<A, I, R>) =>
  Schema.Struct({
    data: Schema.Array(s),
    meta: Schema.Struct({
      total: Schema.Number.pipe(
        Schema.annotations({
          description: 'DB에 있는 전체 item 숫자',
        }),
      ),
      page: Schema.Number.pipe(
        Schema.annotations({
          description: '현재 페이지',
        }),
      ),
      limit: Schema.Number.pipe(
        Schema.annotations({
          description: '한 페이지에 보여지는 item 숫자',
        }),
      ),
      isLastPage: Schema.Boolean.pipe(
        Schema.annotations({
          description: '마지막 페이지인지 여부',
        }),
      ),
    }),
  });

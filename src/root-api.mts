import {
  HttpApiGroup,
  HttpApiEndpoint,
  HttpApiSchema,
  OpenApi,
} from '@effect/platform';
import { Schema } from 'effect';

export class RootApi extends HttpApiGroup.make('root')
  .add(
    HttpApiEndpoint.get('health', '/api/health')
      .addSuccess(
        Schema.Struct({
          status: Schema.String,
          db: Schema.Struct({
            status: Schema.String,
          }),
        }),
      )
      .addError(
        Schema.String.pipe(
          HttpApiSchema.asEmpty({ status: 500, decode: () => 'boom' }),
        ),
      )
      .annotateContext(
        OpenApi.annotations({
          title: 'Health Check',
          description: '서비스가 정상인지 체크하는 API',
        }),
      ),
  )
  .add(
    HttpApiEndpoint.get('home', '/')
      .addSuccess(
        Schema.String.pipe(
          HttpApiSchema.withEncoding({
            kind: 'Text',
            contentType: 'text/html',
          }),
        ),
      )
      .addError(
        Schema.String.pipe(
          HttpApiSchema.asEmpty({ status: 404, decode: () => 'Not Found' }),
        ),
      )
      .annotateContext(
        OpenApi.annotations({
          title: '메인 화면',
          description:
            '편의상 /로 해둔 메인화면입니다. 통상 Swagger에 이걸 표시하진 않지만, 어떻게 숨기는지 모르겠습니다. Effect의 HttpApiEndpoint에서는 아직 지원하지 않는 기능으로 보입니다.',
        }),
      ),
  ) {}

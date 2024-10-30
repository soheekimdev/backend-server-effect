import { HttpApiGroup, HttpApiEndpoint, HttpApiSchema } from '@effect/platform';
import { Schema } from 'effect';

export class RootApi extends HttpApiGroup.make('root')
  .add(
    HttpApiEndpoint.get('health', '/api/health')
      .addSuccess(
        Schema.Struct({
          status: Schema.String,
          db: Schema.Struct({
            status: Schema.Unknown,
          }),
        }),
      )
      .addError(
        Schema.String.pipe(
          HttpApiSchema.asEmpty({ status: 500, decode: () => 'boom' }),
        ),
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
      ),
  ) {}

import { HttpApiGroup, HttpApiEndpoint, HttpApiSchema } from '@effect/platform';
import { Schema } from 'effect';

export class RootApi extends HttpApiGroup.make('root')
  .add(
    HttpApiEndpoint.get('health', '/health')
      .addSuccess(Schema.String)
      .addError(
        Schema.String.pipe(
          HttpApiSchema.asEmpty({ status: 500, decode: () => 'boom' }),
        ),
      ),
  )
  .add(
    HttpApiEndpoint.get('home', '/')
      .addSuccess(Schema.String)
      .setHeaders(
        Schema.Struct({
          contentType: Schema.String.pipe(
            Schema.optionalWith({ default: () => 'text/html' }),
          ),
        }),
      )
      .addError(
        Schema.String.pipe(
          HttpApiSchema.asEmpty({ status: 404, decode: () => 'Not Found' }),
        ),
      ),
  ) {}

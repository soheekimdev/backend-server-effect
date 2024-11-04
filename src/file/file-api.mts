import { Authentication } from '@/auth/authentication.mjs';
import {
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
  Multipart,
  OpenApi,
} from '@effect/platform';
import { Schema } from 'effect';

export class FileApi extends HttpApiGroup.make('file')
  .add(
    HttpApiEndpoint.post('upload', '/upload')
      .middleware(Authentication)
      .setPayload(
        HttpApiSchema.Multipart(
          Schema.Struct({
            // add a "files" field to the schema
            files: Multipart.FilesSchema,
          }),
        ),
      )
      .annotateContext(
        OpenApi.annotations({
          description: '파일을 업로드합니다.',
        }),
      )
      .addSuccess(
        Schema.Struct({
          urls: Schema.Array(Schema.String),
        }),
      ),
  )
  .prefix('/api/files') {}

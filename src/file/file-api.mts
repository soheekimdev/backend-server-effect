import {
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
  Multipart,
  OpenApi,
} from '@effect/platform';
import { Schema } from 'effect';
import { FileInfoFetchingError, FileUploadError } from './file-error.mjs';
import { ImageInfoSchema } from './image-info-schema.mjs';
import { ImagePath } from './image-path-schema.mjs';
import { ImageUploadTargetSchema } from './image-target-schema.mjs';
import { Authentication } from '@/auth/authentication.mjs';

export class FileApi extends HttpApiGroup.make('file')
  .add(
    HttpApiEndpoint.post('uploadImage', '/upload')
      .middleware(Authentication)
      .setPayload(
        HttpApiSchema.Multipart(
          Schema.extend(
            Schema.Struct({
              file: Multipart.SingleFileSchema.pipe(
                Schema.annotations({
                  description:
                    '업로드할 파일명인데, 파일명에는 S3 safe 문자만 들어가야 합니다. 파일명에 한글이나 기타 non-ascii문자가 들어간다면 file is missing 에러가 뜰겁니다.',
                }),
              ),
            }),
            ImageUploadTargetSchema,
          ),
        ),
      )
      .addError(FileInfoFetchingError)
      .addError(FileUploadError)
      .addSuccess(
        Schema.Struct({
          url: Schema.String,
        }),
      )
      .annotateContext(
        OpenApi.annotations({
          description: '(테스트중/사용불가) 파일을 업로드합니다.',
          override: {
            summary: '(테스트중/사용불가)이미지 업로드',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.post('getImageAllInfo', '/image-info')
      .setPayload(ImagePath)
      .addError(FileInfoFetchingError)
      .addSuccess(ImageInfoSchema)
      .annotateContext(
        OpenApi.annotations({
          description: '(사용가능) 경로로부터 이미지 정보를 가져옵니다.',
        }),
      ),
  )
  .prefix('/api/files')
  .annotateContext(
    OpenApi.annotations({
      title: '(사용가능) 파일 API',
    }),
  ) {}

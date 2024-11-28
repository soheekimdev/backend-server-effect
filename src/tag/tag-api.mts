import { Authentication } from '@/auth/authentication.mjs';
import { Unauthorized } from '@/auth/error-403.mjs';
import { FindManyResultSchema } from '@/misc/find-many-result-schema.mjs';
import { FindManyUrlParams } from '@/misc/find-many-url-params-schema.mjs';
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from '@effect/platform';
import { Schema } from 'effect';
import { TagNotFound } from './tag-error.mjs';
import { Tag, TagId } from './tag-schema.mjs';

export class TagApi extends HttpApiGroup.make('tag')
  .add(
    HttpApiEndpoint.get('findAll', '/')
      .setUrlParams(FindManyUrlParams)
      .addSuccess(FindManyResultSchema(Tag.json))
      .annotateContext(
        OpenApi.annotations({
          description:
            '태그 목록을 조회합니다. 페이지와 한 페이지당 태그 수를 지정할 수 있습니다.',
          override: {
            summary: '(사용가능) 태그 목록 조회',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.get('findById', '/:tagId')
      .setPath(
        Schema.Struct({
          tagId: TagId,
        }),
      )
      .addError(TagNotFound)
      .addSuccess(Tag.json)
      .annotateContext(
        OpenApi.annotations({
          description:
            '태그를 조회합니다. 태그가 존재하지 않는 경우 404를 반환합니다.',
          override: {
            summary: '(사용가능) 태그 ID 조회',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.get('findByName', '/by-name/:tagName')
      .setPath(
        Schema.Struct({
          tagName: Schema.String,
        }),
      )
      .addError(TagNotFound)
      .addSuccess(Tag.json)
      .annotateContext(
        OpenApi.annotations({
          description:
            '태그를 이름으로 조회합니다. 태그가 존재하지 않는 경우 404를 반환합니다.',
          override: {
            summary: '(사용가능) 태그 이름 조회',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.post('create', '/')
      .middleware(Authentication)
      .setPayload(Tag.jsonCreate)
      .addError(Unauthorized)
      .addSuccess(Tag.json)
      .annotateContext(
        OpenApi.annotations({
          description: '(누구나 가능) 태그를 생성합니다.',
          override: {
            summary: '(사용가능) 태그 생성',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.patch('update', '/:tagId')
      .middleware(Authentication)
      .setPath(
        Schema.Struct({
          tagId: TagId,
        }),
      )
      .setPayload(Schema.partialWith(Tag.jsonUpdate, { exact: true }))
      .addError(Unauthorized)
      .addError(TagNotFound)
      .addSuccess(Tag.json)
      .annotateContext(
        OpenApi.annotations({
          description: '관리자만 가능 태그를 수정합니다.',
          override: {
            summary: '(사용가능)(관리자 전용) 태그 수정',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.del('delete', '/:tagId')
      .middleware(Authentication)
      .setPath(
        Schema.Struct({
          tagId: TagId,
        }),
      )
      .addError(Unauthorized)
      .addError(TagNotFound)
      .annotateContext(
        OpenApi.annotations({
          description: '관리자만 가능 태그를 삭제합니다.',
          override: {
            summary: '(사용가능)(관리자 전용) 태그 삭제',
          },
        }),
      ),
  )
  .prefix('/api/tags')
  .annotateContext(
    OpenApi.annotations({
      title: '(사용가능) 태그 API',
    }),
  ) {}

import { HttpApiEndpoint, HttpApiGroup, OpenApi } from '@effect/platform';
import { Schema } from 'effect';
import { Authentication } from '@/auth/authentication.mjs';
import { Unauthorized } from '@/auth/error-403.mjs';
import { Comment, CommentId } from './comment-schema.mjs';
import { CommentNotFound } from './comment-error.mjs';

export class CommentApi extends HttpApiGroup.make('comment')
  .add(
    HttpApiEndpoint.get('findAll', '/:postId/comments')
      .setUrlParams(
        Schema.Struct({
          page: Schema.NumberFromString,
          limit: Schema.NumberFromString,
        }),
      )
      .annotateContext(
        OpenApi.annotations({
          description:
            '(미구현) 댓글 목록을 조회합니다. 페이지와 한 페이지당 댓글 수를 지정할 수 있습니다.',
        }),
      ),
  )
  .add(
    HttpApiEndpoint.get('findById', '/:postId/comments/:id')
      .setPath(
        Schema.Struct({
          id: CommentId,
        }),
      )
      .setUrlParams(
        Schema.Struct({
          page: Schema.NumberFromString,
          limit: Schema.NumberFromString,
        }),
      )
      .addError(CommentNotFound)
      .annotateContext(
        OpenApi.annotations({
          description:
            '(미구현) 댓글을 조회합니다. 댓글이 존재하지 않는 경우 404를 반환합니다. 자식 댓글이 있을 경우 같이 조회합니다.',
        }),
      ),
  )
  .add(
    HttpApiEndpoint.post('create', '/:postId/comments')
      .middleware(Authentication)
      .setPayload(Comment.jsonCreate)
      .annotateContext(
        OpenApi.annotations({
          description: '(미구현) 댓글을 작성합니다.',
        }),
      ),
  )
  .add(
    HttpApiEndpoint.patch('updateById', '/:postId/comments/:id')
      .setPath(
        Schema.Struct({
          id: CommentId,
        }),
      )
      .middleware(Authentication)
      .setPayload(Comment.jsonUpdate)
      .addError(CommentNotFound)
      .addError(Unauthorized)
      .annotateContext(
        OpenApi.annotations({
          description: '(미구현) 댓글을 수정합니다.',
        }),
      ),
  )
  .add(
    HttpApiEndpoint.del('deleteById', '/:postId/comments/:id')
      .setPath(
        Schema.Struct({
          id: CommentId,
        }),
      )
      .middleware(Authentication)
      .addError(CommentNotFound)
      .addError(Unauthorized)
      .annotateContext(
        OpenApi.annotations({
          description: '(미구현) 댓글을 삭제합니다',
        }),
      ),
  )
  .prefix('/api/posts')
  .annotateContext(
    OpenApi.annotations({
      title: '(미구현 있음) 댓글 API',
    }),
  ) {}

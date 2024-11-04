import { HttpApiEndpoint, HttpApiGroup, OpenApi } from '@effect/platform';
import { Schema } from 'effect';
import { Authentication } from '@/auth/authentication.mjs';
import { Unauthorized } from '@/auth/error-403.mjs';
import { Comment, CommentId } from './comment-schema.mjs';
import { CommentNotFound } from './comment-error.mjs';
import { PostId } from '@/post/post-schema.mjs';

export class CommentApi extends HttpApiGroup.make('comment')
  .add(
    HttpApiEndpoint.get('findAll', '/:postId/comments')
      .setPath(
        Schema.Struct({
          postId: PostId,
        }),
      )
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
          postId: PostId,
        }),
      )
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
      .setPath(
        Schema.Struct({
          postId: PostId,
        }),
      )
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
          postId: PostId,
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
    HttpApiEndpoint.post('likeCommentById', '/:postId/comments/:id/like')
      .setPath(
        Schema.Struct({
          id: CommentId,
          postId: PostId,
        }),
      )
      .middleware(Authentication)
      .setPayload(Comment.jsonUpdate)
      .addError(CommentNotFound)
      .addError(Unauthorized)
      .annotateContext(
        OpenApi.annotations({
          description: '(미구현) 댓글에 좋아요를 누릅니다',
        }),
      ),
  )
  .add(
    HttpApiEndpoint.del('removeLikeCommentById', '/:postId/comments/:id/like')
      .setPath(
        Schema.Struct({
          id: CommentId,
          postId: PostId,
        }),
      )
      .middleware(Authentication)
      .setPayload(Comment.jsonUpdate)
      .addError(CommentNotFound)
      .addError(Unauthorized)
      .annotateContext(
        OpenApi.annotations({
          description: '(미구현) 댓글에 좋아요를 취소합니다',
        }),
      ),
  )
  .add(
    HttpApiEndpoint.post('dislikeCommentById', '/:postId/comments/:id/dislike')
      .setPath(
        Schema.Struct({
          id: CommentId,
          postId: PostId,
        }),
      )
      .middleware(Authentication)
      .setPayload(Comment.jsonUpdate)
      .addError(CommentNotFound)
      .addError(Unauthorized)
      .annotateContext(
        OpenApi.annotations({
          description: '(미구현) 댓글에 싫어요를 누릅니다',
        }),
      ),
  )
  .add(
    HttpApiEndpoint.del(
      'removeDislikeCommentById',
      '/:postId/comments/:id/dislike',
    )
      .setPath(
        Schema.Struct({
          id: CommentId,
          postId: PostId,
        }),
      )
      .middleware(Authentication)
      .setPayload(Comment.jsonUpdate)
      .addError(CommentNotFound)
      .addError(Unauthorized)
      .annotateContext(
        OpenApi.annotations({
          description: '(미구현) 댓글에 싫어요를 취소합니다',
        }),
      ),
  )
  .add(
    HttpApiEndpoint.del('deleteById', '/:postId/comments/:id')
      .setPath(
        Schema.Struct({
          id: CommentId,
          postId: PostId,
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
  .prefix('/api/posts') // 이거 실수 아님! post 아래로 내려가는거 맞음!
  .annotateContext(
    OpenApi.annotations({
      title: '(미구현 있음) 댓글 API',
    }),
  ) {}

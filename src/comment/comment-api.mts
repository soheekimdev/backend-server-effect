import { Authentication } from '@/auth/authentication.mjs';
import { Unauthorized } from '@/auth/error-403.mjs';
import { LikeConflict, LikeNotFound } from '@/like/like-error.mjs';
import { Like } from '@/like/like-schema.mjs';
import { FindManyResultSchema } from '@/misc/find-many-result-schema.mjs';
import { FindManyUrlParams } from '@/misc/find-many-url-params-schema.mjs';
import { PostNotFound } from '@/post/post-error.mjs';
import { PostCommentView, PostId } from '@/post/post-schema.mjs';
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from '@effect/platform';
import { Schema } from 'effect';
import { CommentNotFound } from './comment-error.mjs';
import { CommentId, Comment, CommentView } from './comment-schema.mjs';

export class CommentApi extends HttpApiGroup.make('comment')
  .add(
    HttpApiEndpoint.get('findAll', '/:postId/comments')
      .setPath(
        Schema.Struct({
          postId: PostId,
        }),
      )
      .setUrlParams(FindManyUrlParams)
      .addSuccess(FindManyResultSchema(CommentView))
      .annotateContext(
        OpenApi.annotations({
          description:
            '(사용가능) 댓글 목록을 조회합니다. 페이지와 한 페이지당 댓글 수를 지정할 수 있습니다.',
          override: {
            summary: '(사용가능) 댓글 목록 조회',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.get('getCommentCount', '/:postId/comments-count')
      .setPath(
        Schema.Struct({
          postId: PostId,
        }),
      )
      .addSuccess(PostCommentView)
      .addError(PostNotFound)
      .annotateContext(
        OpenApi.annotations({
          description: '(사용가능) 댓글 갯수를 조회합니다.',
          override: {
            summary: '(사용가능) 댓글 갯수 조회',
          },
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
      .addSuccess(CommentView)
      .annotateContext(
        OpenApi.annotations({
          description:
            '(사용가능) 댓글을 조회합니다. 댓글이 존재하지 않는 경우 404를 반환합니다. 자식 댓글이 있을 경우 같이 조회합니다. 프론트엔드에서 사용할 일이... 있을지는 모르겠네요. 조회수 기능은 없습니다.',
          override: {
            summary: '(사용가능) 댓글 단일 조회',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.get('findLikeStatus', '/:postId/comments/:id/like-status')
      .middleware(Authentication)
      .setPath(
        Schema.Struct({
          postId: PostId,
          id: CommentId,
        }),
      )
      .addSuccess(Like)
      .addError(PostNotFound)
      .addError(CommentNotFound)
      .addError(LikeNotFound)
      .annotateContext(
        OpenApi.annotations({
          description:
            '(사용가능) 현재 사용자의 댓글 좋아요 상태를 조회합니다. 댓글이나 좋아요가 존재하지 않는 경우 404를 반환합니다.',
          override: {
            summary: '(사용가능) 댓글 좋아요 상태 조회',
          },
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
      .addError(PostNotFound)
      .addSuccess(CommentView, {
        status: 201,
      })
      .annotateContext(
        OpenApi.annotations({
          description: '(사용가능) 댓글을 작성합니다.',
          override: {
            summary: '(사용가능) 댓글 작성',
          },
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
      .setPayload(CommentView.jsonUpdate)
      .addError(CommentNotFound)
      .addError(PostNotFound)
      .addError(Unauthorized)
      .annotateContext(
        OpenApi.annotations({
          description: '(사용가능) 댓글을 수정합니다.',
          override: {
            summary: '(사용가능) 댓글 수정',
          },
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
      .addError(CommentNotFound)
      .addError(Unauthorized)
      .addError(LikeConflict)
      .addSuccess(CommentView)
      .annotateContext(
        OpenApi.annotations({
          description: '(사용가능) 댓글에 좋아요를 누릅니다',
          override: {
            summary: '(사용가능) 댓글 좋아요',
          },
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
      .addError(CommentNotFound)
      .addError(Unauthorized)
      .addError(LikeConflict)
      .addError(LikeNotFound)
      .addSuccess(CommentView)
      .annotateContext(
        OpenApi.annotations({
          description: '(사용가능) 댓글에 좋아요를 취소합니다',
          override: {
            summary: '(사용가능) 댓글 좋아요 취소',
          },
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
      .addError(CommentNotFound)
      .addError(Unauthorized)
      .addError(LikeConflict)
      .annotateContext(
        OpenApi.annotations({
          description: '(사용가능) 댓글에 싫어요를 누릅니다',
          override: {
            summary: '(사용가능) 댓글 싫어요',
          },
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
      .addError(CommentNotFound)
      .addError(Unauthorized)
      .addError(LikeConflict)
      .addError(LikeNotFound)
      .addSuccess(CommentView)
      .annotateContext(
        OpenApi.annotations({
          description: '(사용가능) 댓글에 싫어요를 취소합니다',
          override: {
            summary: '(사용가능) 댓글 싫어요 취소',
          },
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
          description: '(사용가능) 댓글을 삭제합니다',
          override: {
            summary: '(사용가능) 댓글 삭제',
          },
        }),
      ),
  )
  .prefix('/api/posts') // 이거 실수 아님! post 아래로 내려가는거 맞음!
  .annotateContext(
    OpenApi.annotations({
      title: '(사용 가능) 댓글 API',
    }),
  ) {}

import { Authentication } from '@/auth/authentication.mjs';
import { Unauthorized } from '@/auth/error-403.mjs';
import { FindManyUrlParams } from '@/misc/find-many-url-params-schema.mjs';
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from '@effect/platform';
import { Schema } from 'effect';
import { PostNotFound } from './post-error.mjs';
import { Post, PostId } from './post-schema.mjs';
import { FindManyResultSchema } from '@/misc/find-many-result-schema.mjs';
import { LikeConflict, LikeNotFound } from '@/like/like-error.mjs';

export class PostApi extends HttpApiGroup.make('post')
  .add(
    HttpApiEndpoint.get('findAll', '/')
      .setUrlParams(FindManyUrlParams)
      .annotateContext(
        OpenApi.annotations({
          description:
            '게시글 목록을 조회합니다. 페이지와 한 페이지당 게시글 수를 지정할 수 있습니다.',
          override: {
            summary: '(사용가능) 게시글 목록 조회',
          },
        }),
      )
      .addSuccess(FindManyResultSchema(Post)),
  )
  .add(
    HttpApiEndpoint.get('findById', '/:id')
      .setPath(
        Schema.Struct({
          id: PostId,
        }),
      )
      .addError(PostNotFound)
      .addSuccess(Post)
      .annotateContext(
        OpenApi.annotations({
          description:
            '게시글을 조회합니다. 게시글이 존재하지 않는 경우 404를 반환합니다.',
          override: {
            summary: '(사용가능) 게시글 단일 조회',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.post('likePostById', '/:id/like')
      .middleware(Authentication)
      .setPath(
        Schema.Struct({
          id: PostId,
        }),
      )
      .addError(PostNotFound)
      .addError(LikeConflict)
      .addError(Unauthorized)
      .annotateContext(
        OpenApi.annotations({
          description:
            '게시글에 좋아요를 누릅니다. 게시글이 존재하지 않는 경우 404를 반환합니다.',
          override: {
            summary: '(사용가능) 게시글 좋아요',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.del('removeLikePostById', '/:id/like')
      .middleware(Authentication)
      .setPath(
        Schema.Struct({
          id: PostId,
        }),
      )
      .addError(PostNotFound)
      .addError(LikeNotFound)
      .addError(Unauthorized)
      .annotateContext(
        OpenApi.annotations({
          description:
            '게시글에 좋아요를 취소합니다. 게시글이 존재하지 않는 경우 404를 반환합니다.',
          override: {
            summary: '(사용가능) 게시글 좋아요 취소',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.post('dislikePostById', '/:id/dislike')
      .middleware(Authentication)
      .setPath(
        Schema.Struct({
          id: PostId,
        }),
      )
      .addError(PostNotFound)
      .addError(LikeConflict)
      .addError(Unauthorized)
      .annotateContext(
        OpenApi.annotations({
          description:
            '게시글에 싫어요를 누릅니다. 게시글이 존재하지 않는 경우 404를 반환합니다.',
          override: {
            summary:
              '(사용가능) 게시글 싫어요 / 싫어요 구현 굳이 안해도 됩니다',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.del('removeDislikePostById', '/:id/dislike')
      .middleware(Authentication)
      .setPath(
        Schema.Struct({
          id: PostId,
        }),
      )
      .addError(PostNotFound)
      .addError(LikeNotFound)
      .addError(Unauthorized)
      .annotateContext(
        OpenApi.annotations({
          description:
            '게시글에 싫어요를 취소합니다. 게시글이 존재하지 않는 경우 404를 반환합니다.',
          override: {
            summary:
              '(사용가능) 게시글 싫어요 취소 / 싫어요 구현 굳이 안해도 됩니다',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.post('create', '/')
      .middleware(Authentication)
      .setPayload(Post.jsonCreate)
      .annotateContext(
        OpenApi.annotations({
          description:
            '게시글을 작성합니다. 로그인 상태에서만 작성할 수 있습니다.',
          override: {
            summary: '(사용가능) 게시글 작성',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.patch('updateById', '/:id')
      .setPath(
        Schema.Struct({
          id: PostId,
        }),
      )
      .middleware(Authentication)
      .setPayload(Post.jsonUpdate.omit('likeCount', 'dislikeCount'))
      .addError(PostNotFound)
      .addError(Unauthorized)
      .annotateContext(
        OpenApi.annotations({
          description:
            '게시글을 수정합니다. 게시글이 존재하지 않는 경우 404를 반환합니다. 작성자와 현재 사용자가 다른 경우 403을 반환합니다. 작성자와 어드민만 수정할 수 있습니다.',
          override: {
            summary: '(사용가능) 게시글 수정',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.del('deleteById', '/:id')
      .setPath(
        Schema.Struct({
          id: PostId,
        }),
      )
      .middleware(Authentication)
      .addError(PostNotFound)
      .addError(Unauthorized)
      .annotateContext(
        OpenApi.annotations({
          description:
            '게시글을 삭제합니다. 게시글이 존재하지 않는 경우 404를 반환합니다. 작성자와 현재 사용자가 다른 경우 403을 반환합니다. 작성자와 어드민만 삭제할 수 있습니다.',
          override: {
            summary: '(사용가능) 게시글 삭제',
          },
        }),
      ),
  )
  .prefix('/api/posts')
  .annotateContext(
    OpenApi.annotations({
      title: '게시글 API',
    }),
  ) {}

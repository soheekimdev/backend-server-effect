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
            '(미구현) 게시글 목록을 조회합니다. 페이지와 한 페이지당 게시글 수를 지정할 수 있습니다.',
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
      .annotateContext(
        OpenApi.annotations({
          description:
            '(미구현) 게시글을 조회합니다. 게시글이 존재하지 않는 경우 404를 반환합니다.',
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
            '(미구현) 게시글에 좋아요를 누릅니다. 게시글이 존재하지 않는 경우 404를 반환합니다.',
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
            '(미구현) 게시글에 좋아요를 취소합니다. 게시글이 존재하지 않는 경우 404를 반환합니다.',
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
            '(미구현) 게시글에 싫어요를 누릅니다. 게시글이 존재하지 않는 경우 404를 반환합니다.',
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
            '(미구현) 게시글에 싫어요를 취소합니다. 게시글이 존재하지 않는 경우 404를 반환합니다.',
        }),
      ),
  )
  .add(
    HttpApiEndpoint.post('create', '/')
      .middleware(Authentication)
      .setPayload(Post.jsonCreate)
      .annotateContext(
        OpenApi.annotations({
          description: '(미구현) 게시글을 작성합니다.',
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
      .setPayload(Post.jsonUpdate)
      .addError(PostNotFound)
      .addError(Unauthorized)
      .annotateContext(
        OpenApi.annotations({
          description: '(미구현) 게시글을 수정합니다.',
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
          description: '(미구현) 게시글을 삭제합니다.',
        }),
      ),
  )
  .prefix('/api/posts')
  .annotateContext(
    OpenApi.annotations({
      title: '(미구현 있음) 게시글 API',
    }),
  ) {}

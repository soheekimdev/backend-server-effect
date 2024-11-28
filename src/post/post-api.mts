import { Authentication } from '@/auth/authentication.mjs';
import { Unauthorized } from '@/auth/error-403.mjs';
import { LikeConflict, LikeNotFound } from '@/like/like-error.mjs';
import { Like } from '@/like/like-schema.mjs';
import { EmptySchema } from '@/misc/empty-schema.mjs';
import { FindManyResultSchema } from '@/misc/find-many-result-schema.mjs';
import { FindManyUrlParams } from '@/misc/find-many-url-params-schema.mjs';
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from '@effect/platform';
import { Schema } from 'effect';
import { PostNotFound } from './post-error.mjs';
import { Post, PostId, PostView } from './post-schema.mjs';
import { Tag, TagId } from '@/tag/tag-schema.mjs';
import { TagNotFound, TagTargetNotFound } from '@/tag/tag-error.mjs';

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
      .addSuccess(FindManyResultSchema(PostView)),
  )
  .add(
    HttpApiEndpoint.get('findById', '/:postId')
      .setPath(
        Schema.Struct({
          postId: PostId,
        }),
      )
      .addError(PostNotFound)
      .addSuccess(PostView)
      .annotateContext(
        OpenApi.annotations({
          description:
            '게시글을 조회합니다. 게시글이 존재하지 않는 경우 404를 반환합니다. 이 API는 조회수를 1 증가시킵니다.',
          override: {
            summary: '(사용가능) 게시글 단일 조회',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.get('findTags', '/:postId/tags')
      .setPath(
        Schema.Struct({
          postId: PostId,
        }),
      )
      .addError(PostNotFound)
      .addSuccess(Schema.Array(Tag.json))
      .annotateContext(
        OpenApi.annotations({
          description:
            '게시글의 태그 목록을 조회합니다. 게시글이 존재하지 않는 경우 404를 반환합니다.',
          override: {
            summary: '(사용가능) 게시글 태그 목록 조회',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.post('addTags', '/:postId/tags')
      .setPath(
        Schema.Struct({
          postId: PostId,
        }),
      )
      .middleware(Authentication)
      .setPayload(
        Schema.Struct({
          names: Schema.Array(Tag.fields.name),
        }),
      )
      .addError(PostNotFound)
      .addError(Unauthorized)
      .addSuccess(Schema.Array(Tag.json))
      .annotateContext(
        OpenApi.annotations({
          description:
            '게시글에 태그를 추가합니다. 게시글이 존재하지 않는 경우 404를 반환합니다.',
          override: {
            summary: '(사용가능) 게시글 태그 추가',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.del('deleteTag', '/:postId/tags/:tagId')
      .setPath(
        Schema.Struct({
          postId: PostId,
          tagId: TagId,
        }),
      )
      .middleware(Authentication)
      .addError(PostNotFound)
      .addError(TagNotFound)
      .addError(TagTargetNotFound)
      .addError(Unauthorized)
      .annotateContext(
        OpenApi.annotations({
          description:
            '게시글에 태그를 삭제합니다. 게시글이 존재하지 않는 경우 404를 반환합니다.',
          override: {
            summary: '(사용가능) 게시글 태그 삭제',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.get('findLikeStatus', '/:postId/like-status')
      .middleware(Authentication)
      .setPath(
        Schema.Struct({
          postId: PostId,
        }),
      )
      .addError(LikeNotFound)
      .addSuccess(Like)
      .addSuccess(EmptySchema)
      .annotateContext(
        OpenApi.annotations({
          description:
            '현재 사용자의 게시글 좋아요 상태를 조회합니다. 게시글이나 좋아요가 존재하지 않는 경우 404를 반환합니다.',
          override: {
            summary: '(사용가능) 게시글 좋아요 상태 조회',
          },
        }),
      ),
  )
  .add(
    HttpApiEndpoint.post('likePostById', '/:postId/like')
      .middleware(Authentication)
      .setPath(
        Schema.Struct({
          postId: PostId,
        }),
      )
      .addSuccess(Post)
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
    HttpApiEndpoint.del('removeLikePostById', '/:postId/like')
      .middleware(Authentication)
      .setPath(
        Schema.Struct({
          postId: PostId,
        }),
      )
      .addSuccess(Post)
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
    HttpApiEndpoint.post('addDislikePostById', '/:postId/dislike')
      .middleware(Authentication)
      .setPath(
        Schema.Struct({
          postId: PostId,
        }),
      )
      .addSuccess(Post)
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
    HttpApiEndpoint.del('removeDislikePostById', '/:postId/dislike')
      .middleware(Authentication)
      .setPath(
        Schema.Struct({
          postId: PostId,
        }),
      )
      .addSuccess(Post)
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
      .addError(Unauthorized)
      .addError(PostNotFound)
      .addSuccess(PostView, {
        status: 201,
      })
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
    HttpApiEndpoint.patch('updateById', '/:postId')
      .setPath(
        Schema.Struct({
          postId: PostId,
        }),
      )
      .middleware(Authentication)
      .setPayload(Schema.partialWith(Post.jsonUpdate, { exact: true }))
      .addSuccess(PostView)
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
    HttpApiEndpoint.del('deleteById', '/:postId')
      .setPath(
        Schema.Struct({
          postId: PostId,
        }),
      )
      .middleware(Authentication)
      .addError(PostNotFound)
      .addError(Unauthorized)
      .annotateContext(
        OpenApi.annotations({
          description: `게시글을 삭제합니다. 게시글이 존재하지 않는 경우 404를 반환합니다. 작성자와 현재 사용자가 다른 경우 403을 반환합니다. 작성자와 어드민만 삭제할 수 있습니다.
* Row가 삭제되는것이 아니라, isDeleted 필드를 true로 변경합니다.

* 삭제처리를 취소하기 위해서는 update로 처리해야합니다.
`,
          override: {
            summary: '(사용가능) 게시글 삭제',
          },
        }),
      ),
  )
  .prefix('/api/posts')
  .annotateContext(
    OpenApi.annotations({
      title: '(사용가능) 게시글 API',
    }),
  ) {}

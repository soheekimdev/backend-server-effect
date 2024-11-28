import { Api } from '@/api.mjs';
import { AuthenticationLive } from '@/auth/authentication.mjs';
import { policyUse, withSystemActor } from '@/auth/authorization.mjs';
import { HttpApiBuilder } from '@effect/platform';
import { Effect, Layer } from 'effect';
import { PostPolicy } from './post-policy.mjs';
import { PostService } from './post-service.mjs';
import { TagPolicy } from '@/tag/tag-policy.mjs';

export const PostApiLive = HttpApiBuilder.group(Api, 'post', (handlers) =>
  Effect.gen(function* () {
    const postService = yield* PostService;
    const postPolicy = yield* PostPolicy;
    const tagPolicy = yield* TagPolicy;

    return handlers
      .handle('findAll', ({ urlParams }) => postService.findPosts(urlParams))
      .handle('findById', ({ path }) =>
        postService.increaseViewCountById(path.postId),
      )
      .handle('findTags', ({ path }) => postService.findTags(path.postId))
      .handle('addTags', ({ path, payload }) =>
        postService
          .addTags({ postId: path.postId, names: payload.names })
          .pipe(policyUse(tagPolicy.canConnectPost(path.postId))),
      )
      .handle('deleteTag', ({ path }) =>
        postService
          .deleteTag({
            postId: path.postId,
            tagId: path.tagId,
          })
          .pipe(policyUse(tagPolicy.canConnectPost(path.postId))),
      )
      .handle('create', ({ payload }) =>
        postService.create(payload).pipe(withSystemActor),
      )
      .handle('updateById', ({ path, payload }) =>
        postService
          .updateById(path.postId, payload)
          .pipe(policyUse(postPolicy.canUpdate(path.postId))),
      )
      .handle('deleteById', ({ path }) =>
        postService
          .deleteById(path.postId)
          .pipe(policyUse(postPolicy.canDelete(path.postId))),
      )
      .handle('findLikeStatus', ({ path }) =>
        postService.findLikeStatus(path.postId),
      )
      .handle('likePostById', ({ path }) =>
        postService
          .addLikePostById(path.postId)
          .pipe(policyUse(postPolicy.canLike(path.postId))),
      )
      .handle('removeLikePostById', ({ path }) =>
        postService
          .removePostLikeById(path.postId)
          .pipe(policyUse(postPolicy.canLike(path.postId))),
      )
      .handle('addDislikePostById', ({ path }) =>
        postService
          .addDislikePostById(path.postId)
          .pipe(policyUse(postPolicy.canDislike(path.postId))),
      )
      .handle('removeDislikePostById', ({ path }) =>
        postService
          .removePostDislikeById(path.postId)
          .pipe(policyUse(postPolicy.canDislike(path.postId))),
      );
  }),
).pipe(
  Layer.provide(AuthenticationLive),
  Layer.provide(PostService.Live),
  Layer.provide(PostPolicy.Live),
  Layer.provide(TagPolicy.Live),
);

import { Api } from '@/api.mjs';
import { AuthenticationLive } from '@/auth/authentication.mjs';
import { policyUse, withSystemActor } from '@/auth/authorization.mjs';
import { HttpApiBuilder } from '@effect/platform';
import { Effect, Layer } from 'effect';
import { PostPolicy } from './post-policy.mjs';
import { PostService } from './post-service.mjs';

export const PostApiLive = HttpApiBuilder.group(Api, 'post', (handlers) =>
  Effect.gen(function* () {
    const postService = yield* PostService;
    const postPolicy = yield* PostPolicy;

    return handlers
      .handle('findAll', ({ urlParams }) => postService.findPosts(urlParams))
      .handle('findById', ({ path }) =>
        postService.increaseViewCountById(path.id),
      )
      .handle('create', ({ payload }) =>
        postService.create(payload).pipe(withSystemActor),
      )
      .handle('updateById', ({ path, payload }) =>
        postService
          .updateById(path.id, payload)
          .pipe(policyUse(postPolicy.canUpdate(path.id))),
      )
      .handle('deleteById', ({ path }) =>
        postService
          .deleteById(path.id)
          .pipe(policyUse(postPolicy.canDelete(path.id))),
      )
      .handle('findLikeStatus', ({ path }) =>
        postService.findLikeStatus(path.id),
      )
      .handle('likePostById', ({ path }) =>
        postService
          .addLikePostById(path.id)
          .pipe(policyUse(postPolicy.canLike(path.id))),
      )
      .handle('removeLikePostById', ({ path }) =>
        postService
          .removePostLikeById(path.id)
          .pipe(policyUse(postPolicy.canLike(path.id))),
      )
      .handle('addDislikePostById', ({ path }) =>
        postService
          .addDislikePostById(path.id)
          .pipe(policyUse(postPolicy.canDislike(path.id))),
      )
      .handle('removeDislikePostById', ({ path }) =>
        postService
          .removePostDislikeById(path.id)
          .pipe(policyUse(postPolicy.canDislike(path.id))),
      );
  }),
).pipe(
  Layer.provide(AuthenticationLive),
  Layer.provide(PostService.Live),
  Layer.provide(PostPolicy.Live),
);

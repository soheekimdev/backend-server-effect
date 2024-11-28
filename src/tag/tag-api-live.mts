import { Api } from '@/api.mjs';
import { AuthenticationLive } from '@/auth/authentication.mjs';
import { HttpApiBuilder } from '@effect/platform';
import { Effect, Layer } from 'effect';
import { TagService } from './tag-service.mjs';
import { TagPolicy } from './tag-policy.mjs';
import { policyUse } from '@/auth/authorization.mjs';

export const TagApiLive = HttpApiBuilder.group(Api, 'tag', (handlers) =>
  Effect.gen(function* () {
    const tagService = yield* TagService;
    const tagPolicy = yield* TagPolicy;

    return handlers
      .handle('findAll', ({ urlParams }) => tagService.findAll(urlParams))
      .handle('findById', ({ path }) => tagService.findById(path.tagId))
      .handle('findByName', ({ path }) => tagService.findByName(path.tagName))
      .handle('create', ({ payload }) =>
        tagService.getOrInsert(payload).pipe(policyUse(tagPolicy.canCreate())),
      )
      .handle('update', ({ path, payload }) =>
        tagService
          .update(path.tagId, payload)
          .pipe(policyUse(tagPolicy.canUpdate())),
      )
      .handle('delete', ({ path }) =>
        tagService
          .deleteById(path.tagId)
          .pipe(policyUse(tagPolicy.canDelete())),
      );
  }),
).pipe(
  Layer.provide(AuthenticationLive),
  Layer.provide(TagService.Live),
  Layer.provide(TagPolicy.Live),
);

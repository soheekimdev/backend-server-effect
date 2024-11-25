import { Api } from '@/api.mjs';
import { AuthenticationLive } from '@/auth/authentication.mjs';
import { HttpApiBuilder } from '@effect/platform';
import { Effect, Layer } from 'effect';
import { TagService } from './tag-service.mjs';

export const TagApiLive = HttpApiBuilder.group(Api, 'tag', (handlers) =>
  Effect.gen(function* () {
    const tagService = yield* TagService;

    return handlers
      .handle('findAll', ({ urlParams }) => tagService.findAll(urlParams))
      .handle('findById', ({ path }) => tagService.findById(path.tagId))
      .handle('findByName', ({ path }) => tagService.findByName(path.tagName))
      .handle('create', ({ payload }) => tagService.getOrInsert(payload))
      .handle('update', ({ path, payload }) =>
        tagService.update(path.tagId, payload),
      )
      .handle('delete', ({ path }) => tagService.deleteById(path.tagId));
  }),
).pipe(Layer.provide(AuthenticationLive), Layer.provide(TagService.Live));

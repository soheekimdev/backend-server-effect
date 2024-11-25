import { Option, Effect, Layer } from 'effect';
import { TagRepo } from './tag-repo.mjs';
import { FindManyUrlParams } from '@/misc/find-many-url-params-schema.mjs';
import { Tag, TagId } from './tag-schema.mjs';
import { TagNotFound } from './tag-error.mjs';

const make = Effect.gen(function* () {
  const repo = yield* TagRepo;

  const findAll = (parmas: FindManyUrlParams) =>
    repo.findAll(parmas).pipe(Effect.withSpan('TagService.findAll'));

  const findById = (id: TagId) =>
    repo.findById(id).pipe(
      Effect.flatMap(
        Option.match({
          onSome: Effect.succeed,
          onNone: () => Effect.fail(new TagNotFound({ id })),
        }),
      ),
    );

  const findByName = (name: string) =>
    repo.findOne(name).pipe(
      Effect.flatMap(
        Option.match({
          onSome: Effect.succeed,
          onNone: () => Effect.fail(new TagNotFound({ id: TagId.make('') })),
        }),
      ),
    );

  const getOrInsert = (payload: typeof Tag.jsonCreate.Type) =>
    repo.getOrInsert(payload);

  const update = (id: TagId, payload: Partial<typeof Tag.jsonUpdate.Type>) =>
    repo.with(id, (tag) =>
      repo.update({
        ...tag,
        ...(payload?.description && { description: payload.description }),
        updatedAt: undefined,
      }),
    );

  const deleteById = (id: TagId) => repo.delete(id);

  return {
    findAll,
    findById,
    findByName,
    getOrInsert,
    update,
    deleteById,
  } as const;
});

export class TagService extends Effect.Tag('TagService')<
  TagService,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(TagService, make);

  static Live = this.layer.pipe(Layer.provide(TagRepo.Live));
}

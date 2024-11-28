import { policyRequire } from '@/auth/authorization.mjs';
import { ChallengeId } from '@/challenge/challenge-schema.mjs';
import { FindManyUrlParams } from '@/misc/find-many-url-params-schema.mjs';
import { PostId } from '@/post/post-schema.mjs';
import { Effect, Layer, Option } from 'effect';
import { TagNotFound } from './tag-error.mjs';
import { TagRepo } from './tag-repo.mjs';
import { Tag, TagId } from './tag-schema.mjs';

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

  const connectPostByNames = (payload: {
    postId: PostId;
    names: readonly string[];
  }) =>
    repo.getManyOrInsertMany(payload.names).pipe(
      Effect.flatMap((tags) =>
        repo.connectTagsToPost({
          postId: payload.postId,
          tagIds: tags.map((v) => v.id),
        }),
      ),
      Effect.flatMap((targets) =>
        repo.findManyByIds(targets.map((v) => v.tagId)),
      ),
      policyRequire('tag', 'connectPost'),
    );

  const connectChallengeByNames = (payload: {
    challengeId: ChallengeId;
    names: readonly string[];
  }) =>
    repo.getManyOrInsertMany(payload.names).pipe(
      Effect.flatMap((tags) =>
        repo.connectTagsToChallenge({
          challengeId: payload.challengeId,
          tagIds: tags.map((v) => v.id),
        }),
      ),
      Effect.flatMap((targets) =>
        repo.findManyByIds(targets.map((v) => v.tagId)),
      ),
      policyRequire('tag', 'connectChallenge'),
    );

  const getOrInsert = (payload: typeof Tag.jsonCreate.Type) =>
    repo.getOrInsert(payload).pipe(policyRequire('tag', 'create'));

  const update = (id: TagId, payload: Partial<typeof Tag.jsonUpdate.Type>) =>
    repo
      .with(id, (tag) =>
        repo.update({
          ...tag,
          ...(payload?.description && { description: payload.description }),
          updatedAt: undefined,
        }),
      )
      .pipe(policyRequire('tag', 'update'));

  const deleteById = (id: TagId) =>
    repo.delete(id).pipe(policyRequire('tag', 'delete'));

  return {
    findAll,
    findById,
    findByName,

    getOrInsert,
    connectPostByNames,
    connectChallengeByNames,
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

import { policy } from '@/auth/authorization.mjs';
import { Effect, Layer } from 'effect';
import { Post } from './post-schema.mjs';

const make = Effect.gen(function* () {
  const canCreate = (_toCreate: typeof Post.jsonCreate.Type) =>
    policy('post', 'create', (actor) => Effect.succeed(true));

  const canRead = (_toRead: Post) =>
    policy('post', 'read', (_actor) => Effect.succeed(true));

  const canUpdate = (toUpdate: Post) =>
    policy('post', 'update', (actor) =>
      Effect.succeed(actor.id === toUpdate.accountId || actor.role === 'admin'),
    );

  const canDelete = (toDelete: Post) =>
    policy('post', 'delete', (actor) =>
      Effect.succeed(actor.id === toDelete.accountId || actor.role === 'admin'),
    );

  return {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
  } as const;
});

export class PostPolicy extends Effect.Tag('Post/PostPolicy')<
  PostPolicy,
  Effect.Effect.Success<typeof make>
>() {
  static Live = Layer.effect(PostPolicy, make);
}

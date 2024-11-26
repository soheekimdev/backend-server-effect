import { policy } from '@/auth/authorization.mjs';
import { Effect, Layer } from 'effect';

const make = Effect.gen(function* () {
  const canCreate = () =>
    policy('tag', 'create', (actor) => Effect.succeed(true));

  const canRead = () => policy('tag', 'read', (_actor) => Effect.succeed(true));

  const canUpdate = () =>
    policy('tag', 'update', (actor) => Effect.succeed(actor.role === 'admin'));

  const canDelete = () =>
    policy('tag', 'delete', (actor) => Effect.succeed(actor.role === 'admin'));

  return {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
  } as const;
});

export class TagPolicy extends Effect.Tag('TagPolicy')<
  TagPolicy,
  Effect.Effect.Success<typeof make>
>() {
  static layer = Layer.effect(TagPolicy, make);

  static Live = this.layer;
}

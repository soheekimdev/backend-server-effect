import { AccountId, CurrentAccount } from '@/account/account-schema.mjs';
import { HttpApiSchema } from '@effect/platform';
import { Effect, Predicate, Schema } from 'effect';

export class Unauthorized extends Schema.TaggedError<Unauthorized>()(
  'Unauthorized',
  {
    actorId: AccountId,
    entity: Schema.String,
    action: Schema.String,
  },
  HttpApiSchema.annotations({ status: 403 }),
) {
  get message() {
    return `Actor (${this.actorId}) is not authorized to perform action "${this.action}" on entity "${this.entity}"`;
  }

  static is(u: unknown): u is Unauthorized {
    return Predicate.isTagged(u, 'Unauthorized');
  }

  static refail(entity: string, action: string) {
    return <A, E extends Unauthorized, R>(
      effect: Effect.Effect<A, E, R>,
    ): Effect.Effect<A, Unauthorized, CurrentAccount | R> =>
      Effect.catchIf(
        effect,
        (e) => !Unauthorized.is(e),
        () =>
          Effect.flatMap(
            CurrentAccount,
            (actor) =>
              new Unauthorized({
                actorId: actor.id,
                entity,
                action,
              }),
          ),
      );
  }
}

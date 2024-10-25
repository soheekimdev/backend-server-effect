import { Account, CurrentAccount } from '@/account/account-schema.mjs';
import { Effect } from 'effect';
import { Unauthorized } from './error-403.mjs';

export const TypeId: unique symbol = Symbol.for(
  'Domain/Policy/AuthorizedActor',
);

export type TypeId = typeof TypeId;

export interface AuthorizedActor<Entity extends string, Action extends string>
  extends Account {
  readonly [TypeId]: {
    readonly _Entity: Entity;
    readonly _Action: Action;
  };
}

export const authorizedActor = (user: Account): AuthorizedActor<any, any> =>
  user as any;

export const policy = <Entity extends string, Action extends string, E, R>(
  entity: Entity,
  action: Action,
  f: (actor: Account) => Effect.Effect<boolean, E, R>,
): Effect.Effect<
  AuthorizedActor<Entity, Action>,
  E | Unauthorized,
  R | CurrentAccount
> =>
  Effect.flatMap(CurrentAccount, (actor) =>
    Effect.flatMap(f(actor), (can) =>
      can
        ? Effect.succeed(authorizedActor(actor))
        : Effect.fail(
            new Unauthorized({
              actorId: actor.id,
              entity,
              action,
            }),
          ),
    ),
  );

export const policyCompose =
  <Actor extends AuthorizedActor<any, any>, E, R>(
    that: Effect.Effect<Actor, E, R>,
  ) =>
  <Actor2 extends AuthorizedActor<any, any>, E2, R2>(
    self: Effect.Effect<Actor2, E2, R2>,
  ): Effect.Effect<Actor | Actor2, E | Unauthorized, R | CurrentAccount> =>
    Effect.zipRight(self, that) as any;

export const policyUse =
  <Actor extends AuthorizedActor<any, any>, E, R>(
    policy: Effect.Effect<Actor, E, R>,
  ) =>
  <A, E2, R2>(
    effect: Effect.Effect<A, E2, R2>,
  ): Effect.Effect<A, E | E2, Exclude<R2, Actor> | R> =>
    policy.pipe(Effect.zipRight(effect)) as any;

export const policyRequire =
  <Entity extends string, Action extends string>(
    _entity: Entity,
    _action: Action,
  ) =>
  <A, E, R>(
    effect: Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E, R | AuthorizedActor<Entity, Action>> =>
    effect;

export const withSystemActor = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
): Effect.Effect<A, E, Exclude<R, AuthorizedActor<any, any>>> => effect as any;

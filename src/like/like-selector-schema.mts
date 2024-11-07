import { Schema } from 'effect';
import { Like } from './like-schema.mjs';

export const LikeSelector = Like.pipe(
  Schema.pick(
    'accountId',
    'postId',
    'commentId',
    'challengeId',
    'challengeEventId',
  ),
  Schema.filter(
    (like) =>
      Boolean(like.accountId) &&
      Boolean(
        like.postId ||
          like.commentId ||
          like.challengeId ||
          like.challengeEventId,
      ),
    {
      identifier: 'LikeSelectorSchema',
      jsonSchema: {
        type: 'object',
        properties: {
          accountId: { type: 'string' },
          postId: { type: 'string' },
          commentId: { type: 'string' },
          challengeId: { type: 'string' },
          challengeEventId: { type: 'string' },
        },
        required: ['accountId'],
      },
      description:
        'At least one of postId, commentId, challengeId, or challengeEventId must be provided.',
    },
  ),
);

export type LikeSelector = typeof LikeSelector.Type;

type NullifyAll<T> = {
  [P in keyof T]?: T[P] | null | undefined;
};

export const likeSelectorsToWhere = (
  selectors: NullifyAll<typeof LikeSelector.Encoded>,
) => {
  const entries = Object.entries(selectors).reduce(
    (acc, [key, value]) => {
      if (value) {
        const column = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        return [...acc, [column, value] as const];
      }
      return acc;
    },
    [] as (readonly [string, string])[],
  );

  return entries;
};

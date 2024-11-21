import { Schema } from 'effect';
import { ChallengeEventId } from './challenge-event-schema.mjs';
import { AccountId } from '@/account/account-schema.mjs';
import { HttpApiSchema } from '@effect/platform';
import { ChallengeId } from '@/challenge/challenge-schema.mjs';

export class ChallengeEventNotFound extends Schema.TaggedError<ChallengeEventNotFound>()(
  'ChallengeEventNotFound',
  {
    id: Schema.NullishOr(ChallengeEventId),
    accountId: Schema.NullishOr(AccountId),
    challengeId: Schema.NullishOr(ChallengeId),
  },
  HttpApiSchema.annotations({
    status: 404,
    title: 'Challenge Event Not Found',
    description: 'ID에 해당하는 챌린지 이벤트가 존재하지 않습니다.',
  }),
) {}

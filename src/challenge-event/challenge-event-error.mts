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

export class ChallengeEventCheckRequestLocationBadRequest extends Schema.TaggedError<ChallengeEventCheckRequestLocationBadRequest>()(
  'ChallengeEventCheckRequestLocationBadRequest',
  {},
  HttpApiSchema.annotations({
    status: 400,
    title: 'Challenge Event Location Not Found',
    description: '챌린지 이벤트의 체크요청에서 위치 정보가 올바르지 않습니다.',
  }),
) {}

export class ChallengeEventCheckRequestDateBadRequest extends Schema.TaggedError<ChallengeEventCheckRequestDateBadRequest>()(
  'ChallengeEventCheckRequestDateBadRequest',
  {},
  HttpApiSchema.annotations({
    status: 400,
    title: 'Challenge Event Date Not Found',
    description: '챌린지 이벤트의 체크요청에서 날짜 정보가 올바르지 않습니다.',
  }),
) {}

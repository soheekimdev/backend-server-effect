import { HttpApiSchema } from '@effect/platform';
import { Schema } from 'effect';
import { ChallengeEventParticipantId } from './challenge-event-participant-schema.mjs';
import { AccountId } from '@/account/account-schema.mjs';
import { ChallengeId } from '@/challenge/challenge-schema.mjs';
import { ChallengeEventId } from './challenge-event-schema.mjs';

export class ChallengeEventParticipantNotFound extends Schema.TaggedError<ChallengeEventParticipantNotFound>()(
  'ChallengeEventParticipantNotFound',
  {
    id: Schema.NullishOr(ChallengeEventParticipantId),
    accountId: Schema.NullishOr(AccountId),
    challengeId: Schema.NullishOr(ChallengeId),
    challengeEventId: Schema.NullishOr(ChallengeEventId),
  },
  HttpApiSchema.annotations({
    status: 404,
    title: 'Challenge Event Participant Not Found',
    description: 'ID에 해당하는 챌린지 이벤트 참가자가 존재하지 않습니다.',
  }),
) {}

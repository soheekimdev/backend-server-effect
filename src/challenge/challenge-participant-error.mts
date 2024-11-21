import { HttpApiSchema } from '@effect/platform';
import { Schema } from 'effect';
import { ChallengeParticipantId } from './challenge-participant-schema.mjs';
import { AccountId } from '@/account/account-schema.mjs';
import { ChallengeId } from './challenge-schema.mjs';

export class ChallengeParticipantNotFound extends Schema.TaggedError<ChallengeParticipantNotFound>()(
  'ChallengeParticipantNotFound',
  { id: ChallengeParticipantId },
  HttpApiSchema.annotations({
    status: 404,
    description: '챌린지 참가자를 찾을 수 없습니다.',
  }),
) {}

export class ChallengeParticipantTargetNotFound extends Schema.TaggedError<ChallengeParticipantTargetNotFound>()(
  'ChallengeParticipantTargetNotFound',
  {
    accountId: Schema.NullishOr(AccountId),
    challengeId: Schema.NullishOr(ChallengeId),
  },
  HttpApiSchema.annotations({
    status: 404,
    description: '해당 챌린지 참가자를 찾을 수 없습니다.',
  }),
) {}

export class ChallengeParticipantConflict extends Schema.TaggedError<ChallengeParticipantConflict>()(
  'ChallengeParticipantConflict',
  { accountId: AccountId, challengeId: ChallengeId },
  HttpApiSchema.annotations({
    status: 409,
    description: '챌린지 참가가 이미 존재합니다.',
  }),
) {}

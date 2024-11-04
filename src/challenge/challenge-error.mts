import { HttpApiSchema } from '@effect/platform';
import { Schema } from 'effect';
import { ChallengeId } from './challenge-schema.mjs';

export class ChallengeNotFound extends Schema.TaggedError<ChallengeNotFound>()(
  'ChallengeNotFound',
  { id: ChallengeId },
  HttpApiSchema.annotations({
    status: 404,
    title: 'Challenge Not Found',
    description: 'ID에 해당하는 챌린지가 존재하지 않습니다.',
  }),
) {}

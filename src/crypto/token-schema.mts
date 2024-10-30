import { Email } from '@/misc/email-schema.mjs';
import { Schema } from 'effect';

export const Token = Schema.Struct({
  iss: Schema.String,
  type: Schema.Literal('access', 'refresh'),
  iat: Schema.Int,
  sub: Email,
  exp: Schema.Int,
  maxAge: Schema.Int,
});

export type Token = typeof Token.Type;

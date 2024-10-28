import { Email } from '@/misc/email-schema.mjs';
import { Schema } from 'effect';

export const SignIn = Schema.Struct({
  email: Email,
  password: Schema.String,
});

export type SignIn = typeof SignIn.Type;

import { Email } from '@/misc/email-schema.mjs';
import { Schema } from 'effect';

export const SignUp = Schema.Struct({
  email: Email,
  password: Schema.String,
  confirmPassword: Schema.String,
});

export type SignUp = typeof SignUp.Type;

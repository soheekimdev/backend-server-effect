import { Email } from '@/misc/email-schema.mjs';
import { Schema } from 'effect';

export const SignIn = Schema.Struct({
  email: Email,
  password: Schema.String.pipe(
    Schema.annotations({
      title: 'Password',
      description: 'A password',
      default: 'p@ss0wrd',
    }),
  ),
});

export type SignIn = typeof SignIn.Type;

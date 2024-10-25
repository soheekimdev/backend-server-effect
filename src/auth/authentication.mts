import { CurrentAccount } from '@/account/account-schema.mjs';
import { HttpApiMiddleware, HttpApiSecurity } from '@effect/platform';
import { Unauthenticated } from './error-401.mjs';

export class Authentication extends HttpApiMiddleware.Tag<Authentication>()(
  'Authentication',
  {
    failure: Unauthenticated,
    provides: CurrentAccount,
    security: {
      bearer: HttpApiSecurity.bearer,
    },
  },
) {}

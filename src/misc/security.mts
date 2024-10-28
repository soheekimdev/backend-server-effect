import { HttpApiSecurity } from '@effect/platform';

export const security = HttpApiSecurity.apiKey({
  key: 'access-token',
});

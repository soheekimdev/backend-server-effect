import { HttpApiBuilder } from '@effect/platform';
import { Layer } from 'effect';
import { AccountApiLive } from './account/account-api-live.mjs';
import { Api } from './api.mjs';

export const ApiLive = HttpApiBuilder.api(Api).pipe(
  Layer.provide([AccountApiLive]),
);

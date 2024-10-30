import { HttpApi } from '@effect/platform';
import { AccountApi } from './account/account-api.mjs';
import { RootApi } from './root-api.mjs';

export class Api extends HttpApi.empty.add(RootApi).add(AccountApi) {}

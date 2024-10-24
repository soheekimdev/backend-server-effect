import { HttpApi } from '@effect/platform';
import { AccountApi } from './account/account-api.mjs';

export class Api extends HttpApi.empty.add(AccountApi) {}

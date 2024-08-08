import { BaseContext } from '@apollo/server';

export interface Context extends BaseContext {
  authorization?: JwtPayload | string | null;
  actor?: string | null;
  group?: string | null;
}

export interface Authorization {
  email?: string;
  profile?: string;
}

export interface Jwks {
  keys: Array<{
    kid: string;
    [key: string]: any;
  }>;
}

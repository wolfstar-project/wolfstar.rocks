import type { RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";

// auth.d.ts
declare module "#auth-utils" {
  export interface User {
    id: string;
    name: string;
    globalName: string;
    username: string;
    avatar: string | null;
  }

  export interface UserSession {
    loggedAt: number;
  }

  export interface SecureSessionData {
    tokens: RESTPostOAuth2AccessTokenResult;
  }
}

export {};

declare module "h3" {
  interface H3EventContext {
    $authorization: {
      resolveServerUser(): Promise<import("#auth-utils").User | null>;
      resolveServerTokens(): Promise<RESTPostOAuth2AccessTokenResult | null>;
    };
  }
}

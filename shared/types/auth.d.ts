import type { Session } from "better-auth/types";

declare module "better-auth" {
  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
      emailVerified: boolean;
    };
  }
}

export {};

declare module "h3" {
  interface H3EventContext {
    $authorization: {
      resolveServerUser(): Promise<Session["user"] | null>;
      resolveServerTokens(): Promise<any | null>;
    };
  }
}

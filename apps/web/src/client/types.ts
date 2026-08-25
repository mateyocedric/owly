export interface SessionUser {
  id: string;
  username: string;
  role: string;
}

export type Session =
  | { status: "authenticated"; user: SessionUser }
  | { status: "unauthenticated" };

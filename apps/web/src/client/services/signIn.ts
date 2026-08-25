import { apiFetch } from "../../lib/api.js";
import { setAdminToken } from "../lib/admin-token.js";
import type { SessionUser } from "../types.js";

export interface SignInInput {
  username: string;
  password: string;
}

export interface SignInResponse {
  user: SessionUser;
}

interface LoginApiResponse {
  token: string;
  expiresAt: string;
  user: SessionUser;
}

export async function signIn(input: SignInInput): Promise<SignInResponse> {
  const res = await apiFetch<LoginApiResponse>("/admin/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  setAdminToken(res.token);
  return { user: res.user };
}

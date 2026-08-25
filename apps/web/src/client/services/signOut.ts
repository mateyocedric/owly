import { clearAdminToken } from "../lib/admin-token.js";

export async function signOut(): Promise<boolean> {
  clearAdminToken();
  return true;
}

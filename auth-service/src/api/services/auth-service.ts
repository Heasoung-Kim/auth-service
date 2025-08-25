import { login, logout } from "@api/apis/authApi";
import { isLoggedIn, restoreAfterReload } from "@api/modules/token-utils";

export async function doLogin(u: string, p: string) {
  await login(u, p);
  return true;
}

export async function doLogout() {
  await logout();
}

export function restoreSession() {
  restoreAfterReload();
  return isLoggedIn();
}

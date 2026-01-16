export const AUTH_KEYS = {
  token: 'token',
  role: 'role',
  adminToken: 'adminToken',
  isBrand: 'isBrand',
  sessionId: 'sessionId',
} as const;

export type AuthKey = (typeof AUTH_KEYS)[keyof typeof AUTH_KEYS];

export function getAccessToken(): string {
  return localStorage.getItem(AUTH_KEYS.token) || '';
}

export function getRole(): string {
  return localStorage.getItem(AUTH_KEYS.role) || '';
}

export function setAccessToken(token: string) {
  if (token) {
    localStorage.setItem(AUTH_KEYS.token, token);
  } else {
    localStorage.removeItem(AUTH_KEYS.token);
  }
}

export function setRole(role: string) {
  if (role) {
    localStorage.setItem(AUTH_KEYS.role, role);
  } else {
    localStorage.removeItem(AUTH_KEYS.role);
  }
}

export function setBothAuthData(token: string, role: string) {
  setAccessToken(token);
  setRole(role);
}

function clearCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; path=/`;
  document.cookie = `${name}=; Max-Age=0; path=${window.location.pathname}`;
}

export function clearAuthCookies(extraNames: string[] = []) {
  const names = new Set<string>([
    AUTH_KEYS.token,
    AUTH_KEYS.role,
    AUTH_KEYS.sessionId,
    'accessToken',
    'refreshToken',
    'token',
    ...extraNames,
  ]);

  names.forEach(clearCookie);
}

export function clearAuthStorage() {
  Object.values(AUTH_KEYS).forEach((k) => localStorage.removeItem(k));
  clearAuthCookies();
}

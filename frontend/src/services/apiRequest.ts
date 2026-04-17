import { getValidAccessToken } from './authStorage';

interface ApiRequestInit extends RequestInit {
  includeAuth?: boolean;
}

export async function apiRequest(
  input: RequestInfo | URL,
  init?: ApiRequestInit,
): Promise<Response> {
  const { includeAuth = true, ...requestInit } = init ?? {};
  const headers = new Headers(requestInit.headers);

  if (includeAuth) {
    const accessToken = getValidAccessToken();

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
  }

  return fetch(input, {
    ...requestInit,
    headers,
  });
}
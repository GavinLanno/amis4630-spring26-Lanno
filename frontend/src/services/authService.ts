const API_BASE_URL = '/api';

interface ProblemDetails {
  detail?: string;
  title?: string;
}

interface TokenResponseApi {
  accessToken?: string;
  expiresAtUtc?: string;
  AccessToken?: string;
  ExpiresAtUtc?: string;
}

export interface LoginInput {
  userId: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  role: string;
}

export interface LoginResult {
  accessToken: string;
  expiresAtUtc: string;
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as ProblemDetails;
    return data.detail ?? data.title ?? 'Authentication request failed.';
  } catch {
    return 'Authentication request failed.';
  }
}

function mapTokenResponse(data: TokenResponseApi): LoginResult {
  const accessToken = data.accessToken ?? data.AccessToken;
  const expiresAtUtc = data.expiresAtUtc ?? data.ExpiresAtUtc;

  if (!accessToken || !expiresAtUtc) {
    throw new Error('Authentication response was missing token details.');
  }

  return {
    accessToken,
    expiresAtUtc,
  };
}

export async function createToken({ userId, password }: LoginInput): Promise<LoginResult> {
  const response = await fetch(`${API_BASE_URL}/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const data = (await response.json()) as TokenResponseApi;
  return mapTokenResponse(data);
}

export async function registerUser({ userId, password, role }: RegisterInput): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      password,
      role,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
}

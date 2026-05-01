const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

function trimTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, '');
}

function normalizeConfiguredApiUrl(value: string): string {
  const trimmedValue = trimTrailingSlashes(value);

  if (trimmedValue.endsWith('/api')) {
    return trimmedValue;
  }

  return `${trimmedValue}/api`;
}

export const API_BASE_URL =
  configuredApiUrl && configuredApiUrl.length > 0
    ? normalizeConfiguredApiUrl(configuredApiUrl)
    : '/api';

export const BACKEND_BASE_URL =
  API_BASE_URL === '/api'
    ? 'https://localhost:7000'
    : API_BASE_URL.replace(/\/api$/, '');

export function resolveAssetUrl(assetPath: string): string {
  if (!assetPath) {
    return assetPath;
  }

  if (assetPath.startsWith('/')) {
    return API_BASE_URL === '/api' ? assetPath : `${BACKEND_BASE_URL}${assetPath}`;
  }

  try {
    const assetUrl = new URL(assetPath);
    const backendUrl = new URL(BACKEND_BASE_URL);

    if (assetUrl.origin !== backendUrl.origin) {
      return assetPath;
    }

    return API_BASE_URL === '/api'
      ? `${assetUrl.pathname}${assetUrl.search}`
      : assetPath;
  } catch {
    return API_BASE_URL === '/api' ? assetPath : `${BACKEND_BASE_URL}/${assetPath}`;
  }
}

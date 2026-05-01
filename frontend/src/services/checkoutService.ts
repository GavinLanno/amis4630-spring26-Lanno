import { API_BASE_URL } from '../config';
import { getValidAccessToken } from './authStorage';
import { apiRequest } from './apiRequest';

interface ProblemDetails {
  detail?: string;
  title?: string;
}

interface CheckoutResponse {
  message: string;
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as ProblemDetails;

    if (response.status === 401) {
      return 'Please log in before checkout.';
    }

    if (response.status === 403) {
      return 'Only signed-in users can complete checkout for this action.';
    }

    return data.detail ?? data.title ?? 'Checkout failed.';
  } catch {
    return response.status === 401 ? 'Please log in before checkout.' : 'Checkout failed.';
  }
}

export async function submitCheckout(): Promise<string> {
  const accessToken = getValidAccessToken();

  if (!accessToken) {
    throw new Error('Please log in before checkout.');
  }

  const response = await apiRequest(`${API_BASE_URL}/checkout`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = (await response.json()) as CheckoutResponse;
  return payload.message;
}

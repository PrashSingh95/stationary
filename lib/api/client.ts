type ApiResponse<T> = {
  data: T | null;
  error: { code: string; message: string } | null;
};

export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export async function apiGet<T>(path: string): Promise<T | null> {
  return apiRequest<T>(path);
}

export async function apiPost<T, Body = unknown>(
  path: string,
  body?: Body,
): Promise<T | null> {
  return apiRequest<T>(path, { body, method: 'POST' });
}

export async function apiPatch<T, Body = unknown>(
  path: string,
  body?: Body,
): Promise<T | null> {
  return apiRequest<T>(path, { body, method: 'PATCH' });
}

export async function apiDelete<T>(path: string): Promise<T | null> {
  return apiRequest<T>(path, { method: 'DELETE' });
}

async function apiRequest<T>(
  path: string,
  options: {
    body?: unknown;
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  } = {},
): Promise<T | null> {
  if (!apiBaseUrl) return null;

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      headers:
        options.body === undefined
          ? undefined
          : {
              'Content-Type': 'application/json',
            },
      method: options.method ?? 'GET',
      credentials: 'include',
      next:
        options.method === undefined || options.method === 'GET'
          ? { revalidate: 60 }
          : undefined,
    });
    if (!response.ok) return null;

    const payload = (await response.json()) as ApiResponse<T>;
    return payload.data;
  } catch {
    return null;
  }
}

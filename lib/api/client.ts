type ApiResponse<T> = {
  data: T | null;
  error: { code: string; message: string } | null;
};

export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export async function apiGet<T>(path: string): Promise<T | null> {
  if (!apiBaseUrl) return null;

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      credentials: 'include',
      next: { revalidate: 60 },
    });
    if (!response.ok) return null;

    const payload = (await response.json()) as ApiResponse<T>;
    return payload.data;
  } catch {
    return null;
  }
}

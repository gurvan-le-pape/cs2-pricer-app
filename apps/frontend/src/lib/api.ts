const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function refreshTokens(): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  return res.ok;
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (res.status === 401) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      return fetch(`${API_URL}${path}`, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
    }
  }

  return res;
}

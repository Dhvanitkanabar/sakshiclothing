export const getAdminHeaders = (extraHeaders: Record<string, string> = {}) => {
  const token = localStorage.getItem('adminToken');
  const headers: Record<string, string> = { ...extraHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const adminFetch = async (url: string, options: RequestInit = {}) => {
  const headers = getAdminHeaders(
    options.headers ? (options.headers as Record<string, string>) : {}
  );

  return fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });
};

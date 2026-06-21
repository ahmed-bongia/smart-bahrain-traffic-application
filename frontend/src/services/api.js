import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

function withQuery(path, params) {
  if (!params || Object.keys(params).length === 0) return path;
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });
  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
}

async function request(path, options = {}) {
  const token = await SecureStore.getItemAsync('userToken');
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: isFormData || typeof options.body === 'string'
      ? options.body
      : options.body !== undefined
        ? JSON.stringify(options.body)
        : undefined,
  });

  if (response.status === 401) {
    await SecureStore.deleteItemAsync('userToken');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.response = { status: response.status, data };
    throw error;
  }

  return { data };
}

const api = {
  get(path, config = {}) {
    return request(withQuery(path, config.params));
  },
  post(path, data, config = {}) {
    return request(path, { method: 'POST', body: data, headers: config.headers });
  },
  put(path, data, config = {}) {
    return request(path, { method: 'PUT', body: data, headers: config.headers });
  },
  delete(path) {
    return request(path, { method: 'DELETE' });
  },
};

export default api;
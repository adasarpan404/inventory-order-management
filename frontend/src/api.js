const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = data?.detail;
    const message = typeof detail === 'string'
      ? detail
      : Array.isArray(detail)
        ? detail.map((e) => e.msg).join(', ')
        : 'Request failed';
    throw new Error(message);
  }

  return data;
}

export const productsApi = {
  list: () => request('/products'),
  create: (body) => request('/products', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id) => request(`/products/${id}`, { method: 'DELETE' }),
};

export const customersApi = {
  list: () => request('/customers'),
  create: (body) => request('/customers', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id) => request(`/customers/${id}`, { method: 'DELETE' }),
};

export const ordersApi = {
  list: () => request('/orders'),
  create: (body) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
  inventory: () => request('/orders/inventory/summary'),
};
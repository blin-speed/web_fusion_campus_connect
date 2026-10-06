import { getUserToken, getAdminToken } from './auth';

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function request(method, path, { body, query, form, signal, as = 'user' } = {}) {
  let url = `/api/v1${path}`;
  if (query) {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(query)) {
      if (val !== undefined && val !== null && val !== '') {
        params.append(key, val);
      }
    }
    const qString = params.toString();
    if (qString) url += `?${qString}`;
  }

  const headers = {};
  const token = as === 'admin' ? getAdminToken() : getUserToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
    signal,
  };

  if (body) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  } else if (form) {
    // browser sets Content-Type with boundary for FormData
    options.body = form;
  }

  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError(0, 'NETWORK_ERROR', 'Network request failed. Please check your connection.');
  }
  
  if (response.status === 204) {
    return { _empty: true };
  }
  
  const text = await response.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch (_e) { data = { _raw: text }; }
  }

  if (!response.ok) {
    const message = data?.error?.message || `HTTP ${response.status}`;
    const code = data?.error?.code || 'UNKNOWN';
    const details = data?.error?.details;
    throw new ApiError(response.status, code, message, details);
  }

  return data;
}

export async function uploadPhoto(file, purpose, ids) {
  const form = new FormData();
  form.append('file', file);
  form.append('purpose', purpose);
  if (ids?.postId) form.append('postId', ids.postId);
  if (ids?.exchangeId) form.append('exchangeId', ids.exchangeId);
  if (ids?.disputeId) form.append('disputeId', ids.disputeId);
  
  return request('POST', '/photos', { form });
}


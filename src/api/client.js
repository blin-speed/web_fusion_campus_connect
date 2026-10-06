export async function request(method, path, { body, query, form } = {}) {
  let url = `/api/v1${path}`;
  if (query) {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(query)) {
      if (val !== undefined && val !== null) {
        params.append(key, val);
      }
    }
    url += `?${params.toString()}`;
  }

  const headers = {};
  const token = sessionStorage.getItem('token') || sessionStorage.getItem('adminToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  } else if (form) {
    // browser sets Content-Type with boundary for FormData
    options.body = form;
  }

  const response = await fetch(url, options);
  
  if (response.status === 204) {
    return null;
  }
  
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const err = new Error(data?.error?.message || `HTTP ${response.status}`);
    err.code = data?.error?.code || 'UNKNOWN';
    err.details = data?.error?.details;
    throw err;
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

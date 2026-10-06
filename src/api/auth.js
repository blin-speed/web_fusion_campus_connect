export function getUserToken() {
  try { return localStorage.getItem('user_token'); } catch (e) { return null; }
}

export function setUserToken(token) {
  try {
    if (token) localStorage.setItem('user_token', token);
    else localStorage.removeItem('user_token');
  } catch (e) {}
}

export function getAdminToken() {
  try { return localStorage.getItem('admin_token'); } catch (e) { return null; }
}

export function setAdminToken(token) {
  try {
    if (token) localStorage.setItem('admin_token', token);
    else localStorage.removeItem('admin_token');
  } catch (e) {}
}

export function clearSession() {
  setUserToken(null);
  setAdminToken(null);
}

let _adminAuth = null; // { header: "Basic ...", exp: number }

export function setAdminAuth(username, password, ttlMinutes = 10) {
  const header = "Basic " + btoa(`${username}:${password}`);
  const exp = Date.now() + ttlMinutes * 60 * 1000;
  _adminAuth = { header, exp };
}

export function getAdminAuth() {
  if (!_adminAuth) return null;
  if (Date.now() > _adminAuth.exp) {
    _adminAuth = null;
    return null;
  }
  return _adminAuth.header;
}

export function clearAdminAuth() {
  _adminAuth = null;
}
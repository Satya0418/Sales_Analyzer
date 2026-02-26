/* ============================================================
   tokens.js  –  shared JWT token helpers (all pages)
   ============================================================ */
const API = "http://127.0.0.1:8000/api/users";

const Tokens = {
  get access()  { return localStorage.getItem("biz_access");  },
  get refresh() { return localStorage.getItem("biz_refresh"); },
  set(access, refresh) {
    localStorage.setItem("biz_access",  access);
    localStorage.setItem("biz_refresh", refresh);
  },
  clear() {
    localStorage.removeItem("biz_access");
    localStorage.removeItem("biz_refresh");
    localStorage.removeItem("biz_user");
  },
  saveUser(user) { localStorage.setItem("biz_user", JSON.stringify(user)); },
  getUser() {
    try { return JSON.parse(localStorage.getItem("biz_user")); } catch { return null; }
  },
  isLoggedIn() { return !!this.access; },
};

async function apiFetch(path, method = "GET", body = null, auth = false) {
  const headers = { "Content-Type": "application/json" };
  if (auth && Tokens.access) headers["Authorization"] = `Bearer ${Tokens.access}`;
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });
  let data = null;
  try { data = await res.json(); } catch { /* empty */ }
  return { ok: res.ok, status: res.status, data };
}

async function doLogout() {
  try {
    if (Tokens.refresh) {
      await apiFetch("/logout/", "POST", { refresh: Tokens.refresh }, true);
    }
  } catch { /* ignore */ }
  Tokens.clear();
  window.location.href = "/login/";
}

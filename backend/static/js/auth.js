/* ============================================================
   auth.js  –  login page (login + register tabs)
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  // If already logged in, go straight to dashboard
  if (Tokens.isLoggedIn()) {
    window.location.href = "/dashboard/";
    return;
  }

  const yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  // ── Tab switching ─────────────────────────────────────────────
  const tabs     = document.querySelectorAll(".auth-tab");
  const tabLogin = document.getElementById("tab-login");
  const tabReg   = document.getElementById("tab-register");

  function showTab(name) {
    tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === name));
    tabLogin?.classList.toggle("hidden", name !== "login");
    tabReg?.classList.toggle("hidden",   name !== "register");
  }

  tabs.forEach(t => t.addEventListener("click", () => showTab(t.dataset.tab)));

  // Deep-link: /login/#register opens the register tab
  if (window.location.hash === "#register") showTab("register");

  document.querySelectorAll(".auth-switch-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      showTab(link.dataset.switch);
    });
  });

  // ── Shared helpers ─────────────────────────────────────────────
  function setLoading(form, loading) {
    const btn = form.querySelector("button[type='submit']");
    if (!btn) return;
    btn.disabled    = loading;
    btn.textContent = loading ? "Please wait…" : (btn.dataset.label || "Submit");
  }

  function initBtn(form) {
    const btn = form.querySelector("button[type='submit']");
    if (btn) btn.dataset.label = btn.textContent;
  }

  // ── Login ──────────────────────────────────────────────────────
  const loginForm    = document.getElementById("login-form");
  const loginError   = document.getElementById("login-error");
  const loginSuccess = document.getElementById("login-success");

  if (loginForm) {
    initBtn(loginForm);
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      loginError.textContent   = "";
      loginSuccess.textContent = "";

      const email    = loginForm.querySelector("[name='email']").value.trim();
      const password = loginForm.querySelector("[name='password']").value;

      if (!email || !password) {
        loginError.textContent = "Please enter both email and password.";
        return;
      }

      setLoading(loginForm, true);
      try {
        const { ok, data } = await apiFetch("/login/", "POST", { email, password });
        if (ok && data.access) {
          Tokens.set(data.access, data.refresh);
          Tokens.saveUser(data.user);
          loginSuccess.textContent = `Welcome back, ${data.user?.full_name || email}! Redirecting…`;
          setTimeout(() => { window.location.href = "/dashboard/"; }, 600);
        } else {
          loginError.textContent =
            data?.detail ||
            data?.non_field_errors?.[0] ||
            "Incorrect email or password.";
        }
      } catch {
        loginError.textContent = "Cannot reach server. Is the backend running?";
      } finally {
        setLoading(loginForm, false);
      }
    });
  }

  // ── Register ───────────────────────────────────────────────────
  const regForm    = document.getElementById("register-form");
  const regError   = document.getElementById("register-error");
  const regSuccess = document.getElementById("register-success");

  if (regForm) {
    initBtn(regForm);
    regForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      regError.textContent   = "";
      regSuccess.textContent = "";

      const full_name        = regForm.querySelector("[name='full_name']").value.trim();
      const email            = regForm.querySelector("[name='email']").value.trim();
      const password         = regForm.querySelector("[name='password']").value;
      const password_confirm = regForm.querySelector("[name='password_confirm']").value;

      if (!full_name || !email || !password || !password_confirm) {
        regError.textContent = "All fields are required.";
        return;
      }
      if (password !== password_confirm) {
        regError.textContent = "Passwords do not match.";
        return;
      }

      setLoading(regForm, true);
      try {
        const { ok, data } = await apiFetch("/register/", "POST",
          { full_name, email, password, password_confirm });
        if (ok) {
          Tokens.set(data.tokens.access, data.tokens.refresh);
          Tokens.saveUser(data.user);
          regSuccess.textContent = "Account created! Taking you to the dashboard…";
          setTimeout(() => { window.location.href = "/dashboard/"; }, 800);
        } else {
          const msg = data ? Object.values(data).flat().join(" ") : "Registration failed.";
          regError.textContent = msg;
        }
      } catch {
        regError.textContent = "Cannot reach server. Is the backend running?";
      } finally {
        setLoading(regForm, false);
      }
    });
  }
});

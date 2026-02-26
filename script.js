/* ============================================================
   BizAnalystics  –  script.js
   Handles: intro animation, JWT auth (login / register / logout),
            token persistence, auto-login, nav state, dashboard reveal.
   Backend base URL: http://127.0.0.1:8000
   ============================================================ */

const API = "http://127.0.0.1:8000/api/users";

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------
const Tokens = {
  get access()  { return localStorage.getItem("biz_access"); },
  get refresh() { return localStorage.getItem("biz_refresh"); },
  set(access, refresh) {
    localStorage.setItem("biz_access", access);
    localStorage.setItem("biz_refresh", refresh);
  },
  clear() {
    localStorage.removeItem("biz_access");
    localStorage.removeItem("biz_refresh");
    localStorage.removeItem("biz_user");
  },
  saveUser(user) { localStorage.setItem("biz_user", JSON.stringify(user)); },
  getUser()      {
    try { return JSON.parse(localStorage.getItem("biz_user")); } catch { return null; }
  },
};

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------
async function apiFetch(path, method = "GET", body = null, auth = false) {
  const headers = { "Content-Type": "application/json" };
  if (auth && Tokens.access) headers["Authorization"] = `Bearer ${Tokens.access}`;

  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  return { ok: res.ok, status: res.status, data };
}

async function refreshAccessToken() {
  if (!Tokens.refresh) return false;
  const { ok, data } = await apiFetch("/token/refresh/", "POST", { refresh: Tokens.refresh });
  if (ok && data.access) {
    Tokens.set(data.access, data.refresh || Tokens.refresh);
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// DOMContentLoaded
// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const introOverlay    = document.getElementById("intro-overlay");
  const siteRoot        = document.getElementById("site-root");
  const doorScene       = document.querySelector(".door-scene");
  const loginForm       = document.getElementById("login-form");
  const loginError      = document.getElementById("login-error");
  const loginSuccess    = document.getElementById("login-success");
  const registerForm    = document.getElementById("register-form");
  const registerError   = document.getElementById("register-error");
  const registerSuccess = document.getElementById("register-success");
  const dashboardSection = document.getElementById("dashboard");
  const yearSpan        = document.getElementById("year");

  // Nav elements
  const navLogin    = document.getElementById("nav-login");
  const navRegister = document.getElementById("nav-register");
  const navDash     = document.getElementById("nav-dashboard");
  const navLogout   = document.getElementById("nav-logout");

  // Dashboard user elements
  const dashUser   = document.getElementById("dash-user-name");
  const dashRole   = document.getElementById("dash-user-role");
  const logoutBtn  = document.getElementById("logout-btn");

  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // ------------------------------------------------------------------
  // Intro animation
  // ------------------------------------------------------------------
  if (doorScene && introOverlay && siteRoot) {
    setTimeout(() => doorScene.classList.add("intro-doors-open"),  800);
    setTimeout(() => doorScene.classList.add("intro-person-walk"), 1500);
    setTimeout(() => {
      introOverlay.classList.add("intro-fade-out");
      introOverlay.addEventListener(
        "animationend",
        () => {
          introOverlay.classList.add("hidden");
          siteRoot.classList.remove("hidden");
          // Auto-reveal dashboard if already logged in
          if (Tokens.access) {
            revealDashboard();
          } else {
            window.location.hash = "#home";
          }
        },
        { once: true }
      );
    }, 2600);
  }

  // ------------------------------------------------------------------
  // UI state helpers
  // ------------------------------------------------------------------
  function setNavLoggedIn(user) {
    navLogin?.classList.add("hidden");
    navRegister?.classList.add("hidden");
    navDash?.classList.remove("hidden");
    navLogout?.classList.remove("hidden");

    if (user) {
      if (dashUser) dashUser.textContent = user.full_name || user.email;
      if (dashRole) dashRole.textContent = capitalise(user.role || "viewer");
    }
  }

  function setNavLoggedOut() {
    navLogin?.classList.remove("hidden");
    navRegister?.classList.remove("hidden");
    navDash?.classList.add("hidden");
    navLogout?.classList.add("hidden");
    dashboardSection?.classList.add("hidden");
  }

  function revealDashboard() {
    const user = Tokens.getUser();
    setNavLoggedIn(user);
    dashboardSection?.classList.remove("hidden");
    dashboardSection?.scrollIntoView({ behavior: "smooth" });
    // Render charts after the section is visible
    setTimeout(buildDashboardCharts, 120);
  }

  function capitalise(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  }

  function setFormLoading(form, loading) {
    const btn = form?.querySelector("button[type='submit']");
    if (btn) btn.disabled = loading;
    if (btn) btn.textContent = loading ? "Please wait…" : btn.dataset.label || "Submit";
  }

  // Check if user is already logged in
  if (Tokens.access && siteRoot && !siteRoot.classList.contains("hidden")) {
    revealDashboard();
  }

  // ------------------------------------------------------------------
  // Login
  // ------------------------------------------------------------------
  if (loginForm) {
    const btn = loginForm.querySelector("button[type='submit']");
    if (btn) btn.dataset.label = btn.textContent;

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      loginError.textContent = "";
      if (loginSuccess) loginSuccess.textContent = "";

      const email    = loginForm.querySelector("[name='email']").value.trim();
      const password = loginForm.querySelector("[name='password']").value;

      if (!email || !password) {
        loginError.textContent = "Please enter both email and password.";
        return;
      }

      setFormLoading(loginForm, true);
      try {
        const { ok, data } = await apiFetch("/login/", "POST", { email, password });
        if (ok && data.access) {
          Tokens.set(data.access, data.refresh);
          Tokens.saveUser(data.user);
          if (loginSuccess) loginSuccess.textContent = `Welcome back, ${data.user?.full_name || email}!`;
          loginForm.reset();
          revealDashboard();
        } else {
          const msg =
            data?.detail ||
            data?.non_field_errors?.[0] ||
            "Login failed. Please check your credentials.";
          loginError.textContent = msg;
        }
      } catch {
        loginError.textContent = "Could not reach the server. Is the backend running?";
      } finally {
        setFormLoading(loginForm, false);
      }
    });
  }

  // ------------------------------------------------------------------
  // Register
  // ------------------------------------------------------------------
  if (registerForm) {
    const btn = registerForm.querySelector("button[type='submit']");
    if (btn) btn.dataset.label = btn.textContent;

    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (registerError)  registerError.textContent  = "";
      if (registerSuccess) registerSuccess.textContent = "";

      const full_name        = registerForm.querySelector("[name='full_name']").value.trim();
      const email            = registerForm.querySelector("[name='email']").value.trim();
      const password         = registerForm.querySelector("[name='password']").value;
      const password_confirm = registerForm.querySelector("[name='password_confirm']").value;

      if (!full_name || !email || !password || !password_confirm) {
        if (registerError) registerError.textContent = "All fields are required.";
        return;
      }
      if (password !== password_confirm) {
        if (registerError) registerError.textContent = "Passwords do not match.";
        return;
      }

      setFormLoading(registerForm, true);
      try {
        const { ok, data } = await apiFetch("/register/", "POST", {
          full_name, email, password, password_confirm,
        });
        if (ok) {
          Tokens.set(data.tokens.access, data.tokens.refresh);
          Tokens.saveUser(data.user);
          if (registerSuccess) registerSuccess.textContent =
            "Account created! Taking you to the dashboard…";
          registerForm.reset();
          setTimeout(revealDashboard, 800);
        } else {
          const errors = data ? Object.values(data).flat().join(" ") : "Registration failed.";
          if (registerError) registerError.textContent = errors;
        }
      } catch {
        if (registerError) registerError.textContent = "Could not reach the server. Is the backend running?";
      } finally {
        setFormLoading(registerForm, false);
      }
    });
  }

  // ------------------------------------------------------------------
  // Logout
  // ------------------------------------------------------------------
  async function doLogout() {
    try {
      if (Tokens.refresh) {
        await apiFetch("/logout/", "POST", { refresh: Tokens.refresh }, true);
      }
    } catch { /* ignore network errors on logout */ }
    Tokens.clear();
    setNavLoggedOut();
    window.location.hash = "#home";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  logoutBtn?.addEventListener("click", doLogout);
  navLogout?.addEventListener("click", (e) => { e.preventDefault(); doLogout(); });

  // Initialise nav to reflect current login state
  if (Tokens.access) {
    setNavLoggedIn(Tokens.getUser());
  } else {
    setNavLoggedOut();
  }
});

// ===========================================================================
//  BLINKIT DASHBOARD  –  Chart.js charts
//  Data sourced from BLINKIT (1).pbix  (Blinkit Grocery Sales dataset)
// ===========================================================================

const BLINKIT = {
  fatContent: {
    labels: ["Low Fat", "Regular"],
    sales:   [776319, 425363],
  },
  outletSize: {
    labels: ["Medium", "Small", "High"],
    sales:  [507908, 444794, 248980],
  },
  outletLocation: {
    labels: ["Tier 3", "Tier 2", "Tier 1"],
    sales:  [472134, 393151, 336397],
  },
  itemType: {
    labels: ["Fruits & Veg", "Snack Foods", "Household", "Frozen Foods",
             "Dairy", "Canned", "Baking Goods", "Health & Hygiene",
             "Soft Drinks", "Meat", "Breads", "Hard Drinks",
             "Others", "Starchy Foods", "Breakfast", "Seafood"],
    sales:  [178124, 175433, 135976, 118990, 100891, 90976,
             81006, 64029, 59167, 57098, 35385, 21150,
             20000, 17513, 15597, 9017],
  },
  establishment: {
    labels: ["1985","1987","1997","1998","1999","2001","2002","2004","2007","2009","2011","2018","2022"],
    sales:  [131448, 0, 54083, 132204, 0, 0, 131465, 0, 0, 131532, 0, 204522, 131482],
  },
  fatByOutlet: {
    labels:   ["Grocery Store", "Supermarket Type1", "Supermarket Type2", "Supermarket Type3"],
    lowFat:   [44819, 487148, 87370, 85396],
    regular:  [22285, 300401, 44108, 45325],
  },
  outletType: [
    { type: "Supermarket Type1", sales: "$787,549", items: 5577, avgSales: "$141.21", rating: 3.92, visibility: "0.060" },
    { type: "Grocery Store",     sales: "$151,940", items: 1083, avgSales: "$140.30", rating: 3.93, visibility: "0.100" },
    { type: "Supermarket Type2", sales: "$131,478", items:  928, avgSales: "$141.86", rating: 3.93, visibility: "0.066" },
    { type: "Supermarket Type3", sales: "$130,715", items:  935, avgSales: "$139.80", rating: 3.91, visibility: "0.065" },
  ],
};

const C = {
  accent:    "#ff5a5f",
  gold:      "#ffc857",
  blue:      "#60a5fa",
  green:     "#4ade80",
  purple:    "#a78bfa",
  teal:      "#2dd4bf",
  orange:    "#fb923c",
  pink:      "#f472b6",
  textMuted: "#a6b0c3",
  textMain:  "#f7f7ff",
  gridLine:  "rgba(255,255,255,0.06)",
  bg:        "rgba(10,16,32,0.0)",
};

const DONUT_COLORS  = [C.accent, C.gold, C.blue, C.green, C.purple, C.teal];
const BAR_COLORS    = [C.accent, C.gold, C.blue, C.green, C.purple, C.teal, C.orange, C.pink,
                       "#e879f9","#34d399","#fbbf24","#38bdf8","#f87171","#a3e635","#fb7185","#818cf8"];

Chart.defaults.color = C.textMuted;
Chart.defaults.font.family = "system-ui, -apple-system, 'Segoe UI', sans-serif";
Chart.defaults.font.size   = 12;

let chartsInitialised = false;

function buildDashboardCharts() {
  if (chartsInitialised) return;
  chartsInitialised = true;

  // ── FAT CONTENT donut ──────────────────────────────────────────────────
  new Chart(document.getElementById("chart-fat"), {
    type: "doughnut",
    data: {
      labels: BLINKIT.fatContent.labels,
      datasets: [{ data: BLINKIT.fatContent.sales, backgroundColor: [C.accent, C.gold],
                   borderWidth: 2, borderColor: "#0d1526" }],
    },
    options: { ...donutOpts() },
  });

  // ── OUTLET SIZE donut ──────────────────────────────────────────────────
  new Chart(document.getElementById("chart-size"), {
    type: "doughnut",
    data: {
      labels: BLINKIT.outletSize.labels,
      datasets: [{ data: BLINKIT.outletSize.sales, backgroundColor: [C.blue, C.teal, C.purple],
                   borderWidth: 2, borderColor: "#0d1526" }],
    },
    options: { ...donutOpts() },
  });

  // ── OUTLET LOCATION horizontal bar ────────────────────────────────────
  new Chart(document.getElementById("chart-location"), {
    type: "bar",
    data: {
      labels: BLINKIT.outletLocation.labels,
      datasets: [{
        data: BLINKIT.outletLocation.sales,
        backgroundColor: [C.green, C.teal, C.blue],
        borderRadius: 6,
      }],
    },
    options: {
      indexAxis: "y",
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: C.gridLine }, ticks: { callback: v => "$" + (v/1000).toFixed(0) + "K" } },
        y: { grid: { display: false } },
      },
    },
  });

  // ── ITEM TYPE horizontal bar ──────────────────────────────────────────
  new Chart(document.getElementById("chart-item-type"), {
    type: "bar",
    data: {
      labels: BLINKIT.itemType.labels,
      datasets: [{
        data: BLINKIT.itemType.sales,
        backgroundColor: BAR_COLORS,
        borderRadius: 5,
      }],
    },
    options: {
      indexAxis: "y",
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: C.gridLine }, ticks: { callback: v => "$" + (v/1000).toFixed(0) + "K" } },
        y: { grid: { display: false }, ticks: { font: { size: 11 } } },
      },
    },
  });

  // ── ESTABLISHMENT YEAR line ───────────────────────────────────────────
  new Chart(document.getElementById("chart-estab"), {
    type: "line",
    data: {
      labels: BLINKIT.establishment.labels,
      datasets: [{
        label: "Total Sales",
        data: BLINKIT.establishment.sales,
        borderColor: C.accent,
        backgroundColor: "rgba(255,90,95,0.15)",
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: C.accent,
        fill: true,
        tension: 0.4,
      }],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: C.gridLine } },
        y: { grid: { color: C.gridLine }, ticks: { callback: v => "$" + (v/1000).toFixed(0) + "K" } },
      },
    },
  });

  // ── FAT BY OUTLET grouped bar ─────────────────────────────────────────
  new Chart(document.getElementById("chart-fat-outlet"), {
    type: "bar",
    data: {
      labels: BLINKIT.fatByOutlet.labels,
      datasets: [
        { label: "Low Fat",  data: BLINKIT.fatByOutlet.lowFat,  backgroundColor: C.accent, borderRadius: 5 },
        { label: "Regular",  data: BLINKIT.fatByOutlet.regular, backgroundColor: C.gold,   borderRadius: 5 },
      ],
    },
    options: {
      plugins: { legend: { labels: { color: C.textMuted } } },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: C.gridLine }, ticks: { callback: v => "$" + (v/1000).toFixed(0) + "K" } },
      },
    },
  });

  // ── OUTLET TYPE table ─────────────────────────────────────────────────
  const tbl = document.getElementById("outlet-table");
  if (tbl) {
    const headers = ["Outlet Type", "Total Sales", "No. of Items", "Avg Sales", "Avg Rating", "Item Visibility"];
    tbl.innerHTML = `
      <thead>
        <tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>
      </thead>
      <tbody>
        ${BLINKIT.outletType.map(r => `
          <tr>
            <td>${r.type}</td>
            <td class="num">${r.sales}</td>
            <td class="num">${r.items.toLocaleString()}</td>
            <td class="num">${r.avgSales}</td>
            <td class="num">${r.rating}</td>
            <td class="num">${r.visibility}</td>
          </tr>`).join("")}
      </tbody>
    `;
  }
}

// ── Donut options helper ───────────────────────────────────────────────────
function donutOpts() {
  return {
    cutout: "68%",
    plugins: {
      legend: { position: "bottom", labels: { padding: 12, color: C.textMuted, boxWidth: 14 } },
    },
  };
}


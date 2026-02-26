/* ============================================================
   landing.js  –  intro animation + nav state for landing page
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  // Year
  const yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  // Nav: if logged in hide login/register, show dashboard/logout
  const navLogin    = document.getElementById("nav-login");
  const navRegister = document.getElementById("nav-register");
  const navDash     = document.getElementById("nav-dashboard");
  const navLogout   = document.getElementById("nav-logout");

  if (Tokens.isLoggedIn()) {
    navLogin?.classList.add("hidden");
    navRegister?.classList.add("hidden");
    navDash?.classList.remove("hidden");
    navLogout?.classList.remove("hidden");
  }

  navLogout?.addEventListener("click", (e) => { e.preventDefault(); doLogout(); });

  // Intro animation
  const overlay   = document.getElementById("intro-overlay");
  const doorScene = document.querySelector(".door-scene");

  if (overlay && doorScene) {
    setTimeout(() => doorScene.classList.add("intro-doors-open"),  800);
    setTimeout(() => doorScene.classList.add("intro-person-walk"), 1500);
    setTimeout(() => {
      overlay.classList.add("intro-fade-out");
      overlay.addEventListener("animationend", () => {
        overlay.style.display = "none";
      }, { once: true });
    }, 2600);
  }
});

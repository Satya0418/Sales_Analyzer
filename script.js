document.addEventListener("DOMContentLoaded", () => {
  const introOverlay = document.getElementById("intro-overlay");
  const siteRoot = document.getElementById("site-root");
  const doorScene = document.querySelector(".door-scene");
  const loginForm = document.getElementById("login-form");
  const loginError = document.getElementById("login-error");
  const dashboardSection = document.getElementById("dashboard");
  const yearSpan = document.getElementById("year");

  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Simple credentials for demo purposes
  const DEMO_EMAIL = "demo@bizanalytics.com";
  const DEMO_PASSWORD = "Biz@123";

  if (doorScene && introOverlay && siteRoot) {
    // Play door + person animation automatically after the slide-up
    setTimeout(() => {
      doorScene.classList.add("intro-doors-open");
    }, 800);

    setTimeout(() => {
      doorScene.classList.add("intro-person-walk");
    }, 1500);

    // Fade out the intro and reveal the site
    setTimeout(() => {
      introOverlay.classList.add("intro-fade-out");

      introOverlay.addEventListener(
        "animationend",
        () => {
          introOverlay.classList.add("hidden");
          siteRoot.classList.remove("hidden");
          window.location.hash = "#home";
        },
        { once: true }
      );
    }, 2600);
  }

  if (loginForm && dashboardSection) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(loginForm);
      const email = String(formData.get("email") || "").trim();
      const password = String(formData.get("password") || "");

      if (!email || !password) {
        loginError.textContent = "Please enter both email and password.";
        return;
      }

      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        loginError.textContent = "";
        dashboardSection.classList.remove("hidden");
        dashboardSection.scrollIntoView({ behavior: "smooth" });
      } else {
        loginError.textContent =
          "Incorrect credentials. Try demo@bizanalytics.com / Biz@123 (demo only).";
      }
    });
  }
});


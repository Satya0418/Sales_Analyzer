/* ============================================================
   dashboard.js  –  auth guard + user info + Blinkit charts
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  // Auth guard – redirect to login if no token
  if (!Tokens.isLoggedIn()) {
    window.location.href = "/login/";
    return;
  }

  const yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  // Show user info
  const user = Tokens.getUser();
  const nameEl = document.getElementById("dash-user-name");
  const roleEl = document.getElementById("dash-user-role");
  if (nameEl) nameEl.textContent = user?.full_name || user?.email || "User";
  if (roleEl) roleEl.textContent = capitalise(user?.role || "viewer");

  // Logout buttons
  document.getElementById("logout-btn")?.addEventListener("click", doLogout);
  document.getElementById("nav-logout")?.addEventListener("click", (e) => {
    e.preventDefault(); doLogout();
  });

  // Build charts
  buildCharts();
});

function capitalise(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

// ── Blinkit data (from BLINKIT (1).pbix) ──────────────────────────────────
const DATA = {
  fatContent:    { labels: ["Low Fat", "Regular"],   values: [776319, 425363] },
  outletSize:    { labels: ["Medium", "Small", "High"], values: [507908, 444794, 248980] },
  outletLocation:{ labels: ["Tier 3", "Tier 2", "Tier 1"], values: [472134, 393151, 336397] },
  itemType: {
    labels: ["Fruits & Veg","Snack Foods","Household","Frozen Foods","Dairy","Canned",
             "Baking Goods","Health & Hygiene","Soft Drinks","Meat","Breads",
             "Hard Drinks","Others","Starchy Foods","Breakfast","Seafood"],
    values: [178124,175433,135976,118990,100891,90976,81006,64029,
             59167,57098,35385,21150,20000,17513,15597,9017],
  },
  establishment: {
    labels: ["1985","1987","1997","1998","1999","2001","2002","2004","2007","2009","2011","2018","2022"],
    values: [131448,0,54083,132204,0,0,131465,0,0,131532,0,204522,131482],
  },
  fatByOutlet: {
    labels:  ["Grocery Store","Supermarket Type1","Supermarket Type2","Supermarket Type3"],
    lowFat:  [44819,487148,87370,85396],
    regular: [22285,300401,44108,45325],
  },
  outletType: [
    { type:"Supermarket Type1", sales:"$787,549", items:5577, avgSales:"$141.21", rating:3.92, visibility:"0.060" },
    { type:"Grocery Store",     sales:"$151,940", items:1083, avgSales:"$140.30", rating:3.93, visibility:"0.100" },
    { type:"Supermarket Type2", sales:"$131,478", items: 928, avgSales:"$141.86", rating:3.93, visibility:"0.066" },
    { type:"Supermarket Type3", sales:"$130,715", items: 935, avgSales:"$139.80", rating:3.91, visibility:"0.065" },
  ],
};

const C = {
  accent:"#ff5a5f", gold:"#ffc857", blue:"#60a5fa", green:"#4ade80",
  purple:"#a78bfa", teal:"#2dd4bf", orange:"#fb923c", pink:"#f472b6",
  muted:"#a6b0c3", main:"#f7f7ff", grid:"rgba(255,255,255,0.06)",
};
const PALETTE = [C.accent,C.gold,C.blue,C.green,C.purple,C.teal,C.orange,C.pink,
                 "#e879f9","#34d399","#fbbf24","#38bdf8","#f87171","#a3e635","#fb7185","#818cf8"];

Chart.defaults.color      = C.muted;
Chart.defaults.font.family = "system-ui,-apple-system,'Segoe UI',sans-serif";

function donutCfg(labels, values, colors) {
  return {
    type: "doughnut",
    data: { labels, datasets: [{ data: values, backgroundColor: colors,
                                  borderWidth: 2, borderColor: "#0d1526" }] },
    options: { cutout:"68%", plugins:{ legend:{ position:"bottom",
      labels:{ padding:12, boxWidth:14, color:C.muted } } } },
  };
}

function buildCharts() {
  // Fat Content
  new Chart(document.getElementById("chart-fat"),
    donutCfg(DATA.fatContent.labels, DATA.fatContent.values, [C.accent, C.gold]));

  // Outlet Size
  new Chart(document.getElementById("chart-size"),
    donutCfg(DATA.outletSize.labels, DATA.outletSize.values, [C.blue, C.teal, C.purple]));

  // Outlet Location (horizontal bar)
  new Chart(document.getElementById("chart-location"), {
    type: "bar",
    data: { labels: DATA.outletLocation.labels,
            datasets:[{ data:DATA.outletLocation.values,
                        backgroundColor:[C.green,C.teal,C.blue], borderRadius:6 }] },
    options:{ indexAxis:"y", plugins:{legend:{display:false}},
              scales:{ x:{grid:{color:C.grid}, ticks:{callback:v=>"$"+(v/1000).toFixed(0)+"K"}},
                       y:{grid:{display:false}} } },
  });

  // Item Type (horizontal bar)
  new Chart(document.getElementById("chart-item-type"), {
    type: "bar",
    data: { labels:DATA.itemType.labels,
            datasets:[{ data:DATA.itemType.values, backgroundColor:PALETTE, borderRadius:5 }] },
    options:{ indexAxis:"y", plugins:{legend:{display:false}},
              scales:{ x:{grid:{color:C.grid}, ticks:{callback:v=>"$"+(v/1000).toFixed(0)+"K"}},
                       y:{grid:{display:false}, ticks:{font:{size:11}}} } },
  });

  // Outlet Establishment (line)
  new Chart(document.getElementById("chart-estab"), {
    type: "line",
    data: { labels:DATA.establishment.labels,
            datasets:[{ label:"Total Sales", data:DATA.establishment.values,
                        borderColor:C.accent, backgroundColor:"rgba(255,90,95,0.15)",
                        borderWidth:2.5, pointRadius:4, pointBackgroundColor:C.accent,
                        fill:true, tension:0.4 }] },
    options:{ plugins:{legend:{display:false}},
              scales:{ x:{grid:{color:C.grid}},
                       y:{grid:{color:C.grid}, ticks:{callback:v=>"$"+(v/1000).toFixed(0)+"K"}} } },
  });

  // Fat by Outlet (grouped bar)
  new Chart(document.getElementById("chart-fat-outlet"), {
    type: "bar",
    data: { labels:DATA.fatByOutlet.labels,
            datasets:[
              { label:"Low Fat",  data:DATA.fatByOutlet.lowFat,  backgroundColor:C.accent, borderRadius:5 },
              { label:"Regular",  data:DATA.fatByOutlet.regular, backgroundColor:C.gold,   borderRadius:5 },
            ] },
    options:{ plugins:{legend:{labels:{color:C.muted}}},
              scales:{ x:{grid:{display:false}},
                       y:{grid:{color:C.grid}, ticks:{callback:v=>"$"+(v/1000).toFixed(0)+"K"}} } },
  });

  // Outlet type table
  const tbl = document.getElementById("outlet-table");
  if (tbl) {
    const headers = ["Outlet Type","Total Sales","No. of Items","Avg Sales","Avg Rating","Item Visibility"];
    tbl.innerHTML = `
      <thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead>
      <tbody>${DATA.outletType.map(r=>`
        <tr>
          <td>${r.type}</td>
          <td class="num">${r.sales}</td>
          <td class="num">${r.items.toLocaleString()}</td>
          <td class="num">${r.avgSales}</td>
          <td class="num">${r.rating}</td>
          <td class="num">${r.visibility}</td>
        </tr>`).join("")}
      </tbody>`;
  }
}

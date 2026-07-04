/* Barcelona Family Relocation Explorer — all state lives here, rendering is
   synchronous and cheap so the budget sliders feel instant. */
(function () {
  "use strict";

  var REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var OFFICE_DAYS = 3;
  var HIDDEN_COST_UPLIFT = 1.3;   // top-of-range +30% = conservative fee basis
  var TRANSACTION_COSTS = 1.10;   // purchase + ~10% ITP/notary

  var fmtEur = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  function eur(n) { return fmtEur.format(Math.round(n)); }
  function eurK(n) { return "€" + Math.round(n / 1000) + "k"; }

  /* ── Build the unified area list ─────────────────────────── */
  var AREAS = [];
  function commuteFields(id) {
    return {
      commuteGlovoMixed: DATA.commuteMinutesToGlovo[id],
      commuteGlovoBike: COMMUTE_EST.bikeToGlovo[id],
      commuteDanoneMixed: COMMUTE_EST.mixedToDanone[id],
      commuteDanoneBike: COMMUTE_EST.bikeToDanone[id]
    };
  }
  DATA.districts.forEach(function (d) {
    AREAS.push(Object.assign({}, d, commuteFields(d.id), {
      kind: "district",
      rent: DATA.monthlyRent150sqmEstimate[d.id],
      estimated: false
    }));
  });
  DATA.suburbs.forEach(function (s) {
    var range = SUBURB_PRICE_EST[s.id];
    var mid = (range[0] + range[1]) / 2;
    AREAS.push(Object.assign({}, s, commuteFields(s.id), {
      kind: "suburb",
      pricePerSqm: Math.round(mid),
      priceRange: range,
      price150sqm: Math.round(mid * 150 / 5000) * 5000,
      rent: DATA.monthlyRent150sqmEstimate[s.id],
      estimated: true
    }));
  });
  var AREA_BY_ID = {};
  AREAS.forEach(function (a) { AREA_BY_ID[a.id] = a; });

  /* Commute in the currently selected mode (bike is the family's main mode). */
  function commuteGlovo(a) { return state.mode === "bike" ? a.commuteGlovoBike : a.commuteGlovoMixed; }
  function commuteDanone(a) { return state.mode === "bike" ? a.commuteDanoneBike : a.commuteDanoneMixed; }
  function commuteAvg(a) { return (commuteGlovo(a) + commuteDanone(a)) / 2; }

  /* Composite fit score: weights school access and commute at 3 office
     days/week, using the average of the two HQ commutes in the current mode.
     Suburbs have no editorial ratings → commute-only score. */
  function composite(a) {
    var weeklyHours = commuteAvg(a) * 2 * OFFICE_DAYS / 60;
    var penalty = weeklyHours * 1.2;
    if (a.kind === "district") {
      return 3 * a.schoolAccess + a.green + a.bike + a.safety - penalty;
    }
    return -penalty;
  }
  /* Refresh mode-dependent per-area values (sort keys + score + halo colors). */
  function refreshCommutes() {
    AREAS.forEach(function (a) {
      a.commuteGlovo = commuteGlovo(a);
      a.commuteDanone = commuteDanone(a);
      a.commuteMain = commuteAvg(a);
      a.composite = composite(a);
      if (a._halo) a._halo.setStyle({ color: bandColor(a.commuteMain) });
      if (a._ring) a._ring.setStyle({ color: bandColor(a.commuteMain) });
    });
  }

  /* ── State ───────────────────────────────────────────────── */
  var state = {
    purchase: 900000,
    school: 18000,
    conservative: true,
    mode: "bike",            // family's main commute mode
    selectedId: null,
    shortlist: readShortlistFromHash(),
    sort: { key: "composite", dir: -1 }
  };

  function readShortlistFromHash() {
    var m = location.hash.match(/shortlist=([^&]*)/);
    var set = {};
    if (m) m[1].split(",").forEach(function (id) { if (AREA_BY_ID[id]) set[id] = true; });
    return set;
  }
  function writeShortlistToHash() {
    var ids = Object.keys(state.shortlist).filter(function (id) { return state.shortlist[id]; });
    var hash = ids.length ? "#shortlist=" + ids.join(",") : "";
    history.replaceState(null, "", hash || location.pathname + location.search);
  }

  function annualFee(school) {
    if (!school.feesPrimary) return null;
    return state.conservative
      ? Math.round(school.feesPrimary[1] * HIDDEN_COST_UPLIFT)
      : school.feesPrimary[0];
  }
  function fitsArea(a) { return a.price150sqm <= state.purchase; }
  function fitsSchool(s) { return annualFee(s) !== null && annualFee(s) <= state.school; }

  function bandColor(min) {
    return min <= 20 ? "#2e7d6b" : min <= 40 ? "#c07f14" : "#b04a3a";
  }
  function bandLabel(min) { return min <= 20 ? "≤20 min" : min <= 40 ? "21–40 min" : ">40 min"; }

  /* €/m² sequential ramp: warm stone → cobalt */
  var PRICE_MIN = 3220, PRICE_MAX = 6330;
  function lerp(a, b, t) { return a + (b - a) * t; }
  function priceColor(p) {
    var t = Math.max(0, Math.min(1, (p - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)));
    var from = [221, 211, 186], mid = [155, 152, 196], to = [31, 71, 196];
    var c = t < 0.5
      ? [lerp(from[0], mid[0], t * 2), lerp(from[1], mid[1], t * 2), lerp(from[2], mid[2], t * 2)]
      : [lerp(mid[0], to[0], (t - 0.5) * 2), lerp(mid[1], to[1], (t - 0.5) * 2), lerp(mid[2], to[2], (t - 0.5) * 2)];
    return "rgb(" + c.map(Math.round).join(",") + ")";
  }

  function kmBetween(a, b) {
    var dx = (a.lng - b.lng) * Math.cos((a.lat + b.lat) / 2 * Math.PI / 180);
    var dy = a.lat - b.lat;
    return Math.sqrt(dx * dx + dy * dy) * 111;
  }

  /* ── Map ─────────────────────────────────────────────────── */
  var HOME_BOUNDS = [[41.21, 1.75], [41.52, 2.34]];
  var map = L.map("map", { scrollWheelZoom: true, zoomAnimation: !REDUCED_MOTION });
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  map.fitBounds(HOME_BOUNDS);
  // If the container was mid-layout at init (wrong size → wrong zoom), refit
  // until the user takes over the map themselves.
  var userTookOver = false;
  map.on("dragstart zoomstart", function () { userTookOver = true; });
  function ensureFit() {
    if (userTookOver) { map.invalidateSize(); return; }
    userTookOver = false;
    map.invalidateSize();
    map.fitBounds(HOME_BOUNDS, { animate: false });
    userTookOver = false; // programmatic zoomstart above doesn't count
  }
  window.addEventListener("load", ensureFit);
  window.addEventListener("resize", function () { map.invalidateSize(); });
  requestAnimationFrame(ensureFit);

  L.marker([GLOVO_HQ.lat, GLOVO_HQ.lng], {
    icon: L.divIcon({ className: "", html: '<div class="hq-icon" title="Glovo HQ">G</div>', iconSize: [34, 34], iconAnchor: [17, 17] }),
    zIndexOffset: 1000,
    keyboard: true,
    alt: "Glovo HQ, Carrer de Pallars 190"
  }).addTo(map).bindPopup(
    '<p class="popup-name">Glovo HQ</p>' + GLOVO_HQ.address + "<br>Commute anchor · 3 office days/week"
  );

  L.marker([DANONE_HQ.lat, DANONE_HQ.lng], {
    icon: L.divIcon({ className: "", html: '<div class="hq-icon hq-danone" title="Danone HQ">D</div>', iconSize: [34, 34], iconAnchor: [17, 17] }),
    zIndexOffset: 1000,
    keyboard: true,
    alt: "Danone HQ, Carrer de Buenos Aires 21"
  }).addTo(map).bindPopup(
    '<p class="popup-name">Danone HQ</p>' + DANONE_HQ.address + "<br>Second commute anchor"
  );

  var bandLayer = L.layerGroup().addTo(map);
  var suburbLayer = L.layerGroup().addTo(map);
  var schoolLayer = L.layerGroup().addTo(map);
  var districtLayer = L.layerGroup().addTo(map);

  var areaMarkers = {};
  AREAS.forEach(function (a) {
    // Commute-band halo ring (the "commute bands" layer — data-driven, no routing)
    var halo = L.circleMarker([a.lat, a.lng], {
      radius: 19, weight: 4, color: "#999",
      opacity: 0.55, fill: false, interactive: false
    });
    halo.addTo(bandLayer);
    a._halo = halo;   // color set by refreshCommutes()

    var marker = L.circleMarker([a.lat, a.lng], {
      radius: a.kind === "district" ? 13 : 11,
      weight: a.kind === "district" ? 2 : 2.5,
      color: "#26221b",
      dashArray: a.kind === "suburb" ? "4 4" : null,
      fillColor: priceColor(a.pricePerSqm),
      fillOpacity: 0.9
    });
    marker.bindTooltip(a.name + " · " + eurK(a.price150sqm) + (a.estimated ? " (est.)" : ""), { direction: "top", offset: [0, -12] });
    marker.on("click", function () { selectArea(a.id, { fromMap: true }); });
    marker.addTo(a.kind === "district" ? districtLayer : suburbLayer);

    if (a.kind === "suburb") {
      // dashed commute-ring hint around out-of-city areas
      var ring = L.circle([a.lat, a.lng], {
        radius: 2500, weight: 1.5, color: "#999",
        dashArray: "6 6", fill: false, opacity: 0.5, interactive: false
      });
      ring.addTo(suburbLayer);
      a._ring = ring;   // color set by refreshCommutes()
    }
    areaMarkers[a.id] = marker;
  });

  var schoolMarkers = [];
  DATA.schools.forEach(function (s) {
    var glyph = s.preferred ? "★" : (s.type === "international" ? "▲" : "●");
    var cls = s.preferred ? "pref" : (s.type === "international" ? "intl" : "bili");
    var marker = L.marker([s.lat, s.lng], {
      icon: L.divIcon({
        className: "",
        html: '<div class="school-badge ' + cls + '">' + glyph + "</div>",
        iconSize: [22, 28], iconAnchor: [11, 28], popupAnchor: [0, -24]
      }),
      zIndexOffset: s.preferred ? 500 : 0,
      keyboard: true,
      alt: s.name
    });
    marker.bindPopup(function () {
      var fee = annualFee(s);
      return '<p class="popup-name">' + s.name + "</p>" +
        (s.preferred ? '<strong style="color:var(--gold)">★ Preferred school</strong><br>' : "") +
        s.curriculum + " · " + s.type + "<br>" +
        '<span class="popup-fee">' + feeText(s) + "</span><br>" +
        (s.notes ? s.notes + "<br>" : "") +
        (fee !== null ? "Budget basis: " + eur(fee) + "/yr (" + (state.conservative ? "conservative" : "optimistic") + ")<br>" : "") +
        '<span class="popup-verify">Map position approximate — verify address before visiting.</span>';
    });
    marker.addTo(schoolLayer);
    schoolMarkers.push({ school: s, marker: marker });
  });

  function feeText(s) {
    var parts = [];
    if (s.feesPrimary) parts.push("Primary " + eurK(s.feesPrimary[0]) + "–" + eurK(s.feesPrimary[1]));
    parts.push(s.feesSecondary ? "Secondary " + eurK(s.feesSecondary[0]) + "–" + eurK(s.feesSecondary[1]) : "primary only");
    return parts.join(" · ");
  }

  /* ── Table ───────────────────────────────────────────────── */
  var tbodyDistricts = document.getElementById("tbody-districts");
  var tbodySuburbs = document.getElementById("tbody-suburbs");

  function dots(n) {
    if (n == null) return "—";
    var html = '<span class="mini-dots" role="img" aria-label="' + n + ' of 5">';
    for (var i = 1; i <= 5; i++) html += '<span class="dot' + (i <= n ? " on" : "") + '"></span>';
    return html + "</span>";
  }

  function sortAreas(list) {
    var k = state.sort.key, dir = state.sort.dir;
    return list.slice().sort(function (a, b) {
      var va = a[k], vb = b[k];
      if (k === "name") return dir * String(va).localeCompare(vb);
      if (va == null) return 1;
      if (vb == null) return -1;
      return dir * (va - vb);
    });
  }

  function buildSection(tbody, list, heading) {
    tbody.innerHTML = "";
    var hr = document.createElement("tr");
    hr.innerHTML = '<th class="section-head" colspan="13" scope="colgroup">' + heading + "</th>";
    tbody.appendChild(hr);

    sortAreas(list).forEach(function (a) {
      var tr = document.createElement("tr");
      tr.className = "area-row";
      tr.dataset.id = a.id;
      tr.tabIndex = 0;
      var est = a.estimated ? ' <span class="est-mark" title="Editorial estimate — verify on idealista">~</span>' : "";
      tr.innerHTML =
        '<td class="cell-star"><button type="button" class="star-btn" data-star="' + a.id + '" aria-label="Shortlist ' + a.name + '">★</button></td>' +
        '<td class="cell-name" data-th="Area">' + a.name + est + "</td>" +
        '<td class="num" data-th="€/m²">' + eur(a.pricePerSqm) + "</td>" +
        '<td class="num" data-th="150 m² price">' + eur(a.price150sqm) + "</td>" +
        '<td class="num" data-th="Rent /mo">' + eur(a.rent) + "</td>" +
        '<td class="num" data-th="Glovo"><span class="commute-pill" style="background:' + bandColor(a.commuteGlovo) + '">' + a.commuteGlovo + "′</span></td>" +
        '<td class="num" data-th="Danone"><span class="commute-pill" style="background:' + bandColor(a.commuteDanone) + '">' + a.commuteDanone + "′</span></td>" +
        '<td class="cell-vibe" data-th="Vibe">' + a.vibe + "</td>" +
        '<td class="num" data-th="Green">' + dots(a.green) + "</td>" +
        '<td class="num" data-th="Bike">' + dots(a.bike) + "</td>" +
        '<td class="num" data-th="Schools">' + (a.kind === "district" ? dots(a.schoolAccess) : (a.schools || []).join("; ")) + "</td>" +
        '<td class="num cell-score" data-th="Fit score">' + a.composite.toFixed(1) + "</td>" +
        '<td class="cell-notes" data-th="Notes">' + (a.notes || "—") + "</td>";
      tr.addEventListener("click", function (ev) {
        if (ev.target.closest(".star-btn")) return;
        selectArea(a.id, { fly: true });
      });
      tr.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); selectArea(a.id, { fly: true }); }
      });
      tbody.appendChild(tr);
    });
  }

  function buildTable() {
    buildSection(tbodyDistricts, AREAS.filter(function (a) { return a.kind === "district"; }), "Barcelona districts");
    buildSection(tbodySuburbs, AREAS.filter(function (a) { return a.kind === "suburb"; }), "Outside the city (€/m² estimated — verify)");
  }

  document.querySelectorAll("thead button[data-sort]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.dataset.sort;
      if (state.sort.key === key) state.sort.dir *= -1;
      else state.sort = { key: key, dir: key === "name" ? 1 : -1 };
      document.querySelectorAll("thead th").forEach(function (th) { th.removeAttribute("aria-sort"); });
      btn.closest("th").setAttribute("aria-sort", state.sort.dir === 1 ? "ascending" : "descending");
      buildTable();
      render();
    });
  });

  /* ── Side panel ──────────────────────────────────────────── */
  var panel = document.getElementById("panel");

  function schoolsForArea(a) {
    var result = [];
    if (a.kind === "district") {
      DATA.schools.forEach(function (s) { if (s.district === a.id) result.push({ school: s, km: kmBetween(a, s) }); });
      var others = DATA.schools
        .filter(function (s) { return s.district !== a.id; })
        .map(function (s) { return { school: s, km: kmBetween(a, s) }; })
        .sort(function (x, y) { return x.km - y.km; });
      while (result.length < 3 && others.length) result.push(others.shift());
    } else {
      (a.schools || []).forEach(function (name) {
        var match = DATA.schools.filter(function (s) {
          return name.toLowerCase().indexOf(s.name.split(" (")[0].toLowerCase().slice(0, 12)) !== -1 ||
                 s.name.toLowerCase().indexOf(name.split(" (")[0].toLowerCase().slice(0, 12)) !== -1;
        })[0];
        result.push(match ? { school: match, km: kmBetween(a, match) } : { unlisted: name });
      });
    }
    return result;
  }

  function ratingRow(label, n) {
    var html = '<div class="rating-row"><span class="rating-label">' + label + '</span><span class="dots" role="img" aria-label="' + label + " " + n + ' of 5">';
    for (var i = 1; i <= 5; i++) html += '<span class="dot' + (i <= n ? " on" : "") + '"></span>';
    return html + "</span></div>";
  }

  function renderPanel() {
    panel.hidden = false;
    if (!state.selectedId) {
      panel.innerHTML = '<p class="panel-empty">Click an area on the map — or a row in the table below — to see its full profile: prices, ratings, nearby schools and a 5-year buy-vs-rent sketch.</p>';
      return;
    }
    var a = AREA_BY_ID[state.selectedId];

    var fit = fitsArea(a);
    var schools = schoolsForArea(a);
    var estNote = a.estimated
      ? '<span class="est-flag">~ est. ' + eurK(a.priceRange[0] * 150) + "–" + eurK(a.priceRange[1] * 150) + " · verify</span>"
      : "";

    var html =
      '<div class="panel-head"><div><h3>' + a.name + "</h3>" +
      (a.tier ? '<span class="tier">' + a.tier + "</span>" : '<span class="tier">out of city · ' + a.distanceKm + " km</span>") +
      '</div><button type="button" class="star-btn' + (state.shortlist[a.id] ? " on" : "") + '" data-star="' + a.id + '" aria-pressed="' + !!state.shortlist[a.id] + '" aria-label="Shortlist ' + a.name + '">★</button></div>' +
      '<p class="vibe">' + a.vibe + "</p>" +
      '<div class="stat-grid">' +
      '<div class="stat"><span class="stat-label">€/m²' + (a.estimated ? " (est.)" : "") + '</span><span class="stat-value">' + eur(a.pricePerSqm) + "</span></div>" +
      '<div class="stat"><span class="stat-label">150 m² purchase</span><span class="stat-value ' + (fit ? "in" : "over") + '">' + eur(a.price150sqm) + "</span>" + estNote + "</div>" +
      '<div class="stat"><span class="stat-label">Rent 150 m² /mo</span><span class="stat-value">' + eur(a.rent) + "</span></div>" +
      '<div class="stat"><span class="stat-label">Avg commute (' + state.mode + ')</span><span class="stat-value" style="color:' + bandColor(a.commuteMain) + '">' + Math.round(a.commuteMain) + " min</span><span class=\"est-flag\">" + bandLabel(a.commuteMain) + "</span></div>" +
      '<div class="stat"><span class="stat-label">' + (state.mode === "bike" ? "Bike" : "Mixed") + ' → Glovo</span><span class="stat-value" style="color:' + bandColor(a.commuteGlovo) + '">' + a.commuteGlovo + " min</span><span class=\"est-flag\">" + (state.mode === "bike" ? "mixed: " + a.commuteGlovoMixed : "bike: " + a.commuteGlovoBike) + " min</span></div>" +
      '<div class="stat"><span class="stat-label">' + (state.mode === "bike" ? "Bike" : "Mixed") + ' → Danone</span><span class="stat-value" style="color:' + bandColor(a.commuteDanone) + '">' + a.commuteDanone + " min</span><span class=\"est-flag\">" + (state.mode === "bike" ? "mixed: " + a.commuteDanoneMixed : "bike: " + a.commuteDanoneBike) + " min</span></div>" +
      "</div>";

    if (a.kind === "district") {
      html += '<div class="ratings">' +
        ratingRow("Green", a.green) + ratingRow("Bike", a.bike) +
        ratingRow("Schools", a.schoolAccess) + ratingRow("Safety", a.safety) + "</div>";
    }
    if (a.notes) html += "<h4>Notes</h4><p>" + a.notes + "</p>";

    html += "<h4>Schools in / near this area</h4><ul class=\"school-list\">";
    schools.forEach(function (item) {
      if (item.unlisted) {
        html += '<li><span class="s-name">' + item.unlisted + '</span><br><span class="s-meta">not fee-profiled in this dataset</span></li>';
      } else {
        var s = item.school, fee = annualFee(s);
        html += '<li><span class="s-name">' + (s.preferred ? "★ " : "") + s.name + "</span>" +
          (s.preferred ? '<span class="badge pref">preferred</span>' : "") +
          (fitsSchool(s) ? '<span class="badge fits">fits budget</span>' : '<span class="badge over">' + eur(fee) + "/yr</span>") +
          '<br><span class="s-meta">' + s.curriculum + " · " + feeText(s) + " · ~" + item.km.toFixed(1) + " km</span></li>";
      }
    });
    html += "</ul>";

    // 5-year total-cost sketch
    var profiled = DATA.schools
      .map(function (s) { return { school: s, km: kmBetween(a, s) }; })
      .sort(function (x, y) { return x.km - y.km; });
    html += '<h4>5-year cost sketch</h4><div class="cost-sketch">' +
      '<label class="visually-hidden" for="sketch-school">School for cost sketch</label>' +
      '<select id="sketch-school">' +
      profiled.map(function (p, i) {
        return '<option value="' + i + '">' + (p.school.preferred ? "★ " : "") + p.school.name + " (~" + p.km.toFixed(1) + " km)</option>";
      }).join("") + "</select>" +
      '<div class="cost-cols" id="cost-cols"></div>' +
      '<p class="sketch-note">A sketch, not a financial model: buy = price + ~10% ITP/notary + 5 yrs primary tuition (' +
      (state.conservative ? "top of range +30% extras" : "bottom of range, no uplift") +
      "); rent = 60 months + same tuition. No mortgage, no appreciation.</p></div>";

    panel.innerHTML = html;

    var select = panel.querySelector("#sketch-school");
    // Default the sketch to the preferred school (Lycée Français) if profiled
    for (var pi = 0; pi < profiled.length; pi++) {
      if (profiled[pi].school.preferred) { select.value = String(pi); break; }
    }
    function renderSketch() {
      var s = profiled[+select.value].school;
      var fee5 = (annualFee(s) || 0) * 5;
      var buy = a.price150sqm * TRANSACTION_COSTS + fee5;
      var rent = a.rent * 60 + fee5;
      panel.querySelector("#cost-cols").innerHTML =
        '<div class="cost-col"><span class="cost-title">Buy</span><p class="cost-total">' + eur(buy) + '</p>' +
        '<span class="cost-breakdown">' + eur(a.price150sqm) + " +10% costs + " + eur(fee5) + " school</span></div>" +
        '<div class="cost-col"><span class="cost-title">Rent</span><p class="cost-total">' + eur(rent) + '</p>' +
        '<span class="cost-breakdown">' + eur(a.rent) + " × 60 mo + " + eur(fee5) + " school</span></div>";
    }
    select.addEventListener("change", renderSketch);
    renderSketch();
  }

  /* ── Selection & shortlist ───────────────────────────────── */
  function selectArea(id, opts) {
    opts = opts || {};
    state.selectedId = id;
    var a = AREA_BY_ID[id];
    if (opts.fly) {
      if (REDUCED_MOTION) map.setView([a.lat, a.lng], 13);
      else map.flyTo([a.lat, a.lng], 13, { duration: 0.9 });
    }
    renderPanel();
    render();
    if (opts.fly && window.innerWidth <= 900) {
      panel.scrollIntoView({ behavior: REDUCED_MOTION ? "auto" : "smooth", block: "nearest" });
    }
    if (opts.fromMap && window.innerWidth <= 900) {
      panel.scrollIntoView({ behavior: REDUCED_MOTION ? "auto" : "smooth", block: "nearest" });
    }
  }

  document.addEventListener("click", function (ev) {
    var btn = ev.target.closest("[data-star]");
    if (!btn) return;
    var id = btn.dataset.star;
    state.shortlist[id] = !state.shortlist[id];
    writeShortlistToHash();
    if (state.selectedId === id) renderPanel();
    render();
  });

  window.addEventListener("hashchange", function () {
    state.shortlist = readShortlistFromHash();
    if (state.selectedId) renderPanel();
    render();
  });

  /* ── Layer toggles ───────────────────────────────────────── */
  function bindLayer(checkboxId, layer) {
    document.getElementById(checkboxId).addEventListener("change", function (ev) {
      if (ev.target.checked) map.addLayer(layer);
      else map.removeLayer(layer);
    });
  }
  bindLayer("layer-schools", schoolLayer);
  bindLayer("layer-suburbs", suburbLayer);
  bindLayer("layer-bands", bandLayer);

  /* ── Budget controls ─────────────────────────────────────── */
  var purchaseInput = document.getElementById("budget-purchase");
  var schoolInput = document.getElementById("budget-school");
  purchaseInput.addEventListener("input", function () {
    state.purchase = +purchaseInput.value;
    document.getElementById("budget-purchase-out").textContent = eur(state.purchase);
    render();
  });
  schoolInput.addEventListener("input", function () {
    state.school = +schoolInput.value;
    document.getElementById("budget-school-out").textContent = eur(state.school);
    render();
  });

  var btnCons = document.getElementById("fee-conservative");
  var btnOpt = document.getElementById("fee-optimistic");
  function setFeeMode(conservative) {
    state.conservative = conservative;
    btnCons.setAttribute("aria-pressed", conservative);
    btnOpt.setAttribute("aria-pressed", !conservative);
    if (state.selectedId) renderPanel();
    render();
  }
  btnCons.addEventListener("click", function () { setFeeMode(true); });
  btnOpt.addEventListener("click", function () { setFeeMode(false); });

  var btnBike = document.getElementById("mode-bike");
  var btnMixed = document.getElementById("mode-mixed");
  function setMode(mode) {
    state.mode = mode;
    btnBike.setAttribute("aria-pressed", String(mode === "bike"));
    btnMixed.setAttribute("aria-pressed", String(mode === "mixed"));
    refreshCommutes();
    buildTable();
    if (state.selectedId) renderPanel();
    render();
  }
  btnBike.addEventListener("click", function () { setMode("bike"); });
  btnMixed.addEventListener("click", function () { setMode("mixed"); });

  /* ── Render: budget highlighting across all three views ─── */
  function render() {
    var fitCount = 0;
    AREAS.forEach(function (a) {
      var fit = fitsArea(a);
      if (fit) fitCount++;
      var m = areaMarkers[a.id];
      m.setStyle({
        fillOpacity: fit ? 0.9 : 0.18,
        opacity: fit ? 1 : 0.3,
        weight: state.selectedId === a.id ? 4 : (a.kind === "district" ? 2 : 2.5),
        color: state.selectedId === a.id ? "#1f47c4" : "#26221b"
      });
      a._halo.setStyle({ opacity: fit ? 0.55 : 0.12 });
    });

    var schoolFits = 0;
    schoolMarkers.forEach(function (item) {
      var el = item.marker.getElement();
      if (!el) return;
      var pin = el.querySelector(".school-badge");
      var fits = fitsSchool(item.school);
      if (fits) schoolFits++;
      pin.classList.toggle("dim", !fits);
    });

    document.querySelectorAll("tr.area-row").forEach(function (tr) {
      var a = AREA_BY_ID[tr.dataset.id];
      tr.classList.toggle("unfit", !fitsArea(a));
      tr.classList.toggle("selected", state.selectedId === a.id);
      var star = tr.querySelector(".star-btn");
      star.classList.toggle("on", !!state.shortlist[a.id]);
      star.setAttribute("aria-pressed", !!state.shortlist[a.id]);
    });

    document.getElementById("fit-count").textContent =
      fitCount + " of " + AREAS.length + " areas · " + schoolFits + " of " + DATA.schools.length + " schools fit the budget";
  }

  /* ── Boot ────────────────────────────────────────────────── */
  document.querySelector('thead button[data-sort="composite"]').closest("th").setAttribute("aria-sort", "descending");
  refreshCommutes();
  buildTable();
  renderPanel();
  render();
})();

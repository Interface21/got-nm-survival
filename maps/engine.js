/* ================= Map engine =================
   วาดแผนที่จาก window.MAPS[id] แล้วจัดการลำดับการเกิด + สีออร่าของแต่ละเวฟ
   ไฟล์ด่าน (hidden_temple.js ฯลฯ) มีแค่ผังจุดเกิด ภาพ และข้อมูลตัวอย่าง */
(() => {
"use strict";

const MAP_ORDER = ["hidden_temple", "river_village", "frozen_valley", "broken_castle"];
const MAPS = window.MAPS || {};

/* สีออร่า — ตรงกับ auraColors ใน index.html หลัก (bg-orange-500 / bg-blue-500 / bg-green-500) */
const AURA = [
  { id: "orange", hex: "#f97316", th: "ส้ม" },
  { id: "blue",   hex: "#3b82f6", th: "ฟ้า" },
  { id: "green",  hex: "#22c55e", th: "เขียว" }
];
const auraOf = id => AURA.find(a => a.id === id) || { hex: "var(--spawn)", th: id };

const WAVES = ["1.1", "1.2", "1.3", "2.1", "2.2", "2.3", "3.1", "3.2", "3.3", "4.1", "4.2", "4.3"];
const slotMax   = w => (w === 4 ? 4 : 3);   // จำนวนลำดับต่อเวฟ
const colorMax  = w => (w === 4 ? 2 : 1);   // สีต่อลำดับ (เหมือน maxColors ใน index.html หลัก)
const repeatMax = w => (w === 4 ? 3 : 2);   // จุดเดียวลงได้กี่ลำดับ

const SVGNS = "http://www.w3.org/2000/svg";
const el = (n, a = {}) => { const e = document.createElementNS(SVGNS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };
const $ = id => document.getElementById(id);

let mapId = null, M = null;
const DATA = {};              // DATA[mapId][wave] = ["Loc@L:orange", "", ...] — index = ลำดับ
let sel = "1.1";
let focus = null;             // จุดที่เปิด popup อยู่

const cur = () => DATA[mapId][sel];
const waveNo = () => +sel[0];
const key = (loc, sp) => loc + "@" + sp;

function nameOf(k) {
  const at = k.indexOf("@");
  const L = M.locs[k.slice(0, at)];
  return { L, sp: L.spawns.find(s => s.id === k.slice(at + 1)) };
}

/* "Cemetery@L:orange,blue" <-> { k: "Cemetery@L", colors: [...] } · "" = ลำดับว่าง */
function parseEntry(raw) {
  if (!raw) return null;
  const [k, c] = raw.split(":");
  return { k, colors: c ? c.split(",").filter(Boolean) : [] };
}
const buildEntry = e => e.k + (e.colors.length ? ":" + e.colors.join(",") : "");
const ordersOf = k => cur().reduce((acc, raw, i) => (parseEntry(raw)?.k === k ? [...acc, i] : acc), []);

/* อาเรย์ทุกเวฟยาวเท่าจำนวนลำดับเสมอ ลำดับจะได้ไม่เลื่อน */
function normalize(sample = {}) {
  const out = {};
  WAVES.forEach(id => {
    const a = sample[id] || [];
    out[id] = Array.from({ length: slotMax(+id[0]) }, (_, i) => a[i] || "");
  });
  return out;
}

let toastTimer = null;
function toast(msg) {
  const t = $("toast"); t.textContent = msg; t.classList.add("on");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("on"), 1800);
}
const buzz = ms => { if (navigator.vibrate) navigator.vibrate(ms); };
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ================= ฉากประกอบ ================= */
function drawTrees() {
  const g = $("woods");
  g.textContent = "";
  const style = M.trees?.style || "round";
  (M.trees?.list || []).forEach(([x, y, r]) => {
    g.appendChild(el("ellipse", { cx: x, cy: y + r * .8, rx: r * .85, ry: r * .32, fill: "var(--forest3)", opacity: ".4" }));

    if (style === "pine") {
      g.appendChild(el("rect", { x: x - 1.5, y: y + r * .1, width: 3, height: r * .75, fill: "var(--trunk)" }));
      g.appendChild(el("path", { d: `M${x},${y - r * .5} L${x + r * 1.1},${y + r * .85} L${x - r * 1.1},${y + r * .85} Z`, fill: "var(--forest2)" }));
      g.appendChild(el("path", { d: `M${x},${y - r * 1.25} L${x + r * .9},${y + r * .3} L${x - r * .9},${y + r * .3} Z`, fill: "var(--forest)" }));
      g.appendChild(el("path", { d: `M${x},${y - r * 1.25} L${x + r * .38},${y - r * .62} L${x - r * .38},${y - r * .62} Z`, fill: "var(--snow2)", opacity: ".9" }));
    } else if (style === "burnt") {
      g.appendChild(el("path", { d: `M${x},${y + r * .8} V${y - r * .45}`, stroke: "var(--trunk)", "stroke-width": r * .34, "stroke-linecap": "round", fill: "none" }));
      g.appendChild(el("path", {
        d: `M${x},${y - r * .05} l${-r * .75},${-r * .6} M${x},${y - r * .3} l${r * .7},${-r * .75} M${x},${y - r * .45} l${-r * .15},${-r * .75}`,
        stroke: "var(--trunk)", "stroke-width": r * .16, "stroke-linecap": "round", fill: "none"
      }));
      [[-r * .78, -r * .68], [r * .72, -r * .82], [-r * .15, -r * 1.22]].forEach(([dx, dy]) =>
        g.appendChild(el("circle", { cx: x + dx, cy: y + dy, r: r * .28, fill: "var(--blossom)", opacity: ".85" })));
    } else {
      g.appendChild(el("rect", { x: x - 1.4, y: y, width: 2.8, height: r * .8, fill: "var(--trunk)" }));
      g.appendChild(el("circle", { cx: x, cy: y, r: r, fill: "var(--forest)" }));
      g.appendChild(el("circle", { cx: x - r * .3, cy: y - r * .25, r: r * .6, fill: "var(--forest2)", opacity: ".8" }));
      g.appendChild(el("circle", { cx: x + r * .35, cy: y + r * .2, r: r * .45, fill: "var(--forest3)", opacity: ".55" }));
    }
  });
}

/* ถนนจากจุดเกิดเข้าหาสถานที่ — สร้างจากพิกัดอัตโนมัติ */
function drawRoads() {
  const g = $("roads");
  g.textContent = "";
  for (const locId in M.locs) {
    const L = M.locs[locId];
    L.spawns.forEach(sp => {
      const mx = (sp.x + L.x) / 2 + (L.y - sp.y) * .12;
      const my = (sp.y + L.y) / 2 + (sp.x - L.x) * .12;
      const d = `M${sp.x},${sp.y} Q${mx},${my} ${L.x},${L.y}`;
      g.appendChild(el("path", { d, fill: "none", stroke: "var(--path)", "stroke-width": 11, "stroke-linecap": "round", opacity: ".85" }));
      g.appendChild(el("path", { d, fill: "none", stroke: "var(--path2)", "stroke-width": 6, "stroke-linecap": "round", opacity: ".9" }));
    });
  }
}

function drawRocks() {
  const g = $("rocks");
  g.textContent = "";
  (M.rocks || []).forEach(([x, y, r]) => {
    g.appendChild(el("ellipse", { cx: x, cy: y + r * .5, rx: r * 1.1, ry: r * .45, fill: "var(--stonedark)", opacity: ".35" }));
    g.appendChild(el("ellipse", { cx: x, cy: y, rx: r * 1.2, ry: r, fill: "var(--stone2)" }));
    g.appendChild(el("ellipse", { cx: x - r * .3, cy: y - r * .3, rx: r * .6, ry: r * .45, fill: "var(--stone)", opacity: ".9" }));
  });
}

function drawZones() {
  const g = $("layer-zones");
  g.textContent = "";
  for (const locId in M.locs) {
    const L = M.locs[locId];
    g.appendChild(el("circle", {
      cx: L.x, cy: L.y, r: 46, fill: "var(--text)", "fill-opacity": ".05",
      stroke: "var(--muted)", "stroke-width": 1.8, "stroke-dasharray": "5 5", "stroke-opacity": ".6"
    }));
    // ชื่อสถานที่อยู่ในวง ช่วงล่าง — ตัวอักษรมีขอบเข้ม อ่านออกทับภาพอาคาร
    const t = el("text", {
      x: L.x, y: L.y + 31, "text-anchor": "middle",
      "font-size": 12.5, "font-weight": 800, fill: "#fff",
      stroke: "rgba(15,23,42,.85)", "stroke-width": 4, "paint-order": "stroke", "stroke-linejoin": "round",
      "pointer-events": "none"
    });
    t.textContent = L.name.en;
    g.appendChild(t);
  }
}

/* ================= จุดเกิด ================= */
const segFill = colors => colors.length ? auraOf(colors[0]).hex : (M.hasAura ? "var(--spawn)" : "var(--accent)");

/* หมุดมีเลขลำดับ — ลำดับเดียว = วงกลม · หลายลำดับ = แคปซูลแบ่งช่อง ช่องละสี (2 สีแบ่งบน/ล่าง) */
function drawBadge(node, sp, segs, uid) {
  const H = 32, SW = 27;
  const w = segs.length === 1 ? H : SW * segs.length + 6;
  const x0 = Math.min(Math.max(sp.x - w / 2, -14), 414 - w);
  const y0 = sp.y - H / 2, rx = H / 2, segW = w / segs.length;
  const colorsOf = s => (M.hasAura ? s.colors : []);

  node.appendChild(el("rect", {
    x: x0 - 6, y: y0 - 6, width: w + 12, height: H + 12, rx: rx + 6,
    fill: segFill(colorsOf(segs[0])), "fill-opacity": ".28"
  }));

  const clipId = "clip-" + uid;
  const cp = el("clipPath", { id: clipId });
  cp.appendChild(el("rect", { x: x0, y: y0, width: w, height: H, rx }));
  node.appendChild(cp);

  const body = el("g", { "clip-path": `url(#${clipId})` });
  segs.forEach((s, i) => {
    const sx = x0 + i * segW, cs = colorsOf(s);
    if (cs.length === 2) {
      body.appendChild(el("rect", { x: sx, y: y0, width: segW, height: H / 2, fill: auraOf(cs[0]).hex }));
      body.appendChild(el("rect", { x: sx, y: y0 + H / 2, width: segW, height: H / 2, fill: auraOf(cs[1]).hex }));
    } else {
      body.appendChild(el("rect", { x: sx, y: y0, width: segW, height: H, fill: segFill(cs) }));
    }
    if (i > 0) body.appendChild(el("line", { x1: sx, y1: y0, x2: sx, y2: y0 + H, stroke: "var(--panel)", "stroke-width": 2.5 }));
  });
  node.appendChild(body);
  node.appendChild(el("rect", { x: x0, y: y0, width: w, height: H, rx, fill: "none", stroke: "var(--panel)", "stroke-width": 3.5 }));

  segs.forEach((s, i) => {
    const t = el("text", {
      x: x0 + i * segW + segW / 2, y: sp.y + 6.2, "text-anchor": "middle",
      "font-size": 17, "font-weight": 800, fill: "#fff",
      stroke: "rgba(0,0,0,.45)", "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round",
      "pointer-events": "none"
    });
    t.textContent = s.n;
    node.appendChild(t);
  });
  return { x0, y0, w, H };
}

function drawSpawns() {
  const g = $("layer-spawns");
  g.textContent = "";
  const slots = cur();
  for (const locId in M.locs) {
    const L = M.locs[locId];
    L.spawns.forEach(sp => {
      const k = key(locId, sp.id);
      const segs = [];
      slots.forEach((raw, i) => {
        const e = parseEntry(raw);
        if (e && e.k === k) segs.push({ n: i + 1, colors: e.colors });
      });

      const node = el("g", { class: "spawn", role: "button", tabindex: "0", "aria-haspopup": "dialog" });
      node.setAttribute("aria-label",
        `${L.name.th} ${sp.name.th}` + (segs.length ? ` — ลำดับ ${segs.map(s => s.n).join(", ")}` : ""));

      let box;
      if (segs.length) {
        box = drawBadge(node, sp, segs, `${locId}-${sp.id}`.replace(/[^\w-]/g, "_"));
      } else {
        node.appendChild(el("circle", {
          cx: sp.x, cy: sp.y, r: 10, fill: "var(--spawn)", "fill-opacity": ".4",
          stroke: "var(--spawn)", "stroke-width": 2.5, "stroke-opacity": ".75"
        }));
        box = { x0: sp.x - 16, y0: sp.y - 16, w: 32, H: 32 };
      }

      if (focus === k) {
        node.appendChild(el("rect", {
          x: box.x0 - 10, y: box.y0 - 10, width: box.w + 20, height: box.H + 20, rx: box.H / 2 + 10,
          fill: "none", stroke: "var(--accent)", "stroke-width": 3, "stroke-dasharray": "6 4"
        }));
      }

      node.appendChild(el("rect", { class: "hit", x: box.x0 - 12, y: box.y0 - 12, width: box.w + 24, height: box.H + 24, rx: 20 }));
      node.addEventListener("click", () => openSheet(k));
      node.addEventListener("keydown", ev => {
        if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openSheet(k); }
      });
      g.appendChild(node);
    });
  }
}

/* ================= popup ================= */
let lastTrigger = null;

function openSheet(k) {
  lastTrigger = document.activeElement;
  focus = k;
  buzz(10);
  renderSheet();
  paintAll();
  const bg = $("sheetBg");
  bg.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => bg.classList.add("open")));
  document.body.style.overflow = "hidden";
  setTimeout(() => $("shOrders").querySelector("button")?.focus({ preventScroll: true }), 50);
}

function closeSheet() {
  const bg = $("sheetBg");
  if (bg.hidden) return;
  bg.classList.remove("open");
  setTimeout(() => { bg.hidden = true; }, reduced() ? 0 : 240);
  document.body.style.overflow = "";
  focus = null;
  paintAll();
  lastTrigger?.focus?.({ preventScroll: true });
}

function renderSheet() {
  const k = focus;
  if (!k) return;
  const { L, sp } = nameOf(k);
  const w = waveNo(), n = slotMax(w), slots = cur();
  const mine = ordersOf(k);
  const nextFree = slots.findIndex(s => !s);

  $("shTitle").textContent = `${L.name.th} · ${sp.name.th}`;
  $("shWave").textContent = "Wave " + sel;
  $("shOrderNote").textContent = `เลือกได้หลายลำดับ · ซ้ำได้ ${repeatMax(w)} ครั้ง`;

  const box = $("shOrders");
  box.style.setProperty("--n", n);
  box.textContent = "";
  for (let i = 0; i < n; i++) {
    const e = parseEntry(slots[i]);
    const isMine = !!e && e.k === k;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "ord" + (e && !isMine ? " taken" : "") + (!e && i === nextFree && !mine.length ? " next" : "");
    b.setAttribute("aria-pressed", isMine);

    let cap = "ว่าง", aria = "ว่าง";
    if (isMine) { cap = "จุดนี้"; aria = "จุดนี้"; }
    else if (e) {
      const o = nameOf(e.k);
      cap = `${o.L.name.th} ${o.sp.name.th}`;
      aria = `ใช้โดย ${o.L.name.th} ${o.sp.name.th} — แตะเพื่อแทนที่`;
    }
    b.innerHTML = `<b>${i + 1}</b><small>${cap}</small>`;
    b.setAttribute("aria-label", `ลำดับ ${i + 1}, ${aria}`);
    b.onclick = () => toggleOrder(i);
    box.appendChild(b);
  }

  $("shColorSec").hidden = !M.hasAura;
  if (M.hasAura) {
    $("shColorNote").textContent = colorMax(w) === 2 ? "ลำดับละไม่เกิน 2 สี" : "ลำดับละ 1 สี";
    const cbox = $("shColors");
    cbox.textContent = "";
    if (!mine.length) {
      const d = document.createElement("div");
      d.className = "nocolor";
      d.textContent = "เลือกลำดับด้านบนก่อน แล้วค่อยเลือกสี";
      cbox.appendChild(d);
    }
    mine.forEach(i => {
      const e = parseEntry(slots[i]);
      const row = document.createElement("div");
      row.className = "crow";
      const cn = document.createElement("div");
      cn.className = "cn";
      cn.innerHTML = `${i + 1}<small>ลำดับ</small>`;
      const sw = document.createElement("div");
      sw.className = "sw";
      AURA.forEach(a => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "swatch";
        b.style.setProperty("--c", a.hex);
        b.setAttribute("aria-pressed", e.colors.includes(a.id));
        b.setAttribute("aria-label", `ลำดับ ${i + 1} สี${a.th}`);
        b.innerHTML = `<span class="tick">✓</span>${a.th}`;
        b.onclick = () => setColor(i, a.id);
        sw.appendChild(b);
      });
      row.append(cn, sw);
      cbox.appendChild(row);
    });
  }

  $("shRemove").disabled = !mine.length;
}

/* แตะลำดับ: ของจุดนี้ = เอาออก · ว่าง = ใส่ · ของจุดอื่น = แทนที่ */
function toggleOrder(i) {
  const k = focus, slots = cur(), w = waveNo();
  const e = parseEntry(slots[i]);

  if (e && e.k === k) {
    slots[i] = "";
  } else {
    if (ordersOf(k).length >= repeatMax(w)) {
      return toast(`เวฟ ${w === 4 ? "4" : "1-3"} จุดเดียวเกิดซ้ำได้ไม่เกิน ${repeatMax(w)} ครั้ง`);
    }
    if (e) {
      const o = nameOf(e.k);
      toast(`ลำดับ ${i + 1}: แทนที่ ${o.L.name.th} ${o.sp.name.th}`);
    }
    slots[i] = k;
  }
  buzz(10);
  renderSheet();
  paintAll();
}

/* สี — เวฟ 1-3 แทนที่สีเดิม · เวฟ 4 เพิ่มได้ถึง 2 สี · แตะสีเดิมซ้ำ = เอาออก */
function setColor(i, c) {
  const slots = cur();
  const e = parseEntry(slots[i]);
  if (!e) return;
  const max = colorMax(waveNo());

  if (e.colors.includes(c)) e.colors = e.colors.filter(x => x !== c);
  else if (max === 1) e.colors = [c];
  else if (e.colors.length < max) e.colors.push(c);
  else return toast("เวฟ 4 เลือกได้สูงสุด 2 สีต่อลำดับ");

  slots[i] = buildEntry(e);
  buzz(10);
  renderSheet();
  paintAll();
}

function removePoint() {
  const slots = cur();
  ordersOf(focus).forEach(i => { slots[i] = ""; });
  buzz(8);
  closeSheet();
}

function clearWave() {
  if (!cur().some(Boolean)) return;
  DATA[mapId][sel] = cur().map(() => "");
  buzz(8);
  paintAll();
  toast("ล้างเวฟ " + sel + " แล้ว");
}

/* ================= หัวแผนที่ ================= */
function drawHead() {
  const slots = cur(), max = slotMax(waveNo());
  const filled = slots.filter(Boolean).length;
  const missing = M.hasAura ? slots.filter(s => s && !parseEntry(s).colors.length).length : 0;
  $("counter").textContent = `${filled} / ${max}`;
  $("wlabel").textContent = sel;
  const note = $("wnote");
  note.textContent = missing ? `ยังไม่ใส่สี ${missing}` : (max === 4 ? "(4 ลำดับ)" : "");
  note.classList.toggle("warn", missing > 0);
}

/* ================= แถบเลือกด่าน ================= */
const tabEls = {};

function buildTabs() {
  const nav = $("maptabs");
  MAP_ORDER.forEach(id => {
    const m = MAPS[id];
    if (!m) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "mtab";
    b.innerHTML = `<i aria-hidden="true">${m.icon}</i><b>${m.name.en}</b><small>${m.name.th}</small>`;
    b.onclick = () => { if (id !== mapId) { buzz(8); setMap(id); } };
    nav.appendChild(b);
    tabEls[id] = b;
  });
}

function paintTabs() {
  for (const id in tabEls) tabEls[id].setAttribute("aria-pressed", id === mapId);
}

/* ================= แถบเลือกเวฟ ================= */
const chipEls = {};

function buildStrip() {
  const strip = $("strip");
  WAVES.forEach((id, i) => {
    if (i > 0 && id.endsWith(".1")) {
      const sep = document.createElement("span");
      sep.className = "wsep"; sep.setAttribute("aria-hidden", "true");
      strip.appendChild(sep);
    }
    const b = document.createElement("button");
    b.type = "button";
    b.className = "wchip";
    b.innerHTML = `<span class="lbl">${id}</span><span class="pips"></span>`;
    b.onclick = () => select(id);
    strip.appendChild(b);
    chipEls[id] = b;
  });
}

/* จุดใต้เลขเวฟ = ลำดับ 1..n เรียงซ้ายไปขวา · วงกลวง = ลำดับนั้นยังว่าง */
function paintStrip(scroll) {
  WAVES.forEach(id => {
    const b = chipEls[id];
    const slots = DATA[mapId][id];
    const filled = slots.filter(Boolean).length;
    b.setAttribute("aria-pressed", id === sel);
    b.classList.toggle("empty", filled === 0);
    b.setAttribute("aria-label", `เวฟ ${id} ${filled ? filled + " ลำดับ" : "ยังไม่มีข้อมูล"}`);

    const pips = b.querySelector(".pips");
    pips.textContent = "";
    slots.forEach(raw => {
      const i = document.createElement("i");
      const e = parseEntry(raw);
      if (!e) i.className = "hole";
      else {
        const cs = M.hasAura ? e.colors : [];
        i.style.background = cs.length === 2
          ? `linear-gradient(180deg, ${auraOf(cs[0]).hex} 50%, ${auraOf(cs[1]).hex} 50%)`
          : segFill(cs);
      }
      pips.appendChild(i);
    });
  });

  const idx = WAVES.indexOf(sel);
  $("prev").disabled = idx === 0;
  $("next").disabled = idx === WAVES.length - 1;

  if (scroll) {
    const strip = $("strip"), b = chipEls[sel];
    strip.scrollTo({
      left: b.offsetLeft - strip.clientWidth / 2 + b.offsetWidth / 2,
      behavior: reduced() ? "auto" : "smooth"
    });
  }
}

function select(id) {
  if (id === sel) return;
  sel = id;
  focus = null;
  buzz(8);
  drawSpawns(); drawHead(); paintStrip(true);
}

function step(delta) {
  const idx = WAVES.indexOf(sel) + delta;
  if (idx < 0 || idx >= WAVES.length) return;
  select(WAVES[idx]);
}

function paintAll() { drawSpawns(); drawHead(); paintStrip(false); }

/* ================= เปลี่ยนด่าน ================= */
function setMap(id) {
  if (!MAPS[id]) id = MAP_ORDER.find(x => MAPS[x]);
  mapId = id;
  M = MAPS[id];
  if (!DATA[id]) DATA[id] = normalize(M.sample);
  sel = "1.1";
  focus = null;

  const card = $("mapCard");
  card.removeAttribute("style");
  for (const k in M.palette) card.style.setProperty("--" + k, M.palette[k]);

  $("art-back").innerHTML = M.art.back || "";
  $("art-mid").innerHTML = M.art.mid || "";
  $("art-front").innerHTML = M.art.front || "";
  drawTrees(); drawRoads(); drawRocks(); drawZones();

  $("mapSvg").setAttribute("aria-label", "แผนที่ " + M.name.en);
  $("mapTitle").textContent = M.name.en;
  $("mapSub").textContent = `${M.name.th} · ${M.hasAura ? "มีสีออร่า" : "ไม่มีสีออร่า"} — ตัวอย่าง (ยังไม่ต่อข้อมูลจริง)`;
  $("hintAura").hidden = !M.hasAura;

  paintTabs();
  drawSpawns(); drawHead(); paintStrip(true);

  try { history.replaceState(null, "", "#" + id); } catch (_) {}
  try { localStorage.setItem("got_map_proto", id); } catch (_) {}
}

/* ================= events ================= */
$("prev").onclick = () => step(-1);
$("next").onclick = () => step(1);
$("clear").onclick = clearWave;
$("shDone").onclick = closeSheet;
$("shRemove").onclick = removePoint;
$("sheetBg").addEventListener("click", e => { if (e.target === e.currentTarget) closeSheet(); });

document.addEventListener("keydown", e => {
  if (!$("sheetBg").hidden) {
    if (e.key === "Escape") closeSheet();
    return;
  }
  if (e.target.closest && e.target.closest(".spawn")) return;
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === "ArrowRight") step(1);
});

/* Shift+คลิก (เดสก์ท็อป) = อ่านพิกัด x/y */
$("mapSvg").addEventListener("click", e => {
  if (!e.shiftKey) return;
  e.stopPropagation();
  const svg = e.currentTarget;
  const p = svg.createSVGPoint();
  p.x = e.clientX; p.y = e.clientY;
  const q = p.matrixTransform(svg.getScreenCTM().inverse());
  toast(`x: ${Math.round(q.x)}   y: ${Math.round(q.y)}`);
}, true);

window.addEventListener("hashchange", () => {
  const id = location.hash.slice(1);
  if (MAPS[id] && id !== mapId) setMap(id);
});

/* ================= เริ่ม ================= */
buildTabs();
buildStrip();
let start = location.hash.slice(1);
if (!MAPS[start]) { try { start = localStorage.getItem("got_map_proto"); } catch (_) { start = null; } }
setMap(start);
})();

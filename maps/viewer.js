/* ================= Map viewer (ดูอย่างเดียว) =================
   ใช้ใน index.html หลัก: วาดแผนที่จาก window.MAPS[id] + หมุดเลขลำดับของเวฟที่เลือก
   ไม่รับข้อมูลบนแผนที่ (บันทึกผ่าน edit modal เหมือนเดิม) · engine.js คือต้นแบบที่แตะบันทึกได้ */
(() => {
"use strict";

const AURA = { orange: "#f97316", blue: "#3b82f6", green: "#22c55e" };
const SVGNS = "http://www.w3.org/2000/svg";
const el = (n, a = {}) => { const e = document.createElementNS(SVGNS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };

const DEFS = `
  <defs>
    <pattern id="tile" width="14" height="14" patternUnits="userSpaceOnUse">
      <rect width="14" height="14" fill="var(--stone)"/>
      <path d="M0,0 h14 M0,0 v14" stroke="var(--stone2)" stroke-width="1.2"/>
    </pattern>
    <pattern id="grass" width="16" height="16" patternUnits="userSpaceOnUse">
      <path d="M3,13 l2,-5 M6,14 l1,-4 M11,12 l2,-5" stroke="var(--forest2)" stroke-width="1.1"
            stroke-linecap="round" fill="none" opacity=".45"/>
    </pattern>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" flood-opacity=".35"/>
    </filter>
  </defs>`;

/* ================= ฉากประกอบ (เหมือน engine.js) ================= */
function drawTrees(g, M) {
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

function drawRoads(g, M) {
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

function drawRocks(g, M) {
  (M.rocks || []).forEach(([x, y, r]) => {
    g.appendChild(el("ellipse", { cx: x, cy: y + r * .5, rx: r * 1.1, ry: r * .45, fill: "var(--stonedark)", opacity: ".35" }));
    g.appendChild(el("ellipse", { cx: x, cy: y, rx: r * 1.2, ry: r, fill: "var(--stone2)" }));
    g.appendChild(el("ellipse", { cx: x - r * .3, cy: y - r * .3, rx: r * .6, ry: r * .45, fill: "var(--stone)", opacity: ".9" }));
  });
}

function drawZones(g, M, labelOf) {
  for (const locId in M.locs) {
    const L = M.locs[locId];
    g.appendChild(el("circle", {
      cx: L.x, cy: L.y, r: 46, fill: "var(--text)", "fill-opacity": ".05",
      stroke: "var(--muted)", "stroke-width": 1.8, "stroke-dasharray": "5 5", "stroke-opacity": ".6"
    }));
    // ชื่อจาก labelOf (index.html ส่งชื่อจากชีท/คำย่อตามภาษา) ช่วงล่างของวง (หมุดของข้อมูลที่ไม่มีฝั่งอยู่กลางวง)
    const t = el("text", {
      x: L.x, y: L.y + 33, "text-anchor": "middle",
      "font-size": 13, "font-weight": 800, fill: "#fff",
      stroke: "rgba(15,23,42,.85)", "stroke-width": 4, "paint-order": "stroke", "stroke-linejoin": "round"
    });
    t.textContent = labelOf(locId);
    g.appendChild(t);
  }
}

/* ================= จุดเกิด ================= */
const auraHex = id => AURA[id] || "var(--spawn)";

/* หมุดมีเลขลำดับ — ลำดับเดียว = วงกลม · หลายลำดับ = แคปซูลแบ่งช่อง ช่องละสี (2 สีแบ่งบน/ล่าง) */
function drawBadge(g, M, sp, segs, uid) {
  const H = 32, SW = 27;
  const w = segs.length === 1 ? H : SW * segs.length + 6;
  const x0 = Math.min(Math.max(sp.x - w / 2, -14), 414 - w);
  const y0 = sp.y - H / 2, rx = H / 2, segW = w / segs.length;
  const colorsOf = s => (M.hasAura ? s.colors : []);
  const fillOf = cs => cs.length ? auraHex(cs[0]) : (M.hasAura ? "var(--spawn)" : "var(--accent)");

  // ทั้งหมุดเป็นของอีกทีม = จางทั้งก้อน · ปนกัน = จางเฉพาะช่อง
  const allDim = segs.every(s => s.dim);
  const opOf = s => (s.dim && !allDim ? ".3" : "1");
  if (allDim) g = g.appendChild(el("g", { opacity: ".3" }));

  g.appendChild(el("rect", {
    x: x0 - 6, y: y0 - 6, width: w + 12, height: H + 12, rx: rx + 6,
    fill: fillOf(colorsOf(segs[0])), "fill-opacity": ".28"
  }));

  const clipId = "mv-clip-" + uid;
  const cp = el("clipPath", { id: clipId });
  cp.appendChild(el("rect", { x: x0, y: y0, width: w, height: H, rx }));
  g.appendChild(cp);

  const body = el("g", { "clip-path": `url(#${clipId})` });
  segs.forEach((s, i) => {
    const sx = x0 + i * segW, cs = colorsOf(s);
    if (cs.length === 2) {
      body.appendChild(el("rect", { x: sx, y: y0, width: segW, height: H / 2, fill: auraHex(cs[0]), opacity: opOf(s) }));
      body.appendChild(el("rect", { x: sx, y: y0 + H / 2, width: segW, height: H / 2, fill: auraHex(cs[1]), opacity: opOf(s) }));
    } else {
      body.appendChild(el("rect", { x: sx, y: y0, width: segW, height: H, fill: fillOf(cs), opacity: opOf(s) }));
    }
    if (i > 0) body.appendChild(el("line", { x1: sx, y1: y0, x2: sx, y2: y0 + H, stroke: "var(--panel)", "stroke-width": 2.5 }));
  });
  g.appendChild(body);
  g.appendChild(el("rect", { x: x0, y: y0, width: w, height: H, rx, fill: "none", stroke: "var(--panel)", "stroke-width": 3.5 }));

  segs.forEach((s, i) => {
    const t = el("text", {
      x: x0 + i * segW + segW / 2, y: sp.y + 6.2, "text-anchor": "middle",
      "font-size": 17, "font-weight": 800, fill: "#fff", opacity: opOf(s),
      stroke: "rgba(0,0,0,.45)", "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
    });
    t.textContent = s.n;
    g.appendChild(t);
  });
}

/* slots = ["Cemetery@L:orange", "Pagoda", "", ...] — index = ลำดับ
   มีฝั่ง = หมุดที่จุดเกิด · ไม่มีฝั่ง (ข้อมูลเก่า / ยังไม่ระบุ) = หมุดกลางวงสถานที่ */
function drawSpawns(g, M, slots, dimOf) {
  g.textContent = "";
  const segsOf = k => slots.reduce((acc, raw, i) => {
    const [head, c] = (raw || "").split(":");
    return head === k ? [...acc, { n: i + 1, colors: c ? c.split(",").filter(Boolean) : [], dim: dimOf(i) }] : acc;
  }, []);

  for (const locId in M.locs) {
    const L = M.locs[locId];
    L.spawns.forEach(sp => {
      const k = locId + "@" + sp.id;
      const segs = segsOf(k);
      if (segs.length) {
        drawBadge(g, M, sp, segs, k.replace(/[^\w-]/g, "_"));
      } else {
        g.appendChild(el("circle", {
          cx: sp.x, cy: sp.y, r: 10, fill: "var(--spawn)", "fill-opacity": ".4",
          stroke: "var(--spawn)", "stroke-width": 2.5, "stroke-opacity": ".75"
        }));
      }
    });

    const mid = segsOf(locId);
    if (mid.length) drawBadge(g, M, L, mid, (locId + "-mid").replace(/[^\w-]/g, "_"));
  }
}

/* วาดฉากใหม่เฉพาะตอนเปลี่ยนด่าน/ชื่อ · หมุดวาดใหม่ทุกครั้ง · labelOf(locId) = ชื่อที่แสดงบนแผนที่
   dimOf(index) = true → หมุดลำดับนั้นจาง (จุดของอีกทีม) */
function render(svg, mapId, slots, labelOf = locId => locId, dimOf = () => false) {
  const M = (window.MAPS || {})[mapId];
  if (!M) return false;

  const cacheKey = mapId + ":" + Object.keys(M.locs).map(labelOf).join("|");
  if (svg.dataset.map !== cacheKey) {
    svg.removeAttribute("style");
    for (const k in M.palette) svg.style.setProperty("--" + k, M.palette[k]);
    svg.innerHTML = DEFS +
      `<g>${M.art.back || ""}</g><g class="mv-woods"></g><g>${M.art.mid || ""}</g><g class="mv-roads"></g>` +
      `<g>${M.art.front || ""}</g><g class="mv-rocks"></g><g class="mv-zones"></g><g class="mv-spawns"></g>`;
    drawTrees(svg.querySelector(".mv-woods"), M);
    drawRoads(svg.querySelector(".mv-roads"), M);
    drawRocks(svg.querySelector(".mv-rocks"), M);
    drawZones(svg.querySelector(".mv-zones"), M, labelOf);
    svg.setAttribute("aria-label", "แผนที่ " + M.name.en);
    svg.dataset.map = cacheKey;
  }
  drawSpawns(svg.querySelector(".mv-spawns"), M, slots || [], dimOf);
  return true;
}

window.MapView = { render };
})();

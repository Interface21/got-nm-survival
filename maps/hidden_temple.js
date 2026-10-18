/* ================= Hidden Temple (วัดลับ) ================= */
window.MAPS = window.MAPS || {};
window.MAPS.hidden_temple = {
  id: "hidden_temple",
  icon: "⛩️",
  name: { th: "วัดลับ", en: "Hidden Temple" },
  hasAura: true,                       // ด่านเดียวที่ต้องกำหนดสีออร่า

  palette: {
    ground: "#2c3730", ground2: "#333f34", ground3: "#3b4839",
    stone: "#3f4749", stone2: "#374042", stonedark: "#2c3436",
    water: "#1d475c", water2: "#245a72", shore: "#3a4136",
    forest: "#2e4832", forest2: "#273d2b", forest3: "#1f3124", trunk: "#3a2f26",
    wall: "#57543f", wall2: "#464434",
    roof: "#7c3f30", roof2: "#632f23", roof3: "#4e2419", wood: "#493c30",
    grave: "#565247", grave2: "#454238", iron: "#2f2e2a",
    path: "#443f30", path2: "#4e4839"
  },

  /* จุดเกิด 3 จุดต่อสถานที่ = ซ้าย / กลาง / ขวา · พิกัดในกรอบ 400×330 */
  locs: {
    Cemetery: {
      icon: "🪦", name: { th: "สุสาน", en: "Cemetery" },
      x: 126, y: 90,
      spawns: [
        { id: "L", x: 126,  y: 18, name: { th: "ซ้าย",  en: "Left" } },
        { id: "C", x: 58,  y: 32, name: { th: "กลาง", en: "Center" } },
        { id: "R", x: 33, y: 80, name: { th: "ขวา",   en: "Right" } }
      ]
    },
    Courtyard: {
      icon: "⛲", name: { th: "ลานน้ำพุ", en: "Courtyard" },
      x: 300, y: 152,
      spawns: [
        { id: "L", x: 386, y: 204,  name: { th: "ซ้าย",  en: "Left" } },
        { id: "C", x: 378, y: 128, name: { th: "กลาง", en: "Center" } },
        { id: "R", x: 332, y: 82, name: { th: "ขวา",   en: "Right" } }
      ]
    },
    Pagoda: {
      icon: "🏯", name: { th: "เจดีย์", en: "Pagoda" },
      x: 118, y: 244,
      spawns: [
        { id: "L", x: 118,  y: 318, name: { th: "ซ้าย",  en: "Left" } },
        { id: "C", x: 48,  y: 288, name: { th: "กลาง", en: "Center" } },
        { id: "R", x: 37, y: 225, name: { th: "ขวา",   en: "Right" } }
      ]
    }
  },

  trees: {
    style: "round",
    list: [
      [18, 26, 13], [40, 14, 10], [36, 44, 12], [12, 62, 11], [64, 22, 9],
      [14, 96, 12], [30, 108, 9], [10, 150, 11], [24, 172, 9],
      [96, 12, 10], [120, 30, 8], [196, 14, 9], [232, 24, 11], [258, 12, 9],
      [300, 20, 12], [332, 40, 10], [356, 16, 9],
      [14, 210, 10], [34, 190, 8], [18, 288, 11], [44, 300, 9], [100, 322, 10],
      [240, 326, 9], [272, 314, 11], [368, 236, 10], [386, 262, 8]
    ]
  },
  rocks: [[72, 158, 6], [88, 300, 7], [214, 272, 5], [252, 96, 6], [336, 112, 5], [168, 186, 5], [62, 128, 4]],

  art: {
    /* พื้นดิน + แหล่งน้ำ (อยู่ใต้ต้นไม้) */
    back: `
      <rect x="-20" y="-20" width="440" height="370" fill="var(--ground)"/>
      <ellipse cx="110" cy="70" rx="130" ry="80" fill="var(--ground2)" opacity=".75"/>
      <ellipse cx="300" cy="270" rx="130" ry="85" fill="var(--ground3)" opacity=".55"/>
      <ellipse cx="60" cy="270" rx="90" ry="70" fill="var(--ground2)" opacity=".6"/>
      <rect x="-20" y="-20" width="440" height="370" fill="url(#grass)"/>

      <path d="M400,196 C346,204 318,238 326,270 C333,298 364,314 400,312 Z" fill="var(--shore)"/>
      <path d="M400,204 C352,212 328,240 335,268 C342,294 368,307 400,305 Z" fill="var(--water)"/>
      <path d="M400,216 C364,224 344,246 348,268" fill="none" stroke="var(--water2)" stroke-width="2.5" opacity=".8"/>
      <path d="M382,290 C366,286 356,276 356,266" fill="none" stroke="var(--water2)" stroke-width="2" opacity=".6"/>

      <path d="M394,-6 C368,44 384,96 370,140 C356,186 336,214 340,246" fill="none" stroke="var(--shore)" stroke-width="30" stroke-linecap="round"/>
      <path d="M394,-6 C368,44 384,96 370,140 C356,186 336,214 340,246" fill="none" stroke="var(--water)" stroke-width="20" stroke-linecap="round"/>
      <path d="M392,10 C372,50 382,94 370,132" fill="none" stroke="var(--water2)" stroke-width="2.5" opacity=".75"/>

      <path d="M112,336 C146,320 176,314 214,306 C256,297 306,296 338,282" fill="none" stroke="var(--shore)" stroke-width="22" stroke-linecap="round"/>
      <path d="M112,336 C146,320 176,314 214,306 C256,297 306,296 338,282" fill="none" stroke="var(--water)" stroke-width="13" stroke-linecap="round"/>`,

    /* กำแพงวัด (อยู่ใต้ถนน ถนนทับ = ช่องประตู) */
    mid: `
      <rect x="44" y="44" width="312" height="242" rx="44" fill="none" stroke="var(--wall2)" stroke-width="9"/>
      <rect x="44" y="44" width="312" height="242" rx="44" fill="none" stroke="var(--wall)" stroke-width="5.5"/>
      <rect x="44" y="44" width="312" height="242" rx="44" fill="none" stroke="var(--stonedark)" stroke-width="5.5" stroke-dasharray="2 13" opacity=".5"/>`,

    /* อาคาร (อยู่บนถนน) */
    front: `
      <path d="M146,116 L276,150 L252,238 L124,208 Z" fill="var(--stone)" opacity=".45"/>
      <path d="M146,116 L276,150 L252,238 L124,208 Z" fill="none" stroke="var(--stone2)" stroke-width="2" stroke-dasharray="7 6" opacity=".8"/>

      <g transform="translate(130,88)" filter="url(#soft)">
        <ellipse cx="0" cy="24" rx="56" ry="26" fill="var(--ground3)"/>
        <g stroke="var(--iron)" stroke-width="2" stroke-linecap="round" opacity=".85">
          <path d="M-52,16 h104"/>
          <path d="M-52,16 v-9 M-40,16 v-12 M-28,16 v-9 M-16,16 v-12 M-4,16 v-9 M8,16 v-12 M20,16 v-9 M32,16 v-12 M44,16 v-9 M52,16 v-12"/>
        </g>
        <g stroke="var(--trunk)" stroke-linecap="round" fill="none">
          <path d="M-44,14 v-26" stroke-width="3.5"/>
          <path d="M-44,-4 l-9,-9 M-44,-10 l8,-8 M-44,-18 l-6,-7" stroke-width="2.2"/>
        </g>
        <g fill="var(--grave)">
          <path d="M-30,14 v-15 a6.5,6.5 0 0 1 13,0 v15 Z"/>
          <path d="M-11,14 v-19 a7,7 0 0 1 14,0 v19 Z"/>
          <path d="M8,14 v-13 a6,6 0 0 1 12,0 v13 Z"/>
          <rect x="25" y="2" width="12" height="12" rx="1.5"/>
        </g>
        <g fill="var(--grave2)">
          <rect x="-36" y="8" width="9" height="3" rx="1.5"/>
          <rect x="14" y="9" width="9" height="3" rx="1.5"/>
        </g>
        <path d="M-4,-4 h8 M0,-9 v10" stroke="var(--grave2)" stroke-width="2.4" stroke-linecap="round"/>
        <rect x="34" y="-12" width="26" height="26" rx="2" fill="var(--stone2)"/>
        <path d="M32,-12 L47,-24 L62,-12 Z" fill="var(--stonedark)"/>
        <rect x="43" y="0" width="8" height="14" rx="3" fill="var(--iron)" opacity=".7"/>
      </g>

      <g transform="translate(120,242)" filter="url(#soft)">
        <ellipse cx="0" cy="30" rx="48" ry="20" fill="var(--ground3)"/>
        <rect x="-34" y="18" width="68" height="12" rx="3" fill="var(--stone2)"/>
        <rect x="-26" y="12" width="52" height="8" rx="2" fill="var(--stone)"/>
        <path d="M-12,30 h24 M-12,26 h24 M-12,22 h24" stroke="var(--stonedark)" stroke-width="1.4" opacity=".7"/>
        <rect x="-16" y="-10" width="32" height="24" rx="2" fill="var(--wood)"/>
        <rect x="-6" y="-2" width="12" height="16" rx="2" fill="var(--roof3)" opacity=".75"/>
        <path d="M-40,-8 Q0,-30 40,-8 Q0,-18 -40,-8 Z" fill="var(--roof)"/>
        <path d="M-40,-8 Q0,-24 40,-8" fill="none" stroke="var(--roof3)" stroke-width="2"/>
        <path d="M-32,-22 Q0,-42 32,-22 Q0,-31 -32,-22 Z" fill="var(--roof2)"/>
        <path d="M-24,-34 Q0,-52 24,-34 Q0,-42 -24,-34 Z" fill="var(--roof)"/>
        <path d="M-15,-45 Q0,-60 15,-45 Q0,-51 -15,-45 Z" fill="var(--roof2)"/>
        <rect x="-1.6" y="-72" width="3.2" height="14" rx="1.6" fill="var(--stonedark)"/>
        <circle cx="0" cy="-74" r="3.4" fill="var(--roof3)"/>
        <g fill="var(--roof2)">
          <rect x="-44" y="6" width="6" height="14" rx="2"/><rect x="38" y="6" width="6" height="14" rx="2"/>
          <circle cx="-41" cy="3" r="4.5"/><circle cx="41" cy="3" r="4.5"/>
        </g>
      </g>

      <g transform="translate(298,150)" filter="url(#soft)">
        <rect x="-44" y="-40" width="88" height="80" rx="10" fill="url(#tile)"/>
        <rect x="-44" y="-40" width="88" height="80" rx="10" fill="none" stroke="var(--stonedark)" stroke-width="2.5"/>
        <g fill="var(--stone2)" stroke="var(--stonedark)" stroke-width="1.2">
          <circle cx="-34" cy="-30" r="5"/><circle cx="0" cy="-33" r="5"/><circle cx="34" cy="-30" r="5"/>
          <circle cx="-37" cy="0" r="5"/><circle cx="37" cy="0" r="5"/>
          <circle cx="-34" cy="30" r="5"/><circle cx="0" cy="33" r="5"/><circle cx="34" cy="30" r="5"/>
        </g>
        <circle r="21" fill="var(--stone2)"/>
        <circle r="17" fill="var(--water)"/>
        <circle r="17" fill="none" stroke="var(--stonedark)" stroke-width="2.5"/>
        <circle r="10" fill="var(--water2)" opacity=".8"/>
        <circle r="5" fill="var(--stone)"/>
        <path d="M0,-5 v-9" stroke="var(--water2)" stroke-width="2.5" stroke-linecap="round"/>
        <g fill="var(--wood)"><rect x="-16" y="26" width="32" height="5" rx="2.5"/><rect x="-16" y="-31" width="32" height="5" rx="2.5"/></g>
      </g>

      <g transform="translate(196,308) rotate(-13)">
        <rect x="-16" y="-9" width="32" height="18" rx="3" fill="var(--wood)"/>
        <path d="M-10,-9 v18 M-3,-9 v18 M4,-9 v18 M11,-9 v18" stroke="var(--trunk)" stroke-width="1.6" opacity=".8"/>
      </g>`
  },

  /* ข้อมูลตัวอย่าง — index = ลำดับการเกิด · "" = ลำดับว่าง */
  sample: {
    "1.1": ["Cemetery@L:orange", "Pagoda@C:blue", "Cemetery@L:green"],
    "1.2": ["Courtyard@C:blue", "Courtyard@C:orange", "Pagoda@R:green"],
    "1.3": ["Pagoda@L:green", "Cemetery@R:blue", "Cemetery@R:orange"],
    "2.1": ["Cemetery@C:orange", "Courtyard@L:green", "Pagoda@R:blue"],
    "2.2": ["Pagoda@C:blue", "", "Courtyard@R:green"],
    "2.3": ["Cemetery@L:green", "Courtyard@C:orange", "Pagoda@C:blue"],
    "3.1": ["Courtyard@R:orange", "Cemetery@C:green", "Courtyard@R:blue"],
    "3.2": ["Cemetery@R:green", "Pagoda@C", "Courtyard@C:orange"],
    "4.1": ["Pagoda@C:orange,blue", "Pagoda@C:green", "Cemetery@L:blue", "Pagoda@C:orange"],
    "4.2": ["Courtyard@L:green,orange", "Cemetery@C:blue", "Courtyard@L:orange,blue", "Courtyard@L:green"]
  }
};

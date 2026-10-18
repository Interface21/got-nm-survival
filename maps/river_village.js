/* ================= River Village (หมู่บ้านริมน้ำ) ================= */
window.MAPS = window.MAPS || {};
window.MAPS.river_village = {
  id: "river_village",
  icon: "🌾",
  name: { th: "หมู่บ้านริมน้ำ", en: "River Village" },
  hasAura: false,

  palette: {
    ground: "#2b3a2b", ground2: "#324330", ground3: "#3b4a33",
    stone: "#454a44", stone2: "#3b403a", stonedark: "#2e322d",
    water: "#1f4d63", water2: "#2d6a86", shore: "#474433",
    sea: "#163a50", sea2: "#2a5f80", sand: "#5f553f", sand2: "#71664b",
    forest: "#2f4a30", forest2: "#28402a", forest3: "#1f3322", trunk: "#3a2f26",
    paddy: "#34502c", paddy2: "#5c7a3a", paddyWater: "#29505f",
    thatch: "#6b5738", thatch2: "#54432b", wood: "#4d3d2e", wood2: "#3a2e22",
    torii: "#9b3426",
    path: "#4a4434", path2: "#554e3c"
  },

  /* นาข้าว = ซ้าย · ชายหาด = ขวาบน (ติดทะเล) · หมู่บ้าน = ขวาล่าง */
  locs: {
    RicePaddies: {
      icon: "🌾", name: { th: "นาข้าว", en: "Rice Paddies" },
      x: 98, y: 170,
      spawns: [
        { id: "L", x: 40, y: 262, name: { th: "ซ้าย",  en: "Left" } },
        { id: "C", x: 18, y: 180, name: { th: "กลาง", en: "Center" } },
        { id: "R", x: 30, y: 100, name: { th: "ขวา",   en: "Right" } }
      ]
    },
    Beach: {
      icon: "⛵", name: { th: "ชายหาด", en: "Beach" },
      x: 305, y: 84,
      spawns: [
        { id: "L", x: 392, y: 156,  name: { th: "ซ้าย",  en: "Left" } },
        { id: "C", x: 360, y: 28,  name: { th: "กลาง", en: "Center" } },
        { id: "R", x: 250, y: 24, name: { th: "ขวา",   en: "Right" } }
      ]
    },
    Village: {
      icon: "🛖", name: { th: "หมู่บ้าน", en: "Village" },
      x: 288, y: 262,
      spawns: [
        { id: "L", x: 385, y: 286, name: { th: "ซ้าย",  en: "Left" } },
        { id: "C", x: 310, y: 330, name: { th: "กลาง", en: "Center" } },
        { id: "R", x: 230, y: 328, name: { th: "ขวา",   en: "Right" } }
      ]
    }
  },

  trees: {
    style: "round",
    list: [
      [12, 30, 12], [44, 14, 10], [92, 14, 11], [124, 36, 9], [70, 62, 9], [112, 74, 8],
      [12, 142, 10], [8, 226, 11], [22, 304, 12], [92, 318, 10], [140, 300, 9],
      [252, 196, 9], [360, 222, 11], [394, 234, 9], [338, 196, 8], [150, 250, 8]
    ]
  },
  rocks: [[150, 40, 5], [232, 162, 6], [128, 262, 5], [384, 198, 4], [214, 286, 4]],

  art: {
    /* พื้น + ทะเล/ทราย/แม่น้ำ — กลุ่มนี้กลับแนวตั้ง ทะเลจึงอยู่มุมขวาบน แม่น้ำไหลจากล่างขึ้นไปลงทะเล */
    back: `
      <rect x="-20" y="-20" width="440" height="370" fill="var(--ground)"/>
      <ellipse cx="90" cy="170" rx="125" ry="115" fill="var(--ground2)" opacity=".7"/>
      <ellipse cx="300" cy="266" rx="125" ry="85" fill="var(--ground3)" opacity=".5"/>
      <rect x="-20" y="-20" width="440" height="370" fill="url(#grass)"/>

      <g transform="translate(0,346) scale(1,-1)">
        <path d="M186,370 C230,290 314,266 346,230 C368,204 394,194 420,190 L420,370 Z" fill="var(--sand)"/>
        <g fill="var(--sand2)" opacity=".7">
          <circle cx="300" cy="286" r="2"/><circle cx="340" cy="262" r="1.6"/><circle cx="380" cy="228" r="2"/>
          <circle cx="262" cy="310" r="1.8"/><circle cx="322" cy="276" r="1.4"/><circle cx="400" cy="214" r="1.6"/>
        </g>
        <path d="M222,370 C270,312 334,296 366,262 C384,242 404,234 420,232 L420,370 Z" fill="var(--sea)"/>
        <path d="M232,350 C270,312 334,296 366,262 C384,242 404,234 420,232" fill="none" stroke="var(--sea2)" stroke-width="3" stroke-dasharray="12 8" stroke-linecap="round" opacity=".85"/>
        <path d="M290,344 C322,326 356,312 386,284" fill="none" stroke="var(--sea2)" stroke-width="2" opacity=".5"/>
        <path d="M350,346 C372,334 396,318 420,300" fill="none" stroke="var(--sea2)" stroke-width="2" opacity=".4"/>

        <path d="M172,-30 C184,56 158,118 176,178 C190,226 222,270 256,340" fill="none" stroke="var(--shore)" stroke-width="30" stroke-linecap="round"/>
        <path d="M172,-30 C184,56 158,118 176,178 C190,226 222,270 256,340" fill="none" stroke="var(--water)" stroke-width="20" stroke-linecap="round"/>
        <path d="M175,0 C183,56 162,112 176,166" fill="none" stroke="var(--water2)" stroke-width="2.5" opacity=".7"/>
      </g>`,

    /* นาข้าว + รั้วหมู่บ้าน */
    mid: `
      <defs>
        <pattern id="rice" width="7" height="7" patternUnits="userSpaceOnUse">
          <path d="M1,6 l1.5,-4 M4.5,6 l1,-4" stroke="var(--paddy2)" stroke-width="1.2" stroke-linecap="round"/>
        </pattern>
      </defs>
      <g transform="translate(98,170) rotate(-8)">
        <rect x="-68" y="-56" width="136" height="112" rx="10" fill="var(--paddy)"/>
        <g fill="var(--paddyWater)">
          <rect x="-62" y="-50" width="38" height="30" rx="3"/><rect x="-19" y="-50" width="38" height="30" rx="3"/><rect x="24" y="-50" width="38" height="30" rx="3"/>
          <rect x="-62" y="-15" width="38" height="30" rx="3"/><rect x="-19" y="-15" width="38" height="30" rx="3"/><rect x="24" y="-15" width="38" height="30" rx="3"/>
          <rect x="-62" y="20" width="38" height="30" rx="3"/><rect x="-19" y="20" width="38" height="30" rx="3"/><rect x="24" y="20" width="38" height="30" rx="3"/>
        </g>
        <g fill="url(#rice)">
          <rect x="-62" y="-50" width="38" height="30" rx="3"/><rect x="-19" y="-50" width="38" height="30" rx="3"/><rect x="24" y="-50" width="38" height="30" rx="3"/>
          <rect x="-62" y="-15" width="38" height="30" rx="3"/><rect x="-19" y="-15" width="38" height="30" rx="3"/><rect x="24" y="-15" width="38" height="30" rx="3"/>
          <rect x="-62" y="20" width="38" height="30" rx="3"/><rect x="-19" y="20" width="38" height="30" rx="3"/><rect x="24" y="20" width="38" height="30" rx="3"/>
        </g>
      </g>
      <rect x="226" y="214" width="126" height="100" rx="18" fill="none" stroke="var(--wood)" stroke-width="3" stroke-dasharray="9 5" opacity=".9"/>`,

    /* สะพาน โทริอิ บ้าน เรือ */
    front: `
      <g transform="translate(170,200) rotate(-8)">
        <rect x="-22" y="-8" width="44" height="16" rx="3" fill="var(--wood)"/>
        <path d="M-15,-8 v16 M-7,-8 v16 M1,-8 v16 M9,-8 v16 M17,-8 v16" stroke="var(--wood2)" stroke-width="1.6"/>
      </g>
      <g transform="translate(206,100) rotate(28)">
        <rect x="-22" y="-8" width="44" height="16" rx="3" fill="var(--wood)"/>
        <path d="M-15,-8 v16 M-7,-8 v16 M1,-8 v16 M9,-8 v16 M17,-8 v16" stroke="var(--wood2)" stroke-width="1.6"/>
      </g>

      <g transform="translate(216,222)" filter="url(#soft)">
        <rect x="-11" y="-12" width="3.5" height="22" fill="var(--torii)"/>
        <rect x="7.5" y="-12" width="3.5" height="22" fill="var(--torii)"/>
        <path d="M-17,-15 Q0,-20 17,-15 L17,-11 L-17,-11 Z" fill="var(--torii)"/>
        <rect x="-13" y="-7" width="26" height="2.6" fill="var(--torii)"/>
      </g>

      <g filter="url(#soft)">
        <g transform="translate(262,236)">
          <rect x="-14" y="-4" width="28" height="18" rx="2" fill="var(--wood)"/><rect x="-4" y="4" width="8" height="10" rx="1.5" fill="var(--wood2)"/>
          <path d="M-20,-2 L0,-20 L20,-2 Z" fill="var(--thatch)"/><path d="M-20,-2 L0,-20 L20,-2" fill="none" stroke="var(--thatch2)" stroke-width="2"/>
        </g>
        <g transform="translate(322,240)">
          <rect x="-14" y="-4" width="28" height="18" rx="2" fill="var(--wood)"/><rect x="-4" y="4" width="8" height="10" rx="1.5" fill="var(--wood2)"/>
          <path d="M-20,-2 L0,-20 L20,-2 Z" fill="var(--thatch)"/><path d="M-20,-2 L0,-20 L20,-2" fill="none" stroke="var(--thatch2)" stroke-width="2"/>
        </g>
        <g transform="translate(258,286)">
          <rect x="-14" y="-4" width="28" height="18" rx="2" fill="var(--wood)"/><rect x="-4" y="4" width="8" height="10" rx="1.5" fill="var(--wood2)"/>
          <path d="M-20,-2 L0,-20 L20,-2 Z" fill="var(--thatch)"/><path d="M-20,-2 L0,-20 L20,-2" fill="none" stroke="var(--thatch2)" stroke-width="2"/>
        </g>
        <g transform="translate(318,290)">
          <rect x="-14" y="-4" width="28" height="18" rx="2" fill="var(--wood)"/><rect x="-4" y="4" width="8" height="10" rx="1.5" fill="var(--wood2)"/>
          <path d="M-20,-2 L0,-20 L20,-2 Z" fill="var(--thatch)"/><path d="M-20,-2 L0,-20 L20,-2" fill="none" stroke="var(--thatch2)" stroke-width="2"/>
        </g>
      </g>
      <g transform="translate(290,262)"><circle r="7" fill="var(--stone2)"/><circle r="4.5" fill="var(--water)"/></g>

      <g transform="translate(284,48) scale(.8)" filter="url(#soft)">
        <rect x="-14" y="-4" width="28" height="18" rx="2" fill="var(--wood)"/><rect x="-4" y="4" width="8" height="10" rx="1.5" fill="var(--wood2)"/>
        <path d="M-20,-2 L0,-20 L20,-2 Z" fill="var(--thatch)"/><path d="M-20,-2 L0,-20 L20,-2" fill="none" stroke="var(--thatch2)" stroke-width="2"/>
      </g>
      <g transform="translate(350,108) rotate(30)">
        <path d="M-18,0 Q0,9 18,0 L14,-5 L-14,-5 Z" fill="var(--wood)"/>
        <path d="M-12,-2 H12" stroke="var(--wood2)" stroke-width="1.5"/>
      </g>
      <g transform="translate(312,22) rotate(-10)">
        <path d="M-18,0 Q0,9 18,0 L14,-4 L-14,-4 Z" fill="var(--wood)"/>
        <path d="M0,-4 V-24" stroke="var(--wood2)" stroke-width="2"/>
        <path d="M1.5,-23 L13,-7 L1.5,-7 Z" fill="var(--sand2)"/>
      </g>`
  },

  sample: {
    "1.1": ["Village@L", "RicePaddies@C", "Beach@R"],
    "1.2": ["Beach@C", "Beach@C", "Village@R"],
    "1.3": ["RicePaddies@L", "Village@C", "RicePaddies@L"],
    "2.1": ["Village@R", "Beach@L", "RicePaddies@R"],
    "2.2": ["RicePaddies@C", "", "Beach@R"],
    "2.3": ["Beach@L", "Village@L", "Village@C"],
    "3.1": ["RicePaddies@R", "Beach@C", "Village@R"],
    "3.2": ["Village@C", "RicePaddies@L", "Village@C"],
    "4.1": ["Beach@R", "Beach@R", "RicePaddies@C", "Beach@R"],
    "4.2": ["Village@L", "RicePaddies@R", "Beach@C", "Village@R"]
  }
};

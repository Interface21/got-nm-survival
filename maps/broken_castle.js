/* ================= Broken Castle (ปราสาทพัง) ================= */
window.MAPS = window.MAPS || {};
window.MAPS.broken_castle = {
  id: "broken_castle",
  icon: "🏚️",
  name: { th: "ปราสาทพัง", en: "Broken Castle" },
  hasAura: false,

  palette: {
    ground: "#2d2a28", ground2: "#35312e", ground3: "#3e3935",
    ash: "#4a4440", ember: "#e2571e", ember2: "#f59e0b", smoke: "#6a6460",
    stone: "#4d4a47", stone2: "#413e3b", stonedark: "#2b2927",
    wall: "#5a554e", wall2: "#46423d",
    water: "#24404d", water2: "#335868", shore: "#3b3632",
    forest: "#3a2d2b", forest2: "#3a2e26", forest3: "#231b19", trunk: "#2a201c", blossom: "#b0607a",
    roof: "#3f3a3a", roof2: "#332f2f", roof3: "#262323", wood: "#4a3a2e", iron: "#262422",
    path: "#4a4440", path2: "#554e49"
  },

  locs: {
    Keep: {
      icon: "🏰", name: { th: "หอปราการ", en: "Keep" },
      x: 200, y: 110,
      spawns: [
        { id: "L", x: 272, y: 24, name: { th: "ซ้าย",  en: "Left" } },
        { id: "C", x: 200, y: 14, name: { th: "กลาง", en: "Center" } },
        { id: "R", x: 130, y: 22, name: { th: "ขวา",   en: "Right" } }
      ]
    },
    Foundry: {
      icon: "⚒️", name: { th: "โรงหลอม", en: "Foundry" },
      x: 95, y: 238,
      spawns: [
        { id: "L", x: 70, y: 322, name: { th: "ซ้าย",  en: "Left" } },
        { id: "C", x: 22, y: 260, name: { th: "กลาง", en: "Center" } },
        { id: "R", x: 20, y: 170, name: { th: "ขวา",   en: "Right" } }
      ]
    },
    "Burnt Garden": {
      icon: "🌸", name: { th: "สวนไหม้", en: "Burnt Garden" },
      x: 302, y: 238,
      spawns: [
        { id: "L", x: 380, y: 170, name: { th: "ซ้าย",  en: "Left" } },
        { id: "C", x: 382, y: 262, name: { th: "กลาง", en: "Center" } },
        { id: "R", x: 330, y: 322, name: { th: "ขวา",   en: "Right" } }
      ]
    }
  },

  trees: {
    style: "burnt",
    list: [
      [262, 206, 10], [352, 214, 11], [272, 292, 9], [362, 300, 10], [398, 232, 8],
      [22, 32, 10], [62, 16, 9], [340, 34, 10], [382, 54, 9], [160, 302, 9], [232, 322, 8], [28, 312, 9]
    ]
  },
  rocks: [[150, 182, 6], [250, 182, 5], [182, 252, 6], [230, 232, 4], [60, 120, 5], [342, 120, 5], [206, 300, 5]],

  art: {
    /* ดินไหม้ + คูเมือง */
    back: `
      <rect x="-20" y="-20" width="440" height="370" fill="var(--ground)"/>
      <ellipse cx="200" cy="100" rx="150" ry="90" fill="var(--ground2)" opacity=".85"/>
      <ellipse cx="95" cy="250" rx="100" ry="80" fill="var(--ash)" opacity=".35"/>
      <ellipse cx="310" cy="250" rx="100" ry="80" fill="var(--ground3)" opacity=".6"/>
      <rect x="-20" y="-20" width="440" height="370" fill="url(#grass)" opacity=".5"/>

      <path d="M-20,196 C40,186 48,60 200,52 C352,60 360,186 420,196" fill="none" stroke="var(--shore)" stroke-width="24"/>
      <path d="M-20,196 C40,186 48,60 200,52 C352,60 360,186 420,196" fill="none" stroke="var(--water)" stroke-width="15"/>
      <path d="M40,150 C70,90 120,64 180,58" fill="none" stroke="var(--water2)" stroke-width="2" opacity=".6"/>

      <g fill="var(--ash)" opacity=".55">
        <ellipse cx="160" cy="300" rx="40" ry="10"/><ellipse cx="250" cy="200" rx="30" ry="8"/><ellipse cx="60" cy="300" rx="30" ry="8"/>
      </g>`,

    /* กำแพงปราการที่พังเป็นช่วง ๆ + เศษหิน */
    mid: `
      <g fill="none" stroke-linecap="square">
        <path d="M136,166 V124 L152,104 M172,84 H212 M236,90 L248,104 L264,124 V166" stroke="var(--wall2)" stroke-width="10"/>
        <path d="M136,166 V124 L152,104 M172,84 H212 M236,90 L248,104 L264,124 V166" stroke="var(--wall)" stroke-width="6"/>
      </g>
      <g fill="var(--stone2)">
        <rect x="158" y="90" width="7" height="5" transform="rotate(20 161 92)"/><rect x="220" y="84" width="6" height="5" transform="rotate(-15 223 86)"/>
        <rect x="128" y="172" width="8" height="5"/><rect x="262" y="172" width="7" height="6" transform="rotate(30 265 175)"/>
      </g>`,

    /* หอปราการ โรงหลอม สวน */
    front: `
      <g transform="translate(200,112)" filter="url(#soft)">
        <path d="M-44,30 L-36,6 L36,6 L44,30 Z" fill="var(--stone2)"/>
        <path d="M-40,18 H40 M-20,6 V30 M0,6 V30 M20,6 V30" stroke="var(--stonedark)" stroke-width="1.2" opacity=".75"/>
        <rect x="-28" y="-14" width="56" height="20" fill="var(--wood)"/>
        <path d="M-40,-12 Q0,-22 40,-12 L30,-20 Q0,-30 -30,-20 Z" fill="var(--roof)"/>
        <rect x="-18" y="-36" width="36" height="18" fill="var(--wood)"/>
        <path d="M-28,-34 Q0,-44 28,-34 L20,-40 Q0,-49 -20,-40 Z" fill="var(--roof2)"/>
        <path d="M-12,-40 L-9,-56 L-3,-48 L2,-60 L7,-47 L12,-40 Z" fill="var(--roof3)"/>
        <rect x="-20" y="-9" width="6" height="8" fill="var(--iron)"/><rect x="14" y="-9" width="6" height="8" fill="var(--iron)"/>
        <rect x="-4" y="-31" width="8" height="10" fill="var(--iron)"/>
        <circle cx="16" cy="-28" r="4" fill="var(--ember)" opacity=".55"/>
        <path d="M22,-12 l6,-8 l3,6" fill="none" stroke="var(--roof3)" stroke-width="2"/>
      </g>

      <g transform="translate(95,240)" filter="url(#soft)">
        <ellipse cx="0" cy="24" rx="58" ry="18" fill="var(--ash)" opacity=".6"/>
        <rect x="-38" y="-6" width="52" height="28" rx="2" fill="var(--wood)"/>
        <path d="M-46,-4 L-34,-22 L18,-22 L18,-4 Z" fill="var(--roof)"/>
        <rect x="-26" y="4" width="12" height="18" fill="var(--iron)" opacity=".8"/>
        <path d="M-6,16 h14 v-3 h-4 v-4 h8 v-3 h-22 v3 h8 v4 h-4 Z" fill="var(--iron)"/>
        <path d="M16,22 L16,-8 Q30,-22 44,-8 L44,22 Z" fill="var(--stone2)"/>
        <path d="M22,22 V8 Q30,0 38,8 V22 Z" fill="var(--ember)"/>
        <path d="M26,22 V12 Q30,8 34,12 V22 Z" fill="var(--ember2)"/>
        <rect x="34" y="-42" width="8" height="30" fill="var(--stonedark)"/>
        <circle cx="40" cy="-50" r="7" fill="var(--smoke)" opacity=".45"/>
        <circle cx="47" cy="-62" r="9" fill="var(--smoke)" opacity=".3"/>
        <circle cx="42" cy="-78" r="11" fill="var(--smoke)" opacity=".18"/>
      </g>

      <g transform="translate(300,240)">
        <ellipse cx="16" cy="18" rx="36" ry="17" fill="var(--shore)"/>
        <ellipse cx="16" cy="18" rx="30" ry="12" fill="var(--water)"/>
        <path d="M-6,18 Q16,4 38,18" fill="none" stroke="var(--wood)" stroke-width="5" stroke-linecap="round"/>
        <path d="M-2,16 v-5 M8,11 v-5 M24,11 v-5 M34,16 v-5" stroke="var(--wood)" stroke-width="1.5"/>
        <g fill="var(--stone)">
          <rect x="-34" y="4" width="8" height="14"/><rect x="-37" y="-2" width="14" height="6" rx="1"/><rect x="-36" y="18" width="12" height="4"/>
        </g>
        <ellipse cx="-24" cy="32" rx="16" ry="5" fill="var(--ash)"/>
      </g>

      <g fill="var(--ember)" opacity=".6">
        <circle cx="140" cy="214" r="2"/><circle cx="60" cy="206" r="1.6"/><circle cx="276" cy="228" r="1.8"/>
        <circle cx="330" cy="200" r="1.4"/><circle cx="120" cy="280" r="1.6"/><circle cx="238" cy="150" r="1.5"/>
      </g>`
  },

  sample: {
    "1.1": ["Keep@C", "Foundry@L", "Burnt Garden@R"],
    "1.2": ["Burnt Garden@L", "Burnt Garden@L", "Keep@R"],
    "1.3": ["Foundry@R", "Keep@L", "Foundry@R"],
    "2.1": ["Keep@L", "Burnt Garden@C", "Foundry@C"],
    "2.2": ["Foundry@L", "", "Keep@C"],
    "2.3": ["Burnt Garden@R", "Keep@R", "Foundry@L"],
    "3.1": ["Keep@R", "Foundry@C", "Burnt Garden@C"],
    "3.2": ["Burnt Garden@C", "Keep@L", "Burnt Garden@C"],
    "4.1": ["Foundry@C", "Foundry@C", "Keep@L", "Foundry@C"],
    "4.2": ["Keep@C", "Burnt Garden@R", "Foundry@R", "Keep@L"]
  }
};

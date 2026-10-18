/* ================= Frozen Valley (หุบเขาน้ำแข็ง) ================= */
window.MAPS = window.MAPS || {};
window.MAPS.frozen_valley = {
  id: "frozen_valley",
  icon: "❄️",
  name: { th: "หุบเขาน้ำแข็ง", en: "Frozen Valley" },
  hasAura: false,

  palette: {
    ground: "#303e4c", ground2: "#384858", ground3: "#425364",
    snow: "#5d7082", snow2: "#8196aa",
    stone: "#4a525c", stone2: "#3e4650", stonedark: "#2a3139",
    cliff: "#232a33", cliff2: "#343e4a",
    water: "#27566f", water2: "#4a84a6", ice: "#7aa0b8", shore: "#3a4855",
    forest: "#2b4a45", forest2: "#233d39", forest3: "#1a2e2b", trunk: "#3a2f28",
    wood: "#4a3c30", roof: "#5a4236", roof2: "#48352b", roof3: "#34261e",
    banner: "#8f3030", steel: "#8b97a5",
    path: "#4b5561", path2: "#58636f"
  },

  /* คลังอาวุธ = ซ้าย · เนินเขา = ขวาบน · น้ำตก = ล่างกลาง */
  locs: {
    Armory: {
      icon: "⚔️", name: { th: "คลังอาวุธ", en: "Armory" },
      x: 96, y: 122,
      spawns: [
        { id: "L", x: 153, y: 28, name: { th: "ซ้าย",  en: "Left" } },
        { id: "C", x: 18, y: 100, name: { th: "กลาง", en: "Center" } },
        { id: "R", x: 22, y: 190, name: { th: "ขวา",   en: "Right" } }
      ]
    },
    Hillside: {
      icon: "⛰️", name: { th: "เนินเขา", en: "Hillside" },
      x: 300, y: 100,
      spawns: [
        { id: "L", x: 394, y: 150,  name: { th: "ซ้าย",  en: "Left" } },
        { id: "C", x: 372, y: 30,  name: { th: "กลาง", en: "Center" } },
        { id: "R", x: 228, y: 40, name: { th: "ขวา",   en: "Right" } }
      ]
    },
    Waterfalls: {
      icon: "🌊", name: { th: "น้ำตก", en: "Waterfalls" },
      x: 210, y: 264,
      /* น้ำตกมีจุดเกิด 2 จุด */
      spawns: [
        { id: "L", x: 320, y: 312, name: { th: "ซ้าย", en: "Left" } },
        { id: "R", x: 110, y: 315, name: { th: "ขวา",  en: "Right" } }
      ]
    }
  },

  trees: {
    style: "pine",
    list: [
      [18, 24, 12], [106, 16, 10], [14, 252, 12], [46, 238, 9], [60, 294, 11],
      [150, 302, 9], [268, 324, 9], [382, 330, 11], [404, 250, 9], [162, 128, 10],
      [188, 90, 9], [232, 128, 9], [404, 208, 8], [98, 232, 8]
    ]
  },
  rocks: [[150, 162, 6], [300, 244, 5], [42, 150, 4], [344, 220, 5], [398, 94, 5], [140, 262, 5]],

  art: {
    /* เนินหิมะ (ขวาบน) + หน้าผาครึ่งวง น้ำตก แอ่งน้ำ ลำธาร (ล่างกลาง) */
    back: `
      <rect x="-20" y="-20" width="440" height="370" fill="var(--ground)"/>
      <ellipse cx="300" cy="100" rx="135" ry="118" fill="var(--ground2)"/>
      <ellipse cx="300" cy="100" rx="98" ry="84" fill="var(--ground3)"/>
      <ellipse cx="300" cy="100" rx="62" ry="52" fill="var(--snow)" opacity=".6"/>
      <g fill="none" stroke="var(--snow2)" stroke-width="1.5" opacity=".25">
        <ellipse cx="300" cy="100" rx="116" ry="100"/><ellipse cx="300" cy="100" rx="80" ry="68"/><ellipse cx="300" cy="100" rx="44" ry="36"/>
      </g>
      <g fill="var(--snow)" opacity=".45">
        <ellipse cx="60" cy="300" rx="44" ry="14"/><ellipse cx="110" cy="40" rx="50" ry="14"/><ellipse cx="40" cy="220" rx="40" ry="12"/>
        <ellipse cx="370" cy="306" rx="52" ry="15"/><ellipse cx="150" cy="180" rx="26" ry="8"/>
      </g>
      <rect x="-20" y="-20" width="440" height="370" fill="url(#grass)" opacity=".35"/>

      <!-- หน้าผาหินหลังน้ำตก: ขอบบนเป็นเนินหิน ขอบล่างหยักแบบผาจริง -->
      <path d="M118,242 C112,220 126,200 146,194 C154,178 174,168 192,174 C204,162 224,162 236,172 C254,166 274,176 280,192 C300,198 310,220 302,244
               C292,236 280,242 270,234 C258,242 246,234 236,240 L226,230 L196,230 L186,240 C174,234 164,242 152,234 C142,242 130,236 118,242 Z" fill="var(--cliff)"/>
      <path d="M124,236 C120,220 132,204 150,200 C158,186 176,178 192,182 C206,172 222,172 234,180 C252,176 270,184 276,198 C292,204 300,220 296,236" fill="none" stroke="var(--cliff2)" stroke-width="3" opacity=".9"/>
      <path d="M150,214 l10,8 M170,200 l6,12 M250,196 l-6,12 M272,214 l-10,8 M240,212 l4,10 M176,222 l-4,8" stroke="var(--cliff2)" stroke-width="2" stroke-linecap="round" opacity=".7"/>
      <path d="M146,194 C154,180 172,172 190,176 M204,166 C216,162 228,166 236,172 M254,168 C266,170 276,178 280,190" fill="none" stroke="var(--snow2)" stroke-width="3" stroke-linecap="round" opacity=".7"/>

      <!-- น้ำตก -->
      <path d="M198,222 L224,222 L232,258 L190,258 Z" fill="var(--water2)" opacity=".92"/>
      <path d="M202,226 V254 M208,224 V256 M214,224 V257 M220,226 V254 M226,230 V252" stroke="var(--ice)" stroke-width="1.6" opacity=".85"/>
      <path d="M196,222 H226" stroke="var(--ice)" stroke-width="3" stroke-linecap="round" opacity=".8"/>

      <!-- แอ่งน้ำ -->
      <ellipse cx="210" cy="268" rx="46" ry="22" fill="var(--shore)"/>
      <ellipse cx="210" cy="268" rx="40" ry="17" fill="var(--water)"/>
      <ellipse cx="210" cy="270" rx="28" ry="10" fill="none" stroke="var(--water2)" stroke-width="2" opacity=".6"/>
      <ellipse cx="188" cy="276" rx="10" ry="3" fill="var(--ice)" opacity=".45"/>
      <g fill="var(--ice)" opacity=".75">
        <ellipse cx="200" cy="259" rx="6" ry="2.5"/><ellipse cx="216" cy="261" rx="7" ry="2.5"/><ellipse cx="228" cy="258" rx="4" ry="2"/>
      </g>

      <!-- ลำธารไหลออกทางขวา -->
      <path d="M246,276 C274,294 330,302 424,296" fill="none" stroke="var(--shore)" stroke-width="20" stroke-linecap="round"/>
      <path d="M246,276 C274,294 330,302 424,296" fill="none" stroke="var(--water)" stroke-width="12" stroke-linecap="round"/>
      <path d="M258,286 C284,298 330,301 380,298" fill="none" stroke="var(--ice)" stroke-width="2" opacity=".6"/>`,

    mid: ``,

    /* ศาลบนเนิน คลังอาวุธ สะพาน */
    front: `
      <g transform="translate(300,96)" filter="url(#soft)">
        <rect x="-16" y="-6" width="32" height="20" rx="2" fill="var(--wood)"/>
        <path d="M-24,-4 Q0,-26 24,-4 Z" fill="var(--roof)"/>
        <path d="M-17,-11 Q0,-23 17,-11" fill="none" stroke="var(--snow2)" stroke-width="3" stroke-linecap="round"/>
        <rect x="-5" y="2" width="10" height="12" fill="var(--roof3)"/>
        <g fill="var(--stone)">
          <rect x="-36" y="4" width="6" height="10"/><rect x="-38" y="0" width="10" height="4" rx="1"/>
          <rect x="30" y="4" width="6" height="10"/><rect x="28" y="0" width="10" height="4" rx="1"/>
        </g>
      </g>

      <g transform="translate(98,120)" filter="url(#soft)">
        <ellipse cx="0" cy="26" rx="60" ry="18" fill="var(--snow)" opacity=".5"/>
        <rect x="-40" y="-8" width="80" height="32" rx="2" fill="var(--wood)"/>
        <path d="M-50,-6 L-38,-26 L38,-26 L50,-6 Z" fill="var(--roof)"/>
        <path d="M-50,-6 L50,-6" stroke="var(--roof3)" stroke-width="3"/>
        <path d="M-38,-26 L38,-26" stroke="var(--snow2)" stroke-width="4" stroke-linecap="round"/>
        <rect x="-10" y="4" width="20" height="20" rx="1.5" fill="var(--roof3)"/>
        <g stroke="var(--steel)" stroke-width="2" stroke-linecap="round">
          <path d="M-54,24 V-4 M-48,24 V-8 M-42,24 V-2"/>
          <path d="M44,24 V-6 M50,24 V-10 M56,24 V-4"/>
        </g>
        <path d="M-58,12 H-40 M40,12 H60" stroke="var(--wood)" stroke-width="3"/>
        <rect x="-30" y="-46" width="3" height="22" fill="var(--wood)"/><path d="M-27,-46 h11 v15 l-5.5,-3 l-5.5,3 Z" fill="var(--banner)"/>
        <rect x="27" y="-46" width="3" height="22" fill="var(--wood)"/><path d="M30,-46 h11 v15 l-5.5,-3 l-5.5,3 Z" fill="var(--banner)"/>
      </g>

      <g transform="translate(364,298) rotate(84)">
        <rect x="-18" y="-7" width="36" height="14" rx="3" fill="var(--wood)"/>
        <path d="M-11,-7 v14 M-4,-7 v14 M3,-7 v14 M10,-7 v14" stroke="var(--roof3)" stroke-width="1.5"/>
      </g>`
  },

  sample: {
    "1.1": ["Hillside@C", "Armory@L", "Waterfalls@R"],
    "1.2": ["Waterfalls@L", "Waterfalls@L", "Armory@C"],
    "1.3": ["Hillside@R", "Armory@R", "Hillside@R"],
    "2.1": ["Armory@C", "Hillside@L", "Waterfalls@R"],
    "2.2": ["Waterfalls@R", "", "Hillside@C"],
    "2.3": ["Armory@L", "Armory@R", "Waterfalls@L"],
    "3.1": ["Hillside@L", "Waterfalls@L", "Armory@C"],
    "3.2": ["Armory@R", "Hillside@C", "Armory@R"],
    "4.1": ["Waterfalls@R", "Waterfalls@R", "Hillside@L", "Waterfalls@R"],
    "4.2": ["Armory@L", "Hillside@R", "Waterfalls@R", "Armory@C"]
  }
};

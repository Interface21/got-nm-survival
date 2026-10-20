# แผนที่ SVG

แผนที่วาดด้วย SVG จากไฟล์ข้อมูลด่าน ไม่มีภาพ bitmap สักไฟล์ ทุกด่านใช้ `viewBox="-18 -18 436 366"` (พื้นที่วาดหลัก 0 ถึง 400 x 0 ถึง 330 เผื่อขอบ 18)

มีสองตัววาด

- `maps/viewer.js` ดูอย่างเดียว เปิดเป็น `window.MapView.render(svg, mapId, slots, labelOf, dimOf)` ใช้ใน `index.html`
- `maps/engine.js` ต้นแบบที่แตะจุดเกิดบนแผนที่เพื่อเลือกลำดับและสีได้ มีหน้าของตัวเอง `maps/index.html` ยังไม่ต่อ backend ใช้ `sample` ในไฟล์ด่านเป็นข้อมูล

## โครงไฟล์ด่าน

```js
window.MAPS = window.MAPS || {};
window.MAPS.broken_castle = {
  id: "broken_castle",               // ต้องตรงกับ key ที่ server สร้างจากชื่ออังกฤษ
  icon: "🏚️",
  name: { th: "ปราสาทพัง", en: "Broken Castle" },
  hasAura: false,                    // true = ด่านนี้มีสีออร่า (หมุดใช้สีออร่า)

  palette: {                         // กลายเป็น CSS variable --ground, --stone ... บน <svg>
    ground: "#2d2a28", stone: "#4d4a47", path: "#4a4440", path2: "#554e49",
    forest: "#3a2d2b", trunk: "#2a201c", /* ... */
  },

  locs: {
    Keep: {                          // key = id สถานที่ ต้องตรงกับชื่ออังกฤษในชีท
      icon: "🏰", name: { th: "หอปราการ", en: "Keep" },
      x: 200, y: 110,                // ศูนย์กลางวงสถานที่
      spawns: [                      // ฝั่งที่มีจริง (2 หรือ 3 ฝั่ง)
        { id: "L", x: 272, y: 24, name: { th: "ซ้าย", en: "Left" } },
        { id: "C", x: 200, y: 14, name: { th: "กลาง", en: "Center" } },
        { id: "R", x: 130, y: 22, name: { th: "ขวา", en: "Right" } }
      ]
    },
    /* อีก 2 สถานที่ */
  },

  trees: { style: "burnt", list: [[x, y, r], ...] },   // style: round | pine | burnt
  rocks: [[x, y, r], ...],

  art: {                             // SVG ดิบ ใช้ var(--palette) และ pattern/filter ที่ engine เตรียม
    back: `...พื้น น้ำ...`,
    mid: `...กำแพง...`,
    front: `...อาคาร...`
  },

  sample: { "1.1": ["Keep@C", "Foundry@L", "Burnt Garden@R"], ... }   // ใช้ในต้นแบบ
};
```

ฝั่ง L/R เป็นมุมมองของผู้เล่นในเกม ไม่ใช่ซ้ายขวาของภาพ ใน Broken Castle ฝั่ง L ของ Keep อยู่ x = 272 (ขวาของภาพ) ห้ามสลับตอนวางพิกัด (เคยมีบั๊กนี้ ดู 08)

## ลำดับชั้นการวาด

```
<defs>      pattern #tile, pattern #grass, filter #soft (drop shadow)
art.back    พื้นหลัง
.mv-woods   ต้นไม้จาก trees.list
art.mid     กลางภาพ
.mv-roads   ถนนจากจุดเกิดเข้าหาสถานที่ (สร้างจากพิกัดเอง: quadratic curve โค้งเล็กน้อย 2 ชั้นสี)
art.front   อาคาร
.mv-rocks   หิน
.mv-zones   วงประรอบสถานที่ (r=46) + ชื่อสถานที่ช่วงล่างของวง (ตัวขาวขอบเข้ม paint-order stroke)
.mv-spawns  หมุดจุดเกิด
```

viewer.js วาดฉากใหม่เฉพาะเมื่อด่านหรือชื่อที่แสดงเปลี่ยน (cache key = `mapId + ชื่อทุกสถานที่` เก็บใน `svg.dataset.map`) หมุดวาดใหม่ทุกครั้ง

## หมุดจุดเกิด

- ฝั่งที่ไม่มีข้อมูล: วงกลม r=10 สี `--spawn` จาง
- ฝั่งที่มีลำดับเดียว: วงกลมสูง 32 มีเลขลำดับตัวขาวหนา 17px
- ฝั่งที่มีหลายลำดับ (จุดเดียวเกิดซ้ำ): แคปซูลกว้าง `27 * n + 6` แบ่งช่องละลำดับ คั่นด้วยเส้นสี `--panel`
- สี: ด่านมีออร่า ใช้สีออร่าของลำดับนั้น (สองสีแบ่งบนล่าง) ไม่มีสีใช้ `--spawn` ด่านไม่มีออร่าใช้ `--accent`
- มีรัศมีจาง (fill-opacity .28) รอบหมุด และขอบ `--panel` 3.5px
- ข้อมูลที่ไม่มีฝั่ง (`"Pagoda"`) วางหมุดกลางวงสถานที่
- ตำแหน่ง x ถูกบีบให้อยู่ใน -14 ถึง 414 ไม่หลุดขอบ
- `dimOf(index)` true = ลำดับนั้นของอีกทีม ทั้งหมุดของอีกทีมจาง .3 ทั้งก้อน ถ้าปนกันจางเฉพาะช่อง

## เรียกใช้จาก index.html

```js
window.MapView.render(
  document.getElementById('map-svg'),
  curM,                                   // id ด่าน
  gData.spawnData[mapW][mapS],            // ["Keep@L", "", ...]
  loc => shortName(curM, loc, uiLang()),  // ชื่อที่แสดงบนแผนที่
  idx => isOtherTeam(mapW, mapS, idx)     // จางหรือไม่
);
```

`render()` คืน false ถ้าไม่มีข้อมูลด่าน index.html ตรวจ `window.MapView && window.MAPS && window.MAPS[curM]` ก่อน ถ้าไม่มีก็ซ่อนแท็บแผนที่

## เพิ่มด่านใหม่

1. เพิ่มด่านและสถานที่ในชีท `B3:E14` (ชื่อ TH/EN)
2. สร้าง `maps/<id>.js` ตามโครงข้างบน `id` = ชื่ออังกฤษตัวเล็ก ช่องว่างเป็น `_` และ key ของ `locs` = ชื่ออังกฤษของสถานที่ตรงตัว
3. เปิด `maps/index.html` บนคอม Shift+คลิกบนแผนที่เพื่ออ่านพิกัด x/y แล้วใส่ใน `spawns`
4. เพิ่ม `<script src="maps/<id>.js">` ใน `index.html` ก่อน `viewer.js` และใน `maps/index.html` ก่อน `engine.js` และเพิ่ม id ใน `MAP_ORDER` ของ `engine.js`
5. เพิ่ม emoji ของสถานที่ใน `mapIcons` ของ `index.html` (หน้าแก้ไขใช้รายการนี้สร้างปุ่ม)
6. (ถ้าต้องการ) เพิ่มคำย่อใน `NAMES_TH` และ `SHORT_EN`
7. ถ้าด่านมีสีออร่า ตั้ง `hasAura: true` และแก้เงื่อนไข `curM === 'hidden_temple'` ใน `index.html` (ตอนนี้ฝังชื่อด่านไว้ ดู 08)

## ใช้แนวทางนี้กับแอปอื่น

รูปแบบ "ไฟล์ข้อมูลหนึ่งไฟล์ต่อหนึ่งฉาก + ตัววาดกลาง" ใช้ได้กับแผนผังร้าน ผังที่นั่ง แผนที่สนาม ผังโกดัง

- แยกข้อมูลเชิงโครงสร้าง (จุดที่มีความหมาย + พิกัด) ออกจากภาพประกอบ (art เป็น SVG ดิบ)
- ให้ภาพประกอบใช้ CSS variable จาก palette ของฉากนั้น เปลี่ยนโทนได้โดยไม่แก้ภาพ
- ถนนหรือเส้นเชื่อมสร้างจากพิกัดอัตโนมัติ ไม่ต้องวาดเอง
- ตัววาดรับ callback สำหรับชื่อและสถานะ (`labelOf`, `dimOf`) ไม่ผูกกับ state ของแอป

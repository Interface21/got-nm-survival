# โมเดลข้อมูล

## ผังชีท `WeeklyMap`

| เซลล์ | ค่า | โค้ดที่ใช้ |
|---|---|---|
| `B1` | รหัสผ่านแอดมิน | `checkAdminPassword` |
| `E1`, `F1` | `Total Visits:` และจำนวนผู้เข้าชม (สำเนาของ Script Property `VISIT_COUNT`) | `getAndIncrementVisitCount` |
| `B3:E14` | config ด่านและสถานที่ (TH/EN) | `getWeeklyMapData` |
| `A16:N16` | ข้อมูลจุดเกิดของสัปดาห์นี้ | ทุก action |
| `C17:N17` | ทีมของแต่ละจุด | `readTeams`, `saveTeamPoint` |

เซลล์อื่น (เช่นคอลัมน์ A ของแถว 3 ถึง 14) โค้ดไม่อ่าน ใช้เป็นหัวตารางหรือโน้ตได้

### Config ด่าน (`B3:E14`)

อ่านทีละแถว คอลัมน์ B, C, D, E

- แถวที่มีทั้ง B และ C คือหัวด่านใหม่ key ของด่าน = ชื่ออังกฤษ ตัวเล็ก ช่องว่างเป็น `_` (เช่น `Hidden Temple` → `hidden_temple`)
- แถวที่มี E คือจุด (สถานที่) ของด่านล่าสุด `id` = ชื่ออังกฤษใน E
- แถวเดียวอาจมีทั้งหัวด่านและจุดแรกได้

ผลลัพธ์ส่งไป client เป็น

```js
mapsData = {
  hidden_temple: {
    name: { th: "วัดลับ", en: "Hidden Temple" },
    points: [ { id: "Cemetery", name: { th: "...", en: "Cemetery" } }, ... ]
  },
  ...
}
```

แอดมินแก้ชื่อไทยหรือเพิ่มด่านในชีทได้ แต่ emoji ของสถานที่ (`mapIcons`), คำย่อ (`NAMES_TH`, `SHORT_EN`) และภาพแผนที่ (`maps/*.js`) อยู่ในโค้ด ด่านใหม่ต้องเพิ่มทั้งสองที่

### แถว 16: ข้อมูลสัปดาห์นี้

แอปไม่เก็บประวัติ เขียนทับแถวเดียวตลอด

| คอลัมน์ | ค่า |
|---|---|
| A | วันที่ของรอบ `d/m/yyyy` (กุญแจสัปดาห์) |
| B | ชื่ออังกฤษของด่าน (ว่าง = ยังไม่เลือกด่าน) |
| C ถึง N | 12 เซลล์ เรียง W1S1, W1S2, W1S3, W2S1 ... W4S3 |

สูตรคอลัมน์ (1-based): `col = 3 + (wave - 1) * 3 + (subwave - 1)`

แต่ละเซลล์เก็บจุดเกิดเรียงตามลำดับ คั่นด้วย `|` เช่น

```
Cemetery@L:orange|Pagoda@C:blue|Courtyard@R:green
Foundry@L||Keep@C          ← ลำดับ 2 ว่าง ตำแหน่งไม่เลื่อน
```

### แถว 17: ทีม

คอลัมน์ C ถึง N ตรงกับแถว 16 เก็บ `A`, `B` หรือว่างต่อจุด คั่นด้วย `|` เช่น `A||B`

## รูปแบบสตริงของจุดเกิด

```
<location>[@<side>][:<color>[,<color>]]
```

| ตัวอย่าง | ความหมาย |
|---|---|
| `Pagoda` | สถานที่อย่างเดียว (ข้อมูลรุ่นเก่า หรือยังไม่ระบุฝั่ง) |
| `Pagoda@L` | ฝั่งซ้าย |
| `Cemetery@R:orange` | ฝั่งขวา สีส้ม |
| `Cemetery@C:orange,blue` | เวฟ 4 สองสี |
| `Pagoda:green` | มีสีแต่ไม่มีฝั่ง |
| (ว่าง) | ยังไม่มีข้อมูล |

ฟังก์ชันคู่ใน client:

```js
function parsePt(raw) {
    const [head, c] = (raw || "").split(':');
    const [loc, side] = head.split('@');
    return { loc, side: side || "", colors: c ? c.split(',').filter(Boolean) : [] };
}
function buildPt(p) {
    return p.loc + (p.side ? '@' + p.side : '') + (p.colors.length ? ':' + p.colors.join(',') : '');
}
```

การ encode เป็นสตริงทำให้ข้อมูลหนึ่งเวฟย่อยอยู่ในเซลล์เดียว แอดมินอ่านในชีทได้ และรูปแบบขยายได้โดยไม่ทำให้ข้อมูลเก่าพัง (ตอนเพิ่มฝั่ง `@L` ข้อมูลที่ไม่มี `@` ยังอ่านได้)

`splitPoints()` ฝั่ง server เก็บช่องว่างตรงกลางไว้ และตัดเฉพาะช่องว่างท้ายสุด ตำแหน่งของแต่ละลำดับจึงไม่เลื่อนเวลามีจุดว่าง

## กฎของโดเมน

| กฎ | ค่า | ใช้ที่ไหน |
|---|---|---|
| จุดต่อเวฟย่อย | เวฟ 1-3 = 3, เวฟ 4 = 4 | `limit = w === 4 ? 4 : 3` ใช้ทั่วทั้งโค้ด |
| เวฟย่อยต่อเวฟ | 3 | `[1,2,3]` |
| สีต่อจุด (Hidden Temple) | เวฟ 1-3 = 1 (เลือกใหม่แทนที่), เวฟ 4 = 2 (เพิ่มได้ถึงสอง) | `maxColors` |
| เวลาต่อเวฟย่อย | เวฟ 1-3 = 90 วินาที, เวฟ 4 = 120 วินาที | `startSubWaveTimer` |
| จุดเดียวเกิดซ้ำได้ | เวฟ 1-3 = 2 ครั้ง, เวฟ 4 = 3 ครั้ง | มีเฉพาะในต้นแบบ `engine.js` (`repeatMax`) |
| เปลี่ยนด่านได้ | เมื่อยังไม่มีข้อมูลเวฟใดเลย | `canChangeMap = !isMapSet \|\| !hasWaveData` |
| ทีมที่ไม่ได้กำหนด | ถ้าในเวฟย่อยมี A แล้ว ที่เหลือเป็น B, มีแต่ B ที่เหลือเป็น A | `teamOf()` ฝั่ง client เท่านั้น ไม่เขียนลงชีท |

## โครง `spawnData` และ `teamData`

```js
spawnData = {
  1: { 1: ["Cemetery@L:orange", "", "Pagoda@C"], 2: [...], 3: [...] },
  2: { ... },
  3: { ... },
  4: { 1: [a, b, c, d], 2: [...], 3: [...] }
}
teamData = { 1: { 1: ["A", "", "B"], ... }, ... }   // โครงเดียวกัน
```

## ผลของ `getWeeklyMapData`

```js
{
  success: true,
  mapDate: "13/10/2026",
  currentMapId: "hidden_temple",   // "" ถ้ายังไม่มีด่าน
  mapNameEn: "Hidden Temple",
  spawnData, teamData, mapsData,
  isNewWeek: false,                // แถว 16 ไม่ใช่สัปดาห์นี้ (server ล้างให้แล้ว)
  isMapSet: true,
  hasWaveData: true,
  canChangeMap: false,
  visitCount: 12345
}
```

`getLatestSpawnData` คืนโครงคล้ายกันแต่ไม่มี `mapsData`, `visitCount`, `currentMapId` และมี `isCurrentWeek` แทน `isNewWeek` client แปลง `mapNameEn` เป็น id ด้วย `findMapIdByName()`

## State ฝั่ง client

ตัวแปร global ใน `<script>` ของ `index.html`

| ตัวแปร | ความหมาย |
|---|---|
| `gData` | ผลจาก server ทั้งก้อน (`mapsData`, `spawnData`, `teamData`, flag ต่าง ๆ) |
| `curM` | id ด่านที่กำลังแสดง |
| `isAdmin`, `adminPass` | โหมดแอดมินและรหัสที่ใช้ตอน Save |
| `hasUnsavedChanges`, `originalSpawnDataString`, `originalMapId` | สำรองไว้คืนค่าเมื่อแอดมินออกโดยไม่ Save |
| `editingW`, `editingS`, `tempPts` | เวฟย่อยที่เปิด sheet แก้ไขอยู่ และค่าที่แสดงใน sheet |
| `activeSubW`, `activeSubS`, `subWaveTimeRemaining`, `subWaveTimerInterval` | เวฟย่อยที่กำลังจับเวลา |
| `ptState` | คิวบันทึกทีละจุด key = `"spawn.w.s.i"` หรือ `"team.w.s.i"` |
| `viewMode`, `mapW`, `mapS` | แท็บปัจจุบัน และเวฟย่อยที่เลือกในแผนที่ |
| `speechLang`, `voiceEnabled`, `speechRate` | ภาษา (ใช้ทั้ง UI และเสียง) และการตั้งค่าเสียง |
| `myTeam` | ทีมของเครื่องนี้ `''`, `'A'`, `'B'` |
| `mapPickerForced` | หน้าต่างเลือกด่านถูกเปิดเพราะยังไม่มีด่าน |

`render()` วาดทุกส่วนใหม่จาก state ทุกครั้ง (innerHTML) ไม่มี virtual DOM ไม่มี framework แอปเล็กพอที่จะทำแบบนี้ได้

## localStorage

ทุก key ขึ้นต้นด้วย `got_` กันชนกับแอปอื่นบนโดเมนเดียวกัน

| key | ค่า | ใช้ทำอะไร |
|---|---|---|
| `got_theme` | `light` / `dark` | ธีม (ไม่มีค่า = ตามระบบ) |
| `got_lang` | `TH` / `EN` | ภาษา UI และเสียง |
| `got_voice` | `true` / `false` | เปิดเสียง |
| `got_speech_rate` | `1.0` ถึง `2.5` | ความเร็วเสียง |
| `got_curMap` | id ด่าน | ด่านที่ดูล่าสุด (ใช้เมื่อสัปดาห์นี้ยังไม่มีด่าน) |
| `got_view` | `list` / `text` / `map` / `team` / `settings` | แท็บล่าสุด |
| `got_team` | `''` / `A` / `B` | ทีมของฉัน |
| `got_team_week` | `d/m/yyyy` | สัปดาห์ที่ตอบคำถามทีมแล้ว (ถามสัปดาห์ละครั้ง) |
| `got_feature_v3_seen` | `true` | เห็น What's New v3 แล้ว |

ค่าที่อ่านจาก localStorage ถูกตรวจก่อนใช้ เช่น `got_view` ต้องอยู่ในรายการแท็บ, `got_team` ต้องเป็น A หรือ B, `speechRate` ต่ำกว่า 1.0 ถูกดันขึ้นเป็น 1.0

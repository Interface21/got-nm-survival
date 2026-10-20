# สถาปัตยกรรม

## Stack

| ชั้น | เลือกใช้ | เหตุผล |
|---|---|---|
| Frontend | HTML ไฟล์เดียว + JavaScript ล้วน ไม่มี build step | แก้แล้ว push ได้ทันที ไม่มี node_modules |
| CSS | Tailwind ผ่าน CDN (`cdn.tailwindcss.com`) ตั้ง `darkMode: 'class'` | เขียน class ใน template string ของ JS ได้เลย |
| ไอคอน | Font Awesome 6.0.0 (cdnjs) + emoji สำหรับสถานที่ | emoji ไม่ต้องโหลดภาพ อ่านง่ายบนมือถือ |
| ฟอนต์ | JetBrains Mono (ละติน) + Noto Sans Thai Looped (ไทย) จาก Google Fonts | ตัวเลขเวฟกว้างเท่ากัน ไทยมีหัวอ่านง่าย |
| QR | QRious 4.0.2 (cdnjs) | สร้าง QR บน canvas แล้วบันทึกเป็น PNG |
| เสียง | Web Speech API (`speechSynthesis`) | ไม่มีค่าใช้จ่าย รองรับ th-TH บนมือถือส่วนใหญ่ |
| แผนที่ | SVG วาดด้วย JS จากไฟล์ข้อมูลด่าน | ไม่มีภาพ bitmap ขยายได้ไม่แตก |
| Backend | Google Apps Script (V8) deploy เป็น Web App | ฟรี ผูกกับ Google Sheet ได้ตรง |
| ฐานข้อมูล | Google Sheet แผ่นเดียว (`WeeklyMap`) | แอดมินแก้ config ด่านในชีทได้เองโดยไม่ต้องแก้โค้ด |
| ตัวนับ | `PropertiesService.getScriptProperties()` | เขียนเร็วกว่าเซลล์ชีท |
| กันเขียนชน | `LockService.getScriptLock()` | หลายคนบันทึกพร้อมกันได้ |

## โครงไฟล์

```
got_nm/
├─ .clasp.json          scriptId ของ Apps Script, rootDir = โฟลเดอร์นี้
├─ .claspignore         ไม่ push maps/** ขึ้น Apps Script
├─ appsscript.json      timeZone Asia/Bangkok, V8, webapp executeAs USER_DEPLOYING, access ANYONE_ANONYMOUS
├─ code.js              backend ทั้งหมด (doGet, doPost, ฟังก์ชันอ่าน/เขียนชีท)
├─ index.html           frontend ทั้งหมด (markup, style, script)
├─ test.html            หน้าทดสอบเรียก API ด้วย fetch
├─ .agents/AGENTS.md    กฎ agent: แก้ backend แล้ว clasp push + clasp deploy ทันที
└─ maps/
   ├─ hidden_temple.js  ข้อมูลด่าน: พิกัด, ภาพ SVG, palette, ข้อมูลตัวอย่าง
   ├─ river_village.js
   ├─ frozen_valley.js
   ├─ broken_castle.js
   ├─ viewer.js         window.MapView.render() แผนที่ดูอย่างเดียว ใช้ใน index.html
   ├─ engine.js         ต้นแบบแผนที่แตะบันทึกได้ (ยังไม่ต่อ backend)
   ├─ engine.css        สไตล์ของต้นแบบ (dark only, CSS variables)
   └─ index.html        หน้าต้นแบบแผนที่
```

## การ host

Backend กับ frontend อยู่คนละที่

- `doGet` ของ Apps Script คืนแค่ข้อความ `API is running. Use POST for data requests.` ไม่ได้ serve `index.html`
- `index.html` โหลด `maps/*.js` แบบ relative path และ `.claspignore` ตัด `maps/**` ออก แปลว่า frontend ต้องอยู่บน static host ที่มีทั้ง `index.html` และโฟลเดอร์ `maps/` (repo มี remote ที่ GitHub `Interface21/got-nm-survival` แต่ใน repo ไม่มีไฟล์ตั้งค่า hosting ให้ยืนยัน)
- frontend เรียก backend ผ่าน URL `/exec` ของ Web App ที่ฝังไว้ในค่าคงที่ `WEB_APP_URL`

## API

### รูปแบบการเรียก

ทุก action เป็น `POST` ไปที่ URL เดียว body เป็น JSON `{ action, args }`

```js
async function apiCall(action, ...args) {
    const res = await fetch(WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, args })
    });
    const text = await res.text();
    return JSON.parse(text);   // โค้ดจริงห่อ try/catch และ log raw text เมื่อ parse ไม่ได้
}
```

`Content-Type: text/plain` เป็นเทคนิคสำคัญ: ทำให้ browser ถือว่าเป็น simple request ไม่ส่ง CORS preflight (`OPTIONS`) ซึ่ง Apps Script ตอบไม่ได้ ฝั่ง server อ่าน body จาก `e.postData.contents` แล้ว `JSON.parse` เอง

### Router ฝั่ง server

`doPost` เป็น if/else ตามชื่อ action ส่ง `args[n]` เข้าฟังก์ชัน แล้วคืน `ContentService` แบบ JSON เสมอ ถ้า throw จะคืน `{ error: "..." }`

| action | args | คืนค่า | หมายเหตุ |
|---|---|---|---|
| `getWeeklyMapData` | ไม่มี | ข้อมูลเต็ม + `mapsData` + `visitCount` | เรียกครั้งเดียวตอนเปิดแอป นับผู้เข้าชม +1 ถ้าเป็นสัปดาห์ใหม่จะล้างแถวข้อมูล |
| `getLatestSpawnData` | ไม่มี | ข้อมูลสัปดาห์นี้แบบเบา | ไม่นับผู้เข้าชม ใช้ refresh |
| `setWeeklyMap` | `mapNameEn` | `{status, latest}` หรือ error `map_locked` / `invalid_map` | ผู้เล่นเลือกหรือเปลี่ยนด่าน ชื่อต้องตรงกับด่านใน config (`readMapsData`) |
| `saveSpawnPoint` | `wave, subwave, index, value, mapNameEn` | `{status, latest}` | เขียนจุดเดียว แถว 16 ค่าต้องผ่าน `SPAWN_RE` (`สถานที่[@L\|C\|R][:สี[,สี]]`) |
| `saveTeamPoint` | `wave, subwave, index, team, mapNameEn` | `{status, latest}` | team ต้องเป็น `""`, `"A"`, `"B"` เขียนแถว 17 |
| `checkAdminPassword` | `pass` | `{ok: boolean}` | เทียบกับเซลล์ `B1` |
| `saveWeeklyMapData` | `mapId, mapNameEn, spawnData, pass` | `{status}` | แอดมิน เขียนทั้งแถว 16 ทับ |

### รูปแบบผลลัพธ์

- action อ่านข้อมูลคืน `{ success: true, ... }` หรือ `{ success: false, error }`
- action เขียนข้อมูลคืน `{ status: "success", latest }` หรือ `{ status: "error", code?, message }`
- `latest` คือผลของ `getLatestSpawnData()` หลังเขียนเสร็จ client เอาไปแทน state ทันทีโดยไม่ต้องเรียกซ้ำ ลดจำนวน round trip
- `message` เป็นสองภาษาในสตริงเดียว `"ข้อความไทย / English message"`

### Error code ที่ client ตัดสินใจจาก code ไม่ใช่จากข้อความ

| code | เกิดเมื่อ | client ทำอะไร |
|---|---|---|
| `no_map` | บันทึกจุดแต่สัปดาห์นี้ยังไม่มีด่าน | ทิ้งคิว ปิด sheet โหลดใหม่ เปิดหน้าต่างเลือกด่าน |
| `map_mismatch` | ด่านที่ client ส่งมาไม่ตรงกับด่านในชีท (มีคนเปลี่ยนไปแล้ว) | ทิ้งคิว ปิด sheet โหลดใหม่ แจ้ง "Map Changed" |
| `map_locked` | เปลี่ยนด่านทั้งที่มีข้อมูลเวฟแล้ว | ปิดหน้าต่างเลือกด่าน โหลดใหม่ แจ้ง "Map Locked" |
| `invalid_map` | ส่งชื่อด่านว่าง | แจ้งข้อผิดพลาด |

## กลไกฝั่ง server ที่ควรยกไปใช้

### รอบสัปดาห์จากเวลาไทย

`getCurrentResetDateStr()` คำนวณวันที่ของ "วันจันทร์ 22:00 น. รอบล่าสุด" ด้วย `Utilities.formatDate(now, "Asia/Bangkok", "u")` (1 = จันทร์) และ `"H"` (ชั่วโมง)

- วันจันทร์ก่อน 22:00 → ถอยไป 7 วัน
- วันจันทร์ตั้งแต่ 22:00 → วันนี้
- วันอื่น → ถอยไป `day - 1` วัน

คืนสตริง `d/m/yyyy` ใช้เป็นกุญแจของรอบ ทุก action เทียบกุญแจนี้กับเซลล์ `A16` ถ้าไม่ตรงคือสัปดาห์ใหม่ ข้อมูลเก่าถือว่าไม่มี ไม่ต้องตั้ง trigger หรือ cron

### ล็อกก่อนเขียน

```js
const lock = LockService.getScriptLock();
try {
    if (!lock.tryLock(20000)) return { status: "error", message: "Busy, please try again." };
    // ตรวจเงื่อนไข → อ่าน → แก้ → เขียน
    SpreadsheetApp.flush();
    return { status: "success", latest: getLatestSpawnData() };
} finally {
    try { lock.releaseLock(); } catch (e) {}
}
```

`SpreadsheetApp.flush()` ก่อนอ่าน latest ทำให้ค่าที่ส่งกลับเป็นค่าหลังเขียนจริง

### เขียนทีละจุดแบบ merge

`savePointInRow(row, wave, subwave, index, value, mapNameEn)` ใช้ร่วมกันทั้งจุดเกิด (แถว 16) และทีม (แถว 17)

1. ตรวจว่าสัปดาห์นี้มีด่านและเป็นด่านเดียวกับที่ client ส่งมา (`checkWeekMap`)
2. อ่านเซลล์ของเวฟย่อยนั้น แยกด้วย `|`
3. แก้เฉพาะตำแหน่ง `index` ถ้าค่าเท่าเดิมไม่เขียน
4. เติมช่องว่างให้ถึง index ตัดช่องว่างท้ายออก แล้ว join กลับ

ผลคือผู้เล่นสองคนแก้คนละจุดของเวฟย่อยเดียวกันได้โดยไม่ทับกัน

### ล้างข้อมูลที่ขึ้นกับข้อมูลอื่น

ทีม (แถว 17) ผูกกับจุดเกิดของด่านนั้น ทุกครั้งที่เปลี่ยนสัปดาห์หรือเปลี่ยนด่าน server ล้าง `C17:N17` ด้วย

### ค้นหาชีทแบบทนทาน

`getOurSheet()` หาแผ่นชื่อ `WeeklyMap` ก่อน ไม่เจอค่อยเทียบชื่อแบบตัดช่องว่างและไม่สนตัวพิมพ์ ไม่เจออีกใช้แผ่นแรก

## การ deploy

```
clasp push
clasp deploy -i <DEPLOYMENT_ID>
```

ใช้ deployment ID เดิมทุกครั้งเพื่อให้ URL `/exec` ไม่เปลี่ยน frontend ไม่ต้องแก้ `WEB_APP_URL` ไฟล์ `.agents/AGENTS.md` สั่งให้ agent รันสองคำสั่งนี้ทันทีเมื่อแก้ `code.js` หรือ `appsscript.json`

frontend deploy แยก (อัปโหลด `index.html` และ `maps/` ขึ้น static host)

ค่าใน `appsscript.json`:

```json
{
  "timeZone": "Asia/Bangkok",
  "runtimeVersion": "V8",
  "exceptionLogging": "STACKDRIVER",
  "webapp": { "executeAs": "USER_DEPLOYING", "access": "ANYONE_ANONYMOUS" }
}
```

`USER_DEPLOYING` ทำให้สคริปต์เขียนชีทด้วยสิทธิ์เจ้าของ ผู้เล่นไม่ต้องมีบัญชี Google

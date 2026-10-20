# คู่มือยกไปสร้างแอปใหม่

เอกสารนี้สรุปเป็นขั้นตอนและโค้ดตั้งต้นสำหรับแอปใหม่ที่ใช้ stack และหน้าตาเดียวกัน โค้ดตัวอย่างตัดมาจาก got_nm แล้วทำให้ทั่วไปขึ้น ให้เปลี่ยนชื่อ prefix, ชื่อชีท และโดเมนตามแอปใหม่

## เช็กลิสต์ก่อนเริ่ม

- [ ] ข้อมูลหลักของแอปคืออะไร มี "รอบ" ไหม (รายวัน รายสัปดาห์) กุญแจรอบคำนวณจากอะไร
- [ ] หน่วยที่เล็กที่สุดที่คนสองคนอาจแก้พร้อมกันคืออะไร (ใน got_nm คือ "จุดเดียวในเวฟย่อย") ให้บันทึกที่ระดับนั้น
- [ ] งานไหนทุกคนทำได้ งานไหนต้องแอดมิน
- [ ] ข้อความไหนใส่สองภาษาพร้อมกัน ข้อความไหนสลับตามภาษา
- [ ] มีขั้นแรกที่ต้องทำก่อนทุกอย่างไหม (ใน got_nm คือเลือกด่าน) ถ้ามี ทำเป็น modal บังคับ
- [ ] ผู้ใช้ใช้แอประหว่างทำอย่างอื่นไหม ถ้าใช่ ต้องมี action แตะเดียว เสียง และตัวจับเวลา
- [ ] prefix ของ localStorage (got_nm ใช้ `got_`)
- [ ] สีหลัก (got_nm ใช้ indigo) และสีความหมายอื่น ดูตารางใน 05

## ขั้นตอนตั้งโปรเจกต์

1. สร้าง Google Sheet ตั้งชื่อแผ่น, เขียน config และกำหนดเซลล์ข้อมูล ตั้งเซลล์ที่เก็บกุญแจรอบเป็น Plain text (ดู 08)
2. Extensions → Apps Script สร้างสคริปต์ผูกกับชีท
3. `npm i -g @google/clasp`, `clasp login`, `clasp clone <scriptId>` ในโฟลเดอร์โปรเจกต์
4. ตั้ง `appsscript.json` (timeZone, V8, webapp `USER_DEPLOYING` + `ANYONE_ANONYMOUS`)
5. ตั้ง `.claspignore` ไม่ให้ push ไฟล์ frontend ที่ไม่เกี่ยว
6. `clasp push` แล้ว `clasp deploy` ครั้งแรก จด deployment ID ไว้ ครั้งต่อไปใช้ `clasp deploy -i <ID>` URL จะไม่เปลี่ยน
7. ใส่ URL `/exec` ใน `WEB_APP_URL` ของ frontend
8. host frontend บน static host (เช่น GitHub Pages)
9. เขียนกฎ deploy ไว้ใน `AGENTS.md` หรือ `CLAUDE.md` ของ repo ถ้าใช้ AI agent ช่วย

## Backend ตั้งต้น (`code.js`)

```js
const SHEET_NAME = 'Main';
const TZ = 'Asia/Bangkok';

function doGet() {
  return ContentService.createTextOutput('API is running. Use POST.');
}

// action → ฟังก์ชัน (แทน if/else ยาว)
const ACTIONS = {
  getAll:      () => getAll(),
  getLatest:   () => getLatest(),
  saveField:   (a) => saveField(a[0], a[1], a[2], a[3]),
  checkAdmin:  (a) => ({ ok: checkAdmin(a[0]) })
};

function doPost(e) {
  let result;
  try {
    const { action, args = [] } = JSON.parse(e.postData.contents);
    result = ACTIONS[action] ? ACTIONS[action](args) : { error: 'Action not found' };
  } catch (err) {
    result = { error: err.toString() };
  }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME)
      || ss.getSheets().find(s => s.getName().trim().toLowerCase() === SHEET_NAME.toLowerCase())
      || ss.getSheets()[0];
}

// กุญแจรอบ: วันจันทร์ 22:00 รอบล่าสุด (แก้ตามแอปใหม่)
function currentPeriodKey() {
  const now = new Date();
  const day = +Utilities.formatDate(now, TZ, 'u');   // 1 = จันทร์
  const hour = +Utilities.formatDate(now, TZ, 'H');
  const back = day === 1 ? (hour < 22 ? 7 : 0) : day - 1;
  return Utilities.formatDate(new Date(now.getTime() - back * 86400000), TZ, 'd/M/yyyy');
}

// ห่อทุก action เขียน: lock + ตรวจบริบท + flush + ส่ง snapshot กลับ
function withLock(fn) {
  const lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(20000)) return { status: 'error', code: 'busy', message: 'ระบบกำลังบันทึกของคนอื่น ลองใหม่ / Busy, try again.' };
    const err = fn();
    if (err) return err;
    SpreadsheetApp.flush();
    return { status: 'success', latest: getLatest() };
  } catch (e) {
    return { status: 'error', message: e.message };
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

// บันทึก field เดียวในเซลล์ที่เก็บหลายค่าคั่นด้วย | โดยไม่ทับ field อื่น
function saveField(cellA1, index, value, contextKey) {
  return withLock(() => {
    const sheet = getSheet();
    if (!isValidValue(value)) return { status: 'error', code: 'invalid', message: 'Invalid value.' };
    if (!contextMatches(sheet, contextKey)) return { status: 'error', code: 'context_changed', message: '...' };
    const cell = sheet.getRange(cellA1);
    const parts = splitKeepGaps(cell.getDisplayValue());
    const i = parseInt(index, 10);
    const v = (value || '').toString().trim();
    if ((parts[i] || '') === v) return null;          // ค่าเท่าเดิม ไม่เขียน
    while (parts.length <= i) parts.push('');
    parts[i] = v;
    while (parts.length && !parts[parts.length - 1]) parts.pop();
    cell.setValue(parts.join('|'));
    return null;
  });
}

function splitKeepGaps(s) {
  const p = s ? s.toString().trim().split('|') : [];
  while (p.length && !p[p.length - 1]) p.pop();
  return p;
}
```

`isValidValue` ต้องตรวจค่ากับรายการที่อนุญาต (whitelist) เสมอ อย่าเก็บสตริงอะไรก็ได้จากผู้ใช้นิรนาม (ดู 08)

## Frontend ตั้งต้น

### หัวไฟล์

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <title>App name</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>tailwind.config = { darkMode: 'class' };</script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai+Looped:wght@400;500;600;700;800&display=swap');
    html { height: 100%; height: -webkit-fill-available; }
    body { font-family: 'JetBrains Mono', 'Noto Sans Thai Looped', sans-serif; background: #DBD8C9; margin: 0;
           display: flex; justify-content: center; height: 100vh; height: 100dvh; overflow: hidden;
           transition: background-color .3s; }
    html.dark body { background: #090D16; }
    #app { width: 100%; max-width: 550px; height: 100%; max-height: 100dvh; display: flex; flex-direction: column;
           background: #F4F4F5; box-shadow: 0 0 40px rgba(0,0,0,.15); position: relative; overflow: hidden;
           padding-top: env(safe-area-inset-top); transition: background-color .3s; }
    @media (min-width: 700px) { #app { max-width: 900px; } }
    @media (min-width: 1024px) { #app { max-width: 1100px; } }
    html.dark #app { background: #0F172A; box-shadow: 0 0 50px rgba(0,0,0,.7); }
    ::-webkit-scrollbar { display: none; }
    * { touch-action: manipulation; }
  </style>
  <script>
    const P = 'app_';   // prefix localStorage
    const t = localStorage.getItem(P + 'theme');
    if (t === 'dark' || (!t && matchMedia('(prefers-color-scheme: dark)').matches)) document.documentElement.classList.add('dark');
  </script>
</head>
```

สคริปต์ตั้งธีมอยู่ใน `<head>` เพื่อไม่ให้จอกระพริบขาวก่อนเปลี่ยนเป็นมืด (got_nm วางไว้ท้าย body ซึ่งอาจกระพริบได้)

### โครง body

```html
<body>
<div id="app">
  <div id="loading" class="absolute inset-0 z-50 bg-[#F4F4F5] dark:bg-slate-900 flex flex-col items-center justify-center">
    <i class="fa-solid fa-circle-notch fa-spin text-4xl text-indigo-500 mb-3"></i>
    <p id="loading-text" class="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wider text-center">CONNECTING...<br><span class="text-[10px] font-normal">กำลังเชื่อมต่อข้อมูล</span></p>
  </div>

  <div class="flex-1 px-3 py-3 flex flex-col gap-3 overflow-y-auto relative pb-20">
    <div id="tabs" class="sticky -top-3 z-30 -mt-3 pt-3 flex-shrink-0 bg-[#F4F4F5] dark:bg-[#0F172A]">
      <div id="tab-row" class="grid grid-cols-4 gap-1 p-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700"></div>
    </div>
    <div id="view"></div>
    <div class="text-center mt-2 mb-4"><span class="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-widest uppercase">Developed by ...</span></div>
  </div>

  <!-- modal ยืนยัน/error ตัวเดียวใช้ทั้งแอป -->
  <div id="dialog" class="hidden absolute inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
    <div onclick="event.stopPropagation()" class="bg-white dark:bg-slate-800 dark:text-gray-100 p-6 rounded-3xl w-full max-w-xs text-center shadow-2xl my-auto border dark:border-slate-700">
      <div id="dialog-icon-bg" class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><i id="dialog-icon" class="text-3xl"></i></div>
      <h3 id="dialog-title" class="font-black mb-2 text-lg text-gray-800 dark:text-white"></h3>
      <p id="dialog-desc" class="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed px-2 font-medium"></p>
      <div id="dialog-buttons" class="flex gap-2"></div>
    </div>
  </div>

  <div id="toast" class="hidden absolute top-20 left-1/2 -translate-x-1/2 bg-gray-800/95 backdrop-blur text-white px-5 py-2.5 rounded-full z-[100] shadow-xl flex items-center gap-2"></div>
</div>
</body>
```

### ฟังก์ชันพื้นฐาน

```js
const API_URL = 'https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec';

async function api(action, ...args) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },   // กัน CORS preflight
    body: JSON.stringify({ action, args })
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch (e) { console.error('Raw:', text); throw new Error('Invalid JSON from server'); }
}

// ข้อความจากข้อมูลผู้ใช้ต้องผ่านตัวนี้ก่อนใส่ innerHTML
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const store = {
  get: (k, d = null) => { try { return localStorage.getItem(P + k) ?? d; } catch (e) { return d; } },
  set: (k, v) => { try { localStorage.setItem(P + k, v); } catch (e) {} }
};

let lang = store.get('lang', 'th');
const T = o => o[lang];                         // T({ th: 'บันทึก', en: 'Save' })

function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  const icon = type === 'error' ? 'fa-circle-xmark text-red-400' : 'fa-circle-check text-emerald-400';
  el.innerHTML = `<i class="fa-solid ${icon}"></i><div class="text-xs font-bold">${esc(msg)}</div>`;
  el.classList.remove('hidden');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.add('hidden'), 3000);
}

function dialog(type, title, desc, onConfirm) {
  const S = {
    error:   ['bg-red-100 dark:bg-red-950/60', 'fa-solid fa-circle-xmark text-red-500'],
    confirm: ['bg-yellow-100 dark:bg-yellow-950/60', 'fa-solid fa-triangle-exclamation text-yellow-500 dark:text-yellow-400']
  }[type];
  document.getElementById('dialog-icon-bg').className = 'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ' + S[0];
  document.getElementById('dialog-icon').className = S[1] + ' text-3xl';
  document.getElementById('dialog-title').textContent = title;
  document.getElementById('dialog-desc').textContent = desc;
  const box = document.getElementById('dialog-buttons');
  const btn2 = 'flex-1 p-2.5 rounded-xl font-bold transition text-xs leading-tight';
  box.innerHTML = type === 'error'
    ? `<button data-x class="${btn2} bg-red-600 text-white hover:bg-red-700">OK<br><span class="text-[10px] font-normal">ตกลง</span></button>`
    : `<button data-x class="${btn2} bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200">Cancel<br><span class="text-[10px] font-normal">ยกเลิก</span></button>
       <button data-ok class="${btn2} bg-indigo-600 text-white hover:bg-indigo-700">Confirm<br><span class="text-[10px] font-normal">ยืนยัน</span></button>`;
  const close = () => document.getElementById('dialog').classList.add('hidden');
  box.querySelector('[data-x]').onclick = close;
  const ok = box.querySelector('[data-ok]');
  if (ok) ok.onclick = () => { close(); onConfirm && onConfirm(); };
  document.getElementById('dialog').classList.remove('hidden');
}

// ปุ่มที่กำลังส่ง
async function busy(btn, fn) {
  const old = btn.innerHTML;
  btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';
  btn.disabled = true;
  try { return await fn(); } finally { btn.innerHTML = old; btn.disabled = false; }
}
```

### คิวบันทึกทีละ field

```js
const SAVE_DELAY = 1500;
const queue = {};   // key → { args, value, ver, timer, status: wait | saving | saved | error }
const isBusy = q => !!q && ['wait', 'saving', 'error'].includes(q.status);

function queueField(key, args, value) {
  const q = queue[key] || (queue[key] = { ver: 0 });
  clearTimeout(q.timer);
  Object.assign(q, { args, value, ver: q.ver + 1, status: 'wait', timer: setTimeout(() => flushField(key), SAVE_DELAY) });
  render();
}

async function flushField(key) {
  const q = queue[key];
  if (!q) return;
  clearTimeout(q.timer); q.timer = null;
  const ver = q.ver;
  if (q.value === savedValue(key)) { q.status = ''; render(); return; }   // ไม่เปลี่ยน ไม่ส่ง

  q.status = 'saving'; render();
  let res;
  try { res = await api('saveField', ...q.args, q.value, currentContextKey()); }
  catch (e) { res = { status: 'error', message: e.toString() }; }

  if (res.status === 'success') {
    if (q.ver === ver) q.status = 'saved';                 // ผู้ใช้ไม่ได้แก้ต่อระหว่างส่ง
    applyLatest(res.latest);
  } else if (res.code === 'context_changed') {
    for (const k in queue) { clearTimeout(queue[k].timer); delete queue[k]; }
    await refresh();
    dialog('error', 'Data changed (ข้อมูลถูกเปลี่ยน)', res.message);
  } else if (q.ver === ver) {
    q.status = 'error';                                     // UI ให้แตะเพื่อเรียก flushField(key) ซ้ำ
  }
  render();
}

// ค่าที่จะแสดง: ถ้ายังค้างในคิว ใช้ค่าในเครื่อง ไม่งั้นใช้ค่าจาก server
const shownValue = key => isBusy(queue[key]) ? queue[key].value : savedValue(key);

// ปิดหน้าแก้ไข = ส่งที่ค้างทันที
function flushAll() { for (const k in queue) if (queue[k].timer) flushField(k); }
```

### refresh เมื่อกลับเข้าแอป

```js
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && !isEditing()) refresh();
});
```

### modal ลำดับขั้นตอนเปิดแอป

```js
const anyModalOpen = () => [...document.querySelectorAll('[data-modal]')].some(m => !m.classList.contains('hidden'));

function maybeShowOnboarding() {
  if (anyModalOpen()) return;
  if (!state.setupDone) return openSetup(true);                                 // ขั้นบังคับ
  if (!store.get('whatsnew_v1')) return openWhatsNew();                         // ปิดแล้วเรียก maybeShowOnboarding อีกครั้ง
  if (needsAskThisPeriod() && store.get('asked_period') !== state.periodKey) return openAsk();
}
```

เรียก `maybeShowOnboarding()` หลังโหลดครั้งแรก, หลังปิด modal แต่ละอัน และหลัง refresh

## สิ่งที่ยกไปได้ทันทีโดยไม่ต้องแก้

- โครง `#app` กลางจอ, กล่องเลื่อน, แถบแท็บ sticky แบบปิดช่องโหว่
- component ทั้งหมดใน 05 (การ์ด, การ์ดลายน้ำ, แถวรายการพร้อมปุ่มดินสอ, segmented tabs, เมนูตั้งค่า, modal, bottom sheet, toast, stat pill, ช่องว่างเส้นประ)
- `apiCall` แบบ text/plain, router, `withLock`, merge field ในเซลล์
- คิวบันทึกทีละ field พร้อมสถานะ 4 แบบ
- dark mode, สองภาษา, What's New จาก array
- เสียงอ่าน + ตัวจับเวลาที่ไปต่อเอง

## สิ่งที่ควรทำต่างจาก got_nm

ดูรายละเอียดใน 08 สรุปสั้น ๆ:

- escape ทุกข้อความที่มาจากผู้ใช้หรือชีทก่อนใส่ `innerHTML` และ server ตรวจค่าที่รับแบบ whitelist
- อย่าเก็บรหัสแอดมินในเซลล์ชีท ใช้ Script Properties และอย่าส่งรหัสซ้ำทุก request (ออก token ชั่วคราวแทน)
- รวมข้อมูลของแต่ละ "ฉาก" ไว้ที่เดียว (got_nm มีชื่อและไอคอนกระจายใน ชีท, `mapIcons`, `NAMES_TH`, `SHORT_EN`, `maps/*.js`)
- ใช้ flag ในข้อมูล (`hasAura`) แทนการเทียบชื่อด่านในโค้ด
- ตั้งเซลล์กุญแจรอบเป็น Plain text
- build Tailwind เป็นไฟล์ CSS แทน CDN เมื่อขึ้น production
- แยก JS ออกจาก HTML เมื่อเกินราว 1,000 บรรทัด

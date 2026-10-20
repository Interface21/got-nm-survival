# ระบบ UI

ทุกค่าในเอกสารนี้มาจาก class Tailwind ที่ใช้จริงใน `index.html` ใช้ Tailwind CDN ค่า default (ไม่มี theme extend) ยกเว้น `darkMode: 'class'`

## หลักการ

- มือถือก่อน กว้างสุด 550px ขยายเป็น 900px ที่จอ 700px ขึ้นไป และ 1100px ที่ 1024px ขึ้นไป
- การ์ดขาวมุมโค้งมากบนพื้นเทาอ่อน ทุกส่วนเป็นการ์ด
- สีหลักตัวเดียวคือ indigo ใช้กับทุกอย่างที่ "เลือกอยู่" หรือ "กดได้หลัก"
- ตัวหนาจัด (`font-black` 900) เป็นเสียงหลักของแอป ตัวเลขเวฟใช้ฟอนต์ mono
- ขนาดตัวอักษรเล็ก (9 ถึง 13px) เพราะต้องอ่านข้างจอเกม ใช้น้ำหนักและสีแยกลำดับชั้นแทนขนาด
- ทุกสีมีคู่ dark mode

## สี

### พื้นผิว

| บทบาท | Light | Dark |
|---|---|---|
| พื้นหลังนอกแอป (body) | `#DBD8C9` | `#090D16` |
| พื้นแอป (`#app`) | `#F4F4F5` (zinc-100) | `#0F172A` (slate-900) |
| การ์ด | `bg-white` | `dark:bg-slate-800` |
| พื้นรองในการ์ด | `bg-gray-50` | `dark:bg-slate-900/60` หรือ `/80` |
| เส้นขอบการ์ด | `border-gray-100` หรือ `border-gray-200/80` | `dark:border-slate-700` |
| เส้นคั่นแถว | `border-gray-100/60` | `dark:border-slate-700/60` |
| backdrop modal | `bg-black/60` + `backdrop-blur-sm` | เหมือนกัน |

เงาแอปทั้งก้อน: `box-shadow: 0 0 40px rgba(0,0,0,0.15)` (dark: `0 0 50px rgba(0,0,0,0.7)`) ทำให้แอปดูเป็น "เครื่อง" กลางจอบน desktop

### ข้อความ

| บทบาท | Light | Dark |
|---|---|---|
| หัวข้อ | `text-gray-800` | `dark:text-white` หรือ `dark:text-gray-100` |
| เนื้อหา | `text-gray-700` | `dark:text-gray-200` |
| รอง | `text-gray-500` | `dark:text-gray-400` |
| จาง (เลขเวฟที่ไม่ active, placeholder) | `text-gray-300` / `text-gray-400` | `dark:text-slate-600` / `dark:text-gray-500` |

### สีความหมาย

| ความหมาย | สี | ใช้ที่ |
|---|---|---|
| หลัก / เลือกอยู่ / ฝั่ง L C R | indigo-600 (dark indigo-500), ไฮไลต์ indigo-100 / dark indigo-900/80 | แท็บที่เลือก, ปุ่มยืนยัน, ป้ายฝั่ง, แถวที่เล่นอยู่ |
| สำเร็จ / เสียง | emerald-500 | toast สำเร็จ, เปิดเสียง, slider |
| อันตราย / วันที่ | red-500, rose-500 | modal error, ปุ่ม Clear, ป้ายสัปดาห์ |
| เตือน | yellow-400/500, พื้น yellow-50/100 | modal ยืนยัน, แจ้งเตือนสัปดาห์ใหม่ |
| ภาษา | cyan-500 | ไอคอนและ badge ภาษา |
| ธีม | amber-500 | ไอคอนธีม |
| ฟีเจอร์ใหม่ | gradient `from-rose-500 to-amber-500` | ปุ่มและไอคอนของ What's New |
| ทีม A | `bg-sky-500 text-white` | ป้ายทีม, ปุ่มทีม |
| ทีม B | `bg-fuchsia-500 text-white` | ป้ายทีม, ปุ่มทีม |
| ทั้งหมด (ไม่เลือกทีม) | `bg-slate-600 text-white` | ปุ่ม "ทั้งหมด" ที่เลือกอยู่ |

### สีประจำเวฟ (ลายน้ำ)

| เวฟ | สี |
|---|---|
| W1 | blue-500 |
| W2 | emerald-500 |
| W3 | orange-500 |
| W4 | rose-500 |

### สีออร่า (ข้อมูล)

| id | Tailwind | Hex (ในแผนที่) |
|---|---|---|
| orange | `bg-orange-500` | `#f97316` |
| blue | `bg-blue-500` | `#3b82f6` |
| green | `bg-green-500` | `#22c55e` |

### แผนที่ (มืดทั้งสองธีม)

การ์ดแผนที่ใช้ `bg-slate-800 border-slate-700` เสมอ ตัวแปร CSS ของ SVG:

```css
.map-view { --text:#e2e8f0; --muted:#94a3b8; --panel:#1e293b; --spawn:#94a3b8; --accent:#818cf8; }
```

## ตัวอักษร

```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai+Looped:wght@400;500;600;700;800&display=swap');
body { font-family: 'JetBrains Mono', 'Noto Sans Thai Looped', sans-serif; }
```

JetBrains Mono ไม่มีอักษรไทย browser จึงใช้ Noto Sans Thai Looped กับตัวไทยเอง ผลคือละตินและตัวเลขเป็น mono ไทยเป็นแบบมีหัว ช่องข้อความที่ต้องอ่านเร็ว (ชื่อจุดในแท็บตัวหนังสือและแท็บทีม) ใส่ `font-sans` เพื่อหนีจาก mono

| ระดับ | class | ใช้ที่ |
|---|---|---|
| ลายน้ำ | `text-[110px] font-black opacity-10 dark:opacity-15` | W1 ถึง W4 หลังการ์ด |
| หัว modal ใหญ่ | `text-xl font-black` | What's New |
| หัว modal | `text-lg font-black` | modal ทั่วไป, หัว sheet |
| หัวแผนที่ | `text-base font-black` | Wave 1.1 |
| ตัวเนื้อ | `text-sm` / `text-[13px]` | ปุ่มเมนู, ชื่อจุดแบบ 3 ช่อง |
| ตัวเล็ก | `text-xs` / `text-[11px]` | แท็บ, คำอธิบาย, ปุ่มแถบล่าง |
| บรรทัดภาษาที่สอง | `text-[10px] font-normal opacity-80` | ไทยใต้อังกฤษ |
| ตัวเล็กสุด | `text-[9px]` | ชื่อไทยในปุ่มเลือกสถานที่, ฝั่ง |
| เครดิต | `text-[10px] font-bold tracking-widest uppercase text-gray-400` | footer |

emoji สถานที่: `text-[30px] md:text-[34px]` (แท็บเล็ต 42px ผ่าน `.wave-icon`), ในคำอธิบาย `text-[28px] md:text-[32px]`, ในปุ่มเลือก `text-xl`

## รูปทรงและระยะ

| ชิ้น | radius |
|---|---|
| modal กลางจอ | `rounded-3xl` |
| bottom sheet | `rounded-t-3xl` |
| การ์ด, แถบแท็บ | `rounded-2xl` |
| ปุ่ม, แท็บ, ช่องใส่ | `rounded-xl` |
| ป้ายฝั่ง, badge | `rounded-lg` / `rounded-md` |
| toast, ปุ่ม X, สวิตช์ภาษา | `rounded-full` |

ระยะ: กล่องเลื่อนหลัก `px-3 py-3 gap-3 pb-20`, ระหว่างการ์ดเวฟ `gap-2.5`, padding การ์ด `p-2` / `px-2 py-1`, modal `p-6` (เลือกด่าน `p-5`), grid ปุ่ม `gap-1` ถึง `gap-2`

เงา: การ์ด `shadow-sm`, ปุ่มหลัก `shadow-md` / `shadow-lg`, modal `shadow-2xl`, เวฟที่โฟกัส `shadow-md`

## Layout หลัก

```
body (flex center, 100dvh, overflow hidden, พื้นนอก)
└─ #app (กว้างสุด 550/900/1100px, flex column, พื้นแอป, เงา, padding-top safe-area)
   ├─ #loading-overlay      absolute inset-0 z-50
   ├─ #update-notice        absolute top-20 กลาง z-40
   ├─ กล่องเลื่อน           flex-1 overflow-y-auto px-3 py-3 gap-3 pb-20
   │   ├─ #view-toggle      sticky -top-3 z-30 (แถบแท็บ 5 ช่อง + แถบทีมของฉัน)
   │   ├─ #map-bar          ด่าน / ผู้เข้าชม / สัปดาห์ (เฉพาะแท็บตั้งค่าหรือแอดมิน)
   │   ├─ #legend-container คำอธิบายไอคอน (แท็บตั้งค่า)
   │   ├─ #settings-menu    เมนูตั้งค่า
   │   ├─ #map-card         แผนที่
   │   ├─ #text-container   แท็บตัวหนังสือ
   │   ├─ #team-container   แท็บทีม
   │   ├─ #waves-container  แท็บไอคอน
   │   └─ footer เครดิต
   ├─ #admin-bar            absolute bottom-0 z-40 (แอดมิน)
   └─ modal ทั้งหมด          absolute inset-0
```

modal เป็น `absolute` ใน `#app` ไม่ใช่ `fixed` ทั้งหน้า จึงอยู่ในกรอบแอปเสมอบน desktop

### แถบแท็บที่ตรึงโดยไม่มีช่องโหว่

```html
<div class="sticky -top-3 z-30 -mt-3 pt-3 bg-[#F4F4F5] dark:bg-[#0F172A]">
  <div class="grid grid-cols-5 gap-1 p-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border ...">...</div>
</div>
```

กล่องเลื่อนมี `py-3` (12px) แถบจึงตรึงที่ `-top-3` และมี `pt-3` สีพื้นแอปปิดช่อง 12px ด้านบน เนื้อหาที่เลื่อนผ่านจะไม่โผล่เหนือแถบ

### ลำดับชั้น z-index

| ค่า | ชิ้น |
|---|---|
| `z-10` / `z-20` | ส่วนหัวและท้าย sheet, แถวที่ active |
| `z-30` | แถบแท็บ |
| `z-40` | แจ้งเตือนสัปดาห์ใหม่, แถบแอดมิน |
| `z-50` | loading, modal ทั่วไป, sheet แก้ไข |
| `z-[90]` | เลือกด่าน |
| `z-[100]` | modal ยืนยัน/error, toast |

## Component

### การ์ด

```html
<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-2 transition-colors">
```

### การ์ดเวฟพร้อมลายน้ำ

```html
<div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200/80 dark:border-slate-700 overflow-hidden px-2 py-1 transition-all duration-300 {focus}">
  <div class="absolute -right-4 -top-8 text-[110px] font-black text-blue-500 opacity-10 dark:opacity-15 pointer-events-none select-none">W1</div>
  <!-- แถวเวฟย่อย -->
</div>
```

`{focus}` = `shadow-md` สำหรับเวฟที่เล่นอยู่, `opacity-40` สำหรับเวฟอื่น, ว่างเมื่อไม่มีเวฟที่เล่นอยู่

### แถวเวฟย่อย

```
[เลข 1.1 หรือนาฬิกา 1:30]  [จุด 1] [จุด 2] [จุด 3]  [ปุ่มดินสอ]
 w-9 md:w-12 font-black      flex-1 grid / justify-evenly   w-9 h-9
```

- ปกติ: `border-b border-gray-100/60 last:border-0 rounded-xl hover:bg-gray-50`
- active: `bg-indigo-100 dark:bg-indigo-900/80 rounded-xl shadow-md border border-indigo-300 dark:border-indigo-500 scale-[1.02] my-1 ring-1 ring-indigo-400`
- เลข: ปกติ `text-gray-300 dark:text-slate-600`, active `text-indigo-600 dark:text-indigo-300 scale-110`

### จุดเกิดแบบไอคอน

```html
<div class="flex flex-col items-center">
  <div class="flex items-center gap-0.5">
    <span class="text-[30px] md:text-[34px] leading-none">🪦</span>
    <span class="ml-0.5 min-w-[24px] h-6 px-1 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white text-sm font-black flex items-center justify-center shadow-sm">L</span>
  </div>
  <div class="flex gap-1 mt-1 justify-center"><div class="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm"></div></div>
</div>
```

เมื่อเลือกทีมแล้ว ป้ายฝั่งใช้สีทีมแทน indigo ถ้าไม่มีฝั่งแสดงตัวอักษรทีมแทน

### ช่องว่าง

```html
<span class="text-sm font-bold text-gray-200 dark:text-slate-700 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-full w-8 h-8 flex items-center justify-center">?</span>
```

แอดมินเห็น `+` แทน `?`

### ปุ่มดินสอ

```html
<button class="ml-1 w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl
  bg-gradient-to-r from-indigo-500/10 to-violet-500/10 hover:from-indigo-500/20 hover:to-violet-500/20
  dark:from-indigo-400/15 dark:to-violet-400/15 border border-indigo-200/60 dark:border-indigo-500/30
  hover:scale-105 active:scale-95 transition-all shadow-sm">
  <i class="fa-solid fa-pencil text-indigo-500 dark:text-indigo-400 text-sm"></i>
</button>
```

### แท็บ (segmented control)

- กล่อง: `grid grid-cols-5 gap-1 p-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border`
- ปุ่ม: `py-2 px-1 rounded-xl text-[11px] sm:text-xs font-black leading-tight`
- เลือกอยู่: `bg-indigo-600 text-white shadow-sm`
- ไม่ได้เลือก: `text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700`
- ไอคอนในแท็บแสดงเฉพาะจอ `sm` ขึ้นไป (`hidden sm:inline`) มือถือเหลือแค่คำ

แถบ "ทีมของฉัน" ใช้กล่องแบบเดียวกัน (`flex` แทน grid) มีป้าย label ด้านซ้าย ปุ่มเลือกอยู่ใช้สีทีม

### เมนูตั้งค่า (list row)

```html
<button class="w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-between text-gray-700 dark:text-gray-200 font-bold">
  <span class="flex items-center gap-2"><i class="fa-solid fa-language text-cyan-500 w-4 text-center"></i> Language (ภาษา)</span>
  <span class="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded-md text-[10px] font-black">TH</span>
</button>
```

ไอคอนกว้างคงที่ `w-4 text-center` ให้ข้อความตรงแนว ค่าปัจจุบันอยู่ใน badge ขวา (พื้นสีเดียวกับไอคอน 10%) คั่นกลุ่มด้วย `<div class="h-px bg-gray-100 dark:bg-slate-700 my-0.5">`

### ปุ่ม

| ชนิด | class |
|---|---|
| หลัก | `bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold p-2.5` ถึง `p-3.5` |
| รอง / ยกเลิก | `bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl font-bold` |
| อันตราย | `bg-red-600 text-white hover:bg-red-700` หรือแบบเบา `text-red-500 bg-red-50 dark:bg-red-950/50` |
| ฟีเจอร์ใหม่ | `bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/20` |
| ปิด (X) | `w-8 h-8 bg-gray-100 dark:bg-slate-700 rounded-full` + `fa-xmark` |
| แถบล่าง | `flex flex-col items-center leading-none text-[11px]` ไอคอนบน `mb-1` คำล่าง |

ปุ่มสองภาษา: บรรทัดแรก `text-xs font-bold` บรรทัดสอง `<br/><span class="text-[10px] font-normal">ไทย</span>` ปุ่มคู่วาง `flex gap-2` ปุ่มละ `flex-1` ยกเลิกซ้าย ยืนยันขวา

### ปุ่มเลือก (choice tile)

ใช้กับเลือกสถานที่และเลือกด่าน

- ปกติ: `border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-500 rounded-xl`
- เลือก: `border-2 border-indigo-500 shadow-sm scale-[1.03]` ข้อความเป็น `text-indigo-700 dark:text-indigo-400` emoji จาง `opacity-60` เมื่อไม่ได้เลือก
- ด่านที่เลือกอยู่มี `fa-circle-check text-indigo-500` ด่านอื่น `fa-chevron-right text-gray-300`

ปุ่มเลือกฝั่ง: `min-w-[48px] rounded-lg border-2` เลือกอยู่ `bg-indigo-500 border-indigo-500 text-white` แสดงตัวอักษรใหญ่ `L` และคำเล็ก `ซ้าย`

ปุ่มสี: วงกลม `w-7 h-7 rounded-full bg-orange-500 border-2` เลือกอยู่ `border-gray-800 dark:border-white scale-110 shadow-md` + `fa-check` ไม่ได้เลือก `opacity-60`

### Modal กลางจอ

```html
<div class="hidden absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
  <div class="bg-white dark:bg-slate-800 dark:text-gray-100 p-6 rounded-3xl w-full max-w-xs text-center shadow-2xl my-auto border dark:border-slate-700"
       style="max-height:85dvh; overflow-y:auto">
    <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-yellow-100 dark:bg-yellow-950/60">
      <i class="fa-solid fa-triangle-exclamation text-yellow-500 text-3xl"></i>
    </div>
    <h3 class="font-black mb-2 text-lg text-gray-800 dark:text-white">Title</h3>
    <p class="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed px-2 font-medium">Desc</p>
    <div class="flex gap-2">...</div>
  </div>
</div>
```

โครงเหมือนกันทุก modal: วงกลมไอคอนสีตามความหมาย → หัวข้อ → คำอธิบาย → ปุ่ม ความกว้าง `max-w-xs` (ทั่วไป), `max-w-sm` (เลือกด่าน), `max-w-md` (What's New)

### Bottom sheet แก้ไข

```html
<div class="absolute inset-0 z-50 bg-black/60 flex flex-col justify-end items-center p-0 backdrop-blur-sm">
  <div class="bg-white dark:bg-slate-800 w-full flex-1 min-h-0 rounded-t-3xl shadow-2xl max-w-md flex flex-col overflow-hidden">
    <header class="px-4 pt-3 pb-2 border-b flex-shrink-0">หัว + คำอธิบาย + ปุ่ม X</header>
    <main class="flex flex-col gap-2.5 p-3 overflow-y-auto flex-1">การ์ดจุดละใบ</main>
    <footer class="px-4 pt-2 border-t flex-shrink-0" style="padding-bottom:max(0.75rem, env(safe-area-inset-bottom))">ปุ่มเต็มกว้าง</footer>
  </div>
</div>
```

หัวและท้ายตรึง เนื้อหาเลื่อนตรงกลาง ความสูงยืดเต็มพื้นที่ใต้แถบแท็บ

### Toast

```html
<div class="absolute top-20 left-1/2 -translate-x-1/2 bg-gray-800/95 backdrop-blur text-white px-5 py-2.5 rounded-full text-sm font-bold z-[100] shadow-xl flex items-center gap-2">
  <i class="fa-solid fa-circle-check text-emerald-400"></i><div class="text-xs font-bold">Saved! (บันทึกสำเร็จ)</div>
</div>
```

### แจ้งเตือนแถบข้าง

`bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl shadow-2xl` + ไอคอน `animate-bounce` หายเองใน 5 วินาที

### ป้ายข้อมูล (stat pill)

```html
<div class="px-3 py-2 text-xs font-black text-indigo-600 dark:text-indigo-400 tracking-wider bg-indigo-50 dark:bg-indigo-950/50 rounded-xl border border-indigo-100 dark:border-indigo-900/60 shadow-sm">
  <i class="fa-solid fa-users text-indigo-500"></i> 12,345
</div>
```

ป้ายสัปดาห์ใช้แบบเดียวกันเปลี่ยนเป็นโทน red

### Loading

overlay เต็มแอปสีพื้นแอป ไอคอน `fa-circle-notch fa-spin text-4xl text-indigo-500` และข้อความ `CONNECTING...` + ไทยตัวเล็ก ถ้าโหลดไม่ได้ ข้อความเปลี่ยนเป็น error ในที่เดิม

ปุ่มที่กำลังส่ง: แทน innerHTML ด้วย `<i class="fa-solid fa-circle-notch fa-spin"></i>` (บางที่ต่อด้วย `Saving...`) แล้วคืนค่าเดิมใน `finally`

### ตารางเวฟในแท็บแผนที่

`grid grid-cols-3 gap-1.5 p-2` 12 ปุ่ม `py-2.5 rounded-xl border` เลขใหญ่ `text-base font-black` ใต้เลขมีจุดเล็ก `w-2 h-2 rounded-full` ตามจำนวนลำดับ จุดทึบ = มีข้อมูล (สีออร่าถ้ามี), วงกลวง = ว่าง ปุ่มที่ยังไม่มีข้อมูลเลยใช้เส้นประ ปุ่มที่เลือก `bg-indigo-500 border-indigo-500 text-white`

## Dark mode

```html
<script>tailwind.config = { darkMode: 'class' };</script>
<script>
  if (localStorage.getItem('got_theme') === 'dark' ||
      (!localStorage.getItem('got_theme') && matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
</script>
```

สลับด้วยการ toggle class `dark` ที่ `<html>` แล้วบันทึกค่า ทุก element มี `transition-colors` (body และ #app มี `transition: background-color 0.3s`) การสลับจึงนุ่ม

กติกาสี dark: พื้น slate-800/900, เส้น slate-700, พื้นสีอ่อนแบบ light (`bg-indigo-50`) กลายเป็น `dark:bg-indigo-950/50` (สีเข้มโปร่ง), ข้อความสี `-600` กลายเป็น `dark:...-400`

## Responsive

| จุดตัด | การเปลี่ยน |
|---|---|
| `< 640px` | แท็บไม่มีไอคอน, เลขเวฟ `w-9` |
| `sm` 640px | แท็บมีไอคอน, ขนาด `text-xs` |
| `md` 768px | เลขเวฟ `w-12 tracking-widest`, emoji 34px, map-bar เป็นแถวเดียว |
| 700px (CSS เอง) | แอปกว้าง 900px, emoji 42px |
| 1024px | แอปกว้าง 1100px |

## Accessibility ที่มีและที่ขาด

มี: `title` บนปุ่มไอคอน, ข้อความสองภาษา, ต้นแบบแผนที่มี `aria-pressed`, `aria-label`, focus ring, คีย์บอร์ด, reduced motion

ขาดใน `index.html`: ปุ่มไอคอนไม่มี `aria-label`, modal ไม่มี `role="dialog"` และไม่จัดการ focus, การปิด double-tap zoom ด้วย `user-scalable=no` ทำให้ผู้ใช้สายตาไม่ดีซูมไม่ได้ ถ้าแอปใหม่ต้องการ accessibility ดีกว่านี้ ให้ใช้แบบในต้นแบบแผนที่เป็นมาตรฐาน

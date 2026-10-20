# เอกสารโปรเจกต์ GOT : Nightmare Survival Mode

เอกสารชุดนี้อธิบายแอป got_nm ทั้งหมด ตั้งแต่ตัวผลิตภัณฑ์ สถาปัตยกรรม ข้อมูล ไปจนถึงรูปแบบ UX/UI ทุกชิ้น เขียนไว้เพื่อยกวิธีคิดและหน้าตาของแอปนี้ไปใช้กับแอปใหม่ได้โดยไม่ต้องเปิดโค้ดเดิมอ่านทีละบรรทัด

แอปนี้เป็นเว็บแอปหน้าเดียวสำหรับผู้เล่นเกม Ghost of Yotei Legends โหมด Nightmare Survival ใช้จดและแชร์จุดเกิดศัตรูของแต่ละเวฟในด่านประจำสัปดาห์ ผู้เล่นทุกคนช่วยกันบันทึกได้พร้อมกัน ข้อมูลเก็บใน Google Sheet ผ่าน Google Apps Script

## ลำดับการอ่าน

| ไฟล์ | เนื้อหา |
|---|---|
| [01-overview.md](01-overview.md) | แอปทำอะไร ใครใช้ ฟีเจอร์ทั้งหมด และ flow หลักของผู้ใช้ |
| [02-architecture.md](02-architecture.md) | stack, โครงไฟล์, Apps Script backend, API, การ deploy |
| [03-data-model.md](03-data-model.md) | ผังชีท, รูปแบบข้อมูลที่ encode เป็นสตริง, state ฝั่ง client, localStorage |
| [04-ux-patterns.md](04-ux-patterns.md) | รูปแบบ UX ที่ยกไปใช้ได้: บันทึกร่วมกันทีละจุด, รีเซ็ตรายสัปดาห์, modal ลำดับขั้น, สองภาษา, เสียง, timer |
| [05-ui-design-system.md](05-ui-design-system.md) | สี, ฟอนต์, ขนาด, radius, dark mode, component ทุกตัวพร้อม class Tailwind |
| [06-map-engine.md](06-map-engine.md) | แผนที่ SVG ที่วาดจากไฟล์ข้อมูล, หมุดลำดับ, วิธีเพิ่มด่านใหม่ |
| [07-reuse-guide.md](07-reuse-guide.md) | ขั้นตอนสร้างแอปใหม่ด้วยแนวทางเดียวกัน พร้อมโค้ดตั้งต้น |
| [08-lessons-and-risks.md](08-lessons-and-risks.md) | บั๊กที่เคยเจอ, จุดอ่อนด้านความปลอดภัย, สิ่งที่ควรทำต่างไปในแอปใหม่ |

ถ้าต้องการแค่หน้าตา อ่าน 05 กับ 04 ถ้าต้องการโครงทั้งระบบ อ่าน 02, 03 แล้วต่อด้วย 07

## ข้อมูลอ้างอิงด่วน

- Frontend: `index.html` ไฟล์เดียว (HTML + Tailwind CDN + JS ล้วน) ประมาณ 1,900 บรรทัด
- Backend: `code.js` บน Google Apps Script (V8) ประมาณ 480 บรรทัด
- แผนที่: `maps/*.js` ไฟล์ละด่าน, `maps/viewer.js` ตัววาดแบบดูอย่างเดียว, `maps/engine.js` + `maps/index.html` ต้นแบบแผนที่ที่แตะบันทึกได้
- ฐานข้อมูล: Google Sheet แผ่น `WeeklyMap`
- เขตเวลา: `Asia/Bangkok` รีเซ็ตทุกวันจันทร์ 22:00 น.
- เวอร์ชันปัจจุบันในแอป: v3 (มีหน้า What's New)

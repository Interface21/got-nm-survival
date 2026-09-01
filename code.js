function doGet(e) {
  return ContentService.createTextOutput("API is running. Use POST for data requests.");
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const args = payload.args || [];
    
    let result;
    if (action === 'getWeeklyMapData') {
      result = getWeeklyMapData();
    } else if (action === 'checkAdminPassword') {
      result = { ok: checkAdminPassword(args[0]) };
    } else if (action === 'saveWeeklyMapData') {
      result = saveWeeklyMapData(args[0], args[1], args[2], args[3]);
    } else if (action === 'saveWaveData') {
      result = saveWaveData(args[0], args[1], args[2], args[3]);
    } else if (action === 'getLatestSpawnData') {
      result = getLatestSpawnData();
    } else {
      result = { error: 'Action not found' };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 🔍 ค้นหาชีท WeeklyMap
function getOurSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("WeeklyMap");
  if (sheet) return sheet;
  
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    if (sheets[i].getName().trim().toLowerCase() === "weeklymap") return sheets[i];
  }
  return sheets[0];
}

// ⏰ ฟังก์ชันคำนวณหาวันที่ของ "วันจันทร์ 22.00 น." รอบล่าสุด (อิงเวลาไทย)
function getCurrentResetDateStr() {
  const now = new Date();
  const tz = "Asia/Bangkok";
  
  // u = วันในสัปดาห์ (1=จันทร์, 7=อาทิตย์), H = ชั่วโมง (0-23)
  const day = parseInt(Utilities.formatDate(now, tz, "u")); 
  const hour = parseInt(Utilities.formatDate(now, tz, "H")); 
  
  let daysToSubtract = 0;
  if (day === 1) {
    // ถ้าเป็นวันจันทร์ แต่ยังไม่ถึง 4 ทุ่ม ให้อิงข้อมูลของจันทร์ที่แล้ว
    if (hour < 22) daysToSubtract = 7;
    else daysToSubtract = 0;
  } else {
    daysToSubtract = day - 1; 
  }
  
  // ถอยหลังกลับไปหาวันจันทร์ล่าสุด (86400000 ms = 1 วัน)
  const resetTimeMs = now.getTime() - (daysToSubtract * 86400000);
  const resetDate = new Date(resetTimeMs);
  
  const d = parseInt(Utilities.formatDate(resetDate, tz, "d"));
  const m = parseInt(Utilities.formatDate(resetDate, tz, "M"));
  const y = parseInt(Utilities.formatDate(resetDate, tz, "yyyy"));
  
  return d + "/" + m + "/" + y;
}

// 👥 นับจำนวนผู้เข้าชม
function getAndIncrementVisitCount(sheet) {
  let count = 1;
  try {
    const props = PropertiesService.getScriptProperties();
    count = parseInt(props.getProperty('VISIT_COUNT') || '0', 10);
    
    if (count === 0 && sheet) {
      try {
        const cellVal = parseInt(sheet.getRange("F1").getValue() || 0, 10);
        if (!isNaN(cellVal) && cellVal > 0) count = cellVal;
      } catch(e) {}
    }
    
    count++;
    props.setProperty('VISIT_COUNT', count.toString());
  } catch(e) {
    count++;
  }
  
  if (sheet) {
    try {
      sheet.getRange("E1").setValue("Total Visits:");
      sheet.getRange("F1").setValue(count);
    } catch(e) {}
  }
  
  return count;
}

// 📥 ดึงข้อมูล
function getWeeklyMapData() {
  try {
    const sheet = getOurSheet();
    const currentWeekDate = getCurrentResetDateStr();
    
    // 1. อ่าน Config
    const configRows = sheet.getRange("B3:E14").getValues();
    let mapsData = {};
    let tempMapKey = "";

    configRows.forEach(row => {
      const mTh = row[0] ? row[0].toString().trim() : "";
      const mEn = row[1] ? row[1].toString().trim() : "";
      const pTh = row[2] ? row[2].toString().trim() : "";
      const pEn = row[3] ? row[3].toString().trim() : "";

      if (mTh && mEn) {
        tempMapKey = mEn.toLowerCase().replace(/\s+/g, "_");
        mapsData[tempMapKey] = { name: { th: mTh, en: mEn }, points: [] };
      }
      if (pEn && tempMapKey) {
        mapsData[tempMapKey].points.push({ id: pEn, name: { th: pTh, en: pEn } });
      }
    });

    // 2. อ่านข้อมูลสัปดาห์ปัจจุบันจากแถวที่ 16 (บันทึกทับในแถวเดิม)
    let mapDate = currentWeekDate;
    let logMapId = Object.keys(mapsData)[0] || ""; 
    let spawnData = { 1:{1:[],2:[],3:[]}, 2:{1:[],2:[],3:[]}, 3:{1:[],2:[],3:[]}, 4:{1:[],2:[],3:[]} };
    let isDataMatchCurrentWeek = false;

    const logRange = sheet.getRange("A16:N16");
    const logDisplays = logRange.getDisplayValues()[0];
    const logValues = logRange.getValues()[0];

    const lastDateInDb = logDisplays[0] ? logDisplays[0].trim() : "";
    
    // 🌟 ตรวจสอบว่าข้อมูลในแถวที่ 16 เป็นข้อมูลของสัปดาห์นี้หรือยัง?
    if (lastDateInDb === currentWeekDate) {
      isDataMatchCurrentWeek = true;
      mapDate = lastDateInDb;
      const mapNameEn = logValues[1] ? logValues[1].toString().trim() : "";

      for (let id in mapsData) {
        if (mapsData[id].name.en.toLowerCase() === mapNameEn.toLowerCase() || mapsData[id].name.th === mapNameEn) {
          logMapId = id;
          break;
        }
      }

      let colIdx = 2;
      [1,2,3,4].forEach(w => {
        [1,2,3].forEach(s => {
          const cellData = logValues[colIdx] ? logValues[colIdx].toString().trim() : "";
          spawnData[w][s] = cellData ? cellData.split('|').filter(x => x) : [];
          colIdx++;
        });
      });
    } else {
      // 🧹 สัปดาห์ใหม่! อัปเดตวันที่แถว 16 เป็นสัปดาห์ใหม่ และล้างจุดเกิดเก่าทิ้ง (รอแอดมินตั้งด่านใหม่)
      try {
        sheet.getRange("A16").setValue(currentWeekDate);
        sheet.getRange("B16:N16").clearContent();
      } catch(e) {}
    }

    // ถ้าไม่ใช่ข้อมูลของสัปดาห์นี้ ระบบจะส่ง spawnData ที่เคลียร์ว่างเปล่ากลับไปให้ (รอให้แอดมินเซฟเป็นข้อมูลใหม่)
    const visitCount = getAndIncrementVisitCount(sheet);
    return { success: true, mapDate, currentMapId: logMapId, spawnData, mapsData, isNewWeek: !isDataMatchCurrentWeek, visitCount };

  } catch (e) {
    return { success: false, error: e.message };
  }
}

// 🔑 เช็ครหัสผ่าน
function checkAdminPassword(pass) {
  try {
    const sheet = getOurSheet();
    const correctPass = sheet.getRange("B1").getDisplayValue().trim();
    return pass.toString().trim() === correctPass;
  } catch(e) { return false; }
}

// 🚀 บันทึกข้อมูล (บันทึกทับแถวที่ 16 เสมอ ไม่เพิ่มแถวใหม่)
function saveWeeklyMapData(mapId, mapNameEn, spawnData, pass) {
  if (!checkAdminPassword(pass)) return { status: "error", message: "รหัสผ่านไม่ถูกต้อง / Incorrect Password!" };
  
  try {
    const sheet = getOurSheet();
    const currentWeekDate = getCurrentResetDateStr(); // 🌟 บังคับใช้วันที่ของรอบระบบปัจจุบันเสมอ
    
    let rowData = [currentWeekDate, mapNameEn];
    [1,2,3,4].forEach(w => {
      [1,2,3].forEach(s => {
        rowData.push((spawnData[w][s] || []).join("|"));
      });
    });

    // บันทึกทับในแถวที่ 16 โดยตรง
    sheet.getRange(16, 1, 1, 14).setValues([rowData]);

    return { status: "success" };
  } catch (e) {
    return { status: "error", message: e.message };
  }
}

// 📥 คำนวณคอลัมน์จาก Wave และ SubWave (W1S1=Col 3, W1S2=Col 4, ..., W4S3=Col 14)
function getSubWaveColIndex(w, s) {
  const wave = parseInt(w, 10);
  const subwave = parseInt(s, 10);
  return 3 + ((wave - 1) * 3) + (subwave - 1);
}

// 📖 อ่านข้อมูลบันทึกล่าสุด (แถวที่ 16) แบบเบา ๆ ไม่นับจำนวนผู้เข้าชม
function getLatestSpawnData() {
  try {
    const sheet = getOurSheet();
    const currentWeekDate = getCurrentResetDateStr();

    const logRange = sheet.getRange("A16:N16");
    const displays = logRange.getDisplayValues()[0];
    const rowDate = displays[0] ? displays[0].trim() : "";
    const mapNameEn = displays[1] ? displays[1].trim() : "";

    let spawnData = { 1:{1:[],2:[],3:[]}, 2:{1:[],2:[],3:[]}, 3:{1:[],2:[],3:[]}, 4:{1:[],2:[],3:[]} };
    const isCurrentWeek = (rowDate === currentWeekDate);

    if (isCurrentWeek) {
      let colIdx = 2;
      [1,2,3,4].forEach(w => {
        [1,2,3].forEach(s => {
          const cellData = displays[colIdx] ? displays[colIdx].toString().trim() : "";
          spawnData[w][s] = cellData ? cellData.split('|').filter(x => x) : [];
          colIdx++;
        });
      });
    }

    return { success: true, mapDate: rowDate, mapNameEn, spawnData, isCurrentWeek };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ✏️ ผู้เล่นทุกคนช่วยกันบันทึกจุดเกิดของแต่ละ Wave ลงข้อมูลหลัก (แถวที่ 16) ได้ทันที
function saveWaveData(wave, subwave, pointsStr, mapNameEn) {
  const lock = LockService.getScriptLock();
  try {
    // กันการเขียนชนกันเมื่อผู้เล่นหลายคนบันทึกพร้อมกัน
    if (!lock.tryLock(20000)) {
      return { status: "error", message: "ระบบกำลังบันทึกข้อมูลของผู้เล่นคนอื่นอยู่ กรุณาลองใหม่อีกครั้ง / Busy, please try again." };
    }

    const sheet = getOurSheet();
    const currentWeekDate = getCurrentResetDateStr();
    const colIdx = getSubWaveColIndex(wave, subwave);

    const headerVals = sheet.getRange("A16:B16").getDisplayValues()[0];
    const rowDate = headerVals[0] ? headerVals[0].trim() : "";
    const rowMapName = headerVals[1] ? headerVals[1].trim() : "";

    // 1. ต้องมีด่านของสัปดาห์นี้อยู่ก่อน (แอดมินเป็นผู้ตั้งด่านใหม่)
    if (rowDate !== currentWeekDate || !rowMapName) {
      return {
        status: "error",
        code: "no_map",
        message: "ยังไม่มีข้อมูลด่านของสัปดาห์นี้ กรุณารอแอดมินบันทึกด่านใหม่ก่อน / Waiting for admin to set this week's map."
      };
    }

    // 2. ต้องเป็นด่านเดียวกับที่บันทึกไว้ล่าสุดเท่านั้น
    const sentMapName = mapNameEn ? mapNameEn.toString().trim() : "";
    if (sentMapName && sentMapName.toLowerCase() !== rowMapName.toLowerCase()) {
      return {
        status: "error",
        code: "map_mismatch",
        currentMapName: rowMapName,
        message: "ด่านปัจจุบันถูกเปลี่ยนเป็น " + rowMapName + " แล้ว ระบบจะรีเฟรชข้อมูลล่าสุดให้ / Map changed, refreshing latest data."
      };
    }

    sheet.getRange(16, colIdx).setValue(pointsStr || "");
    SpreadsheetApp.flush();

    const latest = getLatestSpawnData();
    return { status: "success", latest };
  } catch (e) {
    return { status: "error", message: e.message };
  } finally {
    try { lock.releaseLock(); } catch(e) {}
  }
}

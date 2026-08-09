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
    } else if (action === 'reportWaveData') {
      result = reportWaveData(args[0], args[1], args[2], args[3]);
    } else if (action === 'getReportLogs') {
      result = getReportLogs();
    } else if (action === 'approveReportLog') {
      result = approveReportLog(args[0], args[1], args[2], args[3]);
    } else if (action === 'deleteReportLog') {
      result = deleteReportLog(args[0], args[1], args[2], args[3]);
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
      // 🧹 สัปดาห์ใหม่! ล้างข้อมูล Log รายงานทั้งหมดตั้งแต่แถวที่ 17 เป็นต้นไป
      try {
        const lastRow = sheet.getLastRow();
        if (lastRow >= 17) {
          sheet.getRange(17, 1, lastRow - 16, 14).clearContent();
        }
      } catch(e) {}
    }

    // 3. อ่านจำนวนการรายงานของผู้ใช้ในแต่ละ SubWave
    let reportCounts = {};
    const maxRow = sheet.getLastRow();
    if (maxRow >= 17) {
      const reportRows = sheet.getRange(17, 1, maxRow - 16, 14).getValues();
      [1,2,3,4].forEach(w => {
        [1,2,3].forEach(s => {
          const cIdx = getSubWaveColIndex(w, s) - 1;
          const key = `${w}_${s}`;
          let c = 0;
          reportRows.forEach(row => {
            if (row[cIdx] && row[cIdx].toString().trim() !== "") c++;
          });
          reportCounts[key] = c;
        });
      });
    }

    // ถ้าไม่ใช่ข้อมูลของสัปดาห์นี้ ระบบจะส่ง spawnData ที่เคลียร์ว่างเปล่ากลับไปให้ (รอให้แอดมินเซฟเป็นข้อมูลใหม่)
    const visitCount = getAndIncrementVisitCount(sheet);
    return { success: true, mapDate, currentMapId: logMapId, spawnData, mapsData, isNewWeek: !isDataMatchCurrentWeek, visitCount, reportCounts };

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

// 📢 ผู้ใช้รายงานจุดเกิด Wave ที่ไม่ถูกต้อง
function reportWaveData(wave, subwave, reportedPointsStr, mapNameEn) {
  try {
    const sheet = getOurSheet();
    const currentWeekDate = getCurrentResetDateStr();
    const colIdx = getSubWaveColIndex(wave, subwave);
    
    // 🌟 ตรวจสอบว่าข้อมูลที่แจ้งเข้ามา ตรงกับข้อมูลปัจจุบันในระบบ (แถว 16) หรือไม่
    const currentActiveData = sheet.getRange(16, colIdx).getDisplayValue().trim();
    if (reportedPointsStr.trim() === currentActiveData) {
      return { status: "no_change", message: "ข้อมูลที่แจ้งเข้ามาตรงกับข้อมูลปัจจุบันในระบบแล้ว จึงไม่มีการบันทึกเพิ่ม" };
    }

    const lastRow = sheet.getLastRow();
    let targetRow = 17;
    
    if (lastRow >= 17) {
      const colValues = sheet.getRange(17, colIdx, lastRow - 16, 1).getValues();
      let foundEmpty = false;
      for (let i = 0; i < colValues.length; i++) {
        if (!colValues[i][0] || colValues[i][0].toString().trim() === "") {
          targetRow = 17 + i;
          foundEmpty = true;
          break;
        }
      }
      if (!foundEmpty) {
        targetRow = lastRow + 1;
      }
    }

    // บันทึกข้อมูลที่รายงานลงในคอลัมน์ของ Wave นั้น
    sheet.getRange(targetRow, colIdx).setValue(reportedPointsStr);
    
    // ตั้งค่า Date และ MapName ในแถวการรายงานหากยังว่าง
    if (!sheet.getRange(targetRow, 1).getValue()) sheet.getRange(targetRow, 1).setValue(currentWeekDate);
    if (!sheet.getRange(targetRow, 2).getValue()) sheet.getRange(targetRow, 2).setValue(mapNameEn || "");

    // 🌟 ตรวจสอบ Consensus (หากรายงานตรงกัน >= 2 คน อัปเดตลงแถว 16 ทันที)
    const newLastRow = Math.max(17, sheet.getLastRow());
    const allReports = sheet.getRange(17, colIdx, newLastRow - 16, 1).getValues();
    
    let freqMap = {};
    let consensusPoints = "";
    let autoApproved = false;

    let totalReports = 0;
    for (let i = 0; i < allReports.length; i++) {
      const val = allReports[i][0] ? allReports[i][0].toString().trim() : "";
      if (val) {
        totalReports++;
        freqMap[val] = (freqMap[val] || 0) + 1;
        if (freqMap[val] >= 2) {
          consensusPoints = val;
          autoApproved = true;
          break;
        }
      }
    }

    if (autoApproved && consensusPoints !== "") {
      // อัปเดตลงแถว 16 โดยตรง
      sheet.getRange(16, colIdx).setValue(consensusPoints);
      // หากแถว 16 คอลัมน์ A/B ยังไม่มี ให้ใส่วันที่และชื่อแมพด้วย
      if (!sheet.getRange(16, 1).getValue()) sheet.getRange(16, 1).setValue(currentWeekDate);
      if (!sheet.getRange(16, 2).getValue()) sheet.getRange(16, 2).setValue(mapNameEn || "");

      // 🧹 ลบ Log การรายงานของ Wave นี้ทั้งหมดหลังจากเกิด Auto-Approve
      if (newLastRow >= 17) {
        sheet.getRange(17, colIdx, newLastRow - 16, 1).clearContent();
      }
      totalReports = 0;
    }

    return { status: "success", autoApproved, points: consensusPoints, totalReports };
  } catch (e) {
    return { status: "error", message: e.message };
  }
}

// 📋 ดึงรายการ Log รายงานสำหรับ Admin
function getReportLogs() {
  try {
    const sheet = getOurSheet();
    const lastRow = sheet.getLastRow();
    let logs = {};

    if (lastRow >= 17) {
      const reportRange = sheet.getRange(17, 1, lastRow - 16, 14).getValues();
      [1,2,3,4].forEach(w => {
        [1,2,3].forEach(s => {
          const colIdx = getSubWaveColIndex(w, s) - 1; // 0-indexed array
          const key = `${w}_${s}`;
          logs[key] = {};

          reportRange.forEach(row => {
            const val = row[colIdx] ? row[colIdx].toString().trim() : "";
            if (val) {
              logs[key][val] = (logs[key][val] || 0) + 1;
            }
          });
        });
      });
    }

    return { success: true, logs };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ✅ Admin ยืนยันข้อมูลรายงาน บันทึกลงแถว 16 และลบ Log ของ Wave นั้นทั้งหมด
function approveReportLog(wave, subwave, approvedPointsStr, pass) {
  if (!checkAdminPassword(pass)) return { status: "error", message: "รหัสผ่านไม่ถูกต้อง / Incorrect Password!" };
  
  try {
    const sheet = getOurSheet();
    const currentWeekDate = getCurrentResetDateStr();
    const colIdx = getSubWaveColIndex(wave, subwave);

    // 1. บันทึกลงแถว 16
    sheet.getRange(16, colIdx).setValue(approvedPointsStr);
    if (!sheet.getRange(16, 1).getValue()) sheet.getRange(16, 1).setValue(currentWeekDate);

    // 2. 🧹 ลบ Log การรายงานของ Wave นี้ทั้งหมดตั้งแต่แถวที่ 17 เป็นต้นไป
    const maxRow = sheet.getLastRow();
    if (maxRow >= 17) {
      sheet.getRange(17, colIdx, maxRow - 16, 1).clearContent();
    }

    return { status: "success" };
  } catch (e) {
    return { status: "error", message: e.message };
  }
}

// 🗑️ Admin ลบข้อมูลรายงานของ Wave นั้น (กรณีผู้ใช้ส่งเข้ามาผิด)
function deleteReportLog(wave, subwave, reportedPointsStr, pass) {
  if (!checkAdminPassword(pass)) return { status: "error", message: "รหัสผ่านไม่ถูกต้อง / Incorrect Password!" };
  
  try {
    const sheet = getOurSheet();
    const colIdx = getSubWaveColIndex(wave, subwave);
    const maxRow = sheet.getLastRow();
    
    if (maxRow >= 17) {
      const colRange = sheet.getRange(17, colIdx, maxRow - 16, 1);
      const values = colRange.getValues();
      
      for (let i = 0; i < values.length; i++) {
        const val = values[i][0] ? values[i][0].toString().trim() : "";
        if (val === reportedPointsStr.trim()) {
          sheet.getRange(17 + i, colIdx).clearContent();
        }
      }
    }

    return { status: "success" };
  } catch (e) {
    return { status: "error", message: e.message };
  }
}
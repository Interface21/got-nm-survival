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
      result = checkAdminPassword(args[0]);
    } else if (action === 'saveWeeklyMapData') {
      result = saveWeeklyMapData(args[0], args[1], args[2], args[3]);
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

    // 2. อ่าน Log History
    const lastRow = sheet.getLastRow();
    let mapDate = currentWeekDate;
    let logMapId = Object.keys(mapsData)[0] || ""; 
    let spawnData = { 1:{1:[],2:[],3:[]}, 2:{1:[],2:[],3:[]}, 3:{1:[],2:[],3:[]}, 4:{1:[],2:[],3:[]} };
    let isDataMatchCurrentWeek = false;

    if (lastRow >= 16) {
      const logRange = sheet.getRange("A" + lastRow + ":N" + lastRow);
      const logDisplays = logRange.getDisplayValues()[0];
      const logValues = logRange.getValues()[0];

      const lastDateInDb = logDisplays[0].trim();
      
      // 🌟 ตรวจสอบว่าบรรทัดล่าสุด เป็นข้อมูลของสัปดาห์นี้หรือยัง?
      if (lastDateInDb === currentWeekDate) {
        isDataMatchCurrentWeek = true;
        mapDate = lastDateInDb;
        const mapNameEn = logValues[1].toString().trim();

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
      }
    }

    // ถ้าไม่ใช่ข้อมูลของสัปดาห์นี้ ระบบจะส่ง spawnData ที่เคลียร์ว่างเปล่ากลับไปให้ (รอให้แอดมินเซฟเป็นข้อมูลใหม่)
    return { success: true, mapDate, currentMapId: logMapId, spawnData, mapsData, isNewWeek: !isDataMatchCurrentWeek };

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

// 🚀 บันทึกข้อมูล
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

    const lastRow = sheet.getLastRow();
    let targetRow = -1;

    if (lastRow >= 16) {
      const dates = sheet.getRange("A16:A" + lastRow).getDisplayValues();
      for (let i = 0; i < dates.length; i++) {
        if (dates[i][0].trim() === currentWeekDate.trim()) {
          targetRow = 16 + i;
          break;
        }
      }
    }

    if (targetRow !== -1) {
      sheet.getRange(targetRow, 1, 1, 14).setValues([rowData]);
    } else {
      const nextRow = lastRow < 15 ? 16 : lastRow + 1;
      sheet.getRange(nextRow, 1, 1, 14).setValues([rowData]);
    }

    return { status: "success" };
  } catch (e) {
    return { status: "error", message: e.message };
  }
}
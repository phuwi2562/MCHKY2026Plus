const SPREADSHEET_ID = '1BovpoJrMmx3MXSjhfvtjw1PjkIjB312tNocf7posQUY';
const VISIT_SHEET_NAME = 'MISS_VISITS';
const LOOKUP_SHEET_NAME = 'MISS_LOOKUPS';
const SUMMARY_SHEET_NAME = 'MISS_SUMMARY';
const VILLAGE_SHEET_NAME = 'MISS_VILLAGES';
const HEADERS = [
  'received_at',
  'created_at',
  'app',
  'case_name',
  'case_type',
  'village',
  'risk',
  'checklist_count',
  'checklist',
  'note',
  'source_sheet_id'
];
const LOOKUP_HEADERS = ['type', 'value', 'sort_order'];
const VILLAGE_HEADERS = ['village_no', 'village_name', 'full_name', 'area'];
const VILLAGES = [
  [1, 'บ้านหัวสนาม', 'หมู่ 1 บ้านหัวสนาม', 'นอกเขตเทศบาล'],
  [2, 'บ้านคำเจริญ', 'หมู่ 2 บ้านคำเจริญ', 'เขตเทศบาล'],
  [3, 'บ้านชัยศรี', 'หมู่ 3 บ้านชัยศรี', 'เขตเทศบาล'],
  [4, 'บ้านนาดี', 'หมู่ 4 บ้านนาดี', 'นอกเขตเทศบาล'],
  [5, 'บ้านห้วยยาง', 'หมู่ 5 บ้านห้วยยาง', 'นอกเขตเทศบาล'],
  [6, 'บ้านห้วยม่วง', 'หมู่ 6 บ้านห้วยม่วง', 'นอกเขตเทศบาล'],
  [7, 'บ้านคำใหญ่', 'หมู่ 7 บ้านคำใหญ่', 'เขตเทศบาล'],
  [8, 'บ้านคำถาวร', 'หมู่ 8 บ้านคำถาวร', 'เขตเทศบาล'],
  [9, 'บ้านโพธิ์ทอง', 'หมู่ 9 บ้านโพธิ์ทอง', 'เขตเทศบาล'],
  [10, 'บ้านโคกป่ากุง', 'หมู่ 10 บ้านโคกป่ากุง', 'เขตเทศบาล'],
  [11, 'บ้านคำใหญ่', 'หมู่ 11 บ้านคำใหญ่', 'เขตเทศบาล'],
  [12, 'บ้านคำเจริญ', 'หมู่ 12 บ้านคำเจริญ', 'เขตเทศบาล']
];

function doGet() {
  const setup = setupSpreadsheet();
  return jsonResponse({
    ok: true,
    app: 'MISS นมแม่ ตำบลคำใหญ่',
    sheetId: SPREADSHEET_ID,
    targetSheet: VISIT_SHEET_NAME,
    setup
  });
}

function doPost(e) {
  let lock;
  let locked = false;
  try {
    const payload = parsePayload(e);
    if (payload.action === 'setup') {
      return jsonResponse({ ok: true, setup: setupSpreadsheet() });
    }
    lock = LockService.getScriptLock();
    lock.waitLock(10000);
    locked = true;
    const sheet = getVisitSheet();
    sheet.appendRow([
      new Date(),
      payload.createdAt || '',
      payload.app || 'MISS นมแม่ ตำบลคำใหญ่',
      payload.caseName || '',
      payload.caseType || '',
      payload.village || '',
      payload.risk || '',
      payload.checked || '',
      Array.isArray(payload.checklist) ? payload.checklist.join(', ') : '',
      payload.note || '',
      payload.sheetId || SPREADSHEET_ID
    ]);
    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message });
  } finally {
    if (lock && locked) {
      lock.releaseLock();
    }
  }
}

function parsePayload(e) {
  if (e && e.postData && e.postData.contents) {
    return JSON.parse(e.postData.contents);
  }
  return e && e.parameter ? e.parameter : {};
}

function getVisitSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSheet(spreadsheet, VISIT_SHEET_NAME);
  ensureHeaders(sheet);
  return sheet;
}

function setupSpreadsheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const visitSheet = getOrCreateSheet(spreadsheet, VISIT_SHEET_NAME);
  const lookupSheet = getOrCreateSheet(spreadsheet, LOOKUP_SHEET_NAME);
  const summarySheet = getOrCreateSheet(spreadsheet, SUMMARY_SHEET_NAME);
  const villageSheet = getOrCreateSheet(spreadsheet, VILLAGE_SHEET_NAME);

  ensureHeaders(visitSheet);
  ensureLookupSheet(lookupSheet);
  ensureVillageSheet(villageSheet);
  ensureSummarySheet(summarySheet);

  return {
    spreadsheetName: spreadsheet.getName(),
    sheets: [VISIT_SHEET_NAME, LOOKUP_SHEET_NAME, VILLAGE_SHEET_NAME, SUMMARY_SHEET_NAME],
    headers: HEADERS
  };
}

function getOrCreateSheet(spreadsheet, name) {
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
  }
  return sheet;
}

function ensureHeaders(sheet) {
  const range = sheet.getRange(1, 1, 1, HEADERS.length);
  const current = range.getValues()[0];
  const hasHeaders = HEADERS.every((header, index) => current[index] === header);
  if (!hasHeaders) {
    range.setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, HEADERS.length);
  }
}

function ensureLookupSheet(sheet) {
  const values = [
    LOOKUP_HEADERS,
    ['case_type', 'เด็กแรกเกิด', 1],
    ['case_type', 'หญิงตั้งครรภ์', 2],
    ['case_type', 'หญิงหลังคลอด', 3],
    ['risk', 'ปกติ', 1],
    ['risk', 'ติดตามใกล้ชิด', 2],
    ['risk', 'ควรปรึกษา รพ.สต./เจ้าหน้าที่', 3],
    ['risk', 'ส่งต่อเร่งด่วน', 4],
    ['checklist', 'ประเมินสัญญาณอันตรายและอาการผิดปกติ', 1],
    ['checklist', 'ให้คำแนะนำการเลี้ยงลูกด้วยนมแม่และการเข้าเต้า', 2],
    ['checklist', 'ติดตามน้ำหนัก การขับถ่าย สะดือ และตัวเหลืองของทารก', 3],
    ['checklist', 'ประเมินสุขภาพจิตแม่หลังคลอดและแรงสนับสนุนในครอบครัว', 4],
    ['area', 'เขตเทศบาล', 1],
    ['area', 'นอกเขตเทศบาล', 2]
  ];
  const firstCell = sheet.getRange(1, 1).getValue();
  if (firstCell !== LOOKUP_HEADERS[0]) {
    sheet.clear();
    sheet.getRange(1, 1, values.length, LOOKUP_HEADERS.length).setValues(values);
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, LOOKUP_HEADERS.length);
  }
}

function ensureVillageSheet(sheet) {
  const firstCell = sheet.getRange(1, 1).getValue();
  if (firstCell !== VILLAGE_HEADERS[0]) {
    sheet.clear();
    sheet.getRange(1, 1, 1, VILLAGE_HEADERS.length).setValues([VILLAGE_HEADERS]);
    sheet.getRange(2, 1, VILLAGES.length, VILLAGE_HEADERS.length).setValues(VILLAGES);
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, VILLAGE_HEADERS.length);
  }
}

function ensureSummarySheet(sheet) {
  const firstCell = sheet.getRange(1, 1).getValue();
  if (firstCell === 'รายการ') return;
  sheet.clear();
  sheet.getRange('A1:B5').setValues([
    ['รายการ', 'สูตร/ค่า'],
    ['จำนวนบันทึกทั้งหมด', `=COUNTA('${VISIT_SHEET_NAME}'!A2:A)`],
    ['จำนวนเคสส่งต่อเร่งด่วน', `=COUNTIF('${VISIT_SHEET_NAME}'!G2:G,"ส่งต่อเร่งด่วน")`],
    ['จำนวนเคสติดตามใกล้ชิด', `=COUNTIF('${VISIT_SHEET_NAME}'!G2:G,"ติดตามใกล้ชิด")`],
    ['อัปเดตล่าสุด', '=NOW()']
  ]);
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, 2);
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

# ตั้งค่า Google Sheet สำหรับแอพ MISS นมแม่

Google Sheet ปลายทาง:
https://docs.google.com/spreadsheets/d/1BovpoJrMmx3MXSjhfvtjw1PjkIjB312tNocf7posQUY/edit

Google Apps Script Web App URL ประจำแอพ:
https://script.google.com/macros/s/AKfycbzRf51z7kSF2XzXrPkFJRffiLNCW_T9KPSnWJayqHGAngZPQqO1v7SpSCsz7UWtKF29/exec

## 1. สร้าง Apps Script

1. เปิด Google Sheet ชื่อ `อนามัยแม่และเด็ก 2569`
2. ไปที่เมนู `ส่วนขยาย` > `Apps Script`
3. ลบโค้ดเดิมในไฟล์ `Code.gs`
4. วางโค้ดจากไฟล์ `google-apps-script.gs`
5. กดบันทึก

## 2. Deploy เป็น Web App

1. กด `Deploy` > `New deployment`
2. เลือกชนิดเป็น `Web app`
3. ตั้งค่า:
   - Execute as: `Me`
   - Who has access: `Anyone`
4. กด `Deploy`
5. อนุญาตสิทธิ์ตามหน้าจอของ Google
6. คัดลอก `Web app URL` ที่ลงท้ายด้วย `/exec`

## 3. สร้างแท็บและหัวตารางอัตโนมัติ

หลัง Deploy แล้ว สามารถเปิด `Web app URL` ที่ลงท้ายด้วย `/exec` หนึ่งครั้งในเบราว์เซอร์ได้เลย Apps Script จะสร้างแท็บเหล่านี้ให้อัตโนมัติ:

- `MISS_VISITS` สำหรับข้อมูลการเยี่ยมบ้าน
- `MISS_LOOKUPS` สำหรับตัวเลือกกลุ่มเยี่ยม ระดับเฝ้าระวัง และ checklist
- `MISS_VILLAGES` สำหรับรายชื่อหมู่บ้านตำบลคำใหญ่ 12 หมู่บ้าน พร้อมเขตเทศบาล/นอกเขตเทศบาล
- `MISS_SUMMARY` สำหรับสรุปจำนวนบันทึกและรายการเฝ้าระวัง

## 4. ตั้งค่าในแอพมือถือ

1. เปิด `index.html`
2. ไปที่เมนู `บันทึก`
3. แอพจะใส่ `Web app URL` ประจำให้อัตโนมัติ
4. กด `เตรียมชีต` หรือ `บันทึก URL`
5. แอพจะสั่งเตรียม Google Sheet อัตโนมัติ
6. หากต้องการสั่งซ้ำ ให้กดปุ่ม `เตรียมชีต`
7. ทดลองบันทึกเยี่ยม 1 รายการ

หลังตั้งค่าสำเร็จ ข้อมูลใหม่จะถูกส่งเข้าแท็บ `MISS_VISITS` ใน Google Sheet โดยอัตโนมัติ หากมือถือออฟไลน์หรือยังไม่ได้ตั้งค่า URL แอพจะเก็บรายการไว้ในเครื่องและสามารถกด `ส่งรายการค้าง` ภายหลังได้

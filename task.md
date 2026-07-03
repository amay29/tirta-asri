# Tasks — Fix Round 2

## Backend
- [x] Fix login API → PIN auth
- [x] Fix register API → PIN auth + validation
- [x] Create reset-pin API
- [x] Fix tagihan API → prevent duplicates
- [x] Create surat/[id] API → get single surat for PDF
- [x] Update seed.js → PIN values
- [x] Update admin surat API → auto-set filePdf on SELESAI

## Components
- [x] Fix Toast.jsx → remove broken useCallback

## Pages — Auth
- [x] Update login page → PIN input
- [x] Update register page → PIN input + confirm

## Pages — New
- [x] Create /payment page (QR target)
- [x] Create /cetak/surat/[id] page (printable surat template)
- [x] Create /admin/riwayat page (move from /riwayat)

## Pages — Fix
- [x] Fix warga dashboard → QRIS countdown
- [x] Fix warga surat → cetak link
- [x] Fix admin dashboard → delete confirm + dates on pengeluaran
- [x] Fix admin surat → cetak button + auto filePdf
- [x] Fix admin warga → reset PIN button
- [x] Update AdminSidebar → riwayat link

## Verify
- [x] npm run build

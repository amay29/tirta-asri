# Tirta Asri Residence Community Portal

A modern, mobile-first Progressive Web Application (PWA) designed to simplify neighborhood community management. Built specifically for **Tirta Asri Residence**, this portal handles financial transparency, document requests, push notifications, and administrative bookkeeping under a single platform.

---

## 🌟 Key Features

### 👤 Multi-Role Dashboard
* **Warga (Residents):** View monthly dues, make mock payments (QRIS, Bank Transfer with receipt upload, Cash), request official letters, and view community announcements.
* **Admin Iuran (Treasurer):** Manage and audit finances, create monthly billings (individually or in bulk), and record neighborhood expenses.
* **Ketua RT (RT Chairman):** Review and process official letters (Domisili, Surat Pengantar, etc.) with pre-formatted printable PDFs, download overall Excel financial backups, and manage resident registries.
* **Seamless Panel Switcher:** Since administrators are also local residents, the system provides a seamless navigation shortcut to toggle between the Admin Panel and Warga View to pay their own dues or request personal letters.

### 💰 Financial Transparency & Ledger
* **Categorized Cashflow:** Automatically divides cash flow into **Saldo Bank** (digital funds via QRIS and manual transfers) and **Kas Tunai** (physical cash handed to administrators).
* **Payment Approval Workflow:** Real-time auditing of manual bank transfers and cash payments with automated logs of which administrator verified and approved the transaction.
* **Laporan Bulanan (Monthly Reports):** Generate comprehensive financial summaries including ledger sheets and detailed resident contributions, exportable to printable PDF or spreadsheet-ready CSV.

### 📄 Digital Letter Requests (Surat)
* Residents can submit requests for official documents (e.g., Certificate of Residence, RT Cover Letter).
* RT Chairman can approve, reject, or edit contents on the fly.
* Generates an official, print-ready A4 PDF document styled with proper letterhead (Kop Surat).

### 🔔 PWA & Web Push Notifications
* **App-like Experience:** Fully installable to Android, iOS, and desktop screens with a customized manifest.
* **Real-time Push Notifications:** Powered by the Web Push Protocol (VAPID). Sends instant push notifications when:
  * A new billing cycle is generated.
  * A resident submits a new payment or letter request.
  * An administrator approves or rejects a payment or letter.
  * A crucial announcement is published.
  * A billing deadline is approaching (automated checker).

---

## 🛠️ Tech Stack

* **Frontend Framework:** [Next.js](https://nextjs.org/) (App Router, React Server/Client Components)
* **Styling:** Vanilla CSS (Tailored variables, dark/glassmorphic aesthetics)
* **Database & ORM:** [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
* **Push Notifications:** [Web-Push](https://github.com/web-push-libs/web-push) (VAPID protocol)
* **Utilities:**
  * [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) (PDF Generation)
  * [XLSX (SheetJS)](https://github.com/SheetJS/sheetjs) (Excel Import/Export)
  * [QRCode.react](https://github.com/zpao/qrcode.react) (QRIS Code Generation)

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18 or higher)
* Docker & Docker Compose (for running the local database)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/tirta-asri.git
   cd tirta-asri
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and define the following variables:
   ```env
   # Database connection
   DATABASE_URL="postgresql://tirta:tirta123@localhost:5432/tirta_asri"

   # VAPID Keys for Push Notifications
   # Generate using: npx web-push generate-vapid-keys
   NEXT_PUBLIC_VAPID_PUBLIC_KEY="YOUR_PUBLIC_KEY"
   VAPID_PRIVATE_KEY="YOUR_PRIVATE_KEY"
   ```

4. **Spin up local PostgreSQL database:**
   ```bash
   docker-compose up -d
   ```

5. **Run Prisma Migrations & Generate Client:**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

6. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

To create an optimized production build:
```bash
npm run build
npm run start
```

---

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).

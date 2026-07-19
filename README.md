# Tirta Asri Residence — Smart Community Portal 🏡

![Tirta Asri Residence](/public/assets/tirta_asri.jpg)

A modern, mobile-first Progressive Web Application (PWA) designed to digitalize and simplify neighborhood community management. Built specifically for **Tirta Asri Residence**, this portal handles financial transparency, document requests, push notifications, and administrative bookkeeping under a single secure platform.

---

## 🌟 Key Features

### 👤 Multi-Role Dashboard
- **Warga (Residents):** View monthly dues, make digital payments (QRIS/Transfer/Cash), request official letters, and view community announcements.
- **Admin Iuran (Treasurer):** Manage and audit finances, create monthly billings (individually or in bulk), and record neighborhood expenses.
- **Ketua RT (RT Chairman):** Review and process official letters with pre-formatted printable PDFs, download financial ledgers, and manage resident registries.
- **Seamless Role Switching:** Administrators can easily toggle between the Admin Panel and Warga View to pay their own dues or request personal letters without re-logging.

### 💰 Financial Ledger & Payment Approval
- **Categorized Cashflow:** Automatically divides cash flow into **Digital Funds** (QRIS/Transfer) and **Physical Cash**.
- **Payment Verification:** Real-time auditing of manual bank transfers and cash payments with automated logs of which administrator verified the transaction.
- **Monthly Reports:** Generate comprehensive financial summaries including ledger sheets and detailed resident contributions, exportable to printable PDF or spreadsheet-ready CSV.

### 📄 Digital Letter Requests (E-Surat)
- Residents can submit requests for official documents (e.g., Certificate of Residence, RT Cover Letter) online.
- RT Chairman can approve, reject, or edit contents on the fly.
- System generates an official, print-ready A4 PDF document styled with proper letterhead (Kop Surat).

### 🔔 PWA & Web Push Notifications
- **App-like Experience:** Fully installable to Android, iOS, and desktop screens.
- **Real-time Push Notifications:** Powered by the Web Push Protocol (VAPID). Sends instant push notifications for:
  - New billing cycles & approaching deadlines.
  - Payment and letter request status updates.
  - Crucial neighborhood announcements.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** Next.js 15 (App Router), React Server & Client Components
- **Styling:** Custom CSS Design System (Glassmorphism, CSS Variables, Responsive Grid)
- **Backend/API:** Next.js API Routes (Serverless ready)
- **Authentication:** Custom JWT-based authentication using `jose` and `bcryptjs`
- **Database & ORM:** PostgreSQL with Prisma ORM
- **Push Notifications:** Web-Push (VAPID protocol)
- **Utilities:** `jsPDF` for PDF generation, `xlsx` for Excel export, `qrcode.react` for QRIS

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- PostgreSQL (Local or managed like Supabase)

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/amay29/tirta-asri.git
   cd tirta-asri
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file based on your local setup:
   ```env
   # Database connection
   DATABASE_URL="postgresql://user:password@localhost:5432/tirta_asri"
   
   # JWT Secret for Session
   JWT_SECRET="generate_a_random_secure_string_here"

   # VAPID Keys for Push Notifications (Optional for local testing)
   # npx web-push generate-vapid-keys
   NEXT_PUBLIC_VAPID_PUBLIC_KEY="YOUR_PUBLIC_KEY"
   VAPID_PRIVATE_KEY="YOUR_PRIVATE_KEY"
   ```

4. **Initialize Database:**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security Best Practices Implemented
- **HttpOnly Cookies:** Session tokens are stored securely in HttpOnly cookies to prevent XSS attacks.
- **Server-side Role Verification:** Every protected API route actively verifies the JWT payload and user role before fulfilling requests.
- **Password Hashing:** Passwords and PINs are securely hashed using `bcryptjs` before storage.
- **Audit Logging:** Administrative actions (e.g., creating users, modifying payments) are tracked in the database for accountability.

---

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).

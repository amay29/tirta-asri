-- CreateEnum
CREATE TYPE "Role" AS ENUM ('WARGA', 'ADMIN');

-- CreateEnum
CREATE TYPE "StatusTagihan" AS ENUM ('BELUM_BAYAR', 'SUDAH_BAYAR');

-- CreateEnum
CREATE TYPE "StatusPembayaran" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "StatusSurat" AS ENUM ('PENDING', 'DIPROSES', 'SELESAI', 'DITOLAK');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "noRumah" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'WARGA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tagihan" (
    "id" SERIAL NOT NULL,
    "bulan" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "status" "StatusTagihan" NOT NULL DEFAULT 'BELUM_BAYAR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Tagihan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pembayaran" (
    "id" SERIAL NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "metodeBayar" TEXT NOT NULL,
    "status" "StatusPembayaran" NOT NULL DEFAULT 'PENDING',
    "midtransId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tagihanId" INTEGER NOT NULL,

    CONSTRAINT "Pembayaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Surat" (
    "id" SERIAL NOT NULL,
    "jenisSurat" TEXT NOT NULL,
    "keterangan" TEXT,
    "status" "StatusSurat" NOT NULL DEFAULT 'PENDING',
    "filePdf" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Surat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Pembayaran_tagihanId_key" ON "Pembayaran"("tagihanId");

-- AddForeignKey
ALTER TABLE "Tagihan" ADD CONSTRAINT "Tagihan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pembayaran" ADD CONSTRAINT "Pembayaran_tagihanId_fkey" FOREIGN KEY ("tagihanId") REFERENCES "Tagihan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Surat" ADD CONSTRAINT "Surat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

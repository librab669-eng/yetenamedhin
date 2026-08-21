-- CreateTable
CREATE TABLE "Family" (
    "id" SERIAL NOT NULL,
    "familyCode" TEXT NOT NULL,
    "headName" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "ethYear" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Family_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" SERIAL NOT NULL,
    "familyId" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "gender" TEXT,
    "ageOrBirth" TEXT,
    "cardNo" TEXT,
    "relationToHead" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medicine" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nameAm" TEXT,
    "unit" TEXT NOT NULL DEFAULT 'tab',
    "pricePerUnit" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Medicine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "medicineId" INTEGER NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "totalCost" DECIMAL(65,30) NOT NULL,
    "ethDate" TEXT NOT NULL,
    "ethYear" INTEGER NOT NULL,
    "ethMonth" INTEGER NOT NULL,
    "ethDay" INTEGER NOT NULL,
    "prescribedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "BackupLog" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BackupLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Family_familyCode_key" ON "Family"("familyCode");

-- CreateIndex
CREATE INDEX "Family_ethYear_idx" ON "Family"("ethYear");

-- CreateIndex
CREATE INDEX "Family_familyCode_idx" ON "Family"("familyCode");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_cardNo_key" ON "Patient"("cardNo");

-- CreateIndex
CREATE INDEX "Patient_familyId_idx" ON "Patient"("familyId");

-- CreateIndex
CREATE INDEX "Patient_fullName_idx" ON "Patient"("fullName");

-- CreateIndex
CREATE INDEX "Patient_cardNo_idx" ON "Patient"("cardNo");

-- CreateIndex
CREATE INDEX "Medicine_name_idx" ON "Medicine"("name");

-- CreateIndex
CREATE INDEX "Expense_ethDate_idx" ON "Expense"("ethDate");

-- CreateIndex
CREATE INDEX "Expense_ethYear_idx" ON "Expense"("ethYear");

-- CreateIndex
CREATE INDEX "Expense_ethMonth_idx" ON "Expense"("ethMonth");

-- CreateIndex
CREATE INDEX "Expense_patientId_idx" ON "Expense"("patientId");

-- CreateIndex
CREATE INDEX "Expense_medicineId_idx" ON "Expense"("medicineId");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

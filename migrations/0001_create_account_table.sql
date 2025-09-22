-- CreateTable
CREATE TABLE "Account" (
    "address" TEXT NOT NULL PRIMARY KEY,
    "fid" INTEGER,
    "fname" TEXT,
    "ens" TEXT,
    "pfpUrl" TEXT,
    "updatedAt" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "Account_fid_idx" ON "Account"("fid");

-- CreateIndex
CREATE INDEX "Account_fname_idx" ON "Account"("fname");

-- CreateIndex
CREATE INDEX "Account_ens_idx" ON "Account"("ens");

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "pdf_documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storedPath" TEXT NOT NULL,
    "pageCount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UPLOADED',
    "errorMessage" TEXT,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME,
    CONSTRAINT "pdf_documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pdf_pages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pdfDocumentId" TEXT NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "selected" BOOLEAN NOT NULL DEFAULT false,
    "thumbnailPath" TEXT,
    CONSTRAINT "pdf_pages_pdfDocumentId_fkey" FOREIGN KEY ("pdfDocumentId") REFERENCES "pdf_documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "waste_types" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "originalName" TEXT,
    "color" TEXT NOT NULL DEFAULT '#22c55e',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "waste_types_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "wasteTypeId" TEXT NOT NULL,
    "pdfDocumentId" TEXT,
    "date" DATETIME NOT NULL,
    CONSTRAINT "calendar_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "calendar_events_wasteTypeId_fkey" FOREIGN KEY ("wasteTypeId") REFERENCES "waste_types" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "calendar_events_pdfDocumentId_fkey" FOREIGN KEY ("pdfDocumentId") REFERENCES "pdf_documents" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reminder_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "dayBeforeEnabled" BOOLEAN NOT NULL DEFAULT true,
    "dayBeforeTime" TEXT NOT NULL DEFAULT '20:00',
    "sameDayEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sameDayTime" TEXT NOT NULL DEFAULT '07:30',
    "skipEmptyDays" BOOLEAN NOT NULL DEFAULT true,
    "messageTemplate" TEXT NOT NULL DEFAULT 'Ricordati di mettere fuori {tipo_rifiuto}.',
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "reminder_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "telegram_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "botToken" TEXT,
    "chatId" TEXT,
    "lastTestAt" DATETIME,
    "lastTestOk" BOOLEAN,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "telegram_configs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "discord_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "botToken" TEXT,
    "channelId" TEXT,
    "lastTestAt" DATETIME,
    "lastTestOk" BOOLEAN,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "discord_configs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pdf_pages_pdfDocumentId_pageNumber_key" ON "pdf_pages"("pdfDocumentId", "pageNumber");

-- CreateIndex
CREATE UNIQUE INDEX "waste_types_userId_name_key" ON "waste_types"("userId", "name");

-- CreateIndex
CREATE INDEX "calendar_events_userId_date_idx" ON "calendar_events"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "calendar_events_userId_wasteTypeId_date_key" ON "calendar_events"("userId", "wasteTypeId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "reminder_settings_userId_key" ON "reminder_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "telegram_configs_userId_key" ON "telegram_configs"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "discord_configs_userId_key" ON "discord_configs"("userId");

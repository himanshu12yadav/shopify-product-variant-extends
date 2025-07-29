-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_variant_options" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "position" INTEGER NOT NULL DEFAULT 0,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "shop" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_variant_options" ("createdAt", "id", "isRequired", "name", "position", "shop", "updatedAt") SELECT "createdAt", "id", "isRequired", "name", "position", "shop", "updatedAt" FROM "variant_options";
DROP TABLE "variant_options";
ALTER TABLE "new_variant_options" RENAME TO "variant_options";
CREATE UNIQUE INDEX "variant_options_shop_name_key" ON "variant_options"("shop", "name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateTable
CREATE TABLE "variant_options" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "shop" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "variant_option_values" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "variantOptionId" TEXT NOT NULL,
    CONSTRAINT "variant_option_values_variantOptionId_fkey" FOREIGN KEY ("variantOptionId") REFERENCES "variant_options" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "sku" TEXT,
    "price" REAL NOT NULL DEFAULT 0,
    "compareAtPrice" REAL DEFAULT 0,
    "inventory" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "shop" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_ProductVariantToVariantOption" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ProductVariantToVariantOption_A_fkey" FOREIGN KEY ("A") REFERENCES "product_variants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ProductVariantToVariantOption_B_fkey" FOREIGN KEY ("B") REFERENCES "variant_options" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ProductVariantToVariantOptionValue" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ProductVariantToVariantOptionValue_A_fkey" FOREIGN KEY ("A") REFERENCES "product_variants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ProductVariantToVariantOptionValue_B_fkey" FOREIGN KEY ("B") REFERENCES "variant_option_values" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "variant_options_shop_name_key" ON "variant_options"("shop", "name");

-- CreateIndex
CREATE UNIQUE INDEX "variant_option_values_variantOptionId_value_key" ON "variant_option_values"("variantOptionId", "value");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductVariantToVariantOption_AB_unique" ON "_ProductVariantToVariantOption"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductVariantToVariantOption_B_index" ON "_ProductVariantToVariantOption"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductVariantToVariantOptionValue_AB_unique" ON "_ProductVariantToVariantOptionValue"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductVariantToVariantOptionValue_B_index" ON "_ProductVariantToVariantOptionValue"("B");

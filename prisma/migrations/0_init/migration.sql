-- CreateEnum
CREATE TYPE "role_company_media_type" AS ENUM ('LOGO', 'COVER', 'AVATAR', 'VIDEO');

-- CreateEnum
CREATE TYPE "role_company_type" AS ENUM ('VENDOR', 'CORP');

-- CreateEnum
CREATE TYPE "status_type" AS ENUM ('ACTIVE', 'PAUSED', 'SKIP', 'CANCELLED', 'DRAFT');

-- CreateEnum
CREATE TYPE "product_selection" AS ENUM ('FIXED', 'DYNAMIC');

-- CreateEnum
CREATE TYPE "pricing_type" AS ENUM ('FIXED', 'DYNAMIC');

-- CreateEnum
CREATE TYPE "plan_type" AS ENUM ('BUILD_A_BOX', 'BUNDLE', 'TRIAL', 'START_REFILL', 'STANDARD');

-- CreateEnum
CREATE TYPE "duration_type" AS ENUM ('DAY', 'WEEK', 'MONTH', 'YEAR');

-- CreateEnum
CREATE TYPE "address_type" AS ENUM ('DELIVERY', 'BILLING', 'COMPANY');

-- CreateEnum
CREATE TYPE "cart_type" AS ENUM ('MAIN', 'RENEWAL');

-- CreateEnum
CREATE TYPE "coupon_duration_type" AS ENUM ('ONCE', 'FOREVER', 'REPEATING');

-- CreateEnum
CREATE TYPE "invoice_item_type" AS ENUM ('PRODUCT', 'DELIVERY', 'DISCOUNT');

-- CreateEnum
CREATE TYPE "order_line_type" AS ENUM ('PRODUCT', 'DELIVERY', 'DISCOUNT');

-- CreateEnum
CREATE TYPE "plan_status" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "payout_status" AS ENUM ('PENDING', 'PROCESSED');

-- CreateTable
CREATE TABLE "address" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255),
    "phone_country_code" VARCHAR(4) NOT NULL DEFAULT '+353',
    "phone_number" VARCHAR(15) NOT NULL,
    "address_line_1" TEXT NOT NULL,
    "address_line_2" TEXT,
    "state" VARCHAR(255),
    "city" VARCHAR(255) NOT NULL,
    "postal_code" VARCHAR(15) NOT NULL,
    "country" VARCHAR(255) NOT NULL DEFAULT 'Ireland',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "type" "address_type",
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "actor" BIGINT,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "address_log" (
    "id" SERIAL NOT NULL,
    "record" JSONB NOT NULL,
    "action" TEXT NOT NULL,
    "actor" BIGINT,
    "action_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "address_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability" (
    "company_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,

    CONSTRAINT "availability_pkey" PRIMARY KEY ("company_id","user_id")
);

-- CreateTable
CREATE TABLE "payment_method" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "payment_type" VARCHAR(255),
    "card_brand" VARCHAR(255),
    "card_last_four" VARCHAR(4),
    "exp_month" SMALLINT,
    "exp_year" SMALLINT,
    "payment_method_id" VARCHAR(255),
    "is_default" BOOLEAN NOT NULL DEFAULT true,
    "actor" BIGINT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "payment_method_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_method_log" (
    "id" SERIAL NOT NULL,
    "record" JSONB NOT NULL,
    "action" TEXT NOT NULL,
    "actor" BIGINT,
    "action_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_method_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "country" VARCHAR(5),
    "phone_country_code" VARCHAR(3),
    "phone_number" VARCHAR(12),
    "about_us" VARCHAR(255),
    "currency" VARCHAR(3),
    "vat" VARCHAR(255),
    "vat_percent" VARCHAR(255),
    "taly_percent" DOUBLE PRECISION,
    "order_email" VARCHAR(255),
    "type" "role_company_type" DEFAULT 'VENDOR',
    "foreign_ids" JSON,
    "headquarter_country" VARCHAR(255),
    "website" VARCHAR(255),
    "industries" VARCHAR(255),
    "sell_type" VARCHAR(255),
    "slug" VARCHAR(255),
    "ecommerce_description" VARCHAR(255),
    "theme" JSON,
    "onboarding" JSON,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "actor" BIGINT,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_log" (
    "id" SERIAL NOT NULL,
    "record" JSONB NOT NULL,
    "action" TEXT NOT NULL,
    "actor" BIGINT,
    "action_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_media" (
    "id" BIGSERIAL NOT NULL,
    "media" VARCHAR(255) NOT NULL,
    "type" "role_company_media_type",
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "actor" BIGINT,
    "company_id" BIGINT NOT NULL,

    CONSTRAINT "company_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_zone" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "rule" JSON,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "actor" BIGINT,
    "company_id" BIGINT NOT NULL,

    CONSTRAINT "shipping_zone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_zone_log" (
    "id" SERIAL NOT NULL,
    "record" JSONB NOT NULL,
    "action" TEXT NOT NULL,
    "actor" BIGINT,
    "action_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_zone_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_zone_price" (
    "id" BIGSERIAL NOT NULL,
    "country" VARCHAR(255) NOT NULL,
    "currency" VARCHAR(255) NOT NULL,
    "amount" VARCHAR(255) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "actor" BIGINT,
    "shipping_zone_id" BIGINT NOT NULL,

    CONSTRAINT "shipping_zone_price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_zone_price_log" (
    "id" SERIAL NOT NULL,
    "record" JSONB NOT NULL,
    "action" TEXT NOT NULL,
    "actor" BIGINT,
    "action_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_zone_price_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" BIGSERIAL NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL DEFAULT '',
    "email" VARCHAR(255) NOT NULL,
    "email_verified_at" TIMESTAMP(0),
    "phone_country_code" VARCHAR(4) NOT NULL DEFAULT '+353',
    "phone_number" VARCHAR(15),
    "gender" VARCHAR(31),
    "birthday" DATE,
    "phone_verified_at" TIMESTAMP(0),
    "employer_id" BIGINT,
    "job_role" VARCHAR(255),
    "policy_agreement" BOOLEAN NOT NULL DEFAULT false,
    "marketing_consent" BOOLEAN NOT NULL DEFAULT true,
    "foreign_ids" JSON,
    "media_profile" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "actor" BIGINT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_log" (
    "id" SERIAL NOT NULL,
    "record" JSONB NOT NULL,
    "action" TEXT NOT NULL,
    "actor" BIGINT,
    "action_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "status" VARCHAR(255) NOT NULL,
    "payment_intent" TEXT NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "address_id" BIGINT NOT NULL,
    "foreign_ids" JSON,
    "actor" BIGINT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_log" (
    "id" SERIAL NOT NULL,
    "record" JSONB NOT NULL,
    "action" TEXT NOT NULL,
    "actor" BIGINT,
    "action_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_item" (
    "id" BIGSERIAL NOT NULL,
    "invoice_id" BIGINT NOT NULL,
    "plan_product_variant_id" BIGINT,
    "description" VARCHAR(255) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "subscription_id" BIGINT,
    "company_id" BIGINT,
    "type" "invoice_item_type" NOT NULL DEFAULT 'PRODUCT',
    "actor" BIGINT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "invoice_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_item_log" (
    "id" SERIAL NOT NULL,
    "record" JSONB NOT NULL,
    "action" TEXT NOT NULL,
    "actor" BIGINT,
    "action_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_item_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payout" (
    "id" BIGSERIAL NOT NULL,
    "company_id" BIGINT NOT NULL,
    "order_id" BIGINT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "status" "payout_status" NOT NULL DEFAULT 'PENDING',
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "payment_method_id" BIGINT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "actor" BIGINT,

    CONSTRAINT "payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payout_log" (
    "id" SERIAL NOT NULL,
    "record" JSONB NOT NULL,
    "action" TEXT NOT NULL,
    "actor" BIGINT,
    "action_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payout_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" BIGSERIAL NOT NULL,
    "company_id" BIGINT NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "brand" VARCHAR,
    "product_media_id" BIGINT,
    "unit" VARCHAR,
    "unit_plural" VARCHAR,
    "breakdown" VARCHAR,
    "foreign_ids" JSON,
    "actor" BIGINT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_log" (
    "id" SERIAL NOT NULL,
    "record" JSONB NOT NULL,
    "action" TEXT NOT NULL,
    "actor" BIGINT,
    "action_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_media" (
    "id" BIGSERIAL NOT NULL,
    "product_id" BIGINT,
    "product_variant_id" BIGINT,
    "media" JSON NOT NULL,
    "foreign_ids" JSON,
    "actor" BIGINT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "product_medias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variant" (
    "id" BIGSERIAL NOT NULL,
    "product_id" BIGINT NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "description_long" TEXT,
    "sku" VARCHAR,
    "volume_or_weight" VARCHAR,
    "nutritional_facts" VARCHAR,
    "ingredients" VARCHAR,
    "allergens" VARCHAR,
    "age_restricted" BOOLEAN NOT NULL DEFAULT false,
    "age" SMALLINT,
    "in_stock" BOOLEAN NOT NULL DEFAULT true,
    "foreign_ids" JSON,
    "actor" BIGINT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variant_log" (
    "id" SERIAL NOT NULL,
    "record" JSONB NOT NULL,
    "action" TEXT NOT NULL,
    "actor" BIGINT,
    "action_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variant_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variant_price" (
    "id" BIGSERIAL NOT NULL,
    "product_variant_id" BIGINT NOT NULL,
    "country" VARCHAR(3) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "foreign_ids" JSON,
    "actor" BIGINT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "product_variant_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variant_price_log" (
    "id" SERIAL NOT NULL,
    "record" JSONB NOT NULL,
    "action" TEXT NOT NULL,
    "actor" BIGINT,
    "action_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variant_price_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan" (
    "id" BIGSERIAL NOT NULL,
    "company_id" BIGINT NOT NULL,
    "foreign_ids" JSON,
    "title" VARCHAR(255) NOT NULL,
    "slug" TEXT NOT NULL DEFAULT '',
    "description" TEXT,
    "delivery_details" TEXT,
    "terms" TEXT,
    "allow_delivery_preference" BOOLEAN NOT NULL DEFAULT false,
    "price_at_origin" DOUBLE PRECISION,
    "currency_at_origin" VARCHAR(255),
    "media_cover" TEXT,
    "recurring" JSONB,
    "duration_value" INTEGER,
    "duration_type" "duration_type",
    "age_restricted" BOOLEAN NOT NULL DEFAULT false,
    "voucher" BOOLEAN NOT NULL DEFAULT false,
    "product_selection" "product_selection" NOT NULL DEFAULT 'FIXED',
    "pricing_type" "pricing_type" NOT NULL DEFAULT 'FIXED',
    "plan_type" "plan_type" NOT NULL DEFAULT 'STANDARD',
    "category_id" BIGINT,
    "status" "plan_status" NOT NULL DEFAULT 'DRAFT',
    "tag" JSON,
    "actor" BIGINT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_log" (
    "id" SERIAL NOT NULL,
    "record" JSONB NOT NULL,
    "action" TEXT NOT NULL,
    "actor" BIGINT,
    "action_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_media" (
    "id" BIGSERIAL NOT NULL,
    "plan_id" BIGINT NOT NULL,
    "media" TEXT NOT NULL,
    "foreign_ids" JSON,

    CONSTRAINT "plan_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_category" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT NOT NULL,

    CONSTRAINT "plan_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_product_variant" (
    "id" BIGSERIAL NOT NULL,
    "plan_id" BIGINT NOT NULL,
    "product_variant_id" BIGINT NOT NULL,
    "foreign_ids" JSON,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "actor" BIGINT,

    CONSTRAINT "plan_product_variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_product_variant_log" (
    "id" SERIAL NOT NULL,
    "record" JSONB NOT NULL,
    "action" TEXT NOT NULL,
    "actor" BIGINT,
    "action_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_product_variant_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_feature" (
    "id" BIGSERIAL NOT NULL,
    "plan_id" BIGINT NOT NULL,
    "feature" JSON NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "actor" BIGINT,

    CONSTRAINT "plan_feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_feature_log" (
    "id" SERIAL NOT NULL,
    "record" JSONB NOT NULL,
    "action" TEXT NOT NULL,
    "actor" BIGINT,
    "action_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_feature_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_price" (
    "id" BIGSERIAL NOT NULL,
    "plan_id" BIGINT NOT NULL,
    "country" VARCHAR(3) NOT NULL,
    "currency" VARCHAR(255) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "actor" BIGINT,

    CONSTRAINT "plan_price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_price_log" (
    "id" SERIAL NOT NULL,
    "record" JSONB NOT NULL,
    "action" TEXT NOT NULL,
    "actor" BIGINT,
    "action_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_price_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_product_variant_price" (
    "id" BIGSERIAL NOT NULL,
    "plan_product_variant_id" BIGINT NOT NULL,
    "country" VARCHAR(3) NOT NULL,
    "currency" VARCHAR(255) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "foreign_ids" JSON,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "actor" BIGINT,

    CONSTRAINT "plan_product_variant_price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_product_variant_price_log" (
    "id" SERIAL NOT NULL,
    "record" JSONB NOT NULL,
    "action" TEXT NOT NULL,
    "actor" BIGINT,
    "action_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_product_variant_price_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT,
    "plan_id" BIGINT NOT NULL,
    "foreign_ids" JSON,
    "status" "status_type" NOT NULL DEFAULT 'ACTIVE',
    "delivery_day" VARCHAR(10) NOT NULL,
    "cancelled_at" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "actor" BIGINT,
    "step" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_log" (
    "id" SERIAL NOT NULL,
    "record" JSONB NOT NULL,
    "action" TEXT NOT NULL,
    "actor" BIGINT,
    "action_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plan_product_variant" (
    "id" BIGSERIAL NOT NULL,
    "subscription_id" BIGINT NOT NULL,
    "plan_product_variant_id" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "actor" BIGINT,

    CONSTRAINT "subscription_plan_product_variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plan_product_variant_log" (
    "id" SERIAL NOT NULL,
    "record" JSONB NOT NULL,
    "action" TEXT NOT NULL,
    "actor" BIGINT,
    "action_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plan_product_variant_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "shipping_address" BIGINT NOT NULL,
    "company_id" BIGINT NOT NULL,
    "total_discount" DOUBLE PRECISION,
    "total_price" DOUBLE PRECISION NOT NULL,
    "foreign_ids" JSON,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "actor" BIGINT,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_log" (
    "id" SERIAL NOT NULL,
    "record" JSONB NOT NULL,
    "action" TEXT NOT NULL,
    "actor" BIGINT,
    "action_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_line" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "product_variant_id" BIGINT,
    "coupon" TEXT,
    "type" "order_line_type" NOT NULL DEFAULT 'PRODUCT',
    "quantity" INTEGER NOT NULL,
    "line_price" DOUBLE PRECISION NOT NULL,
    "line_discount" DOUBLE PRECISION,
    "foreign_ids" JSON,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "actor" BIGINT,

    CONSTRAINT "order_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_line_log" (
    "id" SERIAL NOT NULL,
    "record" JSONB NOT NULL,
    "action" TEXT NOT NULL,
    "actor" BIGINT,
    "action_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_line_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_subscription" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "subscription_id" BIGINT NOT NULL,
    "actor" BIGINT,

    CONSTRAINT "order_subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_subscription_log" (
    "id" SERIAL NOT NULL,
    "record" JSONB NOT NULL,
    "action" TEXT NOT NULL,
    "actor" BIGINT,
    "action_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_subscription_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart" (
    "id" SERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "type" "cart_type" NOT NULL DEFAULT 'MAIN',
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "actor" BIGINT,

    CONSTRAINT "cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_log" (
    "id" SERIAL NOT NULL,
    "record" JSONB NOT NULL,
    "action" TEXT NOT NULL,
    "actor" BIGINT,
    "action_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_line" (
    "id" SERIAL NOT NULL,
    "cart_id" INTEGER NOT NULL,
    "subscription_id" BIGINT NOT NULL,
    "actor" BIGINT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "cart_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_line_log" (
    "id" SERIAL NOT NULL,
    "record" JSONB NOT NULL,
    "action" TEXT NOT NULL,
    "actor" BIGINT,
    "action_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_line_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon" (
    "id" SERIAL NOT NULL,
    "company_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "amount_off" DOUBLE PRECISION,
    "percent_off" DOUBLE PRECISION,
    "currency" VARCHAR(3),
    "duration" "coupon_duration_type" NOT NULL DEFAULT 'ONCE',
    "renew_duration" INTEGER,
    "applies_to" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "coupon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "billing_addresses_user_id_foreign" ON "address"("user_id");

-- CreateIndex
CREATE INDEX "availability_user_id_foreign" ON "availability"("user_id");

-- CreateIndex
CREATE INDEX "payment_methods_user_id_foreign" ON "payment_method"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_slug_key" ON "company"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_unique" ON "user"("email");

-- CreateIndex
CREATE INDEX "users_employer_id_foreign" ON "user"("employer_id");

-- CreateIndex
CREATE INDEX "payouts_order_id_foreign" ON "payout"("company_id");

-- CreateIndex
CREATE INDEX "payouts_company_id_foreign" ON "payout"("company_id");

-- CreateIndex
CREATE INDEX "payouts_payment_method_id_foreign" ON "payout"("payment_method_id");

-- CreateIndex
CREATE INDEX "product_id_idx" ON "product"("id", "company_id");

-- CreateIndex
CREATE INDEX "product_media_product_id_index" ON "product_media"("product_id");

-- CreateIndex
CREATE INDEX "product_variant_product_id_index" ON "product_variant"("product_id");

-- CreateIndex
CREATE INDEX "product_price_product_id_index" ON "product_variant_price"("product_variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "plan_slug_key" ON "plan"("slug");

-- CreateIndex
CREATE INDEX "i_plan_media_plan_id_foreign" ON "plan_media"("plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "plan_category_slug_key" ON "plan_category"("slug");

-- CreateIndex
CREATE INDEX "coupon_index" ON "coupon"("name");

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "billing_addresses_ibfk_1" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "availability" ADD CONSTRAINT "availability_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability" ADD CONSTRAINT "availability_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_media" ADD CONSTRAINT "company_media_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_zone" ADD CONSTRAINT "shipping_zone_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_zone_price" ADD CONSTRAINT "shipping_zone_price_shipping_zone_id_fkey" FOREIGN KEY ("shipping_zone_id") REFERENCES "shipping_zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_item" ADD CONSTRAINT "invoice_item_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_item" ADD CONSTRAINT "invoice_item_plan_product_variant_id_fkey" FOREIGN KEY ("plan_product_variant_id") REFERENCES "plan_product_variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_item" ADD CONSTRAINT "invoice_item_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_item" ADD CONSTRAINT "invoice_item_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payout" ADD CONSTRAINT "payout_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_method"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payout" ADD CONSTRAINT "payout_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payout" ADD CONSTRAINT "payout_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_product_fk" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_variant_price" ADD CONSTRAINT "product_variant_price_fk" FOREIGN KEY ("product_variant_id") REFERENCES "product_variant"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "plan" ADD CONSTRAINT "plan_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan" ADD CONSTRAINT "plan_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "plan_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_media" ADD CONSTRAINT "plan_media_plan_id_foreign" FOREIGN KEY ("plan_id") REFERENCES "plan"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "plan_product_variant" ADD CONSTRAINT "plan_product_id_foreign" FOREIGN KEY ("plan_id") REFERENCES "plan"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "plan_product_variant" ADD CONSTRAINT "product_product_variant_id_foreign" FOREIGN KEY ("product_variant_id") REFERENCES "product_variant"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "plan_feature" ADD CONSTRAINT "plan_id_foreign" FOREIGN KEY ("plan_id") REFERENCES "plan"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "plan_price" ADD CONSTRAINT "plan_price_plan_id_foreign" FOREIGN KEY ("plan_id") REFERENCES "plan"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "plan_product_variant_price" ADD CONSTRAINT "plan_product_variant_price_id_foreign" FOREIGN KEY ("plan_product_variant_id") REFERENCES "plan_product_variant"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "plan_product_id_foreign" FOREIGN KEY ("plan_id") REFERENCES "plan"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_plan_product_variant" ADD CONSTRAINT "subs_plan_product_variant_fk" FOREIGN KEY ("plan_product_variant_id") REFERENCES "plan_product_variant"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subscription_plan_product_variant" ADD CONSTRAINT "subscription_product_subscription_id_foreign" FOREIGN KEY ("subscription_id") REFERENCES "subscription"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_shipping_address_fkey" FOREIGN KEY ("shipping_address") REFERENCES "address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_line" ADD CONSTRAINT "order_line_order_id_foreign" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_line" ADD CONSTRAINT "order_line_product_variant_id_foreign" FOREIGN KEY ("product_variant_id") REFERENCES "product_variant"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_subscription" ADD CONSTRAINT "order_subscription_order_id_foreign" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_subscription" ADD CONSTRAINT "order_subscription_subscription_id_foreign" FOREIGN KEY ("subscription_id") REFERENCES "subscription"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cart" ADD CONSTRAINT "cart_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_line" ADD CONSTRAINT "cart_line_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_line" ADD CONSTRAINT "cart_line_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon" ADD CONSTRAINT "coupon_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


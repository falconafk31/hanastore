-- CreateEnum
CREATE TYPE "Role" AS ENUM ('customer', 'admin', 'operator', 'driver');
CREATE TYPE "EquipmentStatus" AS ENUM ('available', 'rented', 'maintenance', 'inactive');
CREATE TYPE "BookingStatus" AS ENUM ('pending', 'confirmed', 'active', 'completed', 'cancelled', 'rejected');
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'failed', 'expired', 'refunded');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'customer',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

CREATE TABLE "equipment" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "status" "EquipmentStatus" NOT NULL DEFAULT 'available',
    "daily_rate" DECIMAL(12,2) NOT NULL,
    "location" TEXT NOT NULL,
    "photo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "equipment_categoryId_idx" ON "equipment"("category_id");
CREATE INDEX "equipment_status_idx" ON "equipment"("status");

CREATE TABLE "bookings" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "equipment_id" UUID NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'pending',
    "total_amount" DECIMAL(12,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "bookings_equipment_id_start_date_end_date_idx" ON "bookings"("equipment_id", "start_date", "end_date");
CREATE INDEX "bookings_userId_idx" ON "bookings"("user_id");
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "payment_method" TEXT,
    "paid_at" TIMESTAMP(3),
    "midtrans_order_id" TEXT,
    "midtrans_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "payments_bookingId_idx" ON "payments"("booking_id");
CREATE INDEX "payments_status_idx" ON "payments"("status");

CREATE TABLE "contracts" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "doc_url" TEXT,
    "signed" BOOLEAN NOT NULL DEFAULT false,
    "signed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "contracts_booking_id_key" ON "contracts"("booking_id");

CREATE TABLE "maintenance_logs" (
    "id" UUID NOT NULL,
    "equipment_id" UUID NOT NULL,
    "service_date" DATE NOT NULL,
    "notes" TEXT NOT NULL,
    "cost" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "maintenance_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "maintenance_logs_equipmentId_idx" ON "maintenance_logs"("equipment_id");
CREATE INDEX "maintenance_logs_serviceDate_idx" ON "maintenance_logs"("service_date");

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "maintenance_logs" ADD CONSTRAINT "maintenance_logs_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

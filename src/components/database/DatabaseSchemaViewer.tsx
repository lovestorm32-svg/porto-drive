import React, { useState } from 'react';
import { DATABASE_TABLES_INFO } from '../../data/mockData';
import {
  Database,
  Table,
  Key,
  Copy,
  Check,
  Download,
  Share2,
  Code2,
  Layers,
  Sparkles,
} from 'lucide-react';

export const DatabaseSchemaViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'erd' | 'sql' | 'prisma' | 'firebase'>('erd');
  const [selectedTable, setSelectedTable] = useState<string>('Rides');
  const [copied, setCopied] = useState(false);

  // Generate complete PostgreSQL DDL SQL Script
  const generatePostgresSQL = () => {
    return `-- ========================================================
-- Porto Drive Database Schema (PostgreSQL 15+)
-- Designed for Price Negotiation & Multi-Driver Bidding (Egypt)
-- Tables: Users, Drivers, Rides, RideOffers (5 Captains), Payments, Ratings
-- Currency: EGP (الجنيه المصري)
-- ========================================================

-- Enable UUID extension and PostGIS for spatial queries
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. USERS TABLE (Passengers & Profiles)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) UNIQUE NOT NULL, -- e.g. +201012345678
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    avatar_url TEXT,
    wallet_balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00, -- in EGP (ج.م)
    average_rating DECIMAL(3, 2) NOT NULL DEFAULT 5.00,
    total_rides_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone_number);

-- 2. DRIVERS TABLE (Captains, Vehicles, Credentials)
CREATE TYPE driver_status_enum AS ENUM ('offline', 'online', 'busy', 'pending_approval', 'suspended');
CREATE TYPE vehicle_tier_enum AS ENUM ('economy', 'comfort', 'ladies', 'fast');

CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    national_id_number VARCHAR(20) UNIQUE NOT NULL, -- 14-digit Egyptian National ID
    license_number VARCHAR(50) NOT NULL,
    vehicle_make VARCHAR(50) NOT NULL,
    vehicle_model VARCHAR(50) NOT NULL,
    vehicle_year INTEGER NOT NULL,
    vehicle_plate VARCHAR(20) NOT NULL,
    vehicle_tier vehicle_tier_enum NOT NULL DEFAULT 'economy',
    status driver_status_enum NOT NULL DEFAULT 'pending_approval',
    current_location GEOMETRY(Point, 4326),
    current_heading DECIMAL(5, 2) DEFAULT 0.00,
    wallet_balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00, -- EGP
    is_approved_by_admin BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_geo ON drivers USING GIST(current_location);

-- 3. RIDES TABLE (Trips, Passenger Offer & Final Agreed Price)
CREATE TYPE ride_status_enum AS ENUM ('negotiating', 'assigned', 'arriving', 'arrived', 'in_progress', 'completed', 'cancelled');

CREATE TABLE rides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    passenger_id UUID NOT NULL REFERENCES users(id),
    driver_id UUID REFERENCES drivers(id),
    pickup_address TEXT NOT NULL,
    dropoff_address TEXT NOT NULL,
    status ride_status_enum NOT NULL DEFAULT 'negotiating',
    vehicle_tier vehicle_tier_enum NOT NULL,
    distance_km DECIMAL(6, 2) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    suggested_base_price DECIMAL(8, 2) NOT NULL,     -- Baseline price in EGP
    passenger_proposed_price DECIMAL(8, 2) NOT NULL, -- Passenger initial bid in EGP
    final_agreed_price DECIMAL(8, 2) NOT NULL,       -- Agreed price after negotiation
    platform_commission DECIMAL(8, 2) NOT NULL,       -- 12% Porto Drive fee
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. RIDE_OFFERS TABLE (Bids from up to 5 competing captains)
CREATE TABLE ride_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES drivers(id),
    offered_price DECIMAL(8, 2) NOT NULL, -- Captain's bid in EGP
    eta_minutes INTEGER NOT NULL,
    distance_km DECIMAL(6, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending' | 'accepted' | 'rejected'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_offers_ride ON ride_offers(ride_id);
CREATE INDEX idx_offers_driver ON ride_offers(driver_id);

-- 5. PAYMENTS TABLE (Fawry, Meezah, Cash, Cards in EGP)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL REFERENCES rides(id),
    user_id UUID NOT NULL REFERENCES users(id),
    driver_id UUID REFERENCES drivers(id),
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL, -- 'cash' | 'wallet' | 'card' | 'fawry' | 'meezah'
    payment_status VARCHAR(20) NOT NULL DEFAULT 'succeeded',
    currency VARCHAR(5) NOT NULL DEFAULT 'EGP',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. RATINGS TABLE
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL REFERENCES rides(id),
    from_user_id UUID NOT NULL REFERENCES users(id),
    to_user_id UUID NOT NULL,
    stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
    comment TEXT,
    tip_amount DECIMAL(6, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ratings_ride ON ratings(ride_id);
CREATE INDEX idx_ratings_to_user ON ratings(to_user_id);
`;
  };

  // Generate Prisma ORM Schema
  const generatePrismaSchema = () => {
    return `// ========================================================
// Prisma Schema for SmartRide
// Datasource: PostgreSQL
// ========================================================

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id               String    @id @default(uuid())
  phoneNumber      String    @unique @map("phone_number")
  fullName         String    @map("full_name")
  email            String?   @unique
  avatarUrl        String?   @map("avatar_url")
  walletBalance    Decimal   @default(0.00) @map("wallet_balance")
  averageRating    Decimal   @default(5.00) @map("average_rating")
  totalRidesCount  Int       @default(0) @map("total_rides_count")
  isActive         Boolean   @default(true) @map("is_active")
  createdAt        DateTime  @default(now()) @map("created_at")

  // Relations
  driverProfile    Driver?
  ridesAsPassenger Ride[]    @relation("PassengerRides")
  payments         Payment[]
  ratingsGiven     Rating[]  @relation("RatingsGiven")

  @@map("users")
}

model Driver {
  id               String       @id @default(uuid())
  userId           String       @unique @map("user_id")
  user             User         @relation(fields: [userId], references: [id])
  nationalIdNumber String       @unique @map("national_id_number")
  licenseNumber    String       @map("license_number")
  vehicleMake      String       @map("vehicle_make")
  vehicleModel     String       @map("vehicle_model")
  vehicleYear      Int          @map("vehicle_year")
  vehiclePlate     String       @map("vehicle_plate")
  vehicleTier      String       @default("economy") @map("vehicle_tier")
  status           String       @default("pending")
  currentLatitude  Decimal?     @map("current_latitude")
  currentLongitude Decimal?     @map("current_longitude")
  walletBalance    Decimal      @default(0.00) @map("wallet_balance")
  isApproved       Boolean      @default(false) @map("is_approved_by_admin")

  rides            Ride[]       @relation("DriverRides")
  paymentsReceived Payment[]

  @@map("drivers")
}

model Ride {
  id                 String    @id @default(uuid())
  passengerId        String    @map("passenger_id")
  passenger          User      @relation("PassengerRides", fields: [passengerId], references: [id])
  driverId           String?   @map("driver_id")
  driver             Driver?   @relation("DriverRides", fields: [driverId], references: [id])
  pickupAddress      String    @map("pickup_address")
  dropoffAddress     String    @map("dropoff_address")
  status             String    @default("searching")
  vehicleTier        String    @map("vehicle_tier")
  distanceKm         Decimal   @map("distance_km")
  durationMinutes    Int       @map("duration_minutes")
  totalPrice         Decimal   @map("total_price")
  driverEarnings     Decimal   @map("driver_earnings")
  platformCommission Decimal   @map("platform_commission")
  requestedAt        DateTime  @default(now()) @map("requested_at")

  payments           Payment[]
  ratings            Rating[]

  @@map("rides")
}

model Payment {
  id              String   @id @default(uuid())
  rideId          String   @map("ride_id")
  ride            Ride     @relation(fields: [rideId], references: [id])
  userId          String   @map("user_id")
  user            User     @relation(fields: [userId], references: [id])
  driverId        String?  @map("driver_id")
  driver          Driver?  @relation(fields: [driverId], references: [id])
  amount          Decimal
  paymentMethod   String   @map("payment_method")
  paymentStatus   String   @default("pending") @map("payment_status")
  createdAt       DateTime @default(now()) @map("created_at")

  @@map("payments")
}

model Rating {
  id         String   @id @default(uuid())
  rideId     String   @map("ride_id")
  ride       Ride     @relation(fields: [rideId], references: [id])
  fromUserId String   @map("from_user_id")
  fromUser   User     @relation("RatingsGiven", fields: [fromUserId], references: [id])
  toUserId   String   @map("to_user_id")
  stars      Int
  comment    String?
  tipAmount  Decimal  @default(0.00) @map("tip_amount")
  createdAt  DateTime @default(now()) @map("created_at")

  @@map("ratings")
}
`;
  };

  // Generate Firebase Firestore NoSQL blueprint
  const generateFirebaseBlueprint = () => {
    return `// ========================================================
// Firebase Firestore NoSQL Collections Structure & Rules
// ========================================================

/**
 * 1. Collections Hierarchy:
 * 
 * /users/{userId}
 *   - phoneNumber: string
 *   - fullName: string
 *   - walletBalance: number
 *   - rating: number
 * 
 * /drivers/{driverId}
 *   - userId: string
 *   - status: "online" | "busy" | "offline"
 *   - location: GeoPoint(lat, lng)
 *   - vehicle: { make, model, year, plate, tier }
 *   - documents: map of verified docs
 * 
 * /rides/{rideId}
 *   - passengerId: string
 *   - driverId: string | null
 *   - status: "searching" | "arriving" | "in_progress" | "completed"
 *   - pickup: { lat, lng, address }
 *   - dropoff: { lat, lng, address }
 *   - fare: { base, km, total, commission }
 *   - timestamps: { requested, started, completed }
 * 
 * /payments/{paymentId}
 *   - rideId: string
 *   - amount: number
 *   - method: string
 *   - status: string
 * 
 * /ratings/{ratingId}
 *   - rideId: string
 *   - fromUserId: string
 *   - stars: number (1-5)
 *   - tip: number
 */

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Drivers location updates & status
    match /drivers/{driverId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == driverId;
    }
    
    // Active Rides
    match /rides/{rideId} {
      allow read: if request.auth != null && 
        (resource.data.passengerId == request.auth.uid || resource.data.driverId == request.auth.uid);
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
  }
}
`;
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTable = DATABASE_TABLES_INFO.find((t) => t.name === selectedTable) || DATABASE_TABLES_INFO[0];

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-slate-950 text-right p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-emerald-400" />
            هيكل وتصميم قاعدة البيانات المتكاملة (Schema & ERD)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            جداول النظام الخمسة الأساسية المطلوبة: (Users, Drivers, Rides, Payments, Ratings) مهيأة للأداء الفائق
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto">
          {[
            { id: 'erd', label: 'مخطط العلاقات (ERD)', icon: Layers },
            { id: 'sql', label: 'كود PostgreSQL DDL', icon: Code2 },
            { id: 'prisma', label: 'Prisma ORM', icon: Sparkles },
            { id: 'firebase', label: 'Firebase NoSQL', icon: Table },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW 1: INTERACTIVE ERD DIAGRAM & COLUMN INSPECTOR */}
      {activeTab === 'erd' && (
        <div className="space-y-6">
          {/* Table Selector Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {DATABASE_TABLES_INFO.map((tbl) => {
              const isSelected = selectedTable === tbl.name;
              return (
                <button
                  key={tbl.name}
                  onClick={() => setSelectedTable(tbl.name)}
                  className={`p-4 rounded-2xl border text-right transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg'
                      : 'bg-slate-950/80 border-slate-800 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Table className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="text-[10px] text-slate-500 font-mono">{tbl.columns.length} حقل</span>
                  </div>
                  <h3 className="font-bold text-white text-sm font-mono">{tbl.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">{tbl.tableNameAr}</p>
                </button>
              );
            })}
          </div>

          {/* Detailed Inspector for Selected Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-white font-mono flex items-center gap-2">
                  <span>جدول: {currentTable.name}</span>
                  <span className="text-xs text-slate-400 font-sans font-normal">({currentTable.tableNameAr})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{currentTable.descriptionAr}</p>
              </div>
              <div className="flex gap-2">
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-bold">
                  {currentTable.indexes.length} فهارس (B-Tree / PostGIS)
                </span>
              </div>
            </div>

            {/* Columns Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="p-3">اسم العمود (Column Name)</th>
                    <th className="p-3">نوع البيانات (Data Type)</th>
                    <th className="p-3">المفاتيح والقيود (Key / Constraints)</th>
                    <th className="p-3">القيمة الافتراضية</th>
                    <th className="p-3">الوصف والدلالة في النظام</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {currentTable.columns.map((col) => (
                    <tr key={col.name} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-bold text-emerald-400 flex items-center gap-2">
                        {col.isPrimary && <Key className="w-3.5 h-3.5 text-amber-400" />}
                        <span>{col.name}</span>
                      </td>
                      <td className="p-3 text-sky-400">{col.type}</td>
                      <td className="p-3">
                        {col.isPrimary && (
                          <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[10px] font-sans font-bold">
                            Primary Key
                          </span>
                        )}
                        {col.isForeignKey && (
                          <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-[10px] font-sans font-bold mr-1">
                            FK → {col.foreignTable}
                          </span>
                        )}
                        {col.isUnique && (
                          <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-[10px] font-sans font-bold mr-1">
                            UNIQUE
                          </span>
                        )}
                        {!col.nullable && !col.isPrimary && (
                          <span className="text-slate-500 text-[10px] font-sans mr-1">NOT NULL</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-400">{col.default || '-'}</td>
                      <td className="p-3 text-slate-300 font-sans">{col.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Indexes */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5 font-mono text-xs">
              <span className="text-slate-400 font-sans font-bold text-xs block mb-1">
                الفهارس المخصصة للسرعة (Performance Indexes):
              </span>
              {currentTable.indexes.map((idx, i) => (
                <div key={i} className="text-emerald-400">
                  CREATE INDEX {idx};
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: POSTGRESQL DDL SCRIPT */}
      {activeTab === 'sql' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-base font-mono">schema.sql (PostgreSQL 15+ & PostGIS)</h3>
              <p className="text-xs text-slate-400">جاهز للتنفيذ الفوري لإنشاء قاعدة البيانات بكامل الجداول والفهارس</p>
            </div>
            <button
              onClick={() => handleCopy(generatePostgresSQL())}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2 rounded-xl font-bold transition-all"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم النسخ!' : 'نسخ الكود بالكامل'}</span>
            </button>
          </div>

          <pre
            dir="ltr"
            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 font-mono overflow-x-auto max-h-[600px] leading-relaxed selection:bg-emerald-500/30"
          >
            <code>{generatePostgresSQL()}</code>
          </pre>
        </div>
      )}

      {/* VIEW 3: PRISMA ORM SCHEMA */}
      {activeTab === 'prisma' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-base font-mono">schema.prisma (Type-Safe Node.js/Next.js)</h3>
              <p className="text-xs text-slate-400">ملف نمذجة الكائنات والعلاقات لمشاريع الـ Backend الحديثة</p>
            </div>
            <button
              onClick={() => handleCopy(generatePrismaSchema())}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2 rounded-xl font-bold transition-all"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم النسخ!' : 'نسخ schema.prisma'}</span>
            </button>
          </div>

          <pre
            dir="ltr"
            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 font-mono overflow-x-auto max-h-[600px] leading-relaxed selection:bg-emerald-500/30"
          >
            <code>{generatePrismaSchema()}</code>
          </pre>
        </div>
      )}

      {/* VIEW 4: FIREBASE NOSQL STRUCTURE */}
      {activeTab === 'firebase' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-base font-mono">firestore.rules & NoSQL Schema</h3>
              <p className="text-xs text-slate-400">لهيكل المشاريع المبنية على Google Firebase Firestore والمزامنة اللحظية</p>
            </div>
            <button
              onClick={() => handleCopy(generateFirebaseBlueprint())}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2 rounded-xl font-bold transition-all"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم النسخ!' : 'نسخ قواعد Firebase'}</span>
            </button>
          </div>

          <pre
            dir="ltr"
            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 font-mono overflow-x-auto max-h-[600px] leading-relaxed selection:bg-emerald-500/30"
          >
            <code>{generateFirebaseBlueprint()}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

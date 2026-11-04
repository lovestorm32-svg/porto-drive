import React, { useState } from 'react';
import {
  Server,
  Smartphone,
  Terminal,
  Container,
  Code2,
  Copy,
  Check,
  Play,
  FileCode,
  Globe,
  Radio,
  Layers,
} from 'lucide-react';

export const ArchitectureAndDeployGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'backend' | 'mobile' | 'docker' | 'api'>('backend');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // API Sandbox State
  const [sandboxEndpoint, setSandboxEndpoint] = useState('/api/v1/rides/negotiate');
  const [sandboxMethod, setSandboxMethod] = useState('POST');
  const [sandboxBody, setSandboxBody] = useState(`{
  "pickup": { "lat": 30.0444, "lng": 31.4722, "address": "بورتو كايرو مول، التجمع الأول" },
  "dropoff": { "lat": 30.0275, "lng": 31.4913, "address": "شارع التسعين الجنوبي، التجمع الخامس" },
  "vehicleTier": "economy",
  "passengerProposedPrice": 75.0,
  "paymentMethod": "wallet"
}`);
  const [sandboxResponse, setSandboxResponse] = useState<string | null>(null);
  const [isExecutingApi, setIsExecutingApi] = useState(false);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExecuteSandbox = () => {
    setIsExecutingApi(true);
    setTimeout(() => {
      if (sandboxEndpoint.includes('rides') || sandboxEndpoint.includes('negotiate')) {
        setSandboxResponse(
          JSON.stringify(
            {
              status: 'success',
              statusCode: 201,
              message: 'تم فتح جلسة التفاوض بنجاح وإرسال عرض السعر لـ 5 كباتن قريبين من بورتو كايرو',
              data: {
                rideId: 'porto_ride_9912',
                passengerId: 'usr_egy_01',
                passengerProposedPrice: '75.00 EGP',
                competingCaptainsCount: 5,
                incomingBids: [
                  { captain: 'أحمد فتحي', car: 'إلنترا CN7', bid: '75.00 EGP', eta: '3 mins' },
                  { captain: 'محمد مصطفى', car: 'مرسيدس C200', bid: '85.00 EGP', eta: '5 mins' },
                  { captain: 'إسلام حسن', car: 'نيسان صني', bid: '70.00 EGP', eta: '2 mins' },
                  { captain: 'مريم عبد العزيز', car: 'كيا سيراتو', bid: '80.00 EGP', eta: '4 mins' },
                  { captain: 'حسام الشريف', car: 'أريزو 5', bid: '75.00 EGP', eta: '3 mins' }
                ],
                currency: 'EGP',
                status: 'negotiating'
              },
            },
            null,
            2
          )
        );
      } else if (sandboxEndpoint.includes('otp')) {
        setSandboxResponse(
          JSON.stringify(
            {
              status: 'success',
              statusCode: 200,
              message: 'تم إرسال رمز التحقق OTP بنجاح إلى الرقم +201012345678',
              data: {
                sessionToken: 'sess_jwt_egy_9921',
                expiresInSeconds: 300,
                retryAfterSeconds: 60,
              },
            },
            null,
            2
          )
        );
      } else {
        setSandboxResponse(
          JSON.stringify(
            {
              status: 'success',
              statusCode: 200,
              data: {
                platform: 'Porto Drive Egypt',
                platformCommission: '12%',
                currency: 'EGP (ج.م)',
                surgeActive: false,
                tiers: ['Porto Eco', 'Porto Comfort VIP', 'Porto Ladies', 'Porto Express'],
              },
            },
            null,
            2
          )
        );
      }
      setIsExecutingApi(false);
    }, 400);
  };

  const backendCodeSnippet = `// ========================================================
// Node.js + Express + Socket.io Production Backend Server
// Location Matching: Redis GEO Commands
// Database: PostgreSQL with PostGIS
// ========================================================

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Redis from 'ioredis';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const db = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(express.json());

// 1. UPDATE DRIVER LIVE LOCATION VIA WEBSOCKET
io.on('connection', (socket) => {
  socket.on('driver:update_location', async (data) => {
    const { driverId, lat, lng, heading } = data;
    // Add driver coordinates into Redis Geo spatial index
    await redis.geoadd('drivers:locations', lng, lat, driverId);
    
    // Broadcast to tracking room if in active ride
    if (data.activeRideId) {
      io.to(\`ride:\${data.activeRideId}\`).emit('ride:driver_moved', {
        lat,
        lng,
        heading,
        timestamp: Date.now(),
      });
    }
  });

  socket.on('ride:join_room', (rideId) => {
    socket.join(\`ride:\${rideId}\`);
  });
});

// 2. DISPATCH MATCHING ENGINE: FIND NEARBY DRIVERS
app.post('/api/v1/rides/request', async (req, res) => {
  const { passengerId, pickup, dropoff, vehicleTier, paymentMethod } = req.body;

  // Calculate pricing & insert ride into Postgres
  const rideQuery = \`
    INSERT INTO rides (passenger_id, pickup_address, dropoff_address, vehicle_tier, status)
    VALUES ($1, $2, $3, $4, 'searching') RETURNING *
  \`;
  const rideResult = await db.query(rideQuery, [passengerId, pickup.address, dropoff.address, vehicleTier]);
  const ride = rideResult.rows[0];

  // Redis Geospatial Search: Find online drivers within 5km radius
  // GEORADIUS drivers:locations <lng> <lat> 5 km WITHDIST WITHCOORD
  const nearbyDrivers = await redis.georadius(
    'drivers:locations',
    pickup.lng,
    pickup.lat,
    5,
    'km',
    'WITHDIST',
    'WITHCOORD',
    'COUNT',
    5
  );

  // Broadcast push/socket notification to nearest candidates
  nearbyDrivers.forEach(([driverId, distKm]) => {
    io.to(\`driver:\${driverId}\`).emit('ride:incoming_request', {
      rideId: ride.id,
      pickup,
      dropoff,
      distanceToPickupKm: distKm,
      timeoutSeconds: 15,
    });
  });

  return res.status(201).json({ status: 'success', ride, nearbyNotified: nearbyDrivers.length });
});

server.listen(5000, () => console.log('SmartRide Core API running on port 5000'));
`;

  const flutterCodeSnippet = `// ========================================================
// Flutter Mobile App Starter (Passenger & Driver)
// Realtime Map + WebSocket Driver Tracking
// ========================================================

import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

class LiveRideTrackingPage extends StatefulWidget {
  final String rideId;
  const LiveRideTrackingPage({Key? key, required this.rideId}) : super(key: key);

  @override
  _LiveRideTrackingPageState createState() => _LiveRideTrackingPageState();
}

class _LiveRideTrackingPageState extends State<LiveRideTrackingPage> {
  late GoogleMapController _mapController;
  late IO.Socket _socket;
  LatLng _driverLocation = const LatLng(24.7136, 46.6753);
  final Set<Marker> _markers = {};
  final Set<Polyline> _polylines = {};

  @override
  void initState() {
    super.initState();
    _initSocketConnection();
  }

  void _initSocketConnection() {
    _socket = IO.io('https://api.smartride.sa', <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': true,
    });

    _socket.onConnect((_) {
      _socket.emit('ride:join_room', widget.rideId);
    });

    // Listen to real-time driver movement from server
    _socket.on('ride:driver_moved', (data) {
      final double lat = data['lat'];
      final double lng = data['lng'];
      final double heading = (data['heading'] ?? 0).toDouble();

      setState(() {
        _driverLocation = LatLng(lat, lng);
        _updateDriverMarker(_driverLocation, heading);
      });

      _mapController.animateCamera(CameraUpdate.newLatLng(_driverLocation));
    });
  }

  void _updateDriverMarker(LatLng pos, double rotation) {
    _markers.removeWhere((m) => m.markerId.value == 'driver_car');
    _markers.add(
      Marker(
        markerId: const MarkerId('driver_car'),
        position: pos,
        rotation: rotation,
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          GoogleMap(
            initialCameraPosition: CameraPosition(target: _driverLocation, zoom: 15),
            onMapCreated: (controller) => _mapController = controller,
            markers: _markers,
            polylines: _polylines,
            myLocationEnabled: true,
          ),
          // Bottom Passenger Ride Status Card
          Positioned(
            bottom: 24,
            left: 16,
            right: 16,
            child: Card(
              elevation: 8,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              child: const Padding(
                padding: EdgeInsets.all(16.0),
                child: Text('الكابتن في الطريق إليك (يصل خلال 3 دقائق)'),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
`;

  const dockerComposeSnippet = `# ========================================================
# Docker Compose for One-Command Platform Deployment
# Starts: Node.js API, PostgreSQL 15 + PostGIS, Redis 7
# Run: docker compose up -d
# ========================================================

version: '3.8'

services:
  # 1. PostgreSQL with PostGIS spatial extension
  postgres:
    image: postgis/postgis:15-3.3
    container_name: smartride_postgres
    restart: always
    environment:
      POSTGRES_USER: smartride_admin
      POSTGRES_PASSWORD: SecretPassword123!
      POSTGRES_DB: smartride_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./schema.sql:/docker-entrypoint-initdb.d/schema.sql

  # 2. Redis for Fast Geospatial Matching & Socket.io Sessions
  redis:
    image: redis:7-alpine
    container_name: smartride_redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

  # 3. Node.js Backend API & Socket Service
  api_service:
    build: .
    container_name: smartride_api
    restart: always
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgres://smartride_admin:SecretPassword123!@postgres:5432/smartride_db
      REDIS_URL: redis://redis:6379
      JWT_SECRET: super_secure_ride_secret_key_2026
      GOOGLE_MAPS_KEY: YOUR_MAPS_API_KEY
    depends_on:
      - postgres
      - redis

volumes:
  pgdata:
  redisdata:
`;

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-slate-950 text-right p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Server className="w-6 h-6 text-emerald-400" />
            دليل البنية المعمارية، كود الـ Backend وتطبيقات الموبايل
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            شرح متكامل لخطوات التثبيت والتشغيل المحلي وعبر السحاب مع تجربة الـ API تفاعلياً
          </p>
        </div>

        {/* Tab selection */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto">
          {[
            { id: 'backend', label: 'خادم Node.js والـ Redis', icon: Server },
            { id: 'mobile', label: 'كود الموبايل (Flutter/RN)', icon: Smartphone },
            { id: 'docker', label: 'تشغيل Docker Compose', icon: Container },
            { id: 'api', label: 'تجربة الـ API التفاعلي', icon: Play },
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

      {/* TAB 1: BACKEND ARCHITECTURE */}
      {activeTab === 'backend' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">خادم Express + Socket.io + Redis Geohash</h3>
                <p className="text-xs text-slate-400">
                  كيفية عمل خوارزمية الربط بين أقرب سائق وطلب الراكب باستخدام أوامر Redis الجغرافية
                </p>
              </div>
              <button
                onClick={() => handleCopy(backendCodeSnippet, 'backend')}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2 rounded-xl font-bold transition-all"
              >
                {copiedKey === 'backend' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedKey === 'backend' ? 'تم النسخ!' : 'نسخ الكود'}</span>
              </button>
            </div>

            <pre
              dir="ltr"
              className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 font-mono overflow-x-auto max-h-[500px] leading-relaxed"
            >
              <code>{backendCodeSnippet}</code>
            </pre>
          </div>

          {/* Quick steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h4 className="text-xs font-bold text-white">تثبيت الحزم المطلوبة</h4>
              <p className="text-[11px] text-slate-400 font-mono" dir="ltr">
                npm i express socket.io ioredis pg jsonwebtoken dotenv
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h4 className="text-xs font-bold text-white">إعداد قاعدة بيانات Postgres</h4>
              <p className="text-[11px] text-slate-400 font-mono" dir="ltr">
                psql -U postgres -d smartride &lt; schema.sql
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h4 className="text-xs font-bold text-white">تشغيل السيرفر اللحظي</h4>
              <p className="text-[11px] text-slate-400 font-mono" dir="ltr">
                npm run dev (أو tsx server.ts)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MOBILE FLUTTER STARTER */}
      {activeTab === 'mobile' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-base">كود Flutter Dart (Google Maps + WebSockets)</h3>
              <p className="text-xs text-slate-400">شاشة التتبع الحي وتحريك أيقونة الكابتن بسلاسة على الخريطة</p>
            </div>
            <button
              onClick={() => handleCopy(flutterCodeSnippet, 'flutter')}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2 rounded-xl font-bold transition-all"
            >
              {copiedKey === 'flutter' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey === 'flutter' ? 'تم النسخ!' : 'نسخ كود Flutter'}</span>
            </button>
          </div>

          <pre
            dir="ltr"
            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 font-mono overflow-x-auto max-h-[500px] leading-relaxed"
          >
            <code>{flutterCodeSnippet}</code>
          </pre>
        </div>
      )}

      {/* TAB 3: DOCKER COMPOSE */}
      {activeTab === 'docker' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-base">docker-compose.yml</h3>
              <p className="text-xs text-slate-400">تشغيل كافة مكونات السيرفر وقاعدة البيانات والـ Redis بأمر واحد</p>
            </div>
            <button
              onClick={() => handleCopy(dockerComposeSnippet, 'docker')}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2 rounded-xl font-bold transition-all"
            >
              {copiedKey === 'docker' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey === 'docker' ? 'تم النسخ!' : 'نسخ docker-compose'}</span>
            </button>
          </div>

          <pre
            dir="ltr"
            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 font-mono overflow-x-auto max-h-[500px] leading-relaxed"
          >
            <code>{dockerComposeSnippet}</code>
          </pre>
        </div>
      )}

      {/* TAB 4: INTERACTIVE API SANDBOX */}
      {activeTab === 'api' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base">بيئة تجربة واجهات البرمجة التفاعلية (API Sandbox)</h3>
            <p className="text-xs text-slate-400">اختبر استجابة خادم المنصة مباشرة وتأكد من بنية الـ JSON المتبادلة</p>
          </div>

          {/* Quick preset selector */}
          <div className="flex flex-wrap gap-2">
            {[
              {
                label: 'طلب رحلة جديدة (Book Ride)',
                endpoint: '/api/v1/rides/request',
                method: 'POST',
                body: `{\n  "pickup": { "lat": 24.7115, "lng": 46.6744, "address": "برج المملكة، الرياض" },\n  "dropoff": { "lat": 24.7618, "lng": 46.6311, "address": "مركز الملك عبدالله المالي" },\n  "vehicleTier": "economy",\n  "paymentMethod": "wallet"\n}`,
              },
              {
                label: 'طلب رمز التحقق OTP (Auth)',
                endpoint: '/api/v1/auth/request-otp',
                method: 'POST',
                body: `{\n  "phoneNumber": "+966501234567"\n}`,
              },
              {
                label: 'جلب إعدادات التسعيرة (Get Pricing)',
                endpoint: '/api/v1/pricing/current',
                method: 'GET',
                body: `{}`,
              },
            ].map((preset) => (
              <button
                key={preset.endpoint}
                onClick={() => {
                  setSandboxEndpoint(preset.endpoint);
                  setSandboxMethod(preset.method);
                  setSandboxBody(preset.body);
                  setSandboxResponse(null);
                }}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                  sandboxEndpoint === preset.endpoint
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Endpoint Bar */}
          <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
            <span
              className={`px-3 py-1 rounded-xl text-xs font-bold font-mono ${
                sandboxMethod === 'POST' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
              }`}
            >
              {sandboxMethod}
            </span>
            <input
              type="text"
              value={sandboxEndpoint}
              onChange={(e) => setSandboxEndpoint(e.target.value)}
              className="flex-1 bg-transparent text-white font-mono text-xs outline-none text-left"
              dir="ltr"
            />
            <button
              onClick={handleExecuteSandbox}
              disabled={isExecutingApi}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isExecutingApi ? 'جاري الإرسال...' : 'تنفيذ الطلب'}</span>
            </button>
          </div>

          {/* Request & Response Split Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">نص الطلب المرسل (Request Body - JSON)</label>
              <textarea
                dir="ltr"
                rows={9}
                value={sandboxBody}
                onChange={(e) => setSandboxBody(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-emerald-300 font-mono outline-none resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">استجابة الخادم (Response Payload)</label>
              <pre
                dir="ltr"
                className="w-full h-[185px] bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-300 font-mono overflow-y-auto leading-relaxed"
              >
                <code>{sandboxResponse || '// اضغط على "تنفيذ الطلب" لمشاهدة الاستجابة الفورية'}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useRidePlatform } from '../../context/RidePlatformContext';
import { MapView } from '../MapView';
import { VehicleType } from '../../types';
import {
  TrendingUp,
  DollarSign,
  Users,
  Car,
  Activity,
  Sliders,
  Check,
  X,
  ShieldCheck,
  Zap,
  AlertTriangle,
  FileCheck,
  MapPin,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    drivers,
    user,
    activeRide,
    pricing,
    systemStats,
    approveDriver,
    rejectDriver,
    updateDriverStatus,
    updatePricing,
    toggleSurge,
    resetDemoToCleanState,
  } = useRidePlatform();

  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'drivers' | 'pricing' | 'reports'>('overview');
  const [selectedDriverForReview, setSelectedDriverForReview] = useState<string | null>(null);

  // Pricing edit state
  const [commissionInput, setCommissionInput] = useState<number>(pricing.commissionRate);
  const [surgeInput, setSurgeInput] = useState<number>(pricing.surgeMultiplier);
  const [tierInputs, setTierInputs] = useState(pricing.tiers);

  const pendingDrivers = drivers.filter(
    (d) => d.status === 'pending_approval' || d.documents.some((doc) => doc.status === 'pending')
  );

  const handleSavePricing = () => {
    updatePricing({
      commissionRate: commissionInput,
      surgeMultiplier: surgeInput,
      tiers: tierInputs,
    });
    alert('تم حفظ إعدادات التسعيرة ونسبة عمولة المنصة بنجاح!');
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-slate-950 text-right p-4 sm:p-6 space-y-6">
      {/* Top Header & KPI Metric Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
            لوحة التحكم الإدارية والعمليات (Porto Drive Dispatch - مصر 🇪🇬)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            مراقبة العمليات اللحظية، ضبط نسب عمولة Porto، تسعيرة الكيلومتر، وإدارة أسطول الكباتن
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={resetDemoToCleanState}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2 rounded-xl border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>إعادة ضبط المحاكاة</span>
          </button>

          <button
            onClick={toggleSurge}
            className={`flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl font-bold border transition-all ${
              pricing.isSurgeActive
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{pricing.isSurgeActive ? 'إلغاء وضع الذروة (Surge)' : 'تفعيل تسعيرة الذروة'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">إجمالي دخل المنصة اليوم</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white font-mono">{systemStats.totalRevenueToday.toFixed(2)} ج.م</h3>
          <p className="text-[11px] text-emerald-400 mt-1 font-semibold">
            صافي عمولة Porto ({pricing.commissionRate}%): {systemStats.platformProfitToday.toFixed(2)} ج.م
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">الرحلات المنفذة اليوم</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white font-mono">{systemStats.totalRidesToday} رحلة</h3>
          <p className="text-[11px] text-blue-400 mt-1 font-semibold">
            الرحلات الجارية الآن: {systemStats.activeRidesNow} مشوار
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">الكباتن المتصلين حالياً</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white font-mono">{systemStats.onlineDrivers} متاح</h3>
          <p className="text-[11px] text-slate-400 mt-1">
            في رحلة: {systemStats.busyDrivers} • معلقين: {pendingDrivers.length}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">معدل رضا الركاب</span>
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white font-mono">★ {systemStats.averageRating}</h3>
          <p className="text-[11px] text-emerald-400 mt-1 font-semibold">99.2% جودة الخدمة</p>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'overview', label: 'الخريطة والعمليات الحية (Live Fleet)' },
          { id: 'drivers', label: `إدارة السائقين والاعتمادات (${pendingDrivers.length})` },
          { id: 'pricing', label: 'التسعيرة الديناميكية والعمولة' },
          { id: 'reports', label: 'التقارير المالية والتحليلات' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveAdminTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeAdminTab === tab.id
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: LIVE FLEET MAP & DISPATCH */}
      {activeAdminTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[520px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
            <MapView
              pickup={activeRide?.pickup}
              dropoff={activeRide?.dropoff}
              drivers={drivers}
              activeRide={activeRide}
              zoom={12}
            />
            <div className="absolute top-4 right-4 z-20 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 text-xs text-white shadow">
              مراقبة حركة أسطول مدينة الرياض (تحديث حي)
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center justify-between">
              <span>حالة الرحلة النشطة الآن</span>
              {activeRide && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                  {activeRide.status}
                </span>
              )}
            </h3>

            {activeRide ? (
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">رقم الرحلة:</span>
                  <span className="font-mono text-white font-bold">{activeRide.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">الراكب:</span>
                  <span className="text-white font-bold">{activeRide.passengerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">الكابتن:</span>
                  <span className="text-emerald-400 font-bold">{activeRide.driver?.name || 'جاري التعيين'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">المبلغ المقدر:</span>
                  <span className="text-white font-bold font-mono">{activeRide.price} ج.م</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">طريقة الدفع:</span>
                  <span className="text-white font-bold">{activeRide.paymentMethod}</span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/60 p-8 rounded-2xl border border-slate-800 text-center space-y-2">
                <Car className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">لا توجد رحلات نشطة في هذه اللحظة</p>
                <p className="text-[11px] text-slate-500">
                  اطلب رحلة من تبويب "تطبيق الراكب" لمراقبتها هنا لحظياً!
                </p>
              </div>
            )}

            {/* Quick Fleet Health */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-300">سجل الكباتن وحالتهم</h4>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {drivers.map((drv) => (
                  <div
                    key={drv.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{drv.name}</p>
                      <span className="text-[10px] text-slate-400">
                        {drv.vehicle.make} {drv.vehicle.model} • {drv.vehicle.plateNumber}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        drv.status === 'online'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : drrvStatusBadge(drv.status)
                      }`}
                    >
                      {drv.status === 'online' && 'متاح'}
                      {drv.status === 'busy' && 'في رحلة'}
                      {drv.status === 'offline' && 'غير متصل'}
                      {drv.status === 'pending_approval' && 'معلق'}
                      {drv.status === 'suspended' && 'محظور'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DRIVER MANAGEMENT & DOCUMENT APPROVALS */}
      {activeAdminTab === 'drivers' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">قائمة السائقين والوثائق المعلقة للمراجعة</h3>
            <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
              إجمالي الكباتن المسجلين: {drivers.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="p-3">الكابتن</th>
                  <th className="p-3">المركبة واللوحة</th>
                  <th className="p-3">الفئة</th>
                  <th className="p-3">التقييم والرحلات</th>
                  <th className="p-3">حالة الوثائق</th>
                  <th className="p-3">الحالة الحالية</th>
                  <th className="p-3 text-center">الإجراء الإداري</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {drivers.map((drv) => {
                  const hasPendingDoc = drv.documents.some((d) => d.status === 'pending');
                  return (
                    <tr key={drv.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 flex items-center gap-2.5">
                        <img
                          src={drv.avatar}
                          alt={drv.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <p className="font-bold text-white">{drv.name}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{drv.phone}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="text-white">
                          {drv.vehicle.make} {drv.vehicle.model} ({drv.vehicle.year})
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">{drv.vehicle.plateNumber}</span>
                      </td>
                      <td className="p-3">
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] text-emerald-400 font-medium">
                          {drv.vehicle.type}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-amber-400 font-bold">★ {drv.rating}</span>
                        <span className="text-slate-400 text-[10px] block">{drv.totalTrips} مشوار</span>
                      </td>
                      <td className="p-3">
                        {hasPendingDoc ? (
                          <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                            وثيقة تحتاج مراجعة
                          </span>
                        ) : (
                          <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            وثائق معتمدة (4)
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold ${
                            drv.status === 'online'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : drv.status === 'pending_approval'
                              ? 'bg-amber-500/20 text-amber-400'
                              : drv.status === 'suspended'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {drv.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {drv.status === 'pending_approval' || hasPendingDoc ? (
                            <>
                              <button
                                onClick={() => approveDriver(drv.id)}
                                className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                                title="اعتماد وقبول الكابتن"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>اعتماد</span>
                              </button>
                              <button
                                onClick={() => rejectDriver(drv.id)}
                                className="p-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white text-[11px] flex items-center gap-1 transition-colors"
                                title="رفض الوثائق"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>رفض</span>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() =>
                                updateDriverStatus(
                                  drv.id,
                                  drv.status === 'suspended' ? 'online' : 'suspended'
                                )
                              }
                              className={`px-2 py-1 rounded text-[11px] font-bold ${
                                drv.status === 'suspended'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-rose-950 text-rose-400 hover:bg-rose-900 border border-rose-800'
                              }`}
                            >
                              {drv.status === 'suspended' ? 'رفع الحظر' : 'حظر الحساب'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DYNAMIC PRICING & COMMISSION MANAGER */}
      {activeAdminTab === 'pricing' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-white text-base">إعدادات تسعيرة الكيلومتر والحد الأدنى وعمولة التطبيق</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تطبق هذه التغييرات فوراً على حساب تكاليف جميع المشاوير الجديدة للركاب والكباتن
              </p>
            </div>
            <button
              onClick={handleSavePricing}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all self-start sm:self-auto"
            >
              حفظ وتطبيق التسعيرة
            </button>
          </div>

          {/* Platform Commission & Surge Multiplier */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-300 block">نسبة عمولة المنصة (%)</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={commissionInput}
                  onChange={(e) => setCommissionInput(Number(e.target.value))}
                  className="w-24 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold text-sm text-center outline-none"
                />
                <span className="text-xs text-slate-400">
                  تستقطع المنصة حالياً <strong className="text-emerald-400">{commissionInput}%</strong> من كل رحلة،
                  ويذهب الباقي ({(100 - commissionInput)}%) للكابتن.
                </span>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-300 block">معامل وقت الذروة (Surge Factor)</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="3.0"
                  value={surgeInput}
                  onChange={(e) => setSurgeInput(Number(e.target.value))}
                  className="w-24 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold text-sm text-center outline-none"
                />
                <span className="text-xs text-slate-400">
                  مضاعف السعر التلقائي في أوقات المطر والازدحام وساعات الذروة.
                </span>
              </div>
            </div>
          </div>

          {/* Per Vehicle Tier Breakdown Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white">تسعيرة الفئات (الفتح، الكيلومتر، الدقيقة، والحد الأدنى)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.keys(tierInputs) as VehicleType[]).map((tierKey) => {
                const tier = tierInputs[tierKey];
                return (
                  <div key={tierKey} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <h5 className="font-bold text-xs text-emerald-400 border-b border-slate-800 pb-2">
                      {tier.nameAr}
                    </h5>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-slate-400 block text-[10px] mb-1">فتحة العداد (Base Fare)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={tier.baseFare}
                          onChange={(e) => {
                            setTierInputs({
                              ...tierInputs,
                              [tierKey]: { ...tier, baseFare: Number(e.target.value) },
                            });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block text-[10px] mb-1">سعر الكيلومتر (ر.س/كم)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={tier.perKmRate}
                          onChange={(e) => {
                            setTierInputs({
                              ...tierInputs,
                              [tierKey]: { ...tier, perKmRate: Number(e.target.value) },
                            });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block text-[10px] mb-1">سعر الدقيقة (ر.س/دقيقة)</label>
                        <input
                          type="number"
                          step="0.05"
                          value={tier.perMinuteRate}
                          onChange={(e) => {
                            setTierInputs({
                              ...tierInputs,
                              [tierKey]: { ...tier, perMinuteRate: Number(e.target.value) },
                            });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block text-[10px] mb-1">الحد الأدنى للرحلة</label>
                        <input
                          type="number"
                          step="1"
                          value={tier.minimumFare}
                          onChange={(e) => {
                            setTierInputs({
                              ...tierInputs,
                              [tierKey]: { ...tier, minimumFare: Number(e.target.value) },
                            });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FINANCIAL REPORTS & ANALYTICS */}
      {activeAdminTab === 'reports' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6">
          <h3 className="font-bold text-white text-base">التقارير المالية وحركة الإيرادات والعمولات</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block">إجمالي التعاملات الشهرية (GMV)</span>
              <span className="text-2xl font-black text-white font-mono mt-1 block">48,250.00 ر.س</span>
              <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">+22% نمو شهري</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block">صافي أرباح المنصة المودعة</span>
              <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">7,237.50 ر.س</span>
              <span className="text-[10px] text-slate-400 font-semibold mt-1 block">متوسط عمولة 15%</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block">إجمالي مشاوير المنصة المكتملة</span>
              <span className="text-2xl font-black text-sky-400 font-mono mt-1 block">1,840 مشوار</span>
              <span className="text-[10px] text-slate-400 font-semibold mt-1 block">معدل الإلغاء 2.1% فقط</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white">سجل العمليات المالية اللحظية (Payments Audit Log)</h4>
            <div className="space-y-2">
              {[
                { id: 'TXN-90182', user: 'محمد الشمري', driver: 'أحمد العتيبي', total: 28.5, comm: 4.27, net: 24.23, method: 'المحفظة' },
                { id: 'TXN-90181', user: 'سلطان القحطاني', driver: 'خالد بن عبد العزيز', total: 65.0, comm: 9.75, net: 55.25, method: 'مدى / فيزا' },
                { id: 'TXN-90180', user: 'نورة التميمي', driver: 'سارة المنصور', total: 34.0, comm: 5.10, net: 28.90, method: 'Apple Pay' },
                { id: 'TXN-90179', user: 'فيصل الحربي', driver: 'أحمد العتيبي', total: 18.0, comm: 2.70, net: 15.30, method: 'نقداً' },
              ].map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-emerald-400 font-bold">{tx.id}</span>
                    <span className="text-slate-300">الراكب: {tx.user}</span>
                    <span className="text-slate-400">← الكابتن: {tx.driver}</span>
                  </div>
                  <div className="flex items-center gap-4 font-mono">
                    <span className="text-slate-400">طريقة: {tx.method}</span>
                    <span className="text-white font-bold">{tx.total} ر.س</span>
                    <span className="text-emerald-400">عمولة: +{tx.comm} ر.س</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function drrvStatusBadge(status: string) {
  switch (status) {
    case 'busy':
      return 'bg-amber-500/20 text-amber-400';
    case 'pending_approval':
      return 'bg-amber-500/20 text-amber-400';
    case 'suspended':
      return 'bg-rose-500/20 text-rose-400';
    default:
      return 'bg-slate-800 text-slate-400';
  }
}

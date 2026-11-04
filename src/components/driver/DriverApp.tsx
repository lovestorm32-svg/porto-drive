import React, { useState } from 'react';
import { useRidePlatform } from '../../context/RidePlatformContext';
import { MapView } from '../MapView';
import { DriverIncomingRequestModal } from './DriverIncomingRequestModal';
import {
  Power,
  TrendingUp,
  Award,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  Navigation,
  MapPin,
  Phone,
  MessageCircle,
  AlertCircle,
  DollarSign,
  Car,
  ChevronDown,
  UserCheck,
  Shield,
  Send,
  X,
  CreditCard,
  Building,
} from 'lucide-react';

export const DriverApp: React.FC = () => {
  const {
    drivers,
    selectedDriverId,
    setSelectedDriverId,
    activeDriver,
    activeRide,
    toggleDriverOnline,
    driverArrivedAtPickup,
    driverStartTrip,
    driverCompleteTrip,
    registerDriver,
    uploadDriverDocument,
    messages,
    sendMessage,
  } = useRidePlatform();

  // Active view tab inside Driver App: 'dashboard' | 'documents' | 'earnings'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'documents' | 'earnings'>('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [showCashoutModal, setShowCashoutModal] = useState(false);
  const [cashoutAmount, setCashoutAmount] = useState('');
  const [cashoutSuccess, setCashoutSuccess] = useState(false);

  // New Driver Registration State
  const [showRegModal, setShowRegModal] = useState(false);
  const [regForm, setRegForm] = useState({
    name: '',
    phone: '',
    make: 'تويوتا',
    model: 'كامري',
    year: 2024,
    plateNumber: '',
  });

  const isOnline = activeDriver.status === 'online' || activeDriver.status === 'busy';
  const isAssignedToCurrentRide = activeRide && activeRide.driverId === activeDriver.id;

  const handleSendDriverMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendMessage(chatInput, 'driver');
    setChatInput('');
  };

  const handleCashout = () => {
    setCashoutSuccess(true);
    setTimeout(() => {
      setCashoutSuccess(false);
      setShowCashoutModal(false);
    }, 1500);
  };

  return (
    <div className="relative w-full h-[calc(100vh-80px)] min-h-[640px] flex flex-col md:flex-row overflow-hidden bg-slate-950">
      {/* MAP VIEW CONTAINER */}
      <div className="flex-1 relative h-[45vh] md:h-full order-1 md:order-2">
        <MapView
          pickup={activeRide?.pickup}
          dropoff={activeRide?.dropoff}
          drivers={[activeDriver]}
          activeRide={isAssignedToCurrentRide ? activeRide : null}
          center={[activeDriver.currentLocation.lat, activeDriver.currentLocation.lng]}
          zoom={14}
        />

        {/* Turn-by-Turn GPS Navigation Overlay Bar when driver is on a ride */}
        {isAssignedToCurrentRide && (
          <div className="absolute top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-20 bg-slate-900/95 backdrop-blur-md border border-emerald-500/40 rounded-2xl p-4 shadow-2xl space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Navigation className="w-5 h-5 rtl:-rotate-90" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">نظام الملاحة الذكي (Porto GPS)</span>
                  <p className="text-xs font-bold text-white">
                    {activeRide.status === 'driver_arriving'
                      ? 'اتجه نحو نقطة اصطحاب الراكب'
                      : 'واصل السير نحو وجهة الراكب المحددة'}
                  </p>
                </div>
              </div>
              <div className="text-left font-mono">
                <span className="text-xs font-bold text-emerald-400 block">52 كم/س</span>
                <span className="text-[10px] text-slate-400">السرعة الحالية</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">
                {activeRide.status === 'driver_arriving' ? activeRide.pickup.address : activeRide.dropoff.address}
              </span>
            </p>
          </div>
        )}

        {/* Driver Account Switcher Pill */}
        <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-800 text-xs shadow-xl flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">اختيار الكابتن (من الـ 5 كباتن):</span>
          <select
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            className="bg-slate-800 text-white rounded-lg px-2 py-1 outline-none text-xs border border-slate-700"
          >
            {drivers.map((drv) => (
              <option key={drv.id} value={drv.id}>
                {drv.name} ({drv.vehicle.make} {drv.vehicle.model})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* DRIVER CONTROL PANEL (Sidebar / Bottom Sheet) */}
      <div className="w-full md:w-[440px] lg:w-[480px] bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col order-2 md:order-1 z-30 shadow-2xl overflow-y-auto max-h-[55vh] md:max-h-full">
        {/* Driver Profile Bar */}
        <div className="p-4 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={activeDriver.avatar}
                alt={activeDriver.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-700"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                  isOnline ? 'bg-emerald-500' : 'bg-slate-500'
                }`}
              />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">{activeDriver.name}</h3>
              <p className="text-xs text-slate-400">
                {activeDriver.vehicle.make} {activeDriver.vehicle.model} •{' '}
                <span className="font-mono text-emerald-400">{activeDriver.vehicle.plateNumber}</span>
              </p>
            </div>
          </div>

          {/* ONLINE / OFFLINE TOGGLE SWITCH */}
          <button
            onClick={() => toggleDriverOnline(activeDriver.id)}
            disabled={activeDriver.status === 'busy' || activeDriver.status === 'pending_approval'}
            className={`px-3.5 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
              activeDriver.status === 'busy'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : activeDriver.status === 'pending_approval'
                ? 'bg-slate-800 text-slate-400 border border-slate-700'
                : isOnline
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 ring-2 ring-emerald-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>
              {activeDriver.status === 'busy'
                ? 'في رحلة نشطة'
                : activeDriver.status === 'pending_approval'
                ? 'قيد مراجعة الوثائق'
                : isOnline
                ? 'متصل لاستقبال الطلبات'
                : 'غير متصل (Off)'}
            </span>
          </button>
        </div>

        {/* Navigation Tabs (الرئيسية، الوثائق، الأرباح) */}
        <div className="grid grid-cols-3 border-b border-slate-800 text-xs bg-slate-950/50">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-3 font-bold transition-colors border-b-2 ${
              activeTab === 'dashboard'
                ? 'text-emerald-400 border-emerald-500 bg-slate-900'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            لوحة القيادة
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 font-bold transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'documents'
                ? 'text-emerald-400 border-emerald-500 bg-slate-900'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>الوثائق والتسجيل</span>
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`py-3 font-bold transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'earnings'
                ? 'text-emerald-400 border-emerald-500 bg-slate-900'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>سجل الأرباح</span>
          </button>
        </div>

        {/* TAB 1: MAIN DRIVER DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
            {isAssignedToCurrentRide ? (
              /* ACTIVE TRIP WORKFLOW CONTROLS */
              <div className="space-y-4">
                <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        {activeRide.passengerName.slice(0, 1)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{activeRide.passengerName}</h4>
                        <p className="text-[11px] text-slate-400">تقييم الراكب: ★ {activeRide.passengerRating}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => alert(`جاري الاتصال بالراكب على: ${activeRide.passengerPhone}`)}
                        className="p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Route points */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2 text-slate-300">
                      <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">نقطة ركوب العميل:</span>
                        <span className="font-semibold">{activeRide.pickup.name}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300">
                      <Navigation className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">نقطة الإنزال:</span>
                        <span className="font-semibold">{activeRide.dropoff.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial payout info */}
                  <div className="bg-slate-900 rounded-xl p-3 flex items-center justify-between text-xs">
                    <span className="text-slate-400">صافي عائدك من الرحلة بعد التفاوض:</span>
                    <span className="text-emerald-400 font-black text-sm font-mono">
                      {(activeRide.price * (1 - 0.12)).toFixed(2)} ج.م
                    </span>
                  </div>
                </div>

                {/* TRIP ACTION BUTTONS STEP-BY-STEP */}
                <div className="space-y-2 pt-2">
                  {activeRide.status === 'driver_arriving' && (
                    <button
                      onClick={driverArrivedAtPickup}
                      className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>وصلت لموقع الراكب (أنا أمام المكان)</span>
                    </button>
                  )}

                  {activeRide.status === 'arrived' && (
                    <button
                      onClick={driverStartTrip}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-5 h-5" />
                      <span>ركب العميل - بدء التحرك نحو الوجهة</span>
                    </button>
                  )}

                  {activeRide.status === 'in_progress' && (
                    <button
                      onClick={driverCompleteTrip}
                      className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base rounded-2xl shadow-xl shadow-emerald-600/40 transition-all flex items-center justify-center gap-2"
                    >
                      <Award className="w-5 h-5" />
                      <span>وصلنا للوجهة - إنهاء الرحلة وتحصيل ({activeRide.price} ج.م)</span>
                    </button>
                  )}
                </div>

                {/* Embedded in-ride chat drawer if open */}
                {isChatOpen && (
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-white">الدردشة المباشرة مع الراكب</span>
                      <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="max-h-36 overflow-y-auto space-y-2 text-xs">
                      {messages.map((m) => (
                        <div
                          key={m.id}
                          className={`p-2 rounded-xl ${
                            m.senderRole === 'driver' ? 'bg-emerald-950/80 text-emerald-200 text-right mr-4' : 'bg-slate-800 text-white text-left ml-4'
                          }`}
                        >
                          <p>{m.text}</p>
                          <span className="text-[9px] text-slate-400">{m.timestamp}</span>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleSendDriverMessage} className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="أرسل رداً للراكب..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                      />
                      <button
                        type="submit"
                        className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold"
                      >
                        إرسال
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              /* IDLE DRIVER DASHBOARD */
              <div className="space-y-4">
                {/* Status Card */}
                <div
                  className={`p-5 rounded-2xl border text-center space-y-2 transition-all ${
                    isOnline
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
                      isOnline ? 'bg-emerald-500/20 text-emerald-400 animate-pulse' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Car className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-white text-base">
                    {isOnline ? 'أنت متصل وجاهز للمنافسة واستقبال الطلبات' : 'أنت غير متصل حالياً'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isOnline
                      ? 'تطبيق Porto Drive يستمع للطلبات القريبة في القاهرة وبورتو. يمكنك قبول عرض الراكب أو التفاوض بسعر أعلى.'
                      : 'اضغط على زر "متصل" بالأعلى لبدء استقبال طلبات الركاب والمنافسة بالعروض.'}
                  </p>
                </div>

                {/* Quick Today's Stats Cards */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl">
                    <span className="text-[10px] text-slate-400 block">أرباح اليوم</span>
                    <span className="text-base font-bold text-emerald-400 font-mono">
                      {activeDriver.earnings.today} ج.م
                    </span>
                  </div>
                  <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl">
                    <span className="text-[10px] text-slate-400 block">رحلات اليوم</span>
                    <span className="text-base font-bold text-white font-mono">
                      {activeDriver.earnings.tripsToday}
                    </span>
                  </div>
                  <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl">
                    <span className="text-[10px] text-slate-400 block">نسبة القبول</span>
                    <span className="text-base font-bold text-sky-400 font-mono">
                      {activeDriver.acceptanceRate}%
                    </span>
                  </div>
                </div>

                {/* Simulation helper tip */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs space-y-2 text-right">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    كيف تختبر نظام التفاوض مع الـ 5 كباتن؟
                  </span>
                  <p className="text-slate-400 leading-relaxed">
                    1. في <strong className="text-white">"تطبيق الراكب"</strong> حدد وجهتك واقترح سعرك (مثلاً 75 ج.م).
                    <br />
                    2. ستظهر فوراً عروض الـ 5 كباتن متنافسين بأسعار متفاوتة.
                    <br />
                    3. يمكنك هنا ككابتن تقديم عرض مضاد أو قبول سعر الراكب مباشرة!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DOCUMENTS & REGISTRATION */}
        {activeTab === 'documents' && (
          <div className="p-4 sm:p-5 flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">الوثائق والشهادات الرسمية</h3>
                <p className="text-xs text-slate-400">الرقم القومي ورخصة القيادة وفحص السيارة</p>
              </div>
              <button
                onClick={() => setShowRegModal(true)}
                className="text-xs bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-bold transition-colors"
              >
                + تسجيل كابتن جديد
              </button>
            </div>

            {/* Document list */}
            <div className="space-y-2.5">
              {activeDriver.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between text-right"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        doc.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{doc.nameAr}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        رقم: {doc.documentNumber} • تنتهي: {doc.expiryDate}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      doc.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {doc.status === 'approved' ? 'معتمد وموثق' : 'قيد المراجعة'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: EARNINGS & CASHOUT */}
        {activeTab === 'earnings' && (
          <div className="p-4 sm:p-5 flex-1 space-y-4 text-right">
            {/* Wallet Balance Hero */}
            <div className="bg-gradient-to-br from-emerald-950/60 to-slate-950 border border-emerald-500/30 rounded-3xl p-5 text-center space-y-2 relative overflow-hidden">
              <span className="text-xs text-slate-400">رصيد أرباح الكابتن المتاح للسحب الفوري</span>
              <h2 className="text-3xl font-black text-emerald-400 font-mono">
                {activeDriver.earnings.walletBalance.toFixed(2)}{' '}
                <span className="text-sm font-sans text-slate-300">جنيه مصري (ج.م)</span>
              </h2>

              <button
                onClick={() => setShowCashoutModal(true)}
                className="mt-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all inline-flex items-center gap-1.5"
              >
                <DollarSign className="w-4 h-4" />
                <span>سحب الأرباح عبر InstaPay / فودافون كاش / البنك</span>
              </button>
            </div>

            {/* Weekly Performance */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[11px] text-slate-400 block">أرباح هذا الأسبوع</span>
                <span className="text-lg font-black text-white font-mono mt-1 block">
                  {activeDriver.earnings.thisWeek.toFixed(2)} ج.م
                </span>
                <span className="text-[10px] text-emerald-400 mt-1 block font-medium">+18% نمو أسبوعي</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[11px] text-slate-400 block">إجمالي مشاوير الكابتن</span>
                <span className="text-lg font-black text-white font-mono mt-1 block">
                  {activeDriver.totalTrips} مشوار
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block font-medium">متوسط التقييم ★ {activeDriver.rating}</span>
              </div>
            </div>

            {/* Recent Trips Log */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white">آخر المشاوير المكتملة في بورتو والقاهرة</h4>
              <div className="space-y-2">
                {[
                  { from: 'بورتو كايرو مول', to: 'شارع التسعين بالتجمع', fare: 75.0, time: 'منذ ساعة' },
                  { from: 'سيتي ستارز مدينة نصر', to: 'مطار القاهرة مبنى 3', fare: 110.0, time: 'اليوم، 15:20' },
                  { from: 'كورنيش المعادي', to: 'برج القاهرة بالزمالك', fare: 85.0, time: 'أمس' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-white">
                        {item.from} ← {item.to}
                      </p>
                      <span className="text-[10px] text-slate-500">{item.time}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400">+{item.fare} ج.م</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* INCOMING RIDE REQUEST MODAL */}
      <DriverIncomingRequestModal />

      {/* CASHOUT MODAL (InstaPay / Bank / Vodafone Cash) */}
      {showCashoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-400" />
                سحب الأرباح الفوري (InstaPay / كاش)
              </h3>
              <button onClick={() => setShowCashoutModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {cashoutSuccess ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-white text-sm">تم تحويل الأرباح بنجاح!</h4>
                <p className="text-xs text-slate-400">وصل المبلغ إلى محفظتك / حسابك عبر شبكة إنستاباي اللحظية.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <span className="text-[10px] text-slate-500 block">عنوان الدفع اللحظي (InstaPay IPA):</span>
                  <p className="font-mono font-bold text-emerald-400 mt-0.5">captain.portodrive@instapay</p>
                  <p className="text-[11px] text-slate-400">البنك الأهلي المصري - باسم الكابتن</p>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">المبلغ المراد سحبه (ج.م)</label>
                  <input
                    type="number"
                    value={cashoutAmount || activeDriver.earnings.walletBalance}
                    onChange={(e) => setCashoutAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono text-sm outline-none"
                  />
                </div>

                <button
                  onClick={handleCashout}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors"
                >
                  تأكيد التحويل الآن عبر إنستاباي
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NEW DRIVER REGISTRATION MODAL */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">تسجيل كابتن جديد في المنصة</h3>
              <button onClick={() => setShowRegModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">الاسم الثلاثي</label>
                <input
                  type="text"
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  placeholder="مثال: عبد الله ناصر الدوسري"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">رقم الجوال</label>
                <input
                  type="text"
                  value={regForm.phone}
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                  placeholder="+966 5x xxx xxxx"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none text-left font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">الشركة المصنعة</label>
                  <input
                    type="text"
                    value={regForm.make}
                    onChange={(e) => setRegForm({ ...regForm, make: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">طراز السيارة</label>
                  <input
                    type="text"
                    value={regForm.model}
                    onChange={(e) => setRegForm({ ...regForm, model: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">رقم اللوحة</label>
                <input
                  type="text"
                  value={regForm.plateNumber}
                  onChange={(e) => setRegForm({ ...regForm, plateNumber: e.target.value })}
                  placeholder="مثال: ر ق م 5511"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none text-center font-mono"
                />
              </div>

              <button
                onClick={() => {
                  if (!regForm.name) {
                    alert('يرجى كتابة اسم السائق');
                    return;
                  }
                  registerDriver({
                    name: regForm.name,
                    phone: regForm.phone || '+966 55 000 1122',
                    vehicle: {
                      make: regForm.make,
                      model: regForm.model,
                      year: regForm.year,
                      color: 'أبيض',
                      colorHex: '#ffffff',
                      plateNumber: regForm.plateNumber || 'س ق ك 1010',
                      type: 'economy',
                    },
                    documents: [
                      {
                        id: 'doc_new_1',
                        type: 'national_id',
                        nameAr: 'الهوية الوطنية',
                        documentNumber: '109823129',
                        expiryDate: '2029-01-01',
                        status: 'pending',
                        fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
                      },
                    ],
                  });
                  setShowRegModal(false);
                  alert('تم تسجيل الكابتن بنجاح وإرسال الطلب للمشرف للاعتماد!');
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg mt-2 transition-all"
              >
                تأكيد التسجيل ورفع الوثائق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

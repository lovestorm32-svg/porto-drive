import React, { useState } from 'react';
import { useRidePlatform } from '../../context/RidePlatformContext';
import { LocationPoint, PaymentType, VehicleType } from '../../types';
import { POPULAR_LOCATIONS } from '../../data/mockData';
import { MapView } from '../MapView';
import { PassengerChatModal } from './PassengerChatModal';
import { RatingModal } from './RatingModal';
import {
  MapPin,
  Navigation,
  Car,
  Crown,
  Sparkles,
  Zap,
  CreditCard,
  Wallet,
  Banknote,
  Clock,
  Phone,
  MessageCircle,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  X,
  Plus,
  Minus,
  Compass,
  ArrowRight,
  KeyRound,
  Users,
  Check,
  Flame,
} from 'lucide-react';

export const PassengerApp: React.FC = () => {
  const {
    user,
    drivers,
    activeRide,
    pricing,
    requestRideWithNegotiation,
    updatePassengerProposedPrice,
    acceptDriverOffer,
    cancelRide,
    topUpUserWallet,
    speedUpSimulation,
    setSpeedUpSimulation,
  } = useRidePlatform();

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [authStep, setAuthStep] = useState<'phone' | 'otp'>('phone');
  const [phoneInput, setPhoneInput] = useState('+20 10 1234 5678');
  const [otpCode, setOtpCode] = useState(['1', '2', '3', '4']);

  // Ride Booking Setup State
  const [pickup, setPickup] = useState<LocationPoint>(POPULAR_LOCATIONS[0]); // Porto Cairo Mall
  const [dropoff, setDropoff] = useState<LocationPoint>(POPULAR_LOCATIONS[1]); // 90th Street
  const [selectedTier, setSelectedTier] = useState<VehicleType>('economy');
  const [selectedPayment, setSelectedPayment] = useState<PaymentType>('wallet');
  const [interactiveMode, setInteractiveMode] = useState<'pickup' | 'dropoff' | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(100);
  const [activeSearchTarget, setActiveSearchTarget] = useState<'pickup' | 'dropoff' | null>(null);

  // Negotiation state
  const previewDistanceKm = 7.5;
  const currentTierConfig = pricing.tiers[selectedTier];
  const surgeMultiplier = pricing.isSurgeActive ? pricing.surgeMultiplier : 1.0;
  const calculatedBasePrice = Math.max(
    currentTierConfig.minimumFare,
    Math.round(((currentTierConfig.baseFare + previewDistanceKm * currentTierConfig.perKmRate) * surgeMultiplier))
  );

  const [proposedFare, setProposedFare] = useState<number>(calculatedBasePrice);

  // Handle map click for pin placement
  const handleMapClick = (lat: number, lng: number) => {
    if (interactiveMode === 'pickup') {
      setPickup({
        lat,
        lng,
        name: 'موقع محدد على الخريطة',
        address: `إحداثيات: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      });
      setInteractiveMode(null);
    } else if (interactiveMode === 'dropoff') {
      setDropoff({
        lat,
        lng,
        name: 'وجهة محددة على الخريطة',
        address: `إحداثيات: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      });
      setInteractiveMode(null);
    }
  };

  const getTierIcon = (tierId: VehicleType) => {
    switch (tierId) {
      case 'economy':
        return <Car className="w-5 h-5 text-emerald-400" />;
      case 'comfort':
        return <Crown className="w-5 h-5 text-amber-400" />;
      case 'ladies':
        return <Sparkles className="w-5 h-5 text-pink-400" />;
      case 'fast':
        return <Zap className="w-5 h-5 text-cyan-400" />;
    }
  };

  // Auth screen
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[700px] p-4 bg-slate-950">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="text-center space-y-2 mb-8">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/10">
              <KeyRound className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white">تسجيل الدخول في Porto Drive</h2>
            <p className="text-sm text-slate-400">
              {authStep === 'phone'
                ? 'أدخل رقم هاتفك لتصلك رسالة التأكيد عبر رمز التحقق OTP'
                : `تم إرسال رمز التحقق إلى ${phoneInput}`}
            </p>
          </div>

          {authStep === 'phone' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-right">رقم الهاتف المصري</label>
                <div className="relative flex items-center bg-slate-950 border border-slate-700 rounded-xl px-3 py-3 focus-within:border-emerald-500 transition-colors">
                  <span className="text-sm text-slate-400 ml-2 border-l border-slate-700 pl-2">🇪🇬 +20</span>
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="10 1234 5678"
                    className="w-full bg-transparent text-white text-sm outline-none text-right font-mono"
                  />
                </div>
              </div>

              <button
                onClick={() => setAuthStep('otp')}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>إرسال رمز التحقق</span>
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </button>

              <button
                onClick={() => {
                  setPhoneInput('+20 10 1234 5678');
                  setIsAuthenticated(true);
                }}
                className="w-full py-2.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
              >
                الدخول السريع بحساب تجريبي (Demo Bypass)
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex justify-center gap-3 dir-ltr" dir="ltr">
                {otpCode.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const newCode = [...otpCode];
                      newCode[index] = e.target.value;
                      setOtpCode(newCode);
                    }}
                    className="w-12 h-14 bg-slate-950 border-2 border-slate-700 focus:border-emerald-500 text-center text-xl font-bold text-white rounded-xl outline-none"
                  />
                ))}
              </div>

              <button
                onClick={() => setIsAuthenticated(true)}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all"
              >
                تأكيد وتسجيل الدخول
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-80px)] min-h-[640px] flex flex-col md:flex-row overflow-hidden bg-slate-950">
      {/* MAP VIEW CONTAINER */}
      <div className="flex-1 relative h-[45vh] md:h-full order-1 md:order-2">
        <MapView
          pickup={pickup}
          dropoff={dropoff}
          drivers={drivers}
          activeRide={activeRide}
          onMapClick={handleMapClick}
          interactiveSelectMode={interactiveMode}
          center={[30.0444, 31.4722]} // Centered around Porto Cairo & New Cairo
          zoom={13}
        />

        {/* Speed up simulation toggle */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/80 text-xs shadow-lg">
          <span className="text-slate-300">سرعة المحاكاة:</span>
          <button
            onClick={() => setSpeedUpSimulation(!speedUpSimulation)}
            className={`px-2 py-0.5 rounded-full font-bold transition-colors ${
              speedUpSimulation
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {speedUpSimulation ? 'سريع (2x)' : 'عادي (1x)'}
          </button>
        </div>

        {/* Surge pricing badge */}
        {pricing.isSurgeActive && (
          <div className="absolute top-4 left-4 z-20 bg-amber-500/90 backdrop-blur-md text-slate-950 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 animate-pulse">
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
            <span>وقت ذروة الطلب (x{pricing.surgeMultiplier})</span>
          </div>
        )}
      </div>

      {/* RIDE BOOKING & NEGOTIATION PANEL */}
      <div className="w-full md:w-[440px] lg:w-[490px] bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col order-2 md:order-1 z-30 shadow-2xl overflow-y-auto max-h-[55vh] md:max-h-full">
        {/* User bar header */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500"
            />
            <div>
              <h3 className="text-white font-bold text-sm leading-tight flex items-center gap-1.5">
                <span>{user.name}</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded font-mono font-bold">
                  Porto VIP
                </span>
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <span>★ {user.rating}</span>
                <span>•</span>
                <span>{user.totalRides} مشوار</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowWalletModal(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 text-xs transition-colors"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300">المحفظة:</span>
            <span className="font-bold text-emerald-400 font-mono">{user.walletBalance.toFixed(2)} ج.م</span>
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* CASE 1: NEGOTIATION HUB (Waiting for & Comparing 5 Captains) */}
        {/* ------------------------------------------------------------- */}
        {activeRide && activeRide.status === 'negotiating' ? (
          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {/* Negotiation Header Banner */}
              <div className="bg-gradient-to-r from-emerald-950/70 via-slate-950 to-slate-950 border border-emerald-500/40 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></span>
                    <h3 className="text-white font-bold text-sm">عروض وتفاوض الكباتن الحية</h3>
                  </div>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold">
                    {activeRide.driverOffers.length} من 5 عروض وصلت
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs bg-slate-900/90 rounded-xl p-3 border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block">سعرك المقترح الحالي:</span>
                    <span className="text-base font-black text-emerald-400 font-mono">
                      {activeRide.passengerProposedPrice} ج.م
                    </span>
                  </div>

                  {/* Passenger Quick Raise Offer buttons */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400">زيادة السعر لتسريع الرد:</span>
                    <button
                      onClick={() => updatePassengerProposedPrice(activeRide.passengerProposedPrice + 5)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg border border-slate-700 transition-colors"
                    >
                      +5 ج.م
                    </button>
                    <button
                      onClick={() => updatePassengerProposedPrice(activeRide.passengerProposedPrice + 10)}
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors"
                    >
                      +10 ج.م
                    </button>
                  </div>
                </div>
              </div>

              {/* 5 Captain Offers List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs px-1 text-slate-400">
                  <span>الكباتن المتنافسين على مشوارك:</span>
                  <span className="text-[11px] text-emerald-400">اختر الكابتن الأنسب وانقر قبول</span>
                </div>

                {activeRide.driverOffers.length === 0 ? (
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin mx-auto"></div>
                    <p className="text-xs text-slate-300 font-bold">جاري إرسال مشوارك للكباتن القريبين من بورتو كايرو...</p>
                    <p className="text-[11px] text-slate-500">ستظهر عروض حتى 5 كباتن خلال ثوانٍ معدودة</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[340px] overflow-y-auto pr-0.5">
                    {activeRide.driverOffers.map((offer) => {
                      const isExactMatch = offer.offeredPrice === activeRide.passengerProposedPrice;
                      const isCheaper = offer.offeredPrice < activeRide.passengerProposedPrice;
                      return (
                        <div
                          key={offer.id}
                          className="bg-slate-950 border border-slate-800 hover:border-emerald-500/60 rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-all text-right shadow-md"
                        >
                          {/* Captain Info */}
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={offer.driverAvatar}
                                alt={offer.driverName}
                                className="w-11 h-11 rounded-xl object-cover border border-slate-700"
                              />
                              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 text-[9px] font-black px-1 rounded shadow">
                                ★ {offer.driverRating}
                              </span>
                            </div>

                            <div>
                              <h4 className="font-bold text-white text-xs leading-tight">{offer.driverName}</h4>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {offer.vehicleMake} {offer.vehicleModel} •{' '}
                                <span className="font-mono text-emerald-400">{offer.vehiclePlate}</span>
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                يبعد {offer.distanceKm} كم • يصل خلال {offer.etaMinutes} دقائق
                              </p>
                            </div>
                          </div>

                          {/* Price & Accept Action */}
                          <div className="flex flex-col items-end gap-1.5">
                            <div className="flex items-baseline gap-1 font-mono">
                              <span className="text-base font-black text-white">{offer.offeredPrice}</span>
                              <span className="text-[10px] text-slate-400 font-sans">ج.م</span>
                            </div>

                            <button
                              onClick={() => acceptDriverOffer(offer.id)}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>قبول الكابتن</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Cancel negotiation */}
            <div className="pt-2">
              <button
                onClick={() => cancelRide('إلغاء التفاوض')}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-rose-400 border border-slate-800 rounded-xl text-xs font-bold transition-colors"
              >
                إلغاء الطلب والتفاوض
              </button>
            </div>
          </div>
        ) : activeRide && activeRide.status !== 'completed' && activeRide.status !== 'cancelled' ? (
          /* ------------------------------------------------------------- */
          /* CASE 2: ACTIVE RIDE IN PROGRESS (Arriving / In Trip) */
          /* ------------------------------------------------------------- */
          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    {activeRide.status === 'driver_arriving' && 'الكابتن المقبول في الطريق إليك'}
                    {activeRide.status === 'arrived' && 'وصل الكابتن إلى موقعك في بورتو!'}
                    {activeRide.status === 'in_progress' && 'الرحلة جارية نحو وجهتك'}
                  </span>
                  <h2 className="text-lg font-black text-white mt-0.5">
                    {activeRide.status === 'driver_arriving' && 'يصل إليك خلال دقيقتين'}
                    {activeRide.status === 'arrived' && 'الكابتن بانتظارك بالخارج 🚖'}
                    {activeRide.status === 'in_progress' && 'في الطريق إلى الوجهة المحددة'}
                  </h2>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Navigation className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
              </div>

              {/* Agreed Driver Card */}
              {activeRide.driver && (
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={activeRide.driver.avatar}
                          alt={activeRide.driver.name}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500"
                        />
                        <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black px-1 rounded shadow">
                          ★ {activeRide.driver.rating}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{activeRide.driver.name}</h4>
                        <p className="text-xs text-slate-400">
                          {activeRide.driver.vehicle.make} {activeRide.driver.vehicle.model}
                        </p>
                        <div className="inline-block mt-1 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-[11px] font-mono text-emerald-400 font-bold">
                          {activeRide.driver.vehicle.plateNumber}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setIsChatOpen(true)}
                        className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 relative"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                      </button>
                      <button
                        onClick={() => alert(`الاتصال بالكابتن: ${activeRide.driver?.phone}`)}
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                      >
                        <Phone className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-900/90 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <span className="text-slate-400">السعر المتفق عليه بعد التفاوض:</span>
                    <span className="text-emerald-400 font-bold text-sm font-mono">
                      {activeRide.price} ج.م ({activeRide.paymentMethod === 'wallet' ? 'محفظة' : 'نقداً'})
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => cancelRide('إلغاء من قبل الراكب')}
                className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold rounded-xl text-xs transition-colors"
              >
                إلغاء الرحلة
              </button>
            </div>
          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* CASE 3: STANDARD BOOKING & PRICE PROPOSAL VIEW */
          /* ------------------------------------------------------------- */
          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
            {/* Pickup & Destination selection */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white text-right">إلى أين تريد الذهاب مع Porto Drive؟</h3>

              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 space-y-2.5 relative">
                <div className="absolute right-[22px] top-7 bottom-7 w-0.5 bg-dashed border-r border-slate-700 pointer-events-none"></div>

                {/* Pickup row */}
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 shrink-0"></div>
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-400 block text-right font-medium">نقطة الانطلاق (موقعك)</label>
                    <button
                      onClick={() => setActiveSearchTarget(activeSearchTarget === 'pickup' ? null : 'pickup')}
                      className="w-full text-right text-xs text-white font-semibold truncate hover:text-emerald-400 transition-colors"
                    >
                      {pickup.name}
                    </button>
                  </div>
                  <button
                    onClick={() => setInteractiveMode('pickup')}
                    className={`p-1.5 rounded-lg border text-[11px] flex items-center gap-1 transition-colors ${
                      interactiveMode === 'pickup'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>خريطة</span>
                  </button>
                </div>

                {/* Destination row */}
                <div className="flex items-center gap-2.5 pt-1 border-t border-slate-800/80">
                  <div className="w-3 h-3 rounded-full bg-rose-500 border-2 border-slate-900 shrink-0"></div>
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-400 block text-right font-medium">وجهة الوصول</label>
                    <button
                      onClick={() => setActiveSearchTarget(activeSearchTarget === 'dropoff' ? null : 'dropoff')}
                      className="w-full text-right text-xs text-white font-semibold truncate hover:text-rose-400 transition-colors"
                    >
                      {dropoff.name}
                    </button>
                  </div>
                  <button
                    onClick={() => setInteractiveMode('dropoff')}
                    className={`p-1.5 rounded-lg border text-[11px] flex items-center gap-1 transition-colors ${
                      interactiveMode === 'dropoff'
                        ? 'bg-rose-500 text-white border-rose-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>خريطة</span>
                  </button>
                </div>
              </div>

              {/* Landmark quick select */}
              {activeSearchTarget && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-2 space-y-1 max-h-48 overflow-y-auto animate-in fade-in">
                  <div className="px-2 py-1 text-[11px] text-slate-400 font-bold border-b border-slate-800">
                    أماكن شهيرة ومولات في القاهرة وبورتو:
                  </div>
                  {POPULAR_LOCATIONS.map((loc) => (
                    <button
                      key={loc.name}
                      onClick={() => {
                        if (activeSearchTarget === 'pickup') setPickup(loc);
                        else setDropoff(loc);
                        setActiveSearchTarget(null);
                      }}
                      className="w-full text-right px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-900 flex items-center justify-between transition-colors"
                    >
                      <span className="truncate">{loc.name}</span>
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle Tier Selection Cards */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-white block text-right">اختر الفئة</span>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(pricing.tiers) as VehicleType[]).map((tierKey) => {
                  const tier = pricing.tiers[tierKey];
                  const isSelected = selectedTier === tierKey;
                  const tierFare = Math.max(
                    tier.minimumFare,
                    Math.round((tier.baseFare + previewDistanceKm * tier.perKmRate) * surgeMultiplier)
                  );

                  return (
                    <div
                      key={tierKey}
                      onClick={() => {
                        setSelectedTier(tierKey);
                        setProposedFare(tierFare);
                      }}
                      className={`cursor-pointer p-2.5 rounded-2xl border transition-all text-right relative ${
                        isSelected
                          ? 'bg-slate-800/90 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
                          : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="p-1 rounded-xl bg-slate-900 border border-slate-800">
                          {getTierIcon(tierKey)}
                        </div>
                        <span className="text-xs font-extrabold text-white font-mono">
                          ~{tierFare} <span className="text-[10px] text-slate-400 font-sans">ج.م</span>
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-200 truncate">{tier.nameAr.split('(')[0]}</h4>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PRICE NEGOTIATION WIDGET (حدد سعرك المقترح) */}
            <div className="bg-gradient-to-r from-emerald-950/40 to-slate-950 p-4 rounded-2xl border-2 border-emerald-500/50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                    حدد سعرك المقترح (نظام التفاوض)
                  </span>
                  <p className="text-[10px] text-slate-400">يقوم 5 كباتن بالرد بعروضهم على سعرك</p>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  المقترح: {calculatedBasePrice} ج.م
                </span>
              </div>

              {/* Plus/Minus Interactive Price Controller */}
              <div className="flex items-center justify-between bg-slate-900 p-2 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setProposedFare((prev) => Math.max(25, prev - 5))}
                  className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-lg transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="text-center font-mono">
                  <span className="text-2xl font-black text-emerald-400">{proposedFare}</span>
                  <span className="text-xs text-slate-300 font-sans mr-1">جنيه مصري (ج.م)</span>
                </div>

                <button
                  type="button"
                  onClick={() => setProposedFare((prev) => prev + 5)}
                  className="w-10 h-10 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center font-bold text-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Quick suggestion chips */}
              <div className="flex items-center justify-center gap-2">
                {[
                  { label: '-10 ج.م', val: Math.max(25, calculatedBasePrice - 10) },
                  { label: 'السعر الاسترشادي', val: calculatedBasePrice },
                  { label: '+10 ج.م (أسرع)', val: calculatedBasePrice + 10 },
                ].map((chip, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setProposedFare(chip.val)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                      proposedFare === chip.val
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-300 block text-right">طريقة الدفع</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'wallet', name: 'المحفظة', icon: Wallet, desc: `${user.walletBalance.toFixed(0)} ج.م` },
                  { id: 'card', name: 'فيزا / ميزة', icon: CreditCard, desc: '•• 7712' },
                  { id: 'cash', name: 'كاش للكابتن', icon: Banknote, desc: 'عند الوصول' },
                ].map((pm) => {
                  const isSelected = selectedPayment === pm.id;
                  const Icon = pm.icon;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setSelectedPayment(pm.id as PaymentType)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 mx-auto mb-0.5" />
                      <span className="text-xs font-bold block">{pm.name}</span>
                      <span className="text-[10px] text-slate-500 block">{pm.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Negotiation Button */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() =>
                  requestRideWithNegotiation(pickup, dropoff, selectedTier, proposedFare, selectedPayment)
                }
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base rounded-2xl shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 transform active:scale-98"
              >
                <span>ابحث عن عروض الكباتن بسعر ({proposedFare} ج.م)</span>
                <Users className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Wallet Top-Up Modal (EGP) */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                شحن محفظة Porto Cash
              </h3>
              <button onClick={() => setShowWalletModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 rounded-2xl p-4 text-center">
              <span className="text-xs text-slate-400">رصيدك الحالي</span>
              <h2 className="text-3xl font-black text-emerald-400 mt-1 font-mono">
                {user.walletBalance.toFixed(2)} <span className="text-sm font-sans">ج.م</span>
              </h2>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-semibold block text-right">حدد مبلغ الشحن السريع</label>
              <div className="grid grid-cols-3 gap-2">
                {[100, 200, 500].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setTopUpAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      topUpAmount === amt
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    +{amt} ج.م
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                topUpUserWallet(topUpAmount);
                setShowWalletModal(false);
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              شحن فوري عبر فوري / ميزة / كارت بنكي
            </button>
          </div>
        </div>
      )}

      {/* In-ride Live Chat Modal */}
      <PassengerChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Post-ride Rating & Tip Modal */}
      <RatingModal isOpen={activeRide?.status === 'completed'} />
    </div>
  );
};

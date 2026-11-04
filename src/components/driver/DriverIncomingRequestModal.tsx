import React, { useState } from 'react';
import { useRidePlatform } from '../../context/RidePlatformContext';
import { MapPin, Navigation, DollarSign, Clock, Check, X, ShieldAlert, Car, TrendingUp } from 'lucide-react';

export const DriverIncomingRequestModal: React.FC = () => {
  const {
    incomingRequestForDriver,
    driverCountdown,
    acceptRideAsDriver,
    submitDriverCounterOffer,
    declineRideAsDriver,
    activeDriver,
    pricing,
  } = useRidePlatform();

  const [counterPriceInput, setCounterPriceInput] = useState<number | null>(null);

  if (!incomingRequestForDriver) return null;

  const ride = incomingRequestForDriver;
  const passengerPrice = ride.passengerProposedPrice || ride.price;
  const activeCounter = counterPriceInput || passengerPrice;
  const netEarnings = Number((activeCounter * (1 - pricing.commissionRate / 100)).toFixed(2));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border-2 border-emerald-500 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-right">
        {/* Top Countdown Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-slate-800">
          <div
            className="h-full bg-emerald-500 transition-all duration-1000 ease-linear"
            style={{ width: `${(driverCountdown / 20) * 100}%` }}
          />
        </div>

        {/* Header alert */}
        <div className="flex items-center justify-between mt-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="text-xs font-bold text-emerald-400">طلب تفاوض مشوار جديد (Porto Drive)</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-full text-xs font-bold text-white font-mono border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{driverCountdown} ثانية</span>
          </div>
        </div>

        {/* Passenger Offer & Counter Offer Box */}
        <div className="bg-gradient-to-r from-emerald-950/70 to-slate-950 border border-emerald-500/40 rounded-2xl p-4 mb-4 text-center">
          <span className="text-xs text-slate-400 block">عرض سعر الراكب المقترح</span>
          <div className="flex items-baseline justify-center gap-1.5 mt-1 font-mono">
            <span className="text-3xl font-black text-white">{passengerPrice}</span>
            <span className="text-sm font-sans text-emerald-400">ج.م</span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-400 block mb-1.5">
              هل ترغب بقبول سعره أو إرسال عرض مضاد للراكب؟
            </span>
            <div className="flex items-center justify-center gap-1.5">
              {[
                { label: 'سعر الراكب', val: passengerPrice },
                { label: `+5 (${passengerPrice + 5})`, val: passengerPrice + 5 },
                { label: `+10 (${passengerPrice + 10})`, val: passengerPrice + 10 },
                { label: `+15 (${passengerPrice + 15})`, val: passengerPrice + 15 },
              ].map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCounterPriceInput(opt.val)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-bold transition-all ${
                    activeCounter === opt.val
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <p className="text-[10px] text-emerald-400 mt-2 font-medium">
              صافي أرباحك المقدرة بعد عمولة Porto ({pricing.commissionRate}%): {netEarnings} ج.م
            </p>
          </div>
        </div>

        {/* Trip details */}
        <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs mb-5">
          <div className="flex items-start gap-2.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1 shrink-0"></div>
            <div>
              <span className="text-slate-400 block text-[10px]">موقع اصطحاب الراكب</span>
              <p className="text-white font-bold">{ride.pickup.name}</p>
              <p className="text-slate-400 text-[11px] truncate">{ride.pickup.address}</p>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-2 flex items-start gap-2.5">
            <div className="w-3 h-3 rounded-full bg-rose-500 mt-1 shrink-0"></div>
            <div>
              <span className="text-slate-400 block text-[10px]">الوجهة</span>
              <p className="text-white font-bold">{ride.dropoff.name}</p>
              <p className="text-slate-400 text-[11px] truncate">{ride.dropoff.address}</p>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-slate-400">
            <span>المسافة والزمن:</span>
            <span className="text-white font-bold">{ride.distanceKm} كم (~{ride.estimatedDurationMins} دقيقة)</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span>الراكب:</span>
            <span className="text-white font-bold">{ride.passengerName} (★ {ride.passengerRating})</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => declineRideAsDriver(activeDriver.id)}
            className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all border border-slate-700 flex items-center justify-center gap-1.5 text-xs"
          >
            <X className="w-4 h-4 text-rose-400" />
            <span>تخطي المشوار</span>
          </button>

          <button
            onClick={() => {
              if (activeCounter !== passengerPrice) {
                submitDriverCounterOffer(activeDriver.id, activeCounter);
              } else {
                acceptRideAsDriver(activeDriver.id, passengerPrice);
              }
            }}
            className="py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-600/40 transition-all flex items-center justify-center gap-1.5 transform active:scale-95"
          >
            <Check className="w-4 h-4 text-white" />
            <span>
              {activeCounter !== passengerPrice
                ? `إرسال عرضي (${activeCounter} ج.م)`
                : `قبول (${passengerPrice} ج.م)`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { PassengerApp } from '../passenger/PassengerApp';
import { DriverApp } from '../driver/DriverApp';
import { Smartphone, Zap, Sparkles } from 'lucide-react';

export const DualScreenSimulator: React.FC = () => {
  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-slate-950 p-4 sm:p-6 space-y-4">
      {/* Simulation Banner */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-right">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-white text-sm sm:text-base">
              Porto Drive: تجربة التفاوض اللحظي وتنافس 5 كباتن بعروضهم
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              حدد سعرك المقترح بالجنيه المصري (مثلاً 75 ج.م)، وراقب وصول عروض 5 كباتن متنافسين في نفس اللحظة، مع إمكانية الرد بعرض مضاد من هاتف الكابتن!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs bg-slate-800/90 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/30 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>5 كباتن جاهزين لتقديم العروض فوراً</span>
        </div>
      </div>

      {/* Side-by-side Grid of 2 Phones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* PHONE 1: PASSENGER APP */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs px-2">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              هاتف الراكب (Passenger Device)
            </span>
            <span className="text-slate-500">iPhone 16 Pro • شريحة 5G</span>
          </div>

          <div className="rounded-[36px] p-2 sm:p-3 bg-slate-900 border-4 border-slate-800 shadow-2xl relative overflow-hidden h-[760px]">
            {/* Phone notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-950 rounded-full z-40 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-800 mr-2"></div>
            </div>

            <div className="w-full h-full rounded-[26px] overflow-hidden bg-slate-950 pt-2">
              <PassengerApp />
            </div>
          </div>
        </div>

        {/* PHONE 2: DRIVER APP */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs px-2">
            <span className="font-bold text-sky-400 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              هاتف الكابتن (Driver Device)
            </span>
            <span className="text-slate-500">Samsung S24 Ultra • اتصال GPS دقيق</span>
          </div>

          <div className="rounded-[36px] p-2 sm:p-3 bg-slate-900 border-4 border-slate-800 shadow-2xl relative overflow-hidden h-[760px]">
            {/* Phone notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-950 rounded-full z-40 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-800 mr-2"></div>
            </div>

            <div className="w-full h-full rounded-[26px] overflow-hidden bg-slate-950 pt-2">
              <DriverApp />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useRidePlatform } from '../../context/RidePlatformContext';
import {
  Car,
  User,
  LayoutDashboard,
  Database,
  BookOpen,
  SplitSquareVertical,
  Volume2,
  Navigation,
  Download,
} from 'lucide-react';
import { soundEffects } from '../../utils/audioAlerts';

export type MainNavTab = 'passenger' | 'driver' | 'dual' | 'apk' | 'admin' | 'database' | 'docs';

interface HeaderProps {
  currentTab: MainNavTab;
  onTabChange: (tab: MainNavTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onTabChange }) => {
  const { activeRide, systemStats } = useRidePlatform();

  const navItems = [
    { id: 'passenger', label: 'تطبيق الراكب', icon: User, badge: null },
    { id: 'driver', label: 'تطبيق الكابتن', icon: Car, badge: activeRide?.status === 'negotiating' ? 'تفاوض وارد' : null },
    { id: 'dual', label: 'تفاوض الـ 5 كباتن المتزامن', icon: SplitSquareVertical, badge: 'تفاعلي' },
    { id: 'apk', label: 'تثبيت وتحميل APK 📲', icon: Download, badge: 'Android' },
    { id: 'admin', label: 'لوحة التحكم الإدارية', icon: LayoutDashboard, badge: null },
    { id: 'database', label: 'هيكل قاعدة البيانات (SQL)', icon: Database, badge: '5 جداول' },
    { id: 'docs', label: 'دليل الـ Backend والموبايل', icon: BookOpen, badge: null },
  ];

  return (
    <header className="w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-3 sm:px-6 py-2.5">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onTabChange('passenger')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
              <Navigation className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-base tracking-tight font-sans">
                  Porto<span className="text-emerald-400">Drive</span>
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                  بورتو درايف • مصر 🇪🇬
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                منصة النقل الذكي والتفاوض المباشر مع 5 كباتن (بالجنيه المصري)
              </p>
            </div>
          </div>

          {/* Quick Sound Test button on mobile */}
          <button
            onClick={() => soundEffects.playIncomingRideRing()}
            className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
            title="اختبار نغمة التنبيه"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id as MainNavTab)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap relative ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                      item.badge === 'طلب وارد'
                        ? 'bg-amber-400 text-slate-950 animate-pulse'
                        : 'bg-emerald-400 text-slate-950'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Audio Test & System Live Health */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={() => soundEffects.playIncomingRideRing()}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/60 transition-colors"
            title="تجربة صوت الرنين للكابتن"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>صوت التنبيه</span>
          </button>

          <div className="flex items-center gap-2 text-xs bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-300 font-bold">{systemStats.onlineDrivers} كباتن متصلين</span>
          </div>
        </div>
      </div>
    </header>
  );
};

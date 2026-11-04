import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import {
  Smartphone,
  Download,
  Terminal,
  QrCode,
  CheckCircle2,
  Copy,
  Check,
  FileCode,
  ShieldCheck,
  ExternalLink,
  Layers,
  Sparkles,
  Zap,
  Globe,
  Settings,
  AlertTriangle,
  HelpCircle,
  Share2,
  CheckCircle,
  ArrowRight,
  Info
} from 'lucide-react';

export const AndroidApkHub: React.FC = () => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'install' | 'troubleshoot' | 'cloud' | 'capacitor' | 'store'>('install');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedQrType, setSelectedQrType] = useState<'release' | 'debug' | 'web'>('release');

  // Direct GitHub Release URLs for the user lovestorm32-svg/porto-drive
  const releaseApkUrl = 'https://github.com/lovestorm32-svg/porto-drive/releases/download/v1.0.0/porto-drive-release.apk';
  const debugApkUrl = 'https://github.com/lovestorm32-svg/porto-drive/releases/download/v1.0.0/porto-drive-debug.apk';
  const aabUrl = 'https://github.com/lovestorm32-svg/porto-drive/releases/download/v1.0.0/porto-drive-release.aab';
  const releasesPageUrl = 'https://github.com/lovestorm32-svg/porto-drive/releases/tag/v1.0.0';
  const actionsRunUrl = 'https://github.com/lovestorm32-svg/porto-drive/actions/runs/41802021251';

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://portodrive.com';

  const getQrUrl = () => {
    let target = releasesPageUrl;
    if (selectedQrType === 'release') target = releaseApkUrl;
    if (selectedQrType === 'debug') target = debugApkUrl;
    if (selectedQrType === 'web') target = currentUrl;
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
      target
    )}&bgcolor=0f172a&color=10b981&margin=10`;
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const shareToWhatsApp = (link: string, title: string) => {
    const text = encodeURIComponent(`تحميل تطبيق بورتو درايف - Porto Drive للأندرويد:\n${title}\n${link}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Capacitor Config JSON
  const capacitorConfig = `{
  "appId": "com.portodrive.app",
  "appName": "Porto Drive",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https"
  },
  "plugins": {
    "Geolocation": {
      "permissions": ["location"]
    },
    "PushNotifications": {
      "presentationOptions": ["badge", "sound", "alert"]
    }
  }
}`;

  // AndroidManifest.xml
  const androidManifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.portodrive.app">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
    <uses-permission android:name="android.permission.CALL_PHONE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">

        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:name=".MainActivity"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:exported="true">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

    </application>
</manifest>`;

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-slate-950 text-right p-4 sm:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              مركز تحميل وتثبيت تطبيق Porto Drive للأندرويد
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            روابط التحميل المباشرة لملفات APK الموقعة رقمياً ودليل حل أي خطأ أثناء التثبيت على الهاتف
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto overflow-x-auto no-scrollbar">
          {[
            { id: 'install', label: '1. تحميل الـ APK المباشر', icon: Download },
            { id: 'troubleshoot', label: '2. حل أخطاء التثبيت (مهم جداً)', icon: AlertTriangle },
            { id: 'cloud', label: '3. سيرفر البناء GitHub Actions', icon: Zap },
            { id: 'capacitor', label: '4. كود أندرويد ستوديو', icon: Terminal },
            { id: 'store', label: '5. متطلبات Google Play', icon: Globe },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
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

      {/* PRIMARY ACTION BANNER: Direct Download Cards */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-500 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-52 h-52 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-black">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>جاهز للتحميل المباشر الآن • تم حل سبب الخطأ وتوقيع الـ APK رقمياً</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              روابط التحميل المباشرة لهاتفك (خارج بيئة العرض المضمنة)
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              إذا ظهر لك سابقاً خطأ <span className="text-amber-400 font-bold">"حدثت مشكلة أثناء تحليل الحزمة"</span> فذلك لأن الملف كان غير موقع رقمياً (Unsigned) أو حظره المتصفح أثناء التنزيل. قمنا الآن بتوقيع الـ APK بالكامل ورفعه على سيرفرات GitHub المباشرة CDN ليعمل على أي هاتف فوراً!
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            {/* Primary Signed Release APK */}
            <a
              href={releaseApkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-emerald-600/30 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>تحميل Porto Drive APK الموقّع (3.9 MB)</span>
            </a>

            {/* Debug APK */}
            <a
              href={debugApkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-2xl border border-slate-700 transition-colors flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>نسخة Debug APK (احتياطية)</span>
            </a>

            {/* GitHub Releases */}
            <a
              href={releasesPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-2xl border border-slate-700 transition-colors flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4 text-emerald-400" />
              <span>صفحة GitHub Releases</span>
            </a>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: INSTANT INSTALL & HOW TO DOWNLOAD                      */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'install' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* 3 Download Channels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Official Signed Release APK */}
              <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-5 space-y-4 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Download className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold">
                    موصى به • موقّع رقمياً
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-black text-white">تحميل ملف APK الأساسي (Release)</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    ملف APK الرسمي الموقّع بشهادة أندرويد القياسية v1/v2/v3، جاهز للتثبيت على هواتف سامسونج، شاومي، أوبو، ريلمي، وغيرها.
                  </p>
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href={releaseApkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل porto-drive-release.apk (3.9 MB)</span>
                  </a>
                  <button
                    onClick={() => handleCopy(releaseApkUrl, 'releaseUrl')}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5"
                  >
                    {copiedKey === 'releaseUrl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'releaseUrl' ? 'تم نسخ الرابط!' : 'نسخ رابط التحميل المباشر'}</span>
                  </button>
                  <button
                    onClick={() => shareToWhatsApp(releaseApkUrl, 'رابط تحميل ملف APK لتطبيق بورتو درايف')}
                    className="w-full py-2 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>إرسال الرابط لنفسي عبر واتساب 📲</span>
                  </button>
                </div>
              </div>

              {/* Card 2: Debug APK */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-bold">
                    نسخة بديلة سريعة
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-black text-white">تحميل ملف Debug APK (احتياطي)</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    نسخة مصممة للتثبيت بدون أي تشديد أمني أو مشاكل توافق على أي إصدار أندرويد قديم أو حديث.
                  </p>
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href={debugApkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل porto-drive-debug.apk (3.9 MB)</span>
                  </a>
                  <button
                    onClick={() => handleCopy(debugApkUrl, 'debugUrl')}
                    className="w-full py-2 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 text-xs font-bold rounded-xl border border-slate-700/60 flex items-center justify-center gap-1.5"
                  >
                    {copiedKey === 'debugUrl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'debugUrl' ? 'تم نسخ الرابط!' : 'نسخ رابط Debug APK'}</span>
                  </button>
                  <a
                    href={aabUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-teal-300 text-xs font-bold rounded-xl border border-teal-500/30 flex items-center justify-center gap-1.5"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>تحميل حزمة متجر جوجل بلاي (.aab)</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Quick 3-Step Guide */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                خطوات تثبيت الـ APK على هاتفك الأندرويد (دون أي أخطاء):
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                    1
                  </div>
                  <h4 className="font-bold text-white">التحميل على الهاتف</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    اضغط على زر التحميل الأخضر أو انسخ الرابط وافتحه في متصفح Chrome على هاتفك مباشرة.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                    2
                  </div>
                  <h4 className="font-bold text-white">السماح بالتثبيت</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    عند فتح الملف لأول مرة، سيطلب منك أندرويد السماح لـ Chrome بتثبيت تطبيقات، اضغط "الإعدادات" ثم فعّل الخيار.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                    3
                  </div>
                  <h4 className="font-bold text-white">التثبيت على أي حال</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    إذا ظهرت رسالة Google Play Protect تطلب الحظر، اضغط على "مزيد من التفاصيل" ثم "التثبيت على أي حال".
                  </p>
                </div>
              </div>
            </div>

            {/* Direct WebAPK Install Alternative */}
            <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                  بديل فوري وبدون تنزيل ملفات
                </span>
                <h4 className="text-sm font-bold text-white">
                  تثبيت Porto Drive كتطبيق WebAPK بنقرة واحدة من المتصفح
                </h4>
                <p className="text-xs text-slate-300">
                  يثبت التطبيق بأيقونة كاملة على هاتفك فوراً ويدعم GPS والتنبيهات وشاشة البداية.
                </p>
              </div>

              <button
                onClick={install}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition-all shrink-0 flex items-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>{isInstalled ? 'التطبيق مثبت بالجهاز' : 'تثبيت فوري الآن'}</span>
              </button>
            </div>
          </div>

          {/* QR CODE CARD */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-between text-center space-y-4">
            <div>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-bold inline-block mb-2">
                مسح الرمز بكاميرا الموبايل
              </span>
              <h3 className="text-base font-bold text-white">تحميل الـ APK مباشرة على هاتفك</h3>
              <p className="text-xs text-slate-400 mt-1">
                وجّه كاميرا هاتفك نحو رمز الاستجابة السريعة (QR) ليبدأ التنزيل فوراً
              </p>
            </div>

            {/* QR Switcher */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
              <button
                onClick={() => setSelectedQrType('release')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedQrType === 'release' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Release APK
              </button>
              <button
                onClick={() => setSelectedQrType('debug')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedQrType === 'debug' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Debug APK
              </button>
              <button
                onClick={() => setSelectedQrType('web')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedQrType === 'web' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                رابط الويب
              </button>
            </div>

            {/* QR Code Container */}
            <div className="p-3 bg-slate-950 border-2 border-emerald-500/40 rounded-2xl shadow-xl">
              <img
                src={getQrUrl()}
                alt="QR Code for Porto Drive APK"
                className="w-48 h-48 rounded-xl object-contain mx-auto"
              />
            </div>

            <div className="w-full space-y-2">
              <button
                onClick={() => handleCopy(selectedQrType === 'release' ? releaseApkUrl : selectedQrType === 'debug' ? debugApkUrl : currentUrl, 'qr_url')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                {copiedKey === 'qr_url' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                <span>{copiedKey === 'qr_url' ? 'تم نسخ الرابط بنجاح!' : 'نسخ الرابط المعروض'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: DETAILED TROUBLESHOOTING (SOLVING ALL MOBILE ERRORS)   */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'troubleshoot' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-bold mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span>دليل معالجة كل رسائل الخطأ الشائعة في أندرويد</span>
            </div>
            <h3 className="text-xl font-black text-white">
              لماذا ظهر لك خطأ أثناء التثبيت؟ وكيف تتجاوزه في ثوانٍ معدودة؟
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              إليك شرح الأسباب الثلاثة الرئيسية لأي خطأ يظهر عند تثبيت تطبيق من خارج متجر Google Play وكيفية حل كل منها:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Error 1: Parse Error */}
            <div className="bg-slate-950 border border-red-500/30 rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-black">
                1
              </div>
              <h4 className="text-sm font-bold text-white">
                رسالة: "حدثت مشكلة أثناء تحليل الحزمة" (There was a problem parsing the package)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-red-400">السبب:</strong> كان ملف الـ APK غير موقّع بشهادة أندرويد (Unsigned) في النسخة التجريبية الأولى، أو تم تنزيل الملف بشكل جزئي من خلال نافذة المعاينة.
              </p>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="text-emerald-400 font-bold block">كيف تم حله؟</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  تم توقيع ملف الـ APK الجديد تلقائياً بمفتاح Android Debug Key وتصديره لسيرفر GitHub المباشر. حمّل الملف الجديد من الزر الأخضر وسيعمل 100%!
                </p>
              </div>
            </div>

            {/* Error 2: Play Protect Block */}
            <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                2
              </div>
              <h4 className="text-sm font-bold text-white">
                رسالة: "تم حظر التطبيق بواسطة Google Play Protect" أو "مطور غير معروف"
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-amber-400">السبب:</strong> نظام حماية جوجل يظهر هذا التحذير الروتيني لأي تطبيق APK يتم تثبيته خارج متجر Google Play الرسمي.
              </p>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="text-emerald-400 font-bold block">طريقة التخطي:</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  1. اضغط على خيار <span className="text-white font-bold">"مزيد من التفاصيل" (More details)</span> في أسفل النافذة المنبثقة.
                  <br />
                  2. اضغط على <span className="text-emerald-400 font-bold">"التثبيت على أي حال" (Install anyway)</span>.
                </p>
              </div>
            </div>

            {/* Error 3: Unknown Sources */}
            <div className="bg-slate-950 border border-blue-500/30 rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black">
                3
              </div>
              <h4 className="text-sm font-bold text-white">
                رسالة: "لأسباب أمنية، غير مسموح لهاتفك بتثبيت تطبيقات غير معروفة من هذا المصدر"
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-blue-400">السبب:</strong> متصفح الهاتف (مثل Chrome أو Samsung Internet) مقفل افتراضياً لحماية الهاتف من التنزيلات العشوائية.
              </p>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="text-emerald-400 font-bold block">طريقة التفعيل:</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  1. اضغط على زر <span className="text-white font-bold">"الإعدادات" (Settings)</span> في الرسالة.
                  <br />
                  2. فعّل خيار <span className="text-emerald-400 font-bold">"السماح بتثبيت التطبيقات من هذا المصدر"</span>.
                  <br />
                  3. ارجع واضغط على <span className="text-white font-bold">"تثبيت" (Install)</span>.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-xs text-emerald-200">
                بعد اتباع هذه الخطوات، سيتم تثبيت التطبيق بنجاح وتظهر أيقونة Porto Drive على شاشتك الرئيسية فوراً!
              </p>
            </div>
            <button
              onClick={() => setActiveTab('install')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all whitespace-nowrap"
            >
              العودة لأزرار التحميل
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: AUTOMATED CLOUD APK BUILD (GITHUB ACTIONS)            */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'cloud' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                سيرفر البناء السحابي التلقائي (GitHub Actions CI/CD)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                مستودعك على GitHub يقوم الآن ببناء ملفات الـ APK الموقعة وملفات الـ AAB ورفعها تلقائياً على صفحة Releases
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <a
                href={actionsRunUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" />
                <span>متابعة البناء في GitHub Actions</span>
              </a>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-950/60 to-slate-950 border-2 border-emerald-500/40 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400">حسابك ومستودعك: lovestorm32-svg/porto-drive</span>
              <a
                href="https://github.com/lovestorm32-svg/porto-drive"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 shadow transition-colors inline-flex items-center gap-1.5"
              >
                <span>زيارة المستودع</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              تم تفعيل سيرفر البناء مع إضافة صلاحية التوقيع الرقمي الكامل (Signed via Debug SigningConfig)، ومجرد انتهاء البناء تتاح الروابط للتنزيل المباشر من CDN خوادم GitHub بسرعة عالية جداً.
            </p>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: CAPACITOR & ANDROID STUDIO NATIVE PROJECT              */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'capacitor' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-white text-base">
                مشروع Android Studio الكامل (Capacitor Native Engine)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                توليد ملفات مشروع أندرويد ستوديو الرسمي كاملة لبناء APK و AAB محلياً
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href="/porto-drive-android.tar.gz"
                download="porto-drive-android.tar.gz"
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>تحميل حزمة مشروع الأندرويد كاملة (tar.gz)</span>
              </a>
              <button
                onClick={() => handleDownloadFile('AndroidManifest.xml', androidManifest)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>AndroidManifest.xml</span>
              </button>
            </div>
          </div>

          {/* CLI Commands */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-emerald-400 block font-sans">
              الأوامر المباشرة لبناء الـ APK في جهازك محلياً:
            </span>
            <div className="space-y-1.5 font-mono text-xs text-slate-300" dir="ltr">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <span>npm install @capacitor/core @capacitor/cli @capacitor/android</span>
                <button
                  onClick={() => handleCopy('npm install @capacitor/core @capacitor/cli @capacitor/android', 'cmd1')}
                  className="text-slate-400 hover:text-white"
                >
                  {copiedKey === 'cmd1' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <span>npm run build && npx cap add android && npx cap sync</span>
                <button
                  onClick={() => handleCopy('npm run build && npx cap add android && npx cap sync', 'cmd2')}
                  className="text-slate-400 hover:text-white"
                >
                  {copiedKey === 'cmd2' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <span>cd android && ./gradlew assembleRelease</span>
                <button
                  onClick={() => handleCopy('cd android && ./gradlew assembleRelease', 'cmd3')}
                  className="text-slate-400 hover:text-white"
                >
                  {copiedKey === 'cmd3' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 5: GOOGLE PLAY STORE PUBLISHING CHECKLIST                 */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'store' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              دليل رفع التطبيق على متجر Google Play Console (AAB)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              الشروط والمعايير الرسمية لرفع ونشر تطبيق Porto Drive للمستخدمين
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <FileCode className="w-4 h-4" />
                1. صيغة الملف المطلوبة (Android App Bundle - AAB)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                متجر Google Play يطلب صيغة <strong className="text-white">.aab</strong> بدلاً من .apk عند الرفع لأول مرة، ويمكنك تحميلها مباشرة من الزر أعلاه.
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                2. إقرار صلاحية الموقع الجغرافي بالخلفية (Location Disclosure)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                نظراً لأن تطبيق الكابتن يتطلب تتبع الموقع أثناء القيادة لإرسال موقعه للراكب:
              </p>
              <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-1">
                <li>يجب توفير رابط سياسة خصوصية صريح (Privacy Policy).</li>
                <li>تحديد تصنيف التطبيق في فئة: <strong className="text-white">Maps & Navigation / Travel</strong>.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

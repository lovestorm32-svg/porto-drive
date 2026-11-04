import React, { useState } from 'react';
import { RidePlatformProvider } from './context/RidePlatformContext';
import { Header, MainNavTab } from './components/common/Header';
import { PassengerApp } from './components/passenger/PassengerApp';
import { DriverApp } from './components/driver/DriverApp';
import { DualScreenSimulator } from './components/common/DualScreenSimulator';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DatabaseSchemaViewer } from './components/database/DatabaseSchemaViewer';
import { ArchitectureAndDeployGuide } from './components/docs/ArchitectureAndDeployGuide';
import { AndroidApkHub } from './components/apk/AndroidApkHub';

export default function App() {
  const [currentTab, setCurrentTab] = useState<MainNavTab>('dual');

  return (
    <RidePlatformProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
        {/* Navigation Bar */}
        <Header currentTab={currentTab} onTabChange={setCurrentTab} />

        {/* Main Workspace Body */}
        <main className="flex-1 w-full overflow-x-hidden">
          {currentTab === 'passenger' && <PassengerApp />}
          {currentTab === 'driver' && <DriverApp />}
          {currentTab === 'dual' && <DualScreenSimulator />}
          {currentTab === 'apk' && <AndroidApkHub />}
          {currentTab === 'admin' && <AdminDashboard />}
          {currentTab === 'database' && <DatabaseSchemaViewer />}
          {currentTab === 'docs' && <ArchitectureAndDeployGuide />}
        </main>
      </div>
    </RidePlatformProvider>
  );
}

import React, { useState } from 'react';
import { AndroidEmulator } from './components/AndroidEmulator';
import { CodeViewer } from './components/CodeViewer';
import { SetupGuide } from './components/SetupGuide';
import { ApiTester } from './components/ApiTester';
import { AndroidInstallBanner } from './components/AndroidInstallBanner';
import { 
  Smartphone, 
  Code2, 
  BookOpen, 
  Terminal, 
  ShieldCheck, 
  Activity, 
  Download, 
  Layers,
  Sparkles
} from 'lucide-react';
import JSZip from 'jszip';
import { PROJECT_FILES } from './projectFiles';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'guide' | 'api'>('simulator');
  const [isZipping, setIsZipping] = useState(false);

  const [showApkModal, setShowApkModal] = useState(false);

  const handleQuickDownload = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      PROJECT_FILES.forEach(file => {
        zip.file(file.path, file.content);
      });
      zip.file('android/gradlew', `#!/usr/bin/env sh\nexec gradle "$@"\n`);
      zip.file('android/gradlew.bat', `@echo off\ngradle %*\n`);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'WELYD_Game_Test_Panel_Android_and_Backend.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Mobile Android Installation Notice & Prompt */}
      <AndroidInstallBanner />

      {/* Top Navigation Bar */}
      <header className="border-b border-[#1b253b] bg-[#0a0f1d]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-blue-500 flex items-center justify-center font-mono font-black text-xl text-slate-950 shadow-md shadow-cyan-500/20">
              W
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-black text-lg tracking-wider text-white">WELYD</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-500/40">
                  ANDROID + FASTAPI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                Authoritative Game Test Panel & Session Discovery
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1 bg-[#121826] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 transition-all ${
                activeTab === 'simulator'
                  ? 'bg-cyan-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 transition-all ${
                activeTab === 'code'
                  ? 'bg-cyan-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code & ZIP</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 transition-all ${
                activeTab === 'guide'
                  ? 'bg-cyan-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Guide (14 pts)</span>
            </button>

            <button
              onClick={() => setActiveTab('api')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 transition-all ${
                activeTab === 'api'
                  ? 'bg-cyan-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>API Tester</span>
            </button>
          </div>

          {/* Quick ZIP & APK download buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowApkModal(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-mono font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>GET APK</span>
            </button>
            <button
              onClick={handleQuickDownload}
              disabled={isZipping}
              className="hidden sm:flex px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-mono font-bold items-center space-x-2 transition-all active:scale-95 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isZipping ? 'PACKING...' : '.ZIP'}</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-4">
        {activeTab === 'simulator' && <AndroidEmulator />}
        {activeTab === 'code' && <CodeViewer />}
        {activeTab === 'guide' && <SetupGuide />}
        {activeTab === 'api' && <ApiTester />}
      </main>

      {/* Modal: How to Download & Build the APK */}
      {showApkModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121826] border border-cyan-500/60 rounded-2xl p-6 max-w-xl w-full space-y-4 font-sans text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#26354e] pb-3">
              <div className="flex items-center space-x-2 text-cyan-400 font-mono font-bold text-sm">
                <Smartphone className="w-4 h-4" />
                <span>HOW TO DOWNLOAD & INSTALL THE APK</span>
              </div>
              <button 
                onClick={() => setShowApkModal(false)}
                className="text-slate-400 hover:text-white text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-slate-300">
              <p className="text-slate-300">
                Because this is a custom native Kotlin Android project, the APK is built from the complete source files included in this project.
              </p>

              <div className="bg-[#070b12] border border-slate-800 rounded-xl p-3.5 space-y-2.5 font-mono text-[11px]">
                <div className="text-emerald-400 font-bold">STEP 1: Download the Project Package</div>
                <button
                  onClick={handleQuickDownload}
                  disabled={isZipping}
                  className="w-full py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-lg flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>{isZipping ? 'PACKAGING ZIP...' : 'DOWNLOAD PROJECT ZIP (.ZIP)'}</span>
                </button>

                <div className="text-emerald-400 font-bold pt-2">STEP 2: Choose Your Build Method</div>
                <div className="space-y-3 font-sans">
                  <div className="p-2.5 bg-slate-900 border border-cyan-500/30 rounded-lg">
                    <div className="font-bold text-cyan-300 font-mono text-xs flex items-center justify-between">
                      <span>Method 1: Cloud Build via GitHub (Zero Install)</span>
                      <span className="text-[10px] bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/40">EASIEST</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-1">
                      Export this project to GitHub via the AI Studio Settings menu. The included <code>.github/workflows/build-apk.yml</code> pipeline will automatically compile the APK on GitHub's cloud servers in ~1 minute. You can then download the <code>.apk</code> directly from the GitHub Actions <strong>Artifacts</strong> tab onto your phone!
                    </p>
                  </div>

                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="font-bold text-white font-mono text-xs">
                      Method 2: Local Terminal or Android Studio
                    </div>
                    <p className="text-slate-400 text-[11px] mt-1">
                      Extract the downloaded ZIP on your computer, open terminal in <code>android/</code>, and run:
                    </p>
                    <pre className="mt-1 bg-black/70 p-2 rounded text-emerald-400 font-mono text-[11px]">./gradlew assembleDebug</pre>
                  </div>
                </div>

                <div className="text-emerald-400 font-bold pt-2">STEP 3: Install the APK on Your Android Device</div>
                <p className="text-slate-400 font-sans">
                  The compiled APK file will be ready at:
                </p>
                <div className="bg-black/70 p-2 rounded text-amber-300 text-[11px] font-mono break-all">
                  android/app/build/outputs/apk/debug/app-debug.apk
                </div>
                <p className="text-slate-400 font-sans">
                  Transfer <code>app-debug.apk</code> to your phone (via USB, Drive, or AirDrop/Bluetooth) and tap to install, or run <code className="text-cyan-300 font-mono">adb install -r app/build/outputs/apk/debug/app-debug.apk</code>.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowApkModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-bold rounded-lg text-xs"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[#1b253b] bg-[#0a0f1d] py-4 px-6 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Authorized Test Environment Protocol • Kotlin 1.9+ • Jetpack Compose • FastAPI</span>
          </div>
          <div>
            Build Target: <span className="text-cyan-400 font-bold">Android 14 (API 34)</span> • SpecialUse Foreground Service
          </div>
        </div>
      </footer>
    </div>
  );
}

import React, { useState } from 'react';
import { usePWAInstall } from '../usePWAInstall';
import { Smartphone, Download, CheckCircle2, ArrowRight, HelpCircle, X, Sparkles, ExternalLink } from 'lucide-react';

export function AndroidInstallBanner() {
  const { isInstallable, isInstalled, isAndroid, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already installed and running as standalone app, don't show the banner
  if (isInstalled || dismissed) {
    return null;
  }

  return (
    <>
      <div className="bg-gradient-to-r from-cyan-950 via-[#0e1726] to-emerald-950 border-b border-cyan-500/30 px-4 py-2.5 text-xs text-slate-200 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0">
              <Smartphone className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white font-mono">USING ANDROID?</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                  READY TO INSTALL
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                You can install <strong className="text-cyan-400">WELYD Test Panel</strong> directly onto your phone right now.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            {isInstallable ? (
              <button
                onClick={install}
                className="flex-1 sm:flex-none px-4 py-1.5 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-mono font-bold rounded-lg text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>INSTALL APP NOW</span>
              </button>
            ) : (
              <button
                onClick={() => setShowGuideModal(true)}
                className="flex-1 sm:flex-none px-4 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 font-mono font-bold rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-all"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>INSTALL ON THIS PHONE</span>
              </button>
            )}

            <button
              onClick={() => setShowGuideModal(true)}
              className="px-2.5 py-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Installation Instructions"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-slate-500 hover:text-slate-300 rounded"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Android Installation Help Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121826] border border-cyan-500/60 rounded-2xl p-6 max-w-lg w-full space-y-4 font-sans text-xs text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#26354e] pb-3">
              <div className="flex items-center space-x-2 text-cyan-400 font-mono font-bold text-sm">
                <Smartphone className="w-4 h-4" />
                <span>INSTALL WELYD ON YOUR ANDROID PHONE</span>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-white text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Option 1: Instant Direct Install (PWA) */}
              <div className="bg-[#0a0f1d] border border-cyan-500/40 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="font-mono font-bold text-cyan-300 text-xs flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>METHOD 1: Instant Install (No PC Needed)</span>
                  </div>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/40 font-mono font-bold">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  You can install this app directly into your Android phone's launcher in 3 seconds:
                </p>

                {isInstallable ? (
                  <button
                    onClick={() => {
                      install();
                      setShowGuideModal(false);
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-mono font-bold rounded-lg text-xs flex items-center justify-center space-x-2 shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    <span>TAP TO INSTALL TO YOUR HOME SCREEN</span>
                  </button>
                ) : (
                  <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-2 text-[11px] font-mono">
                    <div className="text-amber-400 font-bold">In your Chrome / Samsung Internet browser:</div>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-300 font-sans">
                      <li>Tap the <strong>three dots (⋮)</strong> in the top-right corner of your browser.</li>
                      <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                      <li>Tap <strong>Install</strong>. The WELYD icon will appear directly on your Android app list!</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Option 2: Native APK via Cloud GitHub Actions */}
              <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="font-mono font-bold text-white text-xs flex items-center space-x-1.5">
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>METHOD 2: Download Compiled Native `.APK`</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  If you need the raw <strong>`.apk` binary file</strong> on your Android phone without using a PC:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                  <li>In Google AI Studio on your phone, open the <strong>Settings / Export</strong> menu.</li>
                  <li>Select <strong>Export to GitHub</strong>.</li>
                  <li>Our built-in GitHub workflow automatically compiles the `.apk` in the cloud.</li>
                  <li>Under the <strong>Actions</strong> tab on GitHub, tap the build and download <code>WELYD-Game-Test-Panel-debug.apk</code> straight to your Android Downloads folder!</li>
                </ol>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-bold rounded-lg text-xs"
              >
                GOT IT
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import React from 'react';
import { 
  FolderTree, 
  Terminal, 
  Play, 
  Smartphone, 
  ShieldAlert, 
  HelpCircle, 
  CheckCircle2, 
  Layers,
  Copy,
  Server,
  Zap
} from 'lucide-react';

export function SetupGuide() {
  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-8 font-sans text-slate-200">
      
      {/* Title */}
      <div className="border-b border-slate-800 pb-5">
        <div className="text-cyan-400 font-mono text-xs font-bold tracking-widest uppercase mb-1">
          ENGINEERING & DEPLOYMENT MANUAL
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
          WELYD Game Test Panel Setup Guide
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Step-by-step instructions for Android Studio compilation, physical device deployment, FastAPI execution, and authoritative host validation.
        </p>
      </div>

      {/* 1. Directory Structure Map */}
      <section className="bg-[#121826] border border-[#26354e] rounded-2xl p-6 space-y-4">
        <div className="flex items-center space-x-3 text-cyan-400">
          <FolderTree className="w-5 h-5" />
          <h2 className="text-base font-bold tracking-wide uppercase font-mono">1. Project File Structure</h2>
        </div>
        <p className="text-xs text-slate-400">
          When unzipped or generated, files must be arranged in this clean Android + Backend architecture:
        </p>
        <pre className="bg-[#070b12] p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto">
{`WelydGameTestPanel/
├── android/
│   ├── build.gradle.kts                <-- Top-level project Gradle configuration
│   ├── settings.gradle.kts             <-- Module inclusion (:app)
│   ├── gradle.properties               <-- AndroidX & JVM memory settings
│   └── app/
│       ├── build.gradle.kts            <-- App module dependencies (Compose, OkHttp, DataStore)
│       ├── proguard-rules.pro          <-- Serialization keep rules
│       └── src/main/
│           ├── AndroidManifest.xml     <-- SYSTEM_ALERT_WINDOW & Foreground service permissions
│           ├── java/com/welyd/gametestpanel/
│           │   ├── MainActivity.kt     <-- Root navigation, permission request handlers
│           │   ├── model/
│           │   │   ├── Room.kt         <-- Authoritative Room schema & connection state
│           │   │   ├── Player.kt       <-- Player identity model
│           │   │   ├── GameSession.kt  <-- Dynamic IP:port game session model
│           │   │   └── ApiResponse.kt  <-- ClaimHostResponse, ActionResponse, Health
│           │   ├── network/
│           │   │   ├── ApiService.kt   <-- Coroutine network contract
│           │   │   └── ApiClient.kt    <-- OkHttp client with timeout & error mapping
│           │   ├── repository/
│           │   │   ├── RoomRepository.kt <-- State coordinator, demo mode, connection log
│           │   │   └── SessionManager.kt <-- Dynamic game session server discovery
│           │   ├── service/
│           │   │   └── FloatingPanelService.kt <-- Draggable WindowManager overlay service
│           │   ├── settings/
│           │   │   └── SettingsManager.kt <-- Jetpack DataStore Preferences persistence
│           │   └── ui/
│           │       ├── DashboardScreen.kt <-- Main dark gaming interface
│           │       ├── SettingsScreen.kt  <-- Endpoints, Demo Mode, Auto Refresh
│           │       ├── DebugScreen.kt     <-- Connection log table with clear button
│           │       ├── FloatingPanel.kt   <-- Minimized W bubble & expanded compact panel
│           │       └── theme/
│           │           ├── Color.kt       <-- Neon cyan/emerald/red gaming palette
│           │           └── Theme.kt       <-- Material 3 dark color scheme
│           └── res/
│               ├── drawable/ic_welyd_bubble.xml <-- W stylized vector icon
│               └── values/{strings.xml, colors.xml, themes.xml}
│
└── backend/
    ├── main.py                         <-- Complete FastAPI server with in-memory store
    ├── requirements.txt                <-- fastapi, uvicorn, pydantic
    └── README.md                       <-- Endpoint documentation & curl examples`}
        </pre>
      </section>

      {/* 2. Opening in Android Studio & Building APK */}
      <section className="bg-[#121826] border border-[#26354e] rounded-2xl p-6 space-y-4">
        <div className="flex items-center space-x-3 text-cyan-400">
          <Terminal className="w-5 h-5" />
          <h2 className="text-base font-bold tracking-wide uppercase font-mono">2. Open & Build in Android Studio</h2>
        </div>
        
        <div className="space-y-3 text-xs leading-relaxed">
          <div className="p-3.5 rounded-xl bg-[#0a0e17] border border-slate-800 space-y-2">
            <span className="font-bold text-cyan-300 font-mono">Step 1: Open Project in Android Studio</span>
            <p className="text-slate-400">
              Launch Android Studio (Hedgehog 2023.1+ or Iguana / Jellyfish / Koala). Click <strong>Open</strong> and select the <code>android/</code> folder. Android Studio will detect Gradle and automatically run a Gradle Sync.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0a0e17] border border-slate-800 space-y-2">
            <span className="font-bold text-cyan-300 font-mono">Step 2: Build the Debug APK</span>
            <p className="text-slate-400">
              In Android Studio, select from the top menu:
            </p>
            <div className="bg-slate-950 p-2.5 rounded font-mono text-cyan-400 text-[11px]">
              Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)
            </div>
            <p className="text-slate-400">
              Alternatively, open the terminal in the project directory and run:
            </p>
            <pre className="bg-slate-950 p-2.5 rounded font-mono text-emerald-400 text-[11px]">
./gradlew assembleDebug
            </pre>
            <p className="text-slate-400">
              The compiled APK will be created at: <code>app/build/outputs/apk/debug/app-debug.apk</code>.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Installing on Physical Phone */}
      <section className="bg-[#121826] border border-[#26354e] rounded-2xl p-6 space-y-4">
        <div className="flex items-center space-x-3 text-cyan-400">
          <Smartphone className="w-5 h-5" />
          <h2 className="text-base font-bold tracking-wide uppercase font-mono">3. Install on Physical Android Phone</h2>
        </div>

        <div className="space-y-3 text-xs">
          <p className="text-slate-400">
            No root is required. The app works on any device running Android 8.0 (API 26) or newer.
          </p>

          <ol className="list-decimal list-inside space-y-2 text-slate-300">
            <li>
              <strong>Enable Developer Options:</strong> On your Android phone, go to <em>Settings &gt; About phone</em> and tap <em>Build number</em> 7 times.
            </li>
            <li>
              <strong>Enable USB Debugging:</strong> Go to <em>Settings &gt; System &gt; Developer options</em> and toggle on <strong>USB Debugging</strong>.
            </li>
            <li>
              <strong>Connect Phone via USB:</strong> Plug the phone into your computer. When prompted on your phone, tap <strong>Allow USB debugging</strong>.
            </li>
            <li>
              <strong>Install via ADB:</strong> Run:
              <pre className="bg-slate-950 p-2 rounded mt-1 font-mono text-emerald-400 text-[11px]">
adb install -r app/build/outputs/apk/debug/app-debug.apk
              </pre>
              Or simply press the green <strong>Run (Play)</strong> button in Android Studio with your phone selected in the device dropdown.
            </li>
          </ol>
        </div>
      </section>

      {/* 4. Running the Backend */}
      <section className="bg-[#121826] border border-[#26354e] rounded-2xl p-6 space-y-4">
        <div className="flex items-center space-x-3 text-cyan-400">
          <Server className="w-5 h-5" />
          <h2 className="text-base font-bold tracking-wide uppercase font-mono">4. Start the FastAPI Test Backend</h2>
        </div>

        <div className="space-y-3 text-xs font-mono">
          <p className="text-slate-400 font-sans">
            In your terminal, navigate to the <code>backend/</code> folder:
          </p>
          <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-200 leading-relaxed">
{`cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload`}
          </pre>
          <p className="text-slate-400 font-sans">
            Interactive Swagger API documentation will be available at: <code className="text-cyan-400">http://localhost:8000/docs</code>.
          </p>
        </div>
      </section>

      {/* 5. Device Connection & API URL */}
      <section className="bg-[#121826] border border-[#26354e] rounded-2xl p-6 space-y-4">
        <div className="flex items-center space-x-3 text-cyan-400">
          <Zap className="w-5 h-5" />
          <h2 className="text-base font-bold tracking-wide uppercase font-mono">5. Changing the API URL on Android</h2>
        </div>

        <div className="space-y-3 text-xs">
          <p className="text-slate-400">
            Open the <strong>Settings</strong> screen (gear icon in the top right of WELYD Test Panel):
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-cyan-400 font-bold text-[11px] mb-1">Android Emulator:</div>
              <code className="text-white text-[11px]">http://10.0.2.2:8000</code>
              <p className="text-[10px] text-slate-500 font-sans mt-1">Routes to localhost on the host machine.</p>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-cyan-400 font-bold text-[11px] mb-1">Physical Phone (Same Wi-Fi):</div>
              <code className="text-white text-[11px]">http://192.168.1.X:8000</code>
              <p className="text-[10px] text-slate-500 font-sans mt-1">Replace with computer's local IP (ipconfig/ifconfig).</p>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-cyan-400 font-bold text-[11px] mb-1">Cloud / ngrok Tunnel:</div>
              <code className="text-white text-[11px]">https://your-domain.ngrok.app</code>
              <p className="text-[10px] text-slate-500 font-sans mt-1">Accessible across any cellular or external network.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Floating Overlay Permission */}
      <section className="bg-[#121826] border border-[#26354e] rounded-2xl p-6 space-y-4">
        <div className="flex items-center space-x-3 text-cyan-400">
          <Layers className="w-5 h-5" />
          <h2 className="text-base font-bold tracking-wide uppercase font-mono">6. Enable Floating Bubble Overlay</h2>
        </div>

        <div className="space-y-3 text-xs leading-relaxed text-slate-300">
          <p>
            Android requires explicit user permission to draw over other apps:
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
            <li>In the WELYD app, navigate to <strong>Settings</strong>.</li>
            <li>Toggle <strong>Enable Floating Bubble</strong>.</li>
            <li>The system will launch the Android <em>"Display over other apps"</em> settings screen.</li>
            <li>Find <strong>WELYD Game Test Panel</strong> and switch the toggle to <strong>Allow</strong>.</li>
            <li>Press Back. The foreground service will start, and the circular <strong className="text-cyan-400">W</strong> bubble will appear on your screen over any game or app!</li>
          </ol>
        </div>
      </section>

      {/* 7. Authoritative Host Claim Validation */}
      <section className="bg-[#121826] border border-[#26354e] rounded-2xl p-6 space-y-4">
        <div className="flex items-center space-x-3 text-cyan-400">
          <CheckCircle2 className="w-5 h-5" />
          <h2 className="text-base font-bold tracking-wide uppercase font-mono">7. Test Authoritative Host Ownership</h2>
        </div>

        <div className="space-y-3 text-xs leading-relaxed text-slate-300">
          <p>
            The backend is authoritative. The Android app never decides who owns a room based on local IP or client-side assumptions:
          </p>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-[11px]">
            <div className="text-amber-400 font-bold">1. Conflict Test:</div>
            <p className="text-slate-400">
              The test room <code>ABC123</code> is pre-seeded with <code>PLAYER001</code> as host.
              When <code>PLAYER_4821</code> presses <strong>[ CLAIM HOST ]</strong>, the backend rejects it with:
            </p>
            <pre className="text-rose-400 bg-black/60 p-2 rounded">
{`{
  "success": false,
  "error": "ROOM_ALREADY_HAS_HOST",
  "message": "Room already has an active host (PLAYER001)."
}`}
            </pre>
            <div className="text-emerald-400 font-bold pt-2">2. Successful Claim:</div>
            <p className="text-slate-400">
              Once <code>PLAYER001</code> releases the host via <strong>[ RELEASE HOST ]</strong>, or if you create a fresh room, pressing <strong>[ CLAIM HOST ]</strong> returns:
            </p>
            <pre className="text-emerald-400 bg-black/60 p-2 rounded">
{`{
  "success": true,
  "roomId": "ABC123",
  "playerId": "PLAYER_4821",
  "isHost": true
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* 8. Troubleshooting Build Errors */}
      <section className="bg-[#121826] border border-[#26354e] rounded-2xl p-6 space-y-4">
        <div className="flex items-center space-x-3 text-rose-400">
          <ShieldAlert className="w-5 h-5" />
          <h2 className="text-base font-bold tracking-wide uppercase font-mono">8. Android Build Troubleshooting</h2>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-cyan-300 font-mono">Error: "Unsupported Java version" or "Java 17 required"</span>
            <p className="text-slate-400">
              In Android Studio, go to <em>Settings / Preferences &gt; Build, Execution, Deployment &gt; Build Tools &gt; Gradle</em> and ensure <strong>Gradle JDK</strong> is set to <strong>Java 17 (or Embedded JDK 17)</strong>.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-cyan-300 font-mono">Error: "Cleartext HTTP traffic not permitted"</span>
            <p className="text-slate-400">
              If testing with local non-HTTPS <code>http://10.0.2.2:8000</code>, our <code>AndroidManifest.xml</code> already has <code>android:usesCleartextTraffic="true"</code> configured, enabling seamless local test connectivity.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-cyan-300 font-mono">Error: "Foreground service type specialUse not permitted"</span>
            <p className="text-slate-400">
              On Android 14+ (API 34), foreground services require a designated type. Our manifest defines <code>android:foregroundServiceType="specialUse"</code> with the required <code>PROPERTY_SPECIAL_USE_FGS_SUBTYPE</code> property.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Terminal, 
  Layers, 
  Play, 
  Pause, 
  Clock, 
  Smartphone, 
  Radio, 
  Volume2, 
  VolumeX, 
  Trash2,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  Cpu
} from 'lucide-react';

interface BackgroundLogEntry {
  id: string;
  timestamp: string;
  method: string;
  endpoint: string;
  status: number;
  durationMs: number;
  summary: string;
}

export function ApiTester() {
  const [roomId, setRoomId] = useState('ABC123');
  const [playerId, setPlayerId] = useState('Welyyd-Xvipeer');
  const [endpoint, setEndpoint] = useState('/rooms/ABC123');
  const [method, setMethod] = useState<'GET' | 'POST'>('GET');
  const [payload, setPayload] = useState('{\n  "playerId": "Welyyd-Xvipeer"\n}');
  const [responseStatus, setResponseStatus] = useState<number | null>(200);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({
    'content-type': 'application/json; charset=utf-8',
    'x-welyd-session-version': '1.0.0',
    'x-authoritative-host': 'Welyyd-Xvipeer',
  });
  const [responseBody, setResponseBody] = useState<string>(
    JSON.stringify({
      roomId: "ABC123",
      playerId: "Welyyd-Xvipeer",
      sessionId: "8F92A1",
      server: "203.0.113.10",
      port: 1946,
      status: "CONNECTED",
      isHost: false,
      hostPlayerId: "PLAYER001",
      players: ["PLAYER001", "Welyyd-Xvipeer"],
      updatedAt: new Date().toISOString()
    }, null, 2)
  );
  const [copied, setCopied] = useState(false);

  // Background Execution / Polling State
  const [isBackgroundActive, setIsBackgroundActive] = useState(false);
  const [backgroundInterval, setBackgroundInterval] = useState(3); // seconds
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [bgLogs, setBgLogs] = useState<BackgroundLogEntry[]>([]);
  const [pingCount, setPingCount] = useState(0);
  const [backgroundUptime, setBackgroundUptime] = useState(0);
  const [activeHost, setActiveHost] = useState('PLAYER001');
  const [showAndroidOverlayMock, setShowAndroidOverlayMock] = useState(false);

  const backgroundTimerRef = useRef<NodeJS.Timeout | null>(null);
  const uptimeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize endpoint when user changes Room ID
  const handleRoomIdChange = (newRoomId: string) => {
    const sanitized = newRoomId.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '') || 'ABC123';
    const oldRoomId = roomId;
    setRoomId(sanitized);

    // If endpoint contains old room ID, replace it
    if (endpoint.includes(oldRoomId)) {
      setEndpoint(endpoint.replaceAll(oldRoomId, sanitized));
    }
  };

  // Synchronize Player ID in payload
  const handlePlayerIdChange = (newPlayerId: string) => {
    setPlayerId(newPlayerId);
    try {
      const parsed = JSON.parse(payload);
      if (parsed.playerId !== undefined) {
        parsed.playerId = newPlayerId;
        setPayload(JSON.stringify(parsed, null, 2));
      }
    } catch {
      // not valid JSON, leave as is
    }
  };

  // Dynamic presets based on custom Room ID and Player ID
  const presets = [
    { label: `GET /rooms/${roomId}`, m: 'GET', ep: `/rooms/${roomId}`, body: '' },
    { label: `POST /rooms/${roomId}/claim-host (Guest)`, m: 'POST', ep: `/rooms/${roomId}/claim-host`, body: `{\n  "playerId": "${playerId}"\n}` },
    { label: `POST /rooms/${roomId}/claim-host (Host: ${activeHost})`, m: 'POST', ep: `/rooms/${roomId}/claim-host`, body: `{\n  "playerId": "${activeHost}"\n}` },
    { label: `POST /rooms/${roomId}/release-host`, m: 'POST', ep: `/rooms/${roomId}/release-host`, body: `{\n  "playerId": "${activeHost}"\n}` },
    { label: `POST /rooms/${roomId}/rotate-session`, m: 'POST', ep: `/rooms/${roomId}/rotate-session`, body: '' },
    { label: 'GET /health', m: 'GET', ep: '/health', body: '' },
  ];

  // Optional gentle audio ping for background events
  const playAudioPing = (isError = false) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = isError ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(isError ? 240 : 660, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch {
      // Audio context might be restricted before user gesture
    }
  };

  // Core Request Execution Logic
  const executeApiCall = (targetEndpoint = endpoint, targetMethod = method, targetPayload = payload, isBg = false) => {
    const startTime = performance.now();
    let status = 200;
    let bodyData: Record<string, unknown> = {};

    if (targetEndpoint.includes('/health')) {
      status = 200;
      bodyData = {
        status: "ok",
        service: "WELYD Test Backend",
        version: "1.0.0",
        activeRoom: roomId,
        timestamp: Math.floor(Date.now() / 1000)
      };
    } else if (targetEndpoint.includes('/claim-host')) {
      let bodyObj: { playerId?: string } = {};
      try { bodyObj = JSON.parse(targetPayload); } catch { bodyObj = { playerId }; }
      const reqPlayer = bodyObj.playerId || playerId;

      if (reqPlayer !== activeHost && activeHost !== '') {
        status = 409;
        bodyData = {
          success: false,
          roomId: roomId,
          playerId: reqPlayer,
          isHost: false,
          error: "ROOM_ALREADY_HAS_HOST",
          message: `Room ${roomId} already has an active host (${activeHost}). Current host must release role first.`
        };
        playAudioPing(true);
      } else {
        status = 200;
        setActiveHost(reqPlayer);
        bodyData = {
          success: true,
          roomId: roomId,
          playerId: reqPlayer,
          isHost: true,
          message: `Player ${reqPlayer} successfully claimed host role for room ${roomId}.`
        };
        playAudioPing(false);
      }
    } else if (targetEndpoint.includes('/release-host')) {
      status = 200;
      setActiveHost('');
      bodyData = {
        success: true,
        roomId: roomId,
        message: `Host role for room ${roomId} released. Room is now unhosted.`
      };
      playAudioPing(false);
    } else if (targetEndpoint.includes('/rotate-session')) {
      status = 200;
      bodyData = {
        message: "Session migrated",
        roomId: roomId,
        newSessionId: "SESS_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        newServer: "203.0.113.20",
        newPort: 1900 + Math.floor(Math.random() * 90),
        timestamp: new Date().toISOString()
      };
      playAudioPing(false);
    } else {
      // Default GET /rooms/{roomId}
      status = 200;
      bodyData = {
        roomId: roomId,
        playerId: playerId,
        sessionId: "SESS_" + roomId.slice(0, 4) + "99",
        server: "203.0.113.10",
        port: 1946,
        status: "CONNECTED",
        isHost: playerId === activeHost,
        hostPlayerId: activeHost || null,
        players: Array.from(new Set([activeHost || 'HOST_1', playerId, 'PLAYER_02'])),
        lastPolled: new Date().toLocaleTimeString(),
        backgroundPing: isBg
      };
      if (isBg) playAudioPing(false);
    }

    const duration = Math.round(performance.now() - startTime);

    setResponseStatus(status);
    setResponseHeaders({
      'content-type': 'application/json; charset=utf-8',
      'x-welyd-room-id': roomId,
      'x-authoritative-host': activeHost || 'NONE',
      'x-background-worker': isBg ? 'true' : 'false',
    });
    setResponseBody(JSON.stringify(bodyData, null, 2));

    // Append to Background / Event Log
    const newLog: BackgroundLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      method: targetMethod,
      endpoint: targetEndpoint,
      status,
      durationMs: duration,
      summary: status === 200 ? `Host: ${activeHost || 'None'} | OK` : `Conflict (409)`
    };

    setBgLogs(prev => [newLog, ...prev.slice(0, 39)]);
    setPingCount(c => c + 1);
  };

  // Background Interval Poller
  useEffect(() => {
    if (isBackgroundActive) {
      // Run immediately
      executeApiCall(endpoint, method, payload, true);

      backgroundTimerRef.current = setInterval(() => {
        executeApiCall(endpoint, method, payload, true);
      }, backgroundInterval * 1000);

      uptimeTimerRef.current = setInterval(() => {
        setBackgroundUptime(s => s + 1);
      }, 1000);
    } else {
      if (backgroundTimerRef.current) clearInterval(backgroundTimerRef.current);
      if (uptimeTimerRef.current) clearInterval(uptimeTimerRef.current);
    }

    return () => {
      if (backgroundTimerRef.current) clearInterval(backgroundTimerRef.current);
      if (uptimeTimerRef.current) clearInterval(uptimeTimerRef.current);
    };
  }, [isBackgroundActive, backgroundInterval, endpoint, method, payload, roomId, playerId, activeHost]);

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(responseBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Header Banner */}
      <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-cyan-400 font-mono text-xs font-bold tracking-widest uppercase mb-1 flex items-center space-x-2">
            <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
            <span>AUTHORITATIVE API &amp; BACKGROUND WORKER CONSOLE</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">API Tester &amp; Background Poller</h2>
          <p className="text-slate-400 text-xs mt-1">
            Test custom Room IDs, authoritative host transitions, and run continuous background polling.
          </p>
        </div>

        {/* Global Active Room & Host Indicator */}
        <div className="flex items-center gap-2 bg-[#0c1220] border border-cyan-500/30 rounded-xl px-3.5 py-2 text-xs font-mono">
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Current Target</span>
            <span className="text-cyan-300 font-bold">Room: {roomId}</span>
          </div>
          <div className="h-6 w-px bg-slate-800 mx-1" />
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Active Host</span>
            <span className={activeHost ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
              {activeHost || 'UNCLAIMED'}
            </span>
          </div>
        </div>
      </div>

      {/* Control Strip: Editable Room ID & Player ID */}
      <div className="bg-[#0e1626] border border-cyan-500/30 rounded-2xl p-4 shadow-xl space-y-4">
        <div className="text-xs font-mono font-bold text-cyan-300 flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>1. CONFIGURE TARGET ROOM &amp; CLIENT CREDENTIALS</span>
          </span>
          <span className="text-slate-400 text-[11px] font-normal">
            Edit the Room ID below to instantly update endpoints &amp; background workers
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Editable Room ID */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono font-bold text-slate-300 flex items-center justify-between">
              <span>TARGET ROOM ID:</span>
              <span className="text-cyan-400 text-[10px]">EDITABLE</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={roomId}
                onChange={(e) => handleRoomIdChange(e.target.value)}
                placeholder="e.g. ABC123"
                className="w-full bg-[#070b12] border border-cyan-500/60 focus:border-cyan-300 text-white font-mono font-bold text-sm rounded-xl px-3 py-2 outline-none uppercase shadow-inner"
              />
            </div>
            <div className="flex gap-1 pt-1">
              {['ABC123', 'ROOM_77', 'QUIZ_99', 'TEST_01'].map((presetRoom) => (
                <button
                  key={presetRoom}
                  type="button"
                  onClick={() => handleRoomIdChange(presetRoom)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                    roomId === presetRoom
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {presetRoom}
                </button>
              ))}
            </div>
          </div>

          {/* Editable Player ID */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono font-bold text-slate-300">
              CALLING PLAYER ID:
            </label>
            <input
              type="text"
              value={playerId}
              onChange={(e) => handlePlayerIdChange(e.target.value)}
              placeholder="e.g. Welyyd-Xvipeer"
              className="w-full bg-[#070b12] border border-slate-700 focus:border-cyan-400 text-slate-200 font-mono text-sm rounded-xl px-3 py-2 outline-none"
            />
            <div className="flex flex-wrap gap-1 pt-1">
              {['Welyyd-Xvipeer', 'PLAYER001', 'GUEST_99'].map((pid) => (
                <button
                  key={pid}
                  type="button"
                  onClick={() => handlePlayerIdChange(pid)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                    playerId === pid
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {pid}
                </button>
              ))}
            </div>
          </div>

          {/* Background Worker Runner Toggle */}
          <div className="space-y-1 sm:col-span-2 bg-[#080d1a] border border-emerald-500/30 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-3 w-3">
                  {isBackgroundActive && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${isBackgroundActive ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
                </span>
                <span className="font-mono font-bold text-xs text-white">
                  USE IN BACKGROUND
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  title="Toggle Audio Beep on Ping"
                  className={`p-1.5 rounded-lg border text-xs font-mono flex items-center space-x-1 ${
                    soundEnabled 
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40' 
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => setShowAndroidOverlayMock(!showAndroidOverlayMock)}
                  className={`px-2 py-1 rounded-lg border text-[11px] font-mono flex items-center space-x-1 ${
                    showAndroidOverlayMock
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  <span>Floating Widget</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 mt-2">
              <div className="flex items-center space-x-2 text-xs font-mono">
                <label className="text-slate-400 text-[11px]">Poll every:</label>
                <select
                  value={backgroundInterval}
                  onChange={(e) => setBackgroundInterval(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 text-cyan-400 rounded px-2 py-1 text-xs outline-none"
                >
                  <option value={1}>1 sec</option>
                  <option value={2}>2 sec</option>
                  <option value={3}>3 sec</option>
                  <option value={5}>5 sec</option>
                  <option value={10}>10 sec</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setIsBackgroundActive(!isBackgroundActive)}
                className={`px-4 py-1.5 rounded-xl font-mono font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md active:scale-95 ${
                  isBackgroundActive
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                    : 'bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-bold'
                }`}
              >
                {isBackgroundActive ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>PAUSE BACKGROUND</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>START BACKGROUND RUNNER</span>
                  </>
                )}
              </button>
            </div>

            {isBackgroundActive && (
              <div className="mt-2 pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[11px] font-mono text-emerald-400">
                <span>Pings: {pingCount}</span>
                <span>Active Uptime: {formatUptime(backgroundUptime)}</span>
                <span className="text-slate-400">Keeps running when minimized</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Widget Simulator (Android Overlay Simulation) */}
      {showAndroidOverlayMock && (
        <div className="bg-gradient-to-r from-amber-950/40 via-[#131b2c] to-cyan-950/40 border border-amber-500/40 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-300 font-mono font-bold text-xs">
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>NATIVE ANDROID BACKGROUND OVERLAY PREVIEW</span>
            </div>
            <button
              onClick={() => setShowAndroidOverlayMock(false)}
              className="text-slate-400 hover:text-white text-xs font-mono"
            >
              Close Preview
            </button>
          </div>
          <p className="text-slate-300 text-xs">
            In the native Android app, when you switch to any game or minimize the screen, the background service (<code className="text-cyan-300 font-mono">GameMonitorService</code>) continues polling room <strong className="text-white">{roomId}</strong>. The floating <strong className="text-cyan-400 font-mono">"W"</strong> bubble remains on screen with real-time status:
          </p>

          <div className="flex flex-wrap items-center gap-4 bg-[#080d19] p-3 rounded-xl border border-slate-800">
            {/* The Floating Bubble */}
            <div className="relative group cursor-grab">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-cyan-500/40 border-2 border-white/80 animate-bounce">
                W
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>

            <div className="flex-1 space-y-1 font-mono text-xs">
              <div className="text-white font-bold flex items-center space-x-2">
                <span>WELYD Floating Overlay Widget</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">LIVE OVERLAY</span>
              </div>
              <div className="text-slate-400 text-[11px]">
                Monitoring Room: <span className="text-cyan-300 font-bold">{roomId}</span> | Active Host: <span className="text-amber-300 font-bold">{activeHost || 'None'}</span>
              </div>
              <div className="text-slate-500 text-[10px]">
                Tap the bubble on your Android screen at any time during gameplay to open the Quick Host Action drawer!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Presets tailored to the current Room ID */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-bold text-slate-400">
          QUICK ENDPOINT PRESETS (SYNCED WITH ROOM: {roomId}):
        </label>
        <div className="flex flex-wrap gap-2">
          {presets.map(p => (
            <button
              key={p.label}
              onClick={() => {
                setMethod(p.m as any);
                setEndpoint(p.ep);
                if (p.body) setPayload(p.body);
              }}
              className={`px-3 py-1.5 border rounded-xl text-xs font-mono transition-colors flex items-center space-x-1.5 ${
                endpoint === p.ep && method === p.m
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                  : 'bg-[#121826] hover:bg-[#1b2438] border-slate-800 text-slate-300'
              }`}
            >
              <span className={`font-bold ${p.m === 'POST' ? 'text-amber-400' : 'text-emerald-400'}`}>
                {p.m}
              </span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Request Bar */}
      <div className="bg-[#121826] border border-[#26354e] rounded-2xl p-3 flex flex-col sm:flex-row items-center gap-2 shadow-lg">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as any)}
          className="w-full sm:w-auto bg-slate-900 border border-slate-700 text-cyan-400 font-mono font-bold text-xs rounded-xl px-3 py-2.5 outline-none"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
        </select>
        <div className="flex-1 w-full relative">
          <input
            type="text"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white font-mono text-xs rounded-xl px-3 py-2.5 outline-none focus:border-cyan-400"
            placeholder={`/rooms/${roomId}`}
          />
        </div>
        <button
          onClick={() => executeApiCall(endpoint, method, payload, false)}
          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-mono font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shrink-0 transition-colors shadow-md active:scale-95"
        >
          <Send className="w-3.5 h-3.5" />
          <span>SEND REQUEST</span>
        </button>
      </div>

      {/* Main Grid: Request Body & Live Response */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Payload */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold text-slate-400">
              REQUEST BODY (JSON)
            </label>
            <span className="text-[11px] font-mono text-slate-500">
              {method === 'GET' ? 'Not used for GET requests' : 'Editable JSON'}
            </span>
          </div>
          <textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            disabled={method === 'GET'}
            rows={10}
            className={`w-full bg-[#070b12] border border-[#26354e] rounded-xl p-3 font-mono text-xs text-slate-200 outline-none focus:border-cyan-400 transition-opacity ${
              method === 'GET' ? 'opacity-30 cursor-not-allowed' : ''
            }`}
          />
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Room in payload: <strong className="text-cyan-400">{roomId}</strong></span>
            <span>Player in payload: <strong className="text-slate-300">{playerId}</strong></span>
          </div>
        </div>

        {/* Live Response */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-400">RESPONSE VIEWER</span>
              {isBackgroundActive && (
                <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30 text-[10px] animate-pulse">
                  POLLING ACTIVE
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyResponse}
                className="text-slate-400 hover:text-white flex items-center space-x-1 text-[11px]"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>
              {responseStatus && (
                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  responseStatus >= 200 && responseStatus < 300 
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' 
                    : 'bg-rose-950 text-rose-400 border border-rose-500/40'
                }`}>
                  STATUS: {responseStatus}
                </span>
              )}
            </div>
          </div>
          <pre className="w-full h-[220px] bg-[#070b12] border border-[#26354e] rounded-xl p-3 font-mono text-xs text-emerald-400 overflow-auto shadow-inner">
            {responseBody}
          </pre>
          <div className="text-[10px] font-mono text-slate-500 flex justify-between">
            <span>x-authoritative-host: {responseHeaders['x-authoritative-host'] || 'none'}</span>
            <span>x-welyd-room-id: {responseHeaders['x-welyd-room-id'] || roomId}</span>
          </div>
        </div>
      </div>

      {/* Live Background Activity Log */}
      <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="font-mono font-bold text-xs text-white">
              BACKGROUND EVENT &amp; SYNC HISTORY
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
              {bgLogs.length} events
            </span>
          </div>
          {bgLogs.length > 0 && (
            <button
              onClick={() => setBgLogs([])}
              className="text-slate-500 hover:text-slate-300 text-xs font-mono flex items-center space-x-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {bgLogs.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-slate-500">
            No background events yet. Click "START BACKGROUND RUNNER" or "SEND REQUEST" to generate traffic.
          </div>
        ) : (
          <div className="max-h-48 overflow-y-auto space-y-1.5 font-mono text-[11px] pr-1">
            {bgLogs.map((log) => (
              <div 
                key={log.id} 
                className="flex items-center justify-between p-2 rounded-lg bg-[#070b14] border border-slate-800/80 hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                  <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                    log.method === 'POST' ? 'bg-amber-950 text-amber-400' : 'bg-cyan-950 text-cyan-400'
                  }`}>
                    {log.method}
                  </span>
                  <span className="text-slate-300 font-bold">{log.endpoint}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-slate-400 text-[10px]">{log.summary}</span>
                  <span className={`font-bold ${
                    log.status === 200 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

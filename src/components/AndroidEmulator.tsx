import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  BatteryMedium, 
  RotateCw, 
  Shield, 
  UserMinus, 
  LogIn, 
  LogOut, 
  Activity, 
  Settings as SettingsIcon, 
  Bug, 
  X, 
  Maximize2, 
  Layers, 
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Smartphone
} from 'lucide-react';

export interface RoomState {
  roomId: string;
  playerId: string;
  sessionId: string;
  server: string;
  port: number;
  status: 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED';
  isHost: boolean;
  hostPlayerId: string | null;
  players: string[];
}

export interface LogEntry {
  id: string;
  time: string;
  event: string;
  result: string;
  isSuccess: boolean;
}

export function AndroidEmulator() {
  // Device mode
  const [deviceScreen, setDeviceScreen] = useState<'dashboard' | 'settings' | 'debug'>('dashboard');
  const [overlayActive, setOverlayActive] = useState(false);
  const [bubbleExpanded, setBubbleExpanded] = useState(false);
  const [bubblePos, setBubblePos] = useState({ x: 280, y: 160 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Settings
  const [apiUrl, setApiUrl] = useState('http://10.0.2.2:8000');
  const [playerId, setPlayerId] = useState('Welyyd-Xvipeer');
  const [roomId, setRoomId] = useState('ABC123');
  const [demoMode, setDemoMode] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(3);

  // Room & Network State
  const [room, setRoom] = useState<RoomState>({
    roomId: 'ABC123',
    playerId: 'Welyyd-Xvipeer',
    sessionId: '8F92A1',
    server: '203.0.113.10',
    port: 1946,
    status: 'CONNECTED',
    isHost: false,
    hostPlayerId: 'PLAYER001', // Demonstrates authoritative host assigned to PLAYER001
    players: ['PLAYER001', 'Welyyd-Xvipeer']
  });

  const [hasEndpointChanged, setHasEndpointChanged] = useState(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinInputRoom, setJoinInputRoom] = useState('ABC123');
  const [joinInputPlayer, setJoinInputPlayer] = useState('Welyyd-Xvipeer');

  // Logs
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', time: '17:40:01', event: 'GET /rooms/ABC123', result: 'SUCCESS', isSuccess: true },
    { id: '2', time: '17:40:02', event: 'SESSION DISCOVERED', result: '203.0.113.10:1946', isSuccess: true },
  ]);

  const getTimeStr = () => {
    const d = new Date();
    return d.toTimeString().split(' ')[0];
  };

  const addLog = (event: string, result: string, isSuccess: boolean) => {
    const newEntry: LogEntry = {
      id: Math.random().toString(),
      time: getTimeStr(),
      event,
      result,
      isSuccess
    };
    setLogs(prev => [newEntry, ...prev.slice(0, 49)]);
  };

  // Auto refresh timer
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      handleRefresh(true);
    }, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, room, demoMode, playerId, roomId]);

  // Operations
  const handleRefresh = (silent = false) => {
    if (!silent) setStatusNotification('Synchronizing room state...');
    setTimeout(() => {
      addLog(`GET /rooms/${room.roomId}`, 'SUCCESS 200 OK', true);
      if (!silent) setStatusNotification('Room synchronized');
    }, 300);
  };

  const handleClaimHost = () => {
    const timeStr = getTimeStr();
    // Authoritative check demonstration:
    if (room.hostPlayerId && room.hostPlayerId !== playerId) {
      // Room already has host
      addLog('CLAIM HOST', 'FAILED: ROOM_ALREADY_HAS_HOST', false);
      setStatusNotification(`Error: Room already has host (${room.hostPlayerId})`);
      return;
    }

    setRoom(prev => ({
      ...prev,
      isHost: true,
      hostPlayerId: playerId
    }));
    addLog('CLAIM HOST', `SUCCESS (Assigned to ${playerId})`, true);
    setStatusNotification('Host ownership granted by authoritative backend');
  };

  const handleReleaseHost = () => {
    if (!room.isHost) {
      setStatusNotification('Cannot release: Not current host');
      return;
    }
    setRoom(prev => ({
      ...prev,
      isHost: false,
      hostPlayerId: null
    }));
    addLog('RELEASE HOST', 'SUCCESS (Host released)', true);
    setStatusNotification('Host role released');
  };

  const handleLeaveRoom = () => {
    setRoom(prev => ({
      ...prev,
      status: 'DISCONNECTED',
      isHost: false,
      hostPlayerId: prev.hostPlayerId === playerId ? null : prev.hostPlayerId,
      players: prev.players.filter(p => p !== playerId)
    }));
    addLog(`POST /rooms/${room.roomId}/leave`, 'SUCCESS', true);
    setStatusNotification(`Left room ${room.roomId}`);
  };

  const handleTestConnection = () => {
    setStatusNotification('Testing backend connection...');
    setTimeout(() => {
      addLog('GET /health', 'SUCCESS 200 OK (WELYD Test Backend v1.0.0)', true);
      setStatusNotification('Connection verified OK');
    }, 250);
  };

  const handleSimulateMigration = () => {
    const isPrimary = room.server === '203.0.113.10';
    const newServer = isPrimary ? '203.0.113.20' : '203.0.113.10';
    const newPort = isPrimary ? 1901 : 1946;
    const newSession = 'SESS_' + Math.random().toString(36).substring(2, 8).toUpperCase();

    setRoom(prev => ({
      ...prev,
      server: newServer,
      port: newPort,
      sessionId: newSession
    }));
    setHasEndpointChanged(true);
    addLog('SESSION ROTATED', `${newServer}:${newPort}`, true);
    setStatusNotification(`Dynamic game server migrated to ${newServer}:${newPort}`);
  };

  const handleConfirmJoin = () => {
    setShowJoinModal(false);
    setRoom({
      roomId: joinInputRoom,
      playerId: joinInputPlayer,
      sessionId: 'SESS_' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      server: '203.0.113.10',
      port: 1946,
      status: 'CONNECTED',
      isHost: false,
      hostPlayerId: 'PLAYER001',
      players: ['PLAYER001', joinInputPlayer]
    });
    setPlayerId(joinInputPlayer);
    setRoomId(joinInputRoom);
    addLog(`POST /rooms/${joinInputRoom}/join`, 'SUCCESS', true);
    setStatusNotification(`Joined room ${joinInputRoom}`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center p-4 md:p-6 w-full max-w-7xl mx-auto">
      {/* Device Frame */}
      <div className="relative mx-auto w-[360px] sm:w-[390px] h-[780px] bg-[#030712] rounded-[48px] p-3 shadow-2xl border-4 border-cyan-500/20 shadow-cyan-950/30 flex flex-col shrink-0 select-none">
        
        {/* Hardware Notch / Island */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-900/60 border border-cyan-500/40"></div>
        </div>

        {/* Screen Canvas */}
        <div className="relative w-full h-full bg-[#0a0e17] rounded-[38px] overflow-hidden flex flex-col border border-cyan-900/30 font-sans">
          
          {/* Android Status Bar */}
          <div className="h-10 px-6 pt-2 flex items-center justify-between text-xs text-slate-400 font-mono z-40 bg-[#0a0e17]">
            <span>17:42</span>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-cyan-400 font-semibold">5G</span>
              <Wifi className="w-3.5 h-3.5 text-slate-300" />
              <BatteryMedium className="w-4 h-4 text-slate-300" />
            </div>
          </div>

          {/* OVERLAY MODE: If enabled, shows game in background + floating bubble */}
          {overlayActive ? (
            <div className="relative flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4 flex flex-col justify-between overflow-hidden">
              {/* Simulated Game in Background */}
              <div className="absolute inset-0 opacity-20 pointer-events-none flex flex-col items-center justify-center space-y-4">
                <div className="text-4xl font-black text-white tracking-widest">MULTIPLAYER ARENA</div>
                <div className="text-xs text-cyan-400 font-mono">Running Game Client v2.4.1</div>
                <div className="w-48 h-48 border-2 border-dashed border-cyan-500/30 rounded-xl flex items-center justify-center">
                  <span className="text-xs text-slate-500">3D Match Canvas Active</span>
                </div>
              </div>

              {/* Top Banner indicating Overlay mode */}
              <div className="relative z-10 flex items-center justify-between bg-cyan-950/80 backdrop-blur-md px-3 py-2 rounded-lg border border-cyan-500/30 text-xs">
                <div className="flex items-center space-x-2">
                  <Layers className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span className="text-cyan-300 font-mono font-bold text-[11px]">SYSTEM OVERLAY MODE</span>
                </div>
                <button
                  onClick={() => setOverlayActive(false)}
                  className="px-2 py-0.5 bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 rounded text-[10px] font-bold"
                >
                  FULLSCREEN
                </button>
              </div>

              <div className="relative z-10 text-[11px] text-slate-400 font-mono text-center">
                Drag the circular <strong className="text-cyan-400 font-bold">W</strong> bubble anywhere. Tap to expand.
              </div>

              {/* Floating Draggable Bubble & Panel */}
              <div 
                style={{ left: `${bubblePos.x}px`, top: `${bubblePos.y}px` }}
                className="absolute z-50 cursor-grab active:cursor-grabbing transition-transform"
                onMouseDown={(e) => {
                  setIsDragging(true);
                  setDragStart({ x: e.clientX - bubblePos.x, y: e.clientY - bubblePos.y });
                }}
              >
                {!bubbleExpanded ? (
                  // Minimized W Bubble
                  <div 
                    onClick={() => {
                      if (!isDragging) setBubbleExpanded(true);
                    }}
                    className="w-14 h-14 rounded-full bg-[#1b2438] border-2 border-cyan-400 shadow-xl shadow-cyan-500/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all relative group"
                  >
                    <span className="text-cyan-400 font-black font-mono text-xl tracking-tighter">W</span>
                    {room.isHost && (
                      <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#0a0e17] shadow-sm"></span>
                    )}
                  </div>
                ) : (
                  // Expanded Floating Compact Panel
                  <div className="w-[270px] bg-[#121826] border border-cyan-500/80 rounded-2xl shadow-2xl p-3.5 text-slate-200 font-mono space-y-2.5 backdrop-blur-md">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
                      <span className="text-xs font-black text-cyan-400 tracking-wider">WELYD TEST PANEL</span>
                      <div className="flex items-center space-x-1.5">
                        <button 
                          onClick={() => setBubbleExpanded(false)}
                          className="w-5 h-5 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-[10px] text-slate-300"
                        >
                          ─
                        </button>
                        <button 
                          onClick={() => setOverlayActive(false)}
                          className="w-5 h-5 rounded-full bg-rose-950/60 hover:bg-rose-900 flex items-center justify-center text-[10px] text-rose-400"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">ROOM</span>
                        <span className="text-cyan-400 font-bold">{room.roomId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">SESSION</span>
                        <span className="text-slate-200 font-bold">{room.sessionId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">SERVER</span>
                        <span className="text-slate-200 font-bold">{room.server}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">PORT</span>
                        <span className="text-cyan-400 font-bold">{room.port}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">STATUS</span>
                        <span className="text-emerald-400 font-bold">{room.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">HOST</span>
                        <span className={`font-bold ${room.isHost ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {room.isHost ? 'YES (OWNER)' : 'NO'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-700/60 grid grid-cols-3 gap-1 text-[10px]">
                      <button
                        onClick={() => handleRefresh()}
                        className="py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold rounded border border-cyan-500/30"
                      >
                        REFRESH
                      </button>
                      <button
                        onClick={() => room.isHost ? handleReleaseHost() : handleClaimHost()}
                        className={`py-1.5 font-bold rounded border ${
                          room.isHost 
                            ? 'bg-amber-950/60 hover:bg-amber-900 text-amber-300 border-amber-500/40' 
                            : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {room.isHost ? 'RELEASE' : 'CLAIM'}
                      </button>
                      <button
                        onClick={handleLeaveRoom}
                        className="py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 font-bold rounded border border-rose-500/40"
                      >
                        LEAVE
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // FULLSCREEN SCREENS: Dashboard, Settings, Debug
            <div className="flex-1 flex flex-col overflow-y-auto px-5 py-3">
              
              {/* Screen: DASHBOARD */}
              {deviceScreen === 'dashboard' && (
                <div className="space-y-4">
                  {/* App Header */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <h1 className="text-xl font-black text-cyan-400 tracking-widest font-mono">WELYD</h1>
                      <div className="text-[10px] font-bold text-slate-400 tracking-widest">GAME TEST PANEL</div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {demoMode && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/40 text-[9px] font-mono font-bold text-amber-400">
                          DEMO
                        </span>
                      )}
                      <button 
                        onClick={() => setOverlayActive(true)}
                        title="Enable Floating Bubble Overlay"
                        className="p-1.5 text-cyan-400 hover:bg-cyan-950/50 rounded-lg"
                      >
                        <Layers className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeviceScreen('debug')}
                        title="Connection Log"
                        className="p-1.5 text-cyan-400 hover:bg-cyan-950/50 rounded-lg"
                      >
                        <Bug className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeviceScreen('settings')}
                        title="Settings"
                        className="p-1.5 text-slate-300 hover:bg-slate-800 rounded-lg"
                      >
                        <SettingsIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Server Migration Alert Banner */}
                  {hasEndpointChanged && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-between text-xs font-mono">
                      <div>
                        <div className="text-emerald-400 font-bold text-[11px]">SERVER MIGRATED</div>
                        <div className="text-slate-300 text-[10px]">{room.server}:{room.port}</div>
                      </div>
                      <button
                        onClick={() => setHasEndpointChanged(false)}
                        className="px-2 py-1 bg-emerald-900 hover:bg-emerald-800 text-emerald-200 rounded text-[10px] font-bold"
                      >
                        ACK
                      </button>
                    </div>
                  )}

                  {/* Main Gaming Status Display Card */}
                  <div className="bg-[#121826] border border-[#26354e] rounded-2xl p-4 space-y-3.5 shadow-lg">
                    {/* Status Header with Pulsing Dot */}
                    <div className="flex items-center justify-between border-b border-[#26354e] pb-3">
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 tracking-wider font-mono">STATUS</div>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                          </span>
                          <span className="text-sm font-black font-mono text-emerald-400 tracking-wider">
                            ● {room.status}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{apiUrl.replace('http://', '').replace('https://', '')}</span>
                    </div>

                    {/* Metric 2-Column Grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <div>
                        <div className="text-[10px] font-bold text-slate-500">ROOM</div>
                        <div className="text-cyan-400 font-bold text-sm tracking-wider">{room.roomId}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-500">PLAYER</div>
                        <div className="text-slate-200 font-bold text-sm truncate">{playerId}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <div>
                        <div className="text-[10px] font-bold text-slate-500">SESSION</div>
                        <div className="text-slate-200 font-bold text-sm">{room.sessionId}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-500">HOST STATUS</div>
                        <div className={`font-bold text-sm ${room.isHost ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {room.isHost ? 'HOST (OWNER)' : 'NOT HOST'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-1">
                      <div>
                        <div className="text-[10px] font-bold text-slate-500">GAME SERVER</div>
                        <div className="text-slate-200 font-bold text-sm">{room.server}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-500">PORT</div>
                        <div className="text-cyan-400 font-bold text-sm">{room.port}</div>
                      </div>
                    </div>
                  </div>

                  {/* Operations Buttons */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-slate-500 font-mono tracking-wider">
                      AUTHORITATIVE OPERATIONS
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleRefresh()}
                        className="h-10 px-3 bg-[#1b2438] hover:bg-[#25324d] border border-cyan-500/30 text-cyan-400 rounded-xl text-xs font-bold font-mono flex items-center justify-center space-x-2 transition-colors active:scale-95"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>REFRESH</span>
                      </button>

                      <button
                        onClick={() => setShowJoinModal(true)}
                        className="h-10 px-3 bg-[#1b2438] hover:bg-[#25324d] border border-cyan-500/30 text-cyan-400 rounded-xl text-xs font-bold font-mono flex items-center justify-center space-x-2 transition-colors active:scale-95"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>JOIN ROOM</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleClaimHost}
                        disabled={room.isHost}
                        className={`h-10 px-3 rounded-xl text-xs font-bold font-mono flex items-center justify-center space-x-2 transition-colors active:scale-95 ${
                          room.isHost
                            ? 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
                            : 'bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/50 text-emerald-400'
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>CLAIM HOST</span>
                      </button>

                      <button
                        onClick={handleReleaseHost}
                        disabled={!room.isHost}
                        className={`h-10 px-3 rounded-xl text-xs font-bold font-mono flex items-center justify-center space-x-2 transition-colors active:scale-95 ${
                          !room.isHost
                            ? 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
                            : 'bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/50 text-amber-400'
                        }`}
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        <span>RELEASE HOST</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleLeaveRoom}
                        className="h-10 px-3 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/50 text-rose-400 rounded-xl text-xs font-bold font-mono flex items-center justify-center space-x-2 transition-colors active:scale-95"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>LEAVE ROOM</span>
                      </button>

                      <button
                        onClick={handleTestConnection}
                        className="h-10 px-3 bg-[#1b2438] hover:bg-[#25324d] border border-cyan-500/30 text-cyan-400 rounded-xl text-xs font-bold font-mono flex items-center justify-center space-x-2 transition-colors active:scale-95"
                      >
                        <Activity className="w-3.5 h-3.5" />
                        <span>TEST CONN</span>
                      </button>
                    </div>

                    {/* Test feature to trigger dynamic migration */}
                    <button
                      onClick={handleSimulateMigration}
                      className="w-full h-9 bg-cyan-950/30 hover:bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 rounded-xl text-[11px] font-mono font-bold flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <RotateCw className="w-3 h-3 text-cyan-400" />
                      <span>SIMULATE SERVER ROTATION</span>
                    </button>
                  </div>

                  {/* Toast Notification */}
                  {statusNotification && (
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center justify-between">
                      <span className="truncate">{statusNotification}</span>
                      <button onClick={() => setStatusNotification(null)} className="text-slate-400 hover:text-white ml-2">✕</button>
                    </div>
                  )}
                </div>
              )}

              {/* Screen: SETTINGS */}
              {deviceScreen === 'settings' && (
                <div className="space-y-4 text-xs font-mono text-slate-300">
                  <div className="flex items-center space-x-2 pb-2 border-b border-[#26354e]">
                    <button onClick={() => setDeviceScreen('dashboard')} className="p-1 hover:text-cyan-400">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-sm text-white">SETTINGS</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-1">API BASE URL</label>
                      <input
                        type="text"
                        value={apiUrl}
                        onChange={(e) => setApiUrl(e.target.value)}
                        className="w-full bg-[#121826] border border-[#26354e] rounded-lg px-3 py-2 text-white text-xs focus:border-cyan-400 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold mb-1">PLAYER ID</label>
                        <input
                          type="text"
                          value={playerId}
                          onChange={(e) => setPlayerId(e.target.value)}
                          className="w-full bg-[#121826] border border-[#26354e] rounded-lg px-3 py-2 text-white text-xs focus:border-cyan-400 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold mb-1">ROOM ID</label>
                        <input
                          type="text"
                          value={roomId}
                          onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                          className="w-full bg-[#121826] border border-[#26354e] rounded-lg px-3 py-2 text-white text-xs focus:border-cyan-400 outline-none"
                        />
                      </div>
                    </div>

                    <div className="bg-[#121826] border border-[#26354e] rounded-xl p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white text-xs">Local Demo Mode</div>
                          <div className="text-[10px] text-slate-500">Test UI locally without server</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={demoMode}
                          onChange={(e) => setDemoMode(e.target.checked)}
                          className="w-4 h-4 accent-cyan-400 rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between border-t border-[#26354e] pt-2">
                        <div>
                          <div className="font-bold text-white text-xs">Floating Bubble</div>
                          <div className="text-[10px] text-slate-500">Foreground overlay service</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={overlayActive}
                          onChange={(e) => setOverlayActive(e.target.checked)}
                          className="w-4 h-4 accent-cyan-400 rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between border-t border-[#26354e] pt-2">
                        <div>
                          <div className="font-bold text-white text-xs">Auto Refresh</div>
                          <div className="text-[10px] text-slate-500">Poll room state periodically</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={autoRefresh}
                          onChange={(e) => setAutoRefresh(e.target.checked)}
                          className="w-4 h-4 accent-cyan-400 rounded"
                        />
                      </div>

                      {autoRefresh && (
                        <div className="pt-2 border-t border-[#26354e]">
                          <div className="text-[10px] text-slate-400 mb-1.5">Interval:</div>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[1, 3, 5, 10].map(s => (
                              <button
                                key={s}
                                onClick={() => setRefreshInterval(s)}
                                className={`py-1 text-center rounded border text-xs font-bold ${
                                  refreshInterval === s 
                                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' 
                                    : 'bg-slate-800 border-slate-700 text-slate-400'
                                }`}
                              >
                                {s}s
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setDeviceScreen('dashboard');
                        setStatusNotification('Settings saved in DataStore');
                      }}
                      className="w-full h-10 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl text-xs"
                    >
                      SAVE & RETURN
                    </button>
                  </div>
                </div>
              )}

              {/* Screen: DEBUG / CONNECTION LOG */}
              {deviceScreen === 'debug' && (
                <div className="space-y-3 flex-1 flex flex-col font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#26354e]">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => setDeviceScreen('dashboard')} className="p-1 hover:text-cyan-400">
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <span className="font-bold text-sm text-white">CONNECTION LOG</span>
                    </div>
                    <button
                      onClick={() => setLogs([])}
                      className="text-[10px] text-rose-400 hover:text-rose-300 font-bold"
                    >
                      CLEAR
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="bg-[#121826] border border-[#26354e] rounded-lg p-2 text-[11px] space-y-0.5"
                      >
                        <div className="flex justify-between text-slate-500 text-[10px]">
                          <span>{log.time}</span>
                          <span className={log.isSuccess ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {log.isSuccess ? 'SUCCESS' : 'FAILED'}
                          </span>
                        </div>
                        <div className="text-cyan-300 font-semibold">{log.event}</div>
                        <div className="text-slate-300 text-[10px]">{log.result}</div>
                      </div>
                    ))}
                    {logs.length === 0 && (
                      <div className="text-center text-slate-500 py-12">No connection events logged yet</div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Android Navigation Bar */}
          <div className="h-6 flex items-center justify-center bg-[#0a0e17] z-40">
            <div className="w-28 h-1 bg-slate-600 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Control & Testing Sidebar */}
      <div className="flex-1 max-w-xl space-y-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Interactive Android Simulator</h2>
              <p className="text-xs text-slate-400">Experience the native Android UI, floating overlay, and authoritative backend rules</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <button
              onClick={() => {
                setOverlayActive(!overlayActive);
                if (!overlayActive) setBubbleExpanded(false);
              }}
              className={`p-3 rounded-xl font-mono font-bold flex items-center justify-center space-x-2 border transition-all ${
                overlayActive 
                  ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950' 
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{overlayActive ? 'Exit Floating Bubble' : 'Test Floating Bubble (W)'}</span>
            </button>

            <button
              onClick={handleSimulateMigration}
              className="p-3 rounded-xl font-mono font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center justify-center space-x-2"
            >
              <RotateCw className="w-4 h-4 text-cyan-400" />
              <span>Simulate Session Change</span>
            </button>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2 text-xs text-slate-300 font-mono">
            <div className="text-cyan-400 font-bold flex items-center space-x-1.5">
              <Shield className="w-4 h-4" />
              <span>AUTHORITATIVE HOST RULE TEST:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              In this test room (<strong className="text-white">ABC123</strong>), player <strong className="text-cyan-300">PLAYER001</strong> is initially assigned as host on the backend.
              When current player (<strong className="text-amber-300">{playerId}</strong>) presses <strong>CLAIM HOST</strong>, the backend authoritatively rejects the claim with <code className="text-rose-400">ROOM_ALREADY_HAS_HOST</code>.
            </p>
            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={() => {
                  setPlayerId('PLAYER001');
                  setStatusNotification('Switched identity to PLAYER001');
                }}
                className="px-2.5 py-1 bg-cyan-900/40 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 rounded text-[11px] font-bold"
              >
                Switch to PLAYER001 (Owner)
              </button>
              <button
                onClick={() => {
                  setPlayerId('PLAYER_4821');
                  setStatusNotification('Switched identity to PLAYER_4821');
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 rounded text-[11px] font-bold"
              >
                Switch to PLAYER_4821 (Guest)
              </button>
            </div>
          </div>
        </div>

        {/* Feature Highlights Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur space-y-3 text-xs">
          <h3 className="font-bold text-white text-sm">Android Architecture Implemented</h3>
          <ul className="space-y-2 text-slate-400 font-mono text-[11px]">
            <li className="flex items-start space-x-2">
              <span className="text-cyan-400">✔</span>
              <span><strong>Native Kotlin + Jetpack Compose</strong> Material 3 dark gaming interface</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-cyan-400">✔</span>
              <span><strong>Foreground Service Overlay</strong> (WindowManager + SYSTEM_ALERT_WINDOW + SpecialUse type)</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-cyan-400">✔</span>
              <span><strong>Dynamic Session Discovery</strong> with SessionManager observing server IP & port changes</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-cyan-400">✔</span>
              <span><strong>FastAPI Test Backend</strong> with strict authoritative host ownership check</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-cyan-400">✔</span>
              <span><strong>Jetpack Preferences DataStore</strong> for offline settings & refresh interval</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Modal for Join Room */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121826] border border-cyan-500/60 rounded-2xl p-6 max-w-sm w-full space-y-4 font-mono text-xs">
            <h3 className="text-sm font-bold text-cyan-400">JOIN GAME ROOM</h3>
            <p className="text-slate-400 text-[11px]">Enter room code and player identification:</p>
            
            <div className="space-y-2">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">ROOM ID</label>
                <input
                  type="text"
                  value={joinInputRoom}
                  onChange={(e) => setJoinInputRoom(e.target.value.toUpperCase())}
                  className="w-full bg-[#1b2438] border border-[#26354e] rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">PLAYER ID</label>
                <input
                  type="text"
                  value={joinInputPlayer}
                  onChange={(e) => setJoinInputPlayer(e.target.value)}
                  className="w-full bg-[#1b2438] border border-[#26354e] rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmJoin}
                className="flex-1 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-lg"
              >
                JOIN ROOM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

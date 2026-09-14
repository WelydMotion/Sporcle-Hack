# WELYD Game Test Panel - Authoritative Test Backend

Minimal, high-performance Python FastAPI backend for the WELYD Game Test Panel Android application.

## Prerequisites
- Python 3.8+
- pip

## Quick Start

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the server**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

The server will start at `http://0.0.0.0:8000`.
Interactive Swagger API documentation is available at:
`http://localhost:8000/docs`

---

## Android Device Connection Guide

- **Android Emulator**:
  Set the API Base URL in the WELYD app Settings to:
  `http://10.0.2.2:8000`
  (Android emulator routes `10.0.2.2` to your host machine's `localhost`).

- **Physical Android Phone**:
  Connect your phone to the same Wi-Fi network as your computer.
  Find your computer's local IP address (`ipconfig` on Windows or `ifconfig` / `ip a` on macOS/Linux).
  Example:
  `http://192.168.1.100:8000`
  Enter this in the Android app Settings.

- **Cloud/Reverse Proxy (ngrok / Cloudflare Tunnel)**:
  If you run ngrok: `ngrok http 8000`
  Copy the HTTPS forwarding address (e.g., `https://xyz.ngrok-free.app`) into the Android app.

---

## API Endpoints & Contract

### 1. Health Check
`GET /health`
```bash
curl -X GET http://localhost:8000/health
```
**Response:**
```json
{
  "status": "ok",
  "service": "WELYD Test Backend",
  "version": "1.0.0",
  "timestamp": 1718000000
}
```

### 2. Get Room State
`GET /rooms/{roomId}?playerId=PLAYER_4821`
```bash
curl -X GET "http://localhost:8000/rooms/ABC123?playerId=PLAYER_4821"
```
**Response:**
```json
{
  "roomId": "ABC123",
  "playerId": "PLAYER_4821",
  "sessionId": "8F92A1",
  "server": "203.0.113.10",
  "port": 1946,
  "status": "CONNECTED",
  "isHost": false,
  "hostPlayerId": "PLAYER001",
  "players": ["PLAYER001", "PLAYER002"]
}
```

### 3. Join Room
`POST /rooms/{roomId}/join`
```bash
curl -X POST http://localhost:8000/rooms/ABC123/join \
  -H "Content-Type: application/json" \
  -d '{"playerId": "PLAYER_4821"}'
```

### 4. Claim Host (Authoritative)
`POST /rooms/{roomId}/claim-host`
```bash
curl -X POST http://localhost:8000/rooms/ABC123/claim-host \
  -H "Content-Type: application/json" \
  -d '{"playerId": "PLAYER_4821"}'
```
- **If Room already has host (e.g. PLAYER001):**
```json
{
  "success": false,
  "roomId": "ABC123",
  "playerId": "PLAYER_4821",
  "isHost": false,
  "error": "ROOM_ALREADY_HAS_HOST",
  "message": "Room already has an active host (PLAYER001). Host must release role first."
}
```
- **If host claimed successfully:**
```json
{
  "success": true,
  "roomId": "ABC123",
  "playerId": "PLAYER_4821",
  "isHost": true,
  "message": "Player PLAYER_4821 successfully claimed host role on room ABC123."
}
```

### 5. Release Host
`POST /rooms/{roomId}/release-host`
```bash
curl -X POST http://localhost:8000/rooms/ABC123/release-host \
  -H "Content-Type: application/json" \
  -d '{"playerId": "PLAYER001"}'
```

### 6. Leave Room
`POST /rooms/{roomId}/leave`
```bash
curl -X POST http://localhost:8000/rooms/ABC123/leave \
  -H "Content-Type: application/json" \
  -d '{"playerId": "PLAYER_4821"}'
```

### 7. Get Session Info
`GET /rooms/{roomId}/session`
```bash
curl -X GET http://localhost:8000/rooms/ABC123/session
```

### 8. Simulate Dynamic Server Migration
`POST /rooms/{roomId}/rotate-session`
```bash
curl -X POST http://localhost:8000/rooms/ABC123/rotate-session
```
Migrates server from `203.0.113.10:1946` to `203.0.113.20:1901` to test the Android auto-refresh and session discovery live.

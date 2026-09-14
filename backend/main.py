"""
WELYD Game Test Panel - Authoritative Test Backend
Framework: FastAPI (Python 3.8+)

Provides test multiplayer game room orchestration, dynamic game session server assignment,
and authoritative host ownership management.
"""

import time
import uuid
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="WELYD Game Test Panel API",
    description="Authoritative test backend for game session discovery & host assignment",
    version="1.0.0"
)

# Enable CORS for web emulator and network clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Data Models
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class PlayerRequest(BaseModel):
    playerId: str = Field(..., example="PLAYER_4821")

class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "WELYD Test Backend"
    version: str = "1.0.0"
    timestamp: int

class RoomResponse(BaseModel):
    roomId: str
    playerId: str
    sessionId: str
    server: str
    port: int
    status: str
    isHost: bool
    hostPlayerId: Optional[str] = None
    players: List[str] = []

class ClaimHostResponse(BaseModel):
    success: bool
    roomId: Optional[str] = None
    playerId: Optional[str] = None
    isHost: bool = False
    error: Optional[str] = None
    message: Optional[str] = None

class ActionResponse(BaseModel):
    success: bool
    roomId: Optional[str] = None
    playerId: Optional[str] = None
    error: Optional[str] = None
    message: Optional[str] = None

class GameSessionResponse(BaseModel):
    sessionId: str
    server: str
    port: int
    status: str
    region: str = "us-east-1"
    tickRate: int = 60

class PlayerResponse(BaseModel):
    playerId: str
    displayName: str
    isOnline: bool
    currentRoomId: Optional[str] = None


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# In-Memory Database (Thread-safe dict for test env)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ROOM_STORE: Dict[str, dict] = {
    "ABC123": {
        "roomId": "ABC123",
        "sessionId": "8F92A1",
        "server": "203.0.113.10",
        "port": 1946,
        "status": "CONNECTED",
        "hostPlayerId": "PLAYER001",
        "players": ["PLAYER001", "PLAYER002"]
    }
}

AVAILABLE_GAME_SERVERS = [
    {"server": "203.0.113.10", "port": 1946},
    {"server": "203.0.113.20", "port": 1901},
    {"server": "203.0.113.35", "port": 27015},
    {"server": "198.51.100.42", "port": 7777}
]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Endpoints
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@app.get("/health", response_model=HealthResponse)
def get_health():
    """Health check endpoint used by [TEST CONNECTION] button."""
    return HealthResponse(
        status="ok",
        service="WELYD Test Backend",
        version="1.0.0",
        timestamp=int(time.time())
    )


@app.get("/rooms/{room_id}")
def get_room(room_id: str, playerId: Optional[str] = None):
    """
    Returns the authoritative room state, dynamic game server endpoint,
    and host ownership status for the requesting player.
    """
    room_id = room_id.upper()
    if room_id not in ROOM_STORE:
        # Auto-create room for test convenience if not yet existing
        server_choice = AVAILABLE_GAME_SERVERS[0]
        ROOM_STORE[room_id] = {
            "roomId": room_id,
            "sessionId": "SESS_" + uuid.uuid4().hex[:6].upper(),
            "server": server_choice["server"],
            "port": server_choice["port"],
            "status": "CONNECTED",
            "hostPlayerId": None,
            "players": [playerId] if playerId else []
        }

    room = ROOM_STORE[room_id]
    target_player = playerId or (room["players"][0] if room["players"] else "PLAYER_UNKNOWN")
    is_host = (room["hostPlayerId"] == target_player) and (room["hostPlayerId"] is not None)

    return {
        "roomId": room["roomId"],
        "playerId": target_player,
        "sessionId": room["sessionId"],
        "server": room["server"],
        "port": room["port"],
        "status": room["status"],
        "isHost": is_host,
        "hostPlayerId": room["hostPlayerId"],
        "players": room["players"]
    }


@app.post("/rooms/{room_id}/join")
def join_room(room_id: str, req: PlayerRequest):
    """Join a test game room."""
    room_id = room_id.upper()
    player_id = req.playerId.strip()

    if room_id not in ROOM_STORE:
        server_choice = AVAILABLE_GAME_SERVERS[0]
        ROOM_STORE[room_id] = {
            "roomId": room_id,
            "sessionId": "SESS_" + uuid.uuid4().hex[:6].upper(),
            "server": server_choice["server"],
            "port": server_choice["port"],
            "status": "CONNECTED",
            "hostPlayerId": player_id,  # First player becomes default host
            "players": [player_id]
        }
    else:
        room = ROOM_STORE[room_id]
        if player_id not in room["players"]:
            room["players"].append(player_id)
        if room["hostPlayerId"] is None:
            room["hostPlayerId"] = player_id

    room = ROOM_STORE[room_id]
    is_host = (room["hostPlayerId"] == player_id)

    return {
        "roomId": room["roomId"],
        "playerId": player_id,
        "sessionId": room["sessionId"],
        "server": room["server"],
        "port": room["port"],
        "status": "CONNECTED",
        "isHost": is_host,
        "hostPlayerId": room["hostPlayerId"],
        "players": room["players"]
    }


@app.post("/rooms/{room_id}/claim-host", response_model=ClaimHostResponse)
def claim_host(room_id: str, req: PlayerRequest):
    """
    Authoritative host assignment endpoint.
    The backend determines whether the host role can be granted.
    """
    room_id = room_id.upper()
    player_id = req.playerId.strip()

    if room_id not in ROOM_STORE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "error": "ROOM_NOT_FOUND", "message": f"Room {room_id} does not exist."}
        )

    room = ROOM_STORE[room_id]
    current_host = room.get("hostPlayerId")

    # If another player already owns the room
    if current_host and current_host != player_id:
        return ClaimHostResponse(
            success=False,
            roomId=room_id,
            playerId=player_id,
            isHost=False,
            error="ROOM_ALREADY_HAS_HOST",
            message=f"Room already has an active host ({current_host}). Host must release role first."
        )

    # Assign host ownership
    room["hostPlayerId"] = player_id
    if player_id not in room["players"]:
        room["players"].append(player_id)

    return ClaimHostResponse(
        success=True,
        roomId=room_id,
        playerId=player_id,
        isHost=True,
        message=f"Player {player_id} successfully claimed host role on room {room_id}."
    )


@app.post("/rooms/{room_id}/release-host", response_model=ActionResponse)
def release_host(room_id: str, req: PlayerRequest):
    """Releases the host role for the room if owned by the requesting player."""
    room_id = room_id.upper()
    player_id = req.playerId.strip()

    if room_id not in ROOM_STORE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "error": "ROOM_NOT_FOUND"}
        )

    room = ROOM_STORE[room_id]
    if room.get("hostPlayerId") == player_id:
        room["hostPlayerId"] = None
        return ActionResponse(
            success=True,
            roomId=room_id,
            playerId=player_id,
            message="Host role released. Room is now unhosted."
        )
    else:
        return ActionResponse(
            success=False,
            roomId=room_id,
            playerId=player_id,
            error="NOT_HOST",
            message="Player is not the current room host."
        )


@app.post("/rooms/{room_id}/leave", response_model=ActionResponse)
def leave_room(room_id: str, req: PlayerRequest):
    """Leaves the room. If player was host, releases host role."""
    room_id = room_id.upper()
    player_id = req.playerId.strip()

    if room_id in ROOM_STORE:
        room = ROOM_STORE[room_id]
        if player_id in room["players"]:
            room["players"].remove(player_id)
        if room.get("hostPlayerId") == player_id:
            room["hostPlayerId"] = None

    return ActionResponse(
        success=True,
        roomId=room_id,
        playerId=player_id,
        message=f"Player {player_id} left room {room_id}."
    )


@app.get("/rooms/{room_id}/session", response_model=GameSessionResponse)
def get_room_session(room_id: str):
    """Session discovery endpoint returning the active game server IP and port."""
    room_id = room_id.upper()
    if room_id not in ROOM_STORE:
        raise HTTPException(status_code=404, detail="Room not found")

    room = ROOM_STORE[room_id]
    return GameSessionResponse(
        sessionId=room["sessionId"],
        server=room["server"],
        port=room["port"],
        status=room["status"]
    )


@app.get("/players/{player_id}", response_model=PlayerResponse)
def get_player(player_id: str):
    """Returns player info and current room assignment."""
    current_room = None
    for rid, r in ROOM_STORE.items():
        if player_id in r["players"]:
            current_room = rid
            break

    return PlayerResponse(
        playerId=player_id,
        displayName=f"TestUser_{player_id[-4:] if len(player_id) >= 4 else player_id}",
        isOnline=True,
        currentRoomId=current_room
    )


@app.post("/rooms/{room_id}/rotate-session")
def rotate_session(room_id: str):
    """
    Test helper endpoint: migrates the room's dynamic game server
    to test dynamic session discovery in the Android app.
    """
    room_id = room_id.upper()
    if room_id not in ROOM_STORE:
        raise HTTPException(status_code=404, detail="Room not found")

    room = ROOM_STORE[room_id]
    current_server = room["server"]
    # Pick next server in list
    next_server = AVAILABLE_GAME_SERVERS[1] if current_server == AVAILABLE_GAME_SERVERS[0]["server"] else AVAILABLE_GAME_SERVERS[0]

    room["server"] = next_server["server"]
    room["port"] = next_server["port"]
    room["sessionId"] = "SESS_" + uuid.uuid4().hex[:6].upper()

    return {
        "message": "Session migrated",
        "roomId": room_id,
        "newSessionId": room["sessionId"],
        "newServer": room["server"],
        "newPort": room["port"]
    }

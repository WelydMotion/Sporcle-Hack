package com.welyd.gametestpanel.repository

import com.welyd.gametestpanel.model.ConnectionLogEntry
import com.welyd.gametestpanel.model.Room
import com.welyd.gametestpanel.network.ApiClient
import com.welyd.gametestpanel.settings.AppSettings
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID

/**
 * Authoritative Repository coordinating Room state, backend API requests,
 * local demo simulation, auto-refresh scheduler, and connection logs.
 */
class RoomRepository(
    private val apiClient: ApiClient,
    val sessionManager: SessionManager,
    private val repositoryScope: CoroutineScope = CoroutineScope(Dispatchers.Default)
) {

    private val _currentRoom = MutableStateFlow<Room>(
        Room(
            roomId = "ABC123",
            playerId = "PLAYER_4821",
            sessionId = "8F92A1",
            server = "203.0.113.10",
            port = 1946,
            status = "DISCONNECTED",
            isHost = false
        )
    )
    val currentRoom: StateFlow<Room> = _currentRoom.asStateFlow()

    private val _connectionLogs = MutableStateFlow<List<ConnectionLogEntry>>(emptyList())
    val connectionLogs: StateFlow<List<ConnectionLogEntry>> = _connectionLogs.asStateFlow()

    private val _isConnecting = MutableStateFlow(false)
    val isConnecting: StateFlow<Boolean> = _isConnecting.asStateFlow()

    private val _statusMessage = MutableStateFlow<String?>(null)
    val statusMessage: StateFlow<String?> = _statusMessage.asStateFlow()

    private var autoRefreshJob: Job? = null
    private var currentSettings: AppSettings? = null

    // Local Demo Mode State
    private var demoHostOwner: String? = null
    private var demoServerIndex = 0
    private val demoServers = listOf(
        Pair("203.0.113.10", 1946),
        Pair("203.0.113.20", 1901),
        Pair("203.0.113.35", 27015)
    )

    fun onSettingsChanged(settings: AppSettings) {
        this.currentSettings = settings
        apiClient.updateBaseUrl(settings.apiBaseUrl)

        // Sync room ID and player ID if current room unassigned
        val cur = _currentRoom.value
        _currentRoom.value = cur.copy(
            roomId = if (settings.demoMode) (if (cur.roomId == "ABC123") "TEST123" else cur.roomId) else settings.roomId,
            playerId = settings.playerId
        )

        // Handle auto-refresh configuration
        if (settings.autoRefresh) {
            startAutoRefresh(settings.refreshInterval, settings.roomId, settings.playerId, settings.demoMode)
        } else {
            stopAutoRefresh()
        }
    }

    suspend fun refreshRoom(roomId: String, playerId: String, isDemo: Boolean): Result<Room> {
        _isConnecting.value = true
        val timeStr = getCurrentTime()

        return try {
            if (isDemo) {
                delay(300) // Realistic simulated latency
                val prev = _currentRoom.value
                val updated = prev.copy(
                    roomId = roomId.ifEmpty { "TEST123" },
                    playerId = playerId.ifEmpty { "PLAYER001" },
                    status = "CONNECTED",
                    isHost = (demoHostOwner == (playerId.ifEmpty { "PLAYER001" }))
                )
                _currentRoom.value = updated
                sessionManager.updateFromRoom(updated)
                log(timeStr, "GET /rooms/$roomId", "SUCCESS (Demo)", true)
                _statusMessage.value = "Room state refreshed (Demo Mode)"
                Result.success(updated)
            } else {
                val result = apiClient.getRoom(roomId, playerId)
                if (result.isSuccess) {
                    val room = result.getOrThrow()
                    val previousServer = "${_currentRoom.value.server}:${_currentRoom.value.port}"
                    val newServer = "${room.server}:${room.port}"

                    _currentRoom.value = room
                    sessionManager.updateFromRoom(room)
                    log(timeStr, "GET /rooms/$roomId", "SUCCESS", true)

                    if (previousServer != ":" && previousServer != newServer) {
                        log(getCurrentTime(), "SESSION UPDATED", newServer, true)
                    }
                    _statusMessage.value = "Room synchronized with backend"
                    Result.success(room)
                } else {
                    val err = result.exceptionOrNull()?.message ?: "Unknown error"
                    log(timeStr, "GET /rooms/$roomId", "FAILED: $err", false)
                    _statusMessage.value = err
                    Result.failure(result.exceptionOrNull() ?: Exception(err))
                }
            }
        } finally {
            _isConnecting.value = false
        }
    }

    suspend fun joinRoom(roomId: String, playerId: String, isDemo: Boolean): Result<Room> {
        _isConnecting.value = true
        val timeStr = getCurrentTime()

        return try {
            if (isDemo) {
                delay(400)
                val newRoom = Room(
                    roomId = roomId,
                    playerId = playerId,
                    sessionId = "SESS_" + UUID.randomUUID().toString().take(6).uppercase(),
                    server = demoServers[demoServerIndex].first,
                    port = demoServers[demoServerIndex].second,
                    status = "CONNECTED",
                    isHost = (demoHostOwner == playerId)
                )
                _currentRoom.value = newRoom
                sessionManager.updateFromRoom(newRoom)
                log(timeStr, "POST /rooms/$roomId/join", "SUCCESS (Joined room)", true)
                _statusMessage.value = "Joined room $roomId"
                Result.success(newRoom)
            } else {
                val res = apiClient.joinRoom(roomId, playerId)
                if (res.isSuccess) {
                    val room = res.getOrThrow()
                    _currentRoom.value = room
                    sessionManager.updateFromRoom(room)
                    log(timeStr, "POST /rooms/$roomId/join", "SUCCESS", true)
                    _statusMessage.value = "Joined room $roomId"
                    Result.success(room)
                } else {
                    val err = res.exceptionOrNull()?.message ?: "Join failed"
                    log(timeStr, "POST /rooms/$roomId/join", "FAILED: $err", false)
                    _statusMessage.value = err
                    Result.failure(res.exceptionOrNull() ?: Exception(err))
                }
            }
        } finally {
            _isConnecting.value = false
        }
    }

    suspend fun claimHost(roomId: String, playerId: String, isDemo: Boolean): Result<Boolean> {
        val timeStr = getCurrentTime()

        return if (isDemo) {
            delay(350)
            if (demoHostOwner != null && demoHostOwner != playerId) {
                val err = "Room already has a host ($demoHostOwner)."
                log(timeStr, "CLAIM HOST", "FAILED: ROOM_ALREADY_HAS_HOST", false)
                _statusMessage.value = err
                Result.failure(Exception(err))
            } else {
                demoHostOwner = playerId
                val cur = _currentRoom.value
                val updated = cur.copy(isHost = true, hostPlayerId = playerId)
                _currentRoom.value = updated
                sessionManager.updateFromRoom(updated)
                log(timeStr, "CLAIM HOST", "SUCCESS (Host assigned to $playerId)", true)
                _statusMessage.value = "Host claimed successfully (Authoritative)"
                Result.success(true)
            }
        } else {
            val res = apiClient.claimHost(roomId, playerId)
            if (res.isSuccess) {
                val data = res.getOrThrow()
                if (data.success) {
                    val cur = _currentRoom.value
                    val updated = cur.copy(isHost = true, hostPlayerId = playerId)
                    _currentRoom.value = updated
                    sessionManager.updateFromRoom(updated)
                    log(timeStr, "CLAIM HOST", "SUCCESS", true)
                    _statusMessage.value = "Host ownership granted by backend"
                    Result.success(true)
                } else {
                    val errMsg = data.error ?: "Room already has a host."
                    log(timeStr, "CLAIM HOST", "FAILED: $errMsg", false)
                    _statusMessage.value = errMsg
                    Result.failure(Exception(errMsg))
                }
            } else {
                val err = res.exceptionOrNull()?.message ?: "Claim host rejected"
                log(timeStr, "CLAIM HOST", "FAILED: $err", false)
                _statusMessage.value = err
                Result.failure(res.exceptionOrNull() ?: Exception(err))
            }
        }
    }

    suspend fun releaseHost(roomId: String, playerId: String, isDemo: Boolean): Result<Boolean> {
        val timeStr = getCurrentTime()

        return if (isDemo) {
            delay(250)
            if (demoHostOwner == playerId) {
                demoHostOwner = null
            }
            val cur = _currentRoom.value
            val updated = cur.copy(isHost = false, hostPlayerId = null)
            _currentRoom.value = updated
            sessionManager.updateFromRoom(updated)
            log(timeStr, "RELEASE HOST", "SUCCESS (Host released)", true)
            _statusMessage.value = "Host role released"
            Result.success(true)
        } else {
            val res = apiClient.releaseHost(roomId, playerId)
            if (res.isSuccess) {
                val cur = _currentRoom.value
                val updated = cur.copy(isHost = false, hostPlayerId = null)
                _currentRoom.value = updated
                sessionManager.updateFromRoom(updated)
                log(timeStr, "RELEASE HOST", "SUCCESS", true)
                _statusMessage.value = "Host role released on backend"
                Result.success(true)
            } else {
                val err = res.exceptionOrNull()?.message ?: "Failed to release host"
                log(timeStr, "RELEASE HOST", "FAILED: $err", false)
                _statusMessage.value = err
                Result.failure(res.exceptionOrNull() ?: Exception(err))
            }
        }
    }

    suspend fun leaveRoom(roomId: String, playerId: String, isDemo: Boolean): Result<Boolean> {
        val timeStr = getCurrentTime()
        return if (isDemo) {
            if (demoHostOwner == playerId) demoHostOwner = null
            val updated = _currentRoom.value.copy(
                status = "DISCONNECTED",
                isHost = false,
                sessionId = "NONE",
                server = "0.0.0.0",
                port = 0
            )
            _currentRoom.value = updated
            sessionManager.clear()
            log(timeStr, "POST /rooms/$roomId/leave", "SUCCESS (Left room)", true)
            _statusMessage.value = "Disconnected from room $roomId"
            Result.success(true)
        } else {
            val res = apiClient.leaveRoom(roomId, playerId)
            val updated = _currentRoom.value.copy(
                status = "DISCONNECTED",
                isHost = false
            )
            _currentRoom.value = updated
            sessionManager.clear()
            log(timeStr, "POST /rooms/$roomId/leave", "SUCCESS", true)
            _statusMessage.value = "Left room $roomId"
            Result.success(true)
        }
    }

    suspend fun testConnection(isDemo: Boolean): Result<String> {
        val timeStr = getCurrentTime()
        return if (isDemo) {
            delay(200)
            log(timeStr, "GET /health", "SUCCESS 200 OK (Demo Backend Live)", true)
            _statusMessage.value = "Connection OK (Local Demo Engine)"
            Result.success("Demo backend active")
        } else {
            val res = apiClient.getHealth()
            if (res.isSuccess) {
                val data = res.getOrThrow()
                log(timeStr, "GET /health", "SUCCESS 200 OK (${data.service} v${data.version})", true)
                _statusMessage.value = "Connected to ${data.service}"
                Result.success(data.service)
            } else {
                val err = res.exceptionOrNull()?.message ?: "Health check failed"
                log(timeStr, "GET /health", "FAILED: $err", false)
                _statusMessage.value = err
                Result.failure(res.exceptionOrNull() ?: Exception(err))
            }
        }
    }

    fun triggerSimulatedSessionRotation() {
        // Rotates the demo game server to demonstrate dynamic session discovery
        demoServerIndex = (demoServerIndex + 1) % demoServers.size
        val nextPair = demoServers[demoServerIndex]
        val cur = _currentRoom.value
        val updated = cur.copy(
            server = nextPair.first,
            port = nextPair.second,
            sessionId = "SESS_" + UUID.randomUUID().toString().take(6).uppercase()
        )
        _currentRoom.value = updated
        sessionManager.updateFromRoom(updated)
        log(getCurrentTime(), "SESSION ROTATED", "${nextPair.first}:${nextPair.second}", true)
        _statusMessage.value = "Dynamic game server migrated to ${nextPair.first}:${nextPair.second}"
    }

    fun clearLogs() {
        _connectionLogs.value = emptyList()
    }

    fun dismissStatusMessage() {
        _statusMessage.value = null
    }

    private fun startAutoRefresh(intervalSeconds: Int, roomId: String, playerId: String, isDemo: Boolean) {
        autoRefreshJob?.cancel()
        autoRefreshJob = repositoryScope.launch {
            while (isActive) {
                delay(intervalSeconds * 1000L)
                refreshRoom(roomId, playerId, isDemo)
            }
        }
    }

    private fun stopAutoRefresh() {
        autoRefreshJob?.cancel()
        autoRefreshJob = null
    }

    private fun log(time: String, event: String, result: String, isSuccess: Boolean) {
        val entry = ConnectionLogEntry(
            id = UUID.randomUUID().toString(),
            time = time,
            event = event,
            result = result,
            isSuccess = isSuccess
        )
        _connectionLogs.value = listOf(entry) + _connectionLogs.value.take(49)
    }

    private fun getCurrentTime(): String {
        val sdf = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
        return sdf.format(Date())
    }
}

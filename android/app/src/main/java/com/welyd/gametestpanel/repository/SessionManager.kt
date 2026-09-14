package com.welyd.gametestpanel.repository

import com.welyd.gametestpanel.model.GameSession
import com.welyd.gametestpanel.model.Room
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Manages dynamic session discovery.
 * Never assumes static game server IP or port; observes transitions between dynamic game hosts.
 */
class SessionManager {

    private val _currentRoom = MutableStateFlow<Room?>(null)
    val currentRoom: StateFlow<Room?> = _currentRoom.asStateFlow()

    private val _gameSession = MutableStateFlow<GameSession?>(null)
    val gameSession: StateFlow<GameSession?> = _gameSession.asStateFlow()

    private val _lastServerEndpoint = MutableStateFlow<String>("")
    val lastServerEndpoint: StateFlow<String> = _lastServerEndpoint.asStateFlow()

    private val _hasEndpointChanged = MutableStateFlow<Boolean>(false)
    val hasEndpointChanged: StateFlow<Boolean> = _hasEndpointChanged.asStateFlow()

    fun updateFromRoom(room: Room) {
        val previous = _currentRoom.value
        val newEndpoint = "${room.server}:${room.port}"
        val oldEndpoint = if (previous != null) "${previous.server}:${previous.port}" else ""

        if (oldEndpoint.isNotEmpty() && oldEndpoint != ":" && oldEndpoint != newEndpoint) {
            _hasEndpointChanged.value = true
        }

        _lastServerEndpoint.value = newEndpoint
        _currentRoom.value = room
        _gameSession.value = GameSession(
            sessionId = room.sessionId,
            server = room.server,
            port = room.port,
            status = room.status
        )
    }

    fun updateSession(session: GameSession) {
        _gameSession.value = session
        val current = _currentRoom.value
        if (current != null) {
            val newEndpoint = "${session.server}:${session.port}"
            val oldEndpoint = "${current.server}:${current.port}"
            if (oldEndpoint != ":" && oldEndpoint != newEndpoint) {
                _hasEndpointChanged.value = true
            }
            _currentRoom.value = current.copy(
                sessionId = session.sessionId,
                server = session.server,
                port = session.port,
                status = session.status
            )
        }
    }

    fun clear() {
        _currentRoom.value = null
        _gameSession.value = null
        _hasEndpointChanged.value = false
        _lastServerEndpoint.value = ""
    }

    fun acknowledgeEndpointChange() {
        _hasEndpointChanged.value = false
    }
}

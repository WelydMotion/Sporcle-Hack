package com.welyd.gametestpanel.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Authoritative Room model returned by the test backend.
 */
@Serializable
data class Room(
    @SerialName("roomId")
    val roomId: String,

    @SerialName("playerId")
    val playerId: String = "",

    @SerialName("sessionId")
    val sessionId: String = "",

    @SerialName("server")
    val server: String = "",

    @SerialName("port")
    val port: Int = 0,

    @SerialName("status")
    val status: String = "DISCONNECTED",

    @SerialName("isHost")
    val isHost: Boolean = false,

    @SerialName("hostPlayerId")
    val hostPlayerId: String? = null,

    @SerialName("players")
    val players: List<String> = emptyList()
)

enum class RoomConnectionStatus {
    CONNECTED,
    CONNECTING,
    DISCONNECTED,
    ERROR
}

package com.welyd.gametestpanel.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ClaimHostRequest(
    @SerialName("playerId")
    val playerId: String
)

@Serializable
data class JoinRoomRequest(
    @SerialName("playerId")
    val playerId: String
)

@Serializable
data class LeaveRoomRequest(
    @SerialName("playerId")
    val playerId: String
)

@Serializable
data class ClaimHostResponse(
    @SerialName("success")
    val success: Boolean,

    @SerialName("roomId")
    val roomId: String? = null,

    @SerialName("playerId")
    val playerId: String? = null,

    @SerialName("isHost")
    val isHost: Boolean = false,

    @SerialName("error")
    val error: String? = null,

    @SerialName("message")
    val message: String? = null
)

@Serializable
data class ActionResponse(
    @SerialName("success")
    val success: Boolean,

    @SerialName("roomId")
    val roomId: String? = null,

    @SerialName("playerId")
    val playerId: String? = null,

    @SerialName("error")
    val error: String? = null,

    @SerialName("message")
    val message: String? = null
)

@Serializable
data class HealthResponse(
    @SerialName("status")
    val status: String,

    @SerialName("service")
    val service: String = "WELYD Test Backend",

    @SerialName("version")
    val version: String = "1.0.0",

    @SerialName("timestamp")
    val timestamp: Long = 0L
)

/**
 * Log entry model for Debug/Connection log
 */
data class ConnectionLogEntry(
    val id: String,
    val time: String,
    val event: String,
    val result: String,
    val isSuccess: Boolean = true
)

package com.welyd.gametestpanel.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Player(
    @SerialName("playerId")
    val playerId: String,

    @SerialName("displayName")
    val displayName: String = "",

    @SerialName("isOnline")
    val isOnline: Boolean = true,

    @SerialName("currentRoomId")
    val currentRoomId: String? = null
)

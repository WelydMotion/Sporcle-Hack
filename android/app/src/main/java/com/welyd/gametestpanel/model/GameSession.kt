package com.welyd.gametestpanel.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class GameSession(
    @SerialName("sessionId")
    val sessionId: String,

    @SerialName("server")
    val server: String,

    @SerialName("port")
    val port: Int,

    @SerialName("status")
    val status: String,

    @SerialName("region")
    val region: String = "us-east-1",

    @SerialName("tickRate")
    val tickRate: Int = 60
)

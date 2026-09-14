package com.welyd.gametestpanel.network

import com.welyd.gametestpanel.model.ActionResponse
import com.welyd.gametestpanel.model.ClaimHostResponse
import com.welyd.gametestpanel.model.GameSession
import com.welyd.gametestpanel.model.HealthResponse
import com.welyd.gametestpanel.model.Player
import com.welyd.gametestpanel.model.Room

/**
 * Interface representing the authoritative WELYD Test Backend API contract.
 */
interface ApiService {
    suspend fun getHealth(): Result<HealthResponse>
    suspend fun getRoom(roomId: String, playerId: String = ""): Result<Room>
    suspend fun joinRoom(roomId: String, playerId: String): Result<Room>
    suspend fun claimHost(roomId: String, playerId: String): Result<ClaimHostResponse>
    suspend fun releaseHost(roomId: String, playerId: String): Result<ActionResponse>
    suspend fun leaveRoom(roomId: String, playerId: String): Result<ActionResponse>
    suspend fun getSession(roomId: String): Result<GameSession>
    suspend fun getPlayer(playerId: String): Result<Player>
}

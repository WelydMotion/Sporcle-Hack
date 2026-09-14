package com.welyd.gametestpanel.network

import com.welyd.gametestpanel.model.ActionResponse
import com.welyd.gametestpanel.model.ClaimHostRequest
import com.welyd.gametestpanel.model.ClaimHostResponse
import com.welyd.gametestpanel.model.GameSession
import com.welyd.gametestpanel.model.HealthResponse
import com.welyd.gametestpanel.model.JoinRoomRequest
import com.welyd.gametestpanel.model.LeaveRoomRequest
import com.welyd.gametestpanel.model.Player
import com.welyd.gametestpanel.model.Room
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import java.io.IOException
import java.net.SocketTimeoutException
import java.net.UnknownHostException
import java.util.concurrent.TimeUnit

/**
 * Production-ready HTTPS ApiClient using OkHttp and Kotlinx Serialization.
 * Communicates strictly with user-controlled test endpoints.
 */
class ApiClient(
    private var baseUrl: String = "https://ij2s438eij.execute-api.us-east-1.amazonaws.com"
) : ApiService {

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        encodeDefaults = true
    }

    private val mediaTypeJson = "application/json; charset=utf-8".toMediaType()

    private val okHttpClient: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .writeTimeout(10, TimeUnit.SECONDS)
        .retryOnConnectionFailure(true)
        .build()

    fun updateBaseUrl(newUrl: String) {
        var trimmed = newUrl.trim()
        if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
            trimmed = "https://$trimmed"
        }
        if (trimmed.endsWith("/")) {
            trimmed = trimmed.dropLast(1)
        }
        this.baseUrl = trimmed
    }

    fun getBaseUrl(): String = baseUrl

    override suspend fun getHealth(): Result<HealthResponse> = withContext(Dispatchers.IO) {
        executeGet("/health")
    }

    override suspend fun getRoom(roomId: String, playerId: String): Result<Room> = withContext(Dispatchers.IO) {
        val query = if (playerId.isNotEmpty()) "?playerId=$playerId" else ""
        executeGet("/rooms/$roomId$query")
    }

    override suspend fun joinRoom(roomId: String, playerId: String): Result<Room> = withContext(Dispatchers.IO) {
        val payload = json.encodeToString(JoinRoomRequest(playerId = playerId))
        executePost("/rooms/$roomId/join", payload)
    }

    override suspend fun claimHost(roomId: String, playerId: String): Result<ClaimHostResponse> = withContext(Dispatchers.IO) {
        val payload = json.encodeToString(ClaimHostRequest(playerId = playerId))
        val url = "$baseUrl/rooms/$roomId/claim-host"
        val request = Request.Builder()
            .url(url)
            .post(payload.toRequestBody(mediaTypeJson))
            .header("Content-Type", "application/json")
            .header("Accept", "application/json")
            .build()

        try {
            val response = okHttpClient.newCall(request).execute()
            val body = response.body?.string().orEmpty()

            if (response.isSuccessful) {
                val parsed = json.decodeFromString<ClaimHostResponse>(body)
                Result.success(parsed)
            } else {
                // Parse structured backend error response if available
                val errorMsg = try {
                    val parsedError = json.decodeFromString<ClaimHostResponse>(body)
                    parsedError.error ?: parsedError.message ?: mapHttpStatusToMessage(response.code)
                } catch (e: Exception) {
                    mapHttpStatusToMessage(response.code)
                }
                Result.failure(ApiException(response.code, errorMsg))
            }
        } catch (e: Exception) {
            Result.failure(handleNetworkException(e))
        }
    }

    override suspend fun releaseHost(roomId: String, playerId: String): Result<ActionResponse> = withContext(Dispatchers.IO) {
        val payload = json.encodeToString(ClaimHostRequest(playerId = playerId))
        executePost("/rooms/$roomId/release-host", payload)
    }

    override suspend fun leaveRoom(roomId: String, playerId: String): Result<ActionResponse> = withContext(Dispatchers.IO) {
        val payload = json.encodeToString(LeaveRoomRequest(playerId = playerId))
        executePost("/rooms/$roomId/leave", payload)
    }

    override suspend fun getSession(roomId: String): Result<GameSession> = withContext(Dispatchers.IO) {
        executeGet("/rooms/$roomId/session")
    }

    override suspend fun getPlayer(playerId: String): Result<Player> = withContext(Dispatchers.IO) {
        executeGet("/players/$playerId")
    }

    // --- Private Helper Methods ---

    private inline fun <reified T> executeGet(endpoint: String): Result<T> {
        val url = "$baseUrl$endpoint"
        val request = Request.Builder()
            .url(url)
            .get()
            .header("Accept", "application/json")
            .build()

        return try {
            val response = okHttpClient.newCall(request).execute()
            handleResponse(response)
        } catch (e: Exception) {
            Result.failure(handleNetworkException(e))
        }
    }

    private inline fun <reified T> executePost(endpoint: String, jsonBody: String): Result<T> {
        val url = "$baseUrl$endpoint"
        val request = Request.Builder()
            .url(url)
            .post(jsonBody.toRequestBody(mediaTypeJson))
            .header("Content-Type", "application/json")
            .header("Accept", "application/json")
            .build()

        return try {
            val response = okHttpClient.newCall(request).execute()
            handleResponse(response)
        } catch (e: Exception) {
            Result.failure(handleNetworkException(e))
        }
    }

    private inline fun <reified T> handleResponse(response: Response): Result<T> {
        val body = response.body?.string().orEmpty()
        return if (response.isSuccessful) {
            try {
                val parsed = json.decodeFromString<T>(body)
                Result.success(parsed)
            } catch (e: Exception) {
                Result.failure(ApiException(response.code, "Failed to parse backend response: ${e.message}"))
            }
        } else {
            val userFriendlyMessage = mapHttpStatusToMessage(response.code, body)
            Result.failure(ApiException(response.code, userFriendlyMessage))
        }
    }

    private fun handleNetworkException(e: Exception): Throwable {
        return when (e) {
            is UnknownHostException -> ApiException(0, "No internet or invalid backend host URL")
            is SocketTimeoutException -> ApiException(408, "Server connection timed out")
            is IOException -> ApiException(0, "Network connection error: ${e.message}")
            else -> e
        }
    }

    private fun mapHttpStatusToMessage(code: Int, rawBody: String = ""): String {
        // Look for custom error string in raw body if JSON
        if (rawBody.contains("ROOM_ALREADY_HAS_HOST")) {
            return "Room already has a host assigned."
        }
        if (rawBody.contains("ROOM_NOT_FOUND")) {
            return "Room does not exist on this backend."
        }
        if (rawBody.contains("PLAYER_NOT_IN_ROOM")) {
            return "Player is not currently joined to this room."
        }
        if (rawBody.contains("NOT_HOST")) {
            return "Player is not the current room host."
        }

        return when (code) {
            400 -> "Invalid request parameters or payload."
            401 -> "Unauthorized test backend access."
            403 -> "Action forbidden by test backend rules."
            404 -> "Room or session not found on server."
            409 -> "Room already has a host."
            429 -> "Rate limit exceeded on test server."
            500 -> "Test backend encountered an internal server error."
            502 -> "Bad Gateway: unable to reach game server instance."
            503 -> "Game server test cluster temporarily unavailable."
            else -> "Server returned error code $code."
        }
    }
}

class ApiException(
    val statusCode: Int,
    override val message: String
) : Exception(message)

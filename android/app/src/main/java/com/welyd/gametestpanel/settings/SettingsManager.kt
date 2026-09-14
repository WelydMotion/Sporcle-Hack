package com.welyd.gametestpanel.settings

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "welyd_settings")

data class AppSettings(
    val apiBaseUrl: String,
    val playerId: String,
    val roomId: String,
    val enableFloatingBubble: Boolean,
    val demoMode: Boolean,
    val autoRefresh: Boolean,
    val refreshInterval: Int // 1, 3, 5, 10 seconds
)

class SettingsManager(private val context: Context) {

    companion object {
        val KEY_API_BASE_URL = stringPreferencesKey("api_base_url")
        val KEY_PLAYER_ID = stringPreferencesKey("player_id")
        val KEY_ROOM_ID = stringPreferencesKey("room_id")
        val KEY_ENABLE_BUBBLE = booleanPreferencesKey("enable_floating_bubble")
        val KEY_DEMO_MODE = booleanPreferencesKey("demo_mode")
        val KEY_AUTO_REFRESH = booleanPreferencesKey("auto_refresh")
        val KEY_REFRESH_INTERVAL = intPreferencesKey("refresh_interval")

        const val DEFAULT_BASE_URL = "http://10.0.2.2:8000"
        const val DEFAULT_PLAYER_ID = "PLAYER_4821"
        const val DEFAULT_ROOM_ID = "ABC123"
        const val DEFAULT_REFRESH_INTERVAL = 3
    }

    val settingsFlow: Flow<AppSettings> = context.dataStore.data.map { prefs ->
        AppSettings(
            apiBaseUrl = prefs[KEY_API_BASE_URL] ?: DEFAULT_BASE_URL,
            playerId = prefs[KEY_PLAYER_ID] ?: DEFAULT_PLAYER_ID,
            roomId = prefs[KEY_ROOM_ID] ?: DEFAULT_ROOM_ID,
            enableFloatingBubble = prefs[KEY_ENABLE_BUBBLE] ?: false,
            demoMode = prefs[KEY_DEMO_MODE] ?: true,
            autoRefresh = prefs[KEY_AUTO_REFRESH] ?: false,
            refreshInterval = prefs[KEY_REFRESH_INTERVAL] ?: DEFAULT_REFRESH_INTERVAL
        )
    }

    suspend fun updateApiBaseUrl(url: String) {
        context.dataStore.edit { it[KEY_API_BASE_URL] = url.trim() }
    }

    suspend fun updatePlayerId(playerId: String) {
        context.dataStore.edit { it[KEY_PLAYER_ID] = playerId.trim() }
    }

    suspend fun updateRoomId(roomId: String) {
        context.dataStore.edit { it[KEY_ROOM_ID] = roomId.trim().uppercase() }
    }

    suspend fun setFloatingBubbleEnabled(enabled: Boolean) {
        context.dataStore.edit { it[KEY_ENABLE_BUBBLE] = enabled }
    }

    suspend fun setDemoMode(enabled: Boolean) {
        context.dataStore.edit { it[KEY_DEMO_MODE] = enabled }
    }

    suspend fun setAutoRefresh(enabled: Boolean) {
        context.dataStore.edit { it[KEY_AUTO_REFRESH] = enabled }
    }

    suspend fun setRefreshInterval(seconds: Int) {
        context.dataStore.edit { it[KEY_REFRESH_INTERVAL] = seconds }
    }
}

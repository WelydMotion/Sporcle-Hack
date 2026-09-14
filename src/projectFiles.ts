/**
 * Registry of all Android and Backend source files for the in-app code viewer
 * and the one-click ZIP exporter.
 */
export interface SourceFile {
  path: string;
  name: string;
  category: 'android-kotlin' | 'android-config' | 'android-res' | 'backend';
  language: string;
  content: string;
}

export const PROJECT_FILES: SourceFile[] = [
  {
    path: 'android/settings.gradle.kts',
    name: 'settings.gradle.kts',
    category: 'android-config',
    language: 'kotlin',
    content: `rootProject.name = "WelydGameTestPanel"
include(":app")`
  },
  {
    path: 'android/build.gradle.kts',
    name: 'build.gradle.kts (Project)',
    category: 'android-config',
    language: 'kotlin',
    content: `// Top-level build file
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.kotlin.serialization) apply false
}`
  },
  {
    path: 'android/gradle.properties',
    name: 'gradle.properties',
    category: 'android-config',
    language: 'properties',
    content: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official`
  },
  {
    path: 'android/app/build.gradle.kts',
    name: 'app/build.gradle.kts',
    category: 'android-config',
    language: 'kotlin',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.serialization")
}

android {
    namespace = "com.welyd.gametestpanel"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.welyd.gametestpanel"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.14"
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.4")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.4")
    implementation("androidx.activity:activity-compose:1.9.1")

    // Jetpack Compose & Material 3
    implementation(platform("androidx.compose:compose-bom:2024.06.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")

    // Networking: OkHttp & Kotlinx Serialization
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.3")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")

    // Preferences DataStore
    implementation("androidx.datastore:datastore-preferences:1.1.1")

    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}`
  },
  {
    path: 'android/app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    category: 'android-config',
    language: 'xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.welyd.gametestpanel">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.WelydGameTestPanel"
        android:usesCleartextTraffic="true"
        tools:targetApi="34">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden"
            android:theme="@style/Theme.WelydGameTestPanel">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <service
            android:name=".service.FloatingPanelService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="specialUse">
            <property
                android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE"
                android:value="Overlay game session debugging and host control panel" />
        </service>
    </application>
</manifest>`
  },
  {
    path: 'android/app/src/main/java/com/welyd/gametestpanel/MainActivity.kt',
    name: 'MainActivity.kt',
    category: 'android-kotlin',
    language: 'kotlin',
    content: `package com.welyd.gametestpanel

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.Crossfade
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import com.welyd.gametestpanel.network.ApiClient
import com.welyd.gametestpanel.repository.RoomRepository
import com.welyd.gametestpanel.repository.SessionManager
import com.welyd.gametestpanel.service.FloatingPanelService
import com.welyd.gametestpanel.settings.AppSettings
import com.welyd.gametestpanel.settings.SettingsManager
import com.welyd.gametestpanel.ui.DashboardScreen
import com.welyd.gametestpanel.ui.DebugScreen
import com.welyd.gametestpanel.ui.SettingsScreen
import com.welyd.gametestpanel.ui.theme.DarkBackground
import com.welyd.gametestpanel.ui.theme.WelydGameTestPanelTheme
import kotlinx.coroutines.launch

enum class ScreenState { DASHBOARD, SETTINGS, DEBUG }

class MainActivity : ComponentActivity() {
    private lateinit var settingsManager: SettingsManager
    private lateinit var apiClient: ApiClient
    private lateinit var sessionManager: SessionManager
    private lateinit var repository: RoomRepository

    private val notificationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (!isGranted) {
            Toast.makeText(this, "Notification permission needed for overlay service", Toast.LENGTH_SHORT).show()
        }
    }

    private val overlayPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) {
        if (Settings.canDrawOverlays(this)) {
            startFloatingService()
        } else {
            Toast.makeText(this, "Overlay permission is required for floating bubble", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        settingsManager = SettingsManager(applicationContext)
        apiClient = ApiClient()
        sessionManager = SessionManager()
        repository = RoomRepository(apiClient, sessionManager)

        requestRequiredPermissions()

        setContent {
            WelydGameTestPanelTheme {
                val coroutineScope = rememberCoroutineScope()
                val settings by settingsManager.settingsFlow.collectAsState(
                    initial = AppSettings(
                        apiBaseUrl = SettingsManager.DEFAULT_BASE_URL,
                        playerId = SettingsManager.DEFAULT_PLAYER_ID,
                        roomId = SettingsManager.DEFAULT_ROOM_ID,
                        enableFloatingBubble = false,
                        demoMode = true,
                        autoRefresh = false,
                        refreshInterval = 3
                    )
                )

                LaunchedEffect(settings) {
                    repository.onSettingsChanged(settings)
                    if (settings.enableFloatingBubble) {
                        checkAndStartFloatingService()
                    } else {
                        stopFloatingService()
                    }
                }

                var currentScreen by remember { mutableStateOf(ScreenState.DASHBOARD) }

                Surface(modifier = Modifier.fillMaxSize(), color = DarkBackground) {
                    Crossfade(targetState = currentScreen, label = "screen") { screen ->
                        when (screen) {
                            ScreenState.DASHBOARD -> DashboardScreen(
                                repository = repository,
                                settings = settings,
                                onNavigateToSettings = { currentScreen = ScreenState.SETTINGS },
                                onNavigateToDebug = { currentScreen = ScreenState.DEBUG },
                                onOpenJoinDialog = { /* Open join modal */ }
                            )
                            ScreenState.SETTINGS -> SettingsScreen(
                                currentSettings = settings,
                                onNavigateBack = { currentScreen = ScreenState.DASHBOARD },
                                onSaveSettings = { apiUrl, pid, rid, bubble, demo, autoRef, intv ->
                                    coroutineScope.launch {
                                        settingsManager.updateApiBaseUrl(apiUrl)
                                        settingsManager.updatePlayerId(pid)
                                        settingsManager.updateRoomId(rid)
                                        settingsManager.setFloatingBubbleEnabled(bubble)
                                        settingsManager.setDemoMode(demo)
                                        settingsManager.setAutoRefresh(autoRef)
                                        settingsManager.setRefreshInterval(intv)
                                        currentScreen = ScreenState.DASHBOARD
                                    }
                                }
                            )
                            ScreenState.DEBUG -> DebugScreen(
                                repository = repository,
                                onNavigateBack = { currentScreen = ScreenState.DASHBOARD }
                            )
                        }
                    }
                }
            }
        }
    }

    private fun requestRequiredPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED
            ) {
                notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }

    private fun checkAndStartFloatingService() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:$packageName")
            )
            overlayPermissionLauncher.launch(intent)
        } else {
            startFloatingService()
        }
    }

    private fun startFloatingService() {
        val serviceIntent = Intent(this, FloatingPanelService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent)
        } else {
            startService(serviceIntent)
        }
    }

    private fun stopFloatingService() {
        val serviceIntent = Intent(this, FloatingPanelService::class.java).apply {
            action = FloatingPanelService.ACTION_STOP
        }
        startService(serviceIntent)
    }
}`
  },
  {
    path: 'android/app/src/main/java/com/welyd/gametestpanel/service/FloatingPanelService.kt',
    name: 'FloatingPanelService.kt',
    category: 'android-kotlin',
    language: 'kotlin',
    content: `package com.welyd.gametestpanel.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import androidx.compose.runtime.*
import androidx.compose.ui.platform.ComposeView
import androidx.core.app.NotificationCompat
import com.welyd.gametestpanel.MainActivity
import com.welyd.gametestpanel.R
import com.welyd.gametestpanel.network.ApiClient
import com.welyd.gametestpanel.repository.RoomRepository
import com.welyd.gametestpanel.repository.SessionManager
import com.welyd.gametestpanel.settings.SettingsManager
import com.welyd.gametestpanel.ui.FloatingBubbleView
import com.welyd.gametestpanel.ui.theme.WelydGameTestPanelTheme
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.first

class FloatingPanelService : Service() {
    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private var windowManager: WindowManager? = null
    private var overlayView: View? = null
    private var layoutParams: WindowManager.LayoutParams? = null

    private var isExpanded by mutableStateOf(false)
    private lateinit var settingsManager: SettingsManager
    private lateinit var repository: RoomRepository

    companion object {
        const val CHANNEL_ID = "welyd_floating_channel"
        const val NOTIFICATION_ID = 1946
        const val ACTION_STOP = "com.welyd.gametestpanel.STOP_OVERLAY"
        const val PREF_NAME = "welyd_bubble_position"
        const val KEY_POS_X = "bubble_x"
        const val KEY_POS_Y = "bubble_y"
    }

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        settingsManager = SettingsManager(applicationContext)

        val apiClient = ApiClient()
        val sessionManager = SessionManager()
        repository = RoomRepository(apiClient, sessionManager, serviceScope)

        serviceScope.launch {
            val settings = settingsManager.settingsFlow.first()
            repository.onSettingsChanged(settings)
        }

        createNotificationChannel()
        startForeground(NOTIFICATION_ID, buildNotification())
        createFloatingOverlay()
    }

    private fun createFloatingOverlay() {
        val prefs = getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        val initialX = prefs.getInt(KEY_POS_X, 60)
        val initialY = prefs.getInt(KEY_POS_Y, 200)

        val layoutType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            WindowManager.LayoutParams.TYPE_PHONE
        }

        layoutParams = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = initialX
            y = initialY
        }

        val composeView = ComposeView(this).apply {
            setContent {
                WelydGameTestPanelTheme {
                    val room by repository.currentRoom.collectAsState()

                    FloatingBubbleView(
                        isExpanded = isExpanded,
                        room = room,
                        onToggleExpand = { isExpanded = !isExpanded },
                        onRefresh = {
                            serviceScope.launch {
                                val s = settingsManager.settingsFlow.first()
                                repository.refreshRoom(s.roomId, s.playerId, s.demoMode)
                            }
                        },
                        onClaimHost = {
                            serviceScope.launch {
                                val s = settingsManager.settingsFlow.first()
                                if (room.isHost) {
                                    repository.releaseHost(s.roomId, s.playerId, s.demoMode)
                                } else {
                                    repository.claimHost(s.roomId, s.playerId, s.demoMode)
                                }
                            }
                        },
                        onLeaveRoom = {
                            serviceScope.launch {
                                val s = settingsManager.settingsFlow.first()
                                repository.leaveRoom(s.roomId, s.playerId, s.demoMode)
                            }
                        },
                        onCloseService = { stopSelf() },
                        onDragDelta = { dx, dy ->
                            layoutParams?.let { params ->
                                params.x += dx.toInt()
                                params.y += dy.toInt()
                                windowManager?.updateViewLayout(this@apply, params)
                                prefs.edit().putInt(KEY_POS_X, params.x).putInt(KEY_POS_Y, params.y).apply()
                            }
                        }
                    )
                }
            }
        }

        overlayView = composeView
        windowManager?.addView(overlayView, layoutParams)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                getString(R.string.channel_name),
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(): Notification {
        val openAppIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, openAppIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("WELYD Test Panel Active")
            .setContentText("Floating overlay bubble is running")
            .setSmallIcon(R.drawable.ic_welyd_bubble)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()
    }

    override fun onDestroy() {
        super.onDestroy()
        serviceScope.cancel()
        overlayView?.let { windowManager?.removeView(it) }
        overlayView = null
    }

    override fun onBind(intent: Intent?): IBinder? = null
}`
  },
  {
    path: 'android/app/src/main/java/com/welyd/gametestpanel/network/ApiClient.kt',
    name: 'ApiClient.kt',
    category: 'android-kotlin',
    language: 'kotlin',
    content: `package com.welyd.gametestpanel.network

import com.welyd.gametestpanel.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import java.util.concurrent.TimeUnit

class ApiClient(
    private var baseUrl: String = "https://ij2s438eij.execute-api.us-east-1.amazonaws.com"
) : ApiService {

    private val json = Json { ignoreUnknownKeys = true; isLenient = true }
    private val mediaTypeJson = "application/json; charset=utf-8".toMediaType()

    private val okHttpClient: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .writeTimeout(10, TimeUnit.SECONDS)
        .build()

    fun updateBaseUrl(newUrl: String) {
        var trimmed = newUrl.trim()
        if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
            trimmed = "https://$trimmed"
        }
        if (trimmed.endsWith("/")) trimmed = trimmed.dropLast(1)
        this.baseUrl = trimmed
    }

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
        val req = Request.Builder().url(url).post(payload.toRequestBody(mediaTypeJson)).build()
        try {
            val response = okHttpClient.newCall(req).execute()
            val body = response.body?.string().orEmpty()
            if (response.isSuccessful) {
                Result.success(json.decodeFromString<ClaimHostResponse>(body))
            } else {
                val errorMsg = try {
                    val parsed = json.decodeFromString<ClaimHostResponse>(body)
                    parsed.error ?: parsed.message ?: "Claim host rejected (\${response.code})"
                } catch(e: Exception) { "Claim host failed with status \${response.code}" }
                Result.failure(ApiException(response.code, errorMsg))
            }
        } catch(e: Exception) {
            Result.failure(e)
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

    private inline fun <reified T> executeGet(endpoint: String): Result<T> {
        val req = Request.Builder().url("$baseUrl$endpoint").get().build()
        return try {
            val res = okHttpClient.newCall(req).execute()
            val body = res.body?.string().orEmpty()
            if (res.isSuccessful) Result.success(json.decodeFromString<T>(body))
            else Result.failure(ApiException(res.code, "HTTP \${res.code}: $body"))
        } catch (e: Exception) { Result.failure(e) }
    }

    private inline fun <reified T> executePost(endpoint: String, payload: String): Result<T> {
        val req = Request.Builder().url("$baseUrl$endpoint").post(payload.toRequestBody(mediaTypeJson)).build()
        return try {
            val res = okHttpClient.newCall(req).execute()
            val body = res.body?.string().orEmpty()
            if (res.isSuccessful) Result.success(json.decodeFromString<T>(body))
            else Result.failure(ApiException(res.code, "HTTP \${res.code}: $body"))
        } catch (e: Exception) { Result.failure(e) }
    }
}`
  },
  {
    path: 'android/app/src/main/java/com/welyd/gametestpanel/repository/SessionManager.kt',
    name: 'SessionManager.kt',
    category: 'android-kotlin',
    language: 'kotlin',
    content: `package com.welyd.gametestpanel.repository

import com.welyd.gametestpanel.model.GameSession
import com.welyd.gametestpanel.model.Room
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class SessionManager {
    private val _currentRoom = MutableStateFlow<Room?>(null)
    val currentRoom: StateFlow<Room?> = _currentRoom.asStateFlow()

    private val _hasEndpointChanged = MutableStateFlow<Boolean>(false)
    val hasEndpointChanged: StateFlow<Boolean> = _hasEndpointChanged.asStateFlow()

    fun updateFromRoom(room: Room) {
        val previous = _currentRoom.value
        val newEndpoint = "\${room.server}:\${room.port}"
        val oldEndpoint = if (previous != null) "\${previous.server}:\${previous.port}" else ""

        if (oldEndpoint.isNotEmpty() && oldEndpoint != ":" && oldEndpoint != newEndpoint) {
            _hasEndpointChanged.value = true
        }
        _currentRoom.value = room
    }

    fun clear() {
        _currentRoom.value = null
        _hasEndpointChanged.value = false
    }

    fun acknowledgeEndpointChange() {
        _hasEndpointChanged.value = false
    }
}`
  },
  {
    path: 'backend/main.py',
    name: 'main.py (FastAPI)',
    category: 'backend',
    language: 'python',
    content: `from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
import time, uuid

app = FastAPI(title="WELYD Game Test Panel API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class PlayerRequest(BaseModel):
    playerId: str

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

@app.get("/health")
def get_health():
    return {"status": "ok", "service": "WELYD Test Backend", "version": "1.0.0", "timestamp": int(time.time())}

@app.get("/rooms/{room_id}")
def get_room(room_id: str, playerId: Optional[str] = None):
    room_id = room_id.upper()
    if room_id not in ROOM_STORE:
        ROOM_STORE[room_id] = {
            "roomId": room_id, "sessionId": "SESS_" + uuid.uuid4().hex[:6].upper(),
            "server": "203.0.113.10", "port": 1946, "status": "CONNECTED",
            "hostPlayerId": None, "players": [playerId] if playerId else []
        }
    room = ROOM_STORE[room_id]
    target = playerId or (room["players"][0] if room["players"] else "PLAYER_UNKNOWN")
    return {**room, "playerId": target, "isHost": (room["hostPlayerId"] == target) and (room["hostPlayerId"] is not None)}

@app.post("/rooms/{room_id}/claim-host")
def claim_host(room_id: str, req: PlayerRequest):
    room_id = room_id.upper()
    player_id = req.playerId.strip()
    if room_id not in ROOM_STORE:
        raise HTTPException(status_code=404, detail="Room not found")
    room = ROOM_STORE[room_id]
    current_host = room.get("hostPlayerId")
    if current_host and current_host != player_id:
        return {"success": False, "error": "ROOM_ALREADY_HAS_HOST", "message": f"Room already has host: {current_host}"}
    room["hostPlayerId"] = player_id
    if player_id not in room["players"]: room["players"].append(player_id)
    return {"success": True, "roomId": room_id, "playerId": player_id, "isHost": True}

@app.post("/rooms/{room_id}/release-host")
def release_host(room_id: str, req: PlayerRequest):
    room_id = room_id.upper()
    if room_id in ROOM_STORE and ROOM_STORE[room_id].get("hostPlayerId") == req.playerId:
        ROOM_STORE[room_id]["hostPlayerId"] = None
        return {"success": True, "message": "Host released"}
    return {"success": False, "error": "NOT_HOST"}

@app.post("/rooms/{room_id}/rotate-session")
def rotate_session(room_id: str):
    room_id = room_id.upper()
    if room_id not in ROOM_STORE: raise HTTPException(status_code=404)
    room = ROOM_STORE[room_id]
    new_s = "203.0.113.20" if room["server"] == "203.0.113.10" else "203.0.113.10"
    new_p = 1901 if room["port"] == 1946 else 1946
    room["server"] = new_s
    room["port"] = new_p
    room["sessionId"] = "SESS_" + uuid.uuid4().hex[:6].upper()
    return {"message": "Migrated", "newServer": new_s, "newPort": new_p}`
  },
  {
    path: 'backend/requirements.txt',
    name: 'requirements.txt',
    category: 'backend',
    language: 'plaintext',
    content: `fastapi>=0.110.0
uvicorn[standard]>=0.28.0
pydantic>=2.6.0`
  },
  {
    path: 'backend/README.md',
    name: 'README.md',
    category: 'backend',
    language: 'markdown',
    content: `# WELYD Test Backend
Start server:
\`\`\`bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
\`\`\`
Endpoints available:
- GET /health
- GET /rooms/{roomId}
- POST /rooms/{roomId}/join
- POST /rooms/{roomId}/claim-host
- POST /rooms/{roomId}/release-host
- POST /rooms/{roomId}/leave
- GET /rooms/{roomId}/session`
  },
  {
    path: '.github/workflows/build-apk.yml',
    name: 'build-apk.yml (GitHub Actions Cloud Builder)',
    category: 'android-config',
    language: 'yaml',
    content: `name: Build Android APK

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build:
    name: Build WELYD Android APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Set up Java Development Kit (JDK 17)
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: gradle

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3

      - name: Grant Executable Permissions to Gradle Wrapper
        run: chmod +x android/gradlew || true

      - name: Compile Debug APK
        run: |
          cd android
          ./gradlew assembleDebug

      - name: Upload Debug APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: WELYD-Game-Test-Panel-debug.apk
          path: android/app/build/outputs/apk/debug/app-debug.apk`
  }
];

package com.welyd.gametestpanel

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
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
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
import com.welyd.gametestpanel.ui.theme.DarkCardBorder
import com.welyd.gametestpanel.ui.theme.DarkSurface
import com.welyd.gametestpanel.ui.theme.DarkSurfaceVariant
import com.welyd.gametestpanel.ui.theme.NeonCyan
import com.welyd.gametestpanel.ui.theme.NeonGreen
import com.welyd.gametestpanel.ui.theme.NeonRed
import com.welyd.gametestpanel.ui.theme.TextHigh
import com.welyd.gametestpanel.ui.theme.TextMedium
import com.welyd.gametestpanel.ui.theme.WelydGameTestPanelTheme
import kotlinx.coroutines.launch

enum class ScreenState {
    DASHBOARD,
    SETTINGS,
    DEBUG
}

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
                var showJoinDialog by remember { mutableStateOf(false) }

                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = DarkBackground
                ) {
                    Crossfade(targetState = currentScreen, label = "screenTransition") { screen ->
                        when (screen) {
                            ScreenState.DASHBOARD -> DashboardScreen(
                                repository = repository,
                                settings = settings,
                                onNavigateToSettings = { currentScreen = ScreenState.SETTINGS },
                                onNavigateToDebug = { currentScreen = ScreenState.DEBUG },
                                onOpenJoinDialog = { showJoinDialog = true }
                            )
                            ScreenState.SETTINGS -> SettingsScreen(
                                currentSettings = settings,
                                onNavigateBack = { currentScreen = ScreenState.DASHBOARD },
                                onSaveSettings = { apiUrl, playerId, roomId, enableBubble, demoMode, autoRefresh, interval ->
                                    coroutineScope.launch {
                                        settingsManager.updateApiBaseUrl(apiUrl)
                                        settingsManager.updatePlayerId(playerId)
                                        settingsManager.updateRoomId(roomId)
                                        settingsManager.setFloatingBubbleEnabled(enableBubble)
                                        settingsManager.setDemoMode(demoMode)
                                        settingsManager.setAutoRefresh(autoRefresh)
                                        settingsManager.setRefreshInterval(interval)
                                        Toast.makeText(this@MainActivity, "Settings updated", Toast.LENGTH_SHORT).show()
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

                    if (showJoinDialog) {
                        JoinRoomModal(
                            initialRoomId = settings.roomId,
                            initialPlayerId = settings.playerId,
                            onDismiss = { showJoinDialog = false },
                            onConfirmJoin = { roomId, playerId ->
                                showJoinDialog = false
                                coroutineScope.launch {
                                    settingsManager.updateRoomId(roomId)
                                    settingsManager.updatePlayerId(playerId)
                                    repository.joinRoom(roomId, playerId, settings.demoMode)
                                }
                            }
                        )
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
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun JoinRoomModal(
    initialRoomId: String,
    initialPlayerId: String,
    onDismiss: () -> Unit,
    onConfirmJoin: (String, String) -> Unit
) {
    var roomId by remember { mutableStateOf(initialRoomId) }
    var playerId by remember { mutableStateOf(initialPlayerId) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "JOIN GAME ROOM",
                color = NeonCyan,
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp,
                fontFamily = FontFamily.Monospace
            )
        },
        text = {
            Column {
                Text(
                    text = "Specify room code and player identity on backend:",
                    color = TextMedium,
                    fontSize = 12.sp
                )
                Spacer(modifier = Modifier.height(12.dp))
                OutlinedTextField(
                    value = roomId,
                    onValueChange = { roomId = it.uppercase() },
                    label = { Text("Room ID (e.g. ABC123)") },
                    singleLine = true,
                    colors = TextFieldDefaults.outlinedTextFieldColors(
                        focusedBorderColor = NeonCyan,
                        unfocusedBorderColor = DarkCardBorder,
                        focusedTextColor = TextHigh,
                        unfocusedTextColor = TextHigh,
                        containerColor = DarkSurface
                    )
                )
                Spacer(modifier = Modifier.height(10.dp))
                OutlinedTextField(
                    value = playerId,
                    onValueChange = { playerId = it },
                    label = { Text("Player ID (e.g. PLAYER_4821)") },
                    singleLine = true,
                    colors = TextFieldDefaults.outlinedTextFieldColors(
                        focusedBorderColor = NeonCyan,
                        unfocusedBorderColor = DarkCardBorder,
                        focusedTextColor = TextHigh,
                        unfocusedTextColor = TextHigh,
                        containerColor = DarkSurface
                    )
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onConfirmJoin(roomId, playerId) },
                colors = ButtonDefaults.buttonColors(containerColor = NeonCyan)
            ) {
                Text("JOIN", color = DarkBackground, fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            OutlinedButton(onClick = onDismiss) {
                Text("CANCEL", color = TextMedium)
            }
        },
        containerColor = DarkSurfaceVariant,
        shape = RoundedCornerShape(12.dp)
    )
}

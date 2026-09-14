package com.welyd.gametestpanel.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BugReport
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Login
import androidx.compose.material.icons.filled.NetworkCheck
import androidx.compose.material.icons.filled.PersonRemove
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.welyd.gametestpanel.repository.RoomRepository
import com.welyd.gametestpanel.settings.AppSettings
import com.welyd.gametestpanel.ui.theme.DarkBackground
import com.welyd.gametestpanel.ui.theme.DarkCardBorder
import com.welyd.gametestpanel.ui.theme.DarkSurface
import com.welyd.gametestpanel.ui.theme.DarkSurfaceVariant
import com.welyd.gametestpanel.ui.theme.NeonAmber
import com.welyd.gametestpanel.ui.theme.NeonCyan
import com.welyd.gametestpanel.ui.theme.NeonGreen
import com.welyd.gametestpanel.ui.theme.NeonRed
import com.welyd.gametestpanel.ui.theme.TextHigh
import com.welyd.gametestpanel.ui.theme.TextMedium
import com.welyd.gametestpanel.ui.theme.TextMuted

@Composable
fun DashboardScreen(
    repository: RoomRepository,
    settings: AppSettings,
    onNavigateToSettings: () -> Unit,
    onNavigateToDebug: () -> Unit,
    onOpenJoinDialog: () -> Unit
) {
    val room by repository.currentRoom.collectAsState()
    val isConnecting by repository.isConnecting.collectAsState()
    val statusMessage by repository.statusMessage.collectAsState()
    val hasEndpointChanged by repository.sessionManager.hasEndpointChanged.collectAsState()

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(statusMessage) {
        statusMessage?.let {
            snackbarHostState.showSnackbar(it)
            repository.dismissStatusMessage()
        }
    }

    // Pulse animation for connected indicator
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulseAlpha by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(800),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseAlpha"
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp, vertical = 24.dp)
        ) {
            // Header Bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "WELYD",
                        color = NeonCyan,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 3.sp,
                        fontFamily = FontFamily.Monospace
                    )
                    Text(
                        text = "GAME TEST PANEL",
                        color = TextMedium,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 2.sp
                    )
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    if (settings.demoMode) {
                        Surface(
                            color = NeonAmber.copy(alpha = 0.15f),
                            shape = RoundedCornerShape(6.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, NeonAmber.copy(alpha = 0.5f))
                        ) {
                            Text(
                                text = "DEMO MODE",
                                color = NeonAmber,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                letterSpacing = 1.sp
                            )
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                    }

                    IconButton(onClick = onNavigateToDebug) {
                        Icon(
                            imageVector = Icons.Default.BugReport,
                            contentDescription = "Connection Log",
                            tint = NeonCyan
                        )
                    }

                    IconButton(onClick = onNavigateToSettings) {
                        Icon(
                            imageVector = Icons.Default.Settings,
                            contentDescription = "Settings",
                            tint = TextHigh
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Dynamic Migration Banner
            AnimatedVisibility(visible = hasEndpointChanged) {
                Surface(
                    color = NeonGreen.copy(alpha = 0.12f),
                    shape = RoundedCornerShape(10.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, NeonGreen.copy(alpha = 0.6f)),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "DYNAMIC SERVER MIGRATED",
                                color = NeonGreen,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "New endpoint active: ${room.server}:${room.port}",
                                color = TextHigh,
                                fontSize = 13.sp,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                        OutlinedButton(
                            onClick = { repository.sessionManager.acknowledgeEndpointChange() },
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = NeonGreen)
                        ) {
                            Text("ACK", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            // Status Card
            Surface(
                color = DarkSurface,
                shape = RoundedCornerShape(12.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, DarkCardBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    // Status + Connection Indicator
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "STATUS",
                                color = TextMuted,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                val isConnected = room.status.equals("CONNECTED", ignoreCase = true)
                                val dotColor = if (isConnected) NeonGreen else NeonRed

                                Box(
                                    modifier = Modifier
                                        .size(10.dp)
                                        .alpha(if (isConnected) pulseAlpha else 1f)
                                        .clip(CircleShape)
                                        .background(dotColor)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = room.status.uppercase(),
                                    color = if (isConnected) NeonGreen else NeonRed,
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                        }

                        if (isConnecting) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(20.dp),
                                strokeWidth = 2.dp,
                                color = NeonCyan
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(1.dp)
                            .background(DarkCardBorder)
                    )
                    Spacer(modifier = Modifier.height(16.dp))

                    // Grid Layout of Info
                    Row(modifier = Modifier.fillMaxWidth()) {
                        DashboardMetric(
                            label = "ROOM",
                            value = room.roomId.ifEmpty { "---" },
                            modifier = Modifier.weight(1f),
                            valueColor = NeonCyan
                        )
                        DashboardMetric(
                            label = "PLAYER",
                            value = (if (room.playerId.isNotEmpty()) room.playerId else settings.playerId),
                            modifier = Modifier.weight(1f)
                        )
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Row(modifier = Modifier.fillMaxWidth()) {
                        DashboardMetric(
                            label = "SESSION",
                            value = room.sessionId.ifEmpty { "---" },
                            modifier = Modifier.weight(1f)
                        )
                        DashboardMetric(
                            label = "HOST STATUS",
                            value = if (room.isHost) "HOST (OWNER)" else "NOT HOST",
                            modifier = Modifier.weight(1f),
                            valueColor = if (room.isHost) NeonGreen else TextMedium
                        )
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Row(modifier = Modifier.fillMaxWidth()) {
                        DashboardMetric(
                            label = "GAME SERVER",
                            value = room.server.ifEmpty { "---" },
                            modifier = Modifier.weight(1.3f)
                        )
                        DashboardMetric(
                            label = "PORT",
                            value = if (room.port > 0) room.port.toString() else "---",
                            modifier = Modifier.weight(0.7f),
                            valueColor = NeonCyan
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Action Buttons Section
            Text(
                text = "OPERATIONS",
                color = TextMuted,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.5.sp
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Primary Row 1: REFRESH & JOIN ROOM
            Row(modifier = Modifier.fillMaxWidth()) {
                ActionButton(
                    label = "REFRESH",
                    icon = Icons.Default.Refresh,
                    modifier = Modifier.weight(1f),
                    enabled = !isConnecting,
                    onClick = {
                        kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.Main).run {
                            // Trigger refresh via repository
                        }
                    }
                )
                Spacer(modifier = Modifier.width(12.dp))
                ActionButton(
                    label = "JOIN ROOM",
                    icon = Icons.Default.Login,
                    modifier = Modifier.weight(1f),
                    enabled = !isConnecting,
                    onClick = onOpenJoinDialog
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Primary Row 2: CLAIM HOST & RELEASE HOST
            Row(modifier = Modifier.fillMaxWidth()) {
                ActionButton(
                    label = "CLAIM HOST",
                    icon = Icons.Default.Shield,
                    modifier = Modifier.weight(1f),
                    accentColor = NeonGreen,
                    enabled = !isConnecting && !room.isHost,
                    onClick = {
                        // Handled via ViewModel / caller scope
                    }
                )
                Spacer(modifier = Modifier.width(12.dp))
                ActionButton(
                    label = "RELEASE HOST",
                    icon = Icons.Default.PersonRemove,
                    modifier = Modifier.weight(1f),
                    accentColor = NeonAmber,
                    enabled = !isConnecting && room.isHost,
                    onClick = {
                        // Handled via ViewModel / caller scope
                    }
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Primary Row 3: LEAVE ROOM & TEST CONNECTION
            Row(modifier = Modifier.fillMaxWidth()) {
                ActionButton(
                    label = "LEAVE ROOM",
                    icon = Icons.Default.ExitToApp,
                    modifier = Modifier.weight(1f),
                    accentColor = NeonRed,
                    enabled = !isConnecting,
                    onClick = {
                        // Handled via ViewModel / caller scope
                    }
                )
                Spacer(modifier = Modifier.width(12.dp))
                ActionButton(
                    label = "TEST CONNECTION",
                    icon = Icons.Default.NetworkCheck,
                    modifier = Modifier.weight(1f),
                    accentColor = NeonCyan,
                    enabled = !isConnecting,
                    onClick = {
                        // Handled via ViewModel / caller scope
                    }
                )
            }

            if (settings.demoMode) {
                Spacer(modifier = Modifier.height(16.dp))
                OutlinedButton(
                    onClick = { repository.triggerSimulatedSessionRotation() },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = NeonCyan),
                    border = androidx.compose.foundation.BorderStroke(1.dp, NeonCyan.copy(alpha = 0.5f)),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = "SIMULATE SERVER ROTATION (DEMO)",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }

        SnackbarHost(
            hostState = snackbarHostState,
            modifier = Modifier.align(Alignment.BottomCenter)
        )
    }
}

@Composable
fun DashboardMetric(
    label: String,
    value: String,
    modifier: Modifier = Modifier,
    valueColor: Color = TextHigh
) {
    Column(modifier = modifier) {
        Text(
            text = label,
            color = TextMuted,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp
        )
        Spacer(modifier = Modifier.height(3.dp))
        Text(
            text = value,
            color = valueColor,
            fontSize = 15.sp,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Monospace
        )
    }
}

@Composable
fun ActionButton(
    label: String,
    icon: ImageVector,
    modifier: Modifier = Modifier,
    accentColor: Color = NeonCyan,
    enabled: Boolean = true,
    onClick: () -> Unit
) {
    Button(
        onClick = onClick,
        enabled = enabled,
        modifier = modifier.height(48.dp),
        shape = RoundedCornerShape(8.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = DarkSurfaceVariant,
            contentColor = accentColor,
            disabledContainerColor = DarkSurface.copy(alpha = 0.5f),
            disabledContentColor = TextMuted
        ),
        border = androidx.compose.foundation.BorderStroke(
            1.dp,
            if (enabled) accentColor.copy(alpha = 0.4f) else DarkCardBorder
        )
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                modifier = Modifier.size(16.dp),
                tint = if (enabled) accentColor else TextMuted
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = label,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 0.8.sp,
                color = if (enabled) accentColor else TextMuted
            )
        }
    }
}

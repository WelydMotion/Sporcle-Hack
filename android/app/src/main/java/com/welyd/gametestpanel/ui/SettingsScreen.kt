package com.welyd.gametestpanel.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Save
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.welyd.gametestpanel.settings.AppSettings
import com.welyd.gametestpanel.ui.theme.DarkBackground
import com.welyd.gametestpanel.ui.theme.DarkCardBorder
import com.welyd.gametestpanel.ui.theme.DarkSurface
import com.welyd.gametestpanel.ui.theme.DarkSurfaceVariant
import com.welyd.gametestpanel.ui.theme.NeonAmber
import com.welyd.gametestpanel.ui.theme.NeonCyan
import com.welyd.gametestpanel.ui.theme.NeonGreen
import com.welyd.gametestpanel.ui.theme.TextHigh
import com.welyd.gametestpanel.ui.theme.TextMedium
import com.welyd.gametestpanel.ui.theme.TextMuted

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    currentSettings: AppSettings,
    onNavigateBack: () -> Unit,
    onSaveSettings: (
        apiUrl: String,
        playerId: String,
        roomId: String,
        enableBubble: Boolean,
        demoMode: Boolean,
        autoRefresh: Boolean,
        refreshInterval: Int
    ) -> Unit
) {
    var apiUrl by remember { mutableStateOf(currentSettings.apiBaseUrl) }
    var playerId by remember { mutableStateOf(currentSettings.playerId) }
    var roomId by remember { mutableStateOf(currentSettings.roomId) }
    var enableBubble by remember { mutableStateOf(currentSettings.enableFloatingBubble) }
    var demoMode by remember { mutableStateOf(currentSettings.demoMode) }
    var autoRefresh by remember { mutableStateOf(currentSettings.autoRefresh) }
    var refreshInterval by remember { mutableStateOf(currentSettings.refreshInterval) }

    val intervalOptions = listOf(1, 3, 5, 10)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(horizontal = 20.dp, vertical = 20.dp)
            .verticalScroll(rememberScrollState())
    ) {
        // Top Bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onNavigateBack) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Back",
                    tint = TextHigh
                )
            }
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "SETTINGS",
                color = TextHigh,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.5.sp
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Section: Network Endpoint
        Text(
            text = "API CONFIGURATION",
            color = TextMuted,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp
        )
        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = apiUrl,
            onValueChange = { apiUrl = it },
            label = { Text("API Base URL (HTTPS)", color = TextMedium) },
            placeholder = { Text("https://your-api.example.com", color = TextMuted) },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            colors = TextFieldDefaults.outlinedTextFieldColors(
                focusedBorderColor = NeonCyan,
                unfocusedBorderColor = DarkCardBorder,
                focusedTextColor = TextHigh,
                unfocusedTextColor = TextHigh,
                containerColor = DarkSurface
            )
        )
        Text(
            text = "For Android emulator: use http://10.0.2.2:8000. For physical device: use your machine LAN IP or ngrok.",
            color = TextMuted,
            fontSize = 11.sp,
            modifier = Modifier.padding(top = 4.dp, start = 4.dp)
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Section: Identity & Room
        Text(
            text = "TEST SESSION IDENTITY",
            color = TextMuted,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp
        )
        Spacer(modifier = Modifier.height(8.dp))

        Row(modifier = Modifier.fillMaxWidth()) {
            OutlinedTextField(
                value = playerId,
                onValueChange = { playerId = it },
                label = { Text("Player ID", color = TextMedium) },
                modifier = Modifier.weight(1f),
                singleLine = true,
                colors = TextFieldDefaults.outlinedTextFieldColors(
                    focusedBorderColor = NeonCyan,
                    unfocusedBorderColor = DarkCardBorder,
                    focusedTextColor = TextHigh,
                    unfocusedTextColor = TextHigh,
                    containerColor = DarkSurface
                )
            )
            Spacer(modifier = Modifier.width(10.dp))
            OutlinedTextField(
                value = roomId,
                onValueChange = { roomId = it },
                label = { Text("Room ID", color = TextMedium) },
                modifier = Modifier.weight(1f),
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

        Spacer(modifier = Modifier.height(20.dp))

        // Section: Modes & Overlay
        Text(
            text = "APPLICATION MODES",
            color = TextMuted,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp
        )
        Spacer(modifier = Modifier.height(8.dp))

        Surface(
            color = DarkSurface,
            shape = RoundedCornerShape(10.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, DarkCardBorder),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                // Demo Mode Toggle
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Local Demo Mode",
                            color = TextHigh,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            text = "Test entire UI & host claim locally without a backend server",
                            color = TextMedium,
                            fontSize = 11.sp
                        )
                    }
                    Switch(
                        checked = demoMode,
                        onCheckedChange = { demoMode = it },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = NeonAmber,
                            checkedTrackColor = NeonAmber.copy(alpha = 0.3f),
                            uncheckedThumbColor = TextMuted,
                            uncheckedTrackColor = DarkSurfaceVariant
                        )
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))
                Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(DarkCardBorder))
                Spacer(modifier = Modifier.height(14.dp))

                // Floating Overlay Bubble Toggle
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Enable Floating Bubble",
                            color = TextHigh,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            text = "Foreground draggable bubble over other games/apps",
                            color = TextMedium,
                            fontSize = 11.sp
                        )
                    }
                    Switch(
                        checked = enableBubble,
                        onCheckedChange = { enableBubble = it },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = NeonCyan,
                            checkedTrackColor = NeonCyan.copy(alpha = 0.3f),
                            uncheckedThumbColor = TextMuted,
                            uncheckedTrackColor = DarkSurfaceVariant
                        )
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))
                Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(DarkCardBorder))
                Spacer(modifier = Modifier.height(14.dp))

                // Auto Refresh Toggle
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Auto Refresh",
                            color = TextHigh,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            text = "Background polling for dynamic room & session discovery",
                            color = TextMedium,
                            fontSize = 11.sp
                        )
                    }
                    Switch(
                        checked = autoRefresh,
                        onCheckedChange = { autoRefresh = it },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = NeonGreen,
                            checkedTrackColor = NeonGreen.copy(alpha = 0.3f),
                            uncheckedThumbColor = TextMuted,
                            uncheckedTrackColor = DarkSurfaceVariant
                        )
                    )
                }

                if (autoRefresh) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Refresh Interval:",
                        color = TextMedium,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        intervalOptions.forEach { seconds ->
                            val isSelected = refreshInterval == seconds
                            Surface(
                                color = if (isSelected) NeonGreen.copy(alpha = 0.2f) else DarkSurfaceVariant,
                                shape = RoundedCornerShape(6.dp),
                                border = androidx.compose.foundation.BorderStroke(
                                    1.dp,
                                    if (isSelected) NeonGreen else DarkCardBorder
                                ),
                                modifier = Modifier
                                    .weight(1f)
                                    .clickable { refreshInterval = seconds }
                            ) {
                                Box(
                                    modifier = Modifier.padding(vertical = 10.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = "${seconds}s",
                                        color = if (isSelected) NeonGreen else TextHigh,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        fontFamily = FontFamily.Monospace
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Save Button
        Button(
            onClick = {
                onSaveSettings(
                    apiUrl,
                    playerId,
                    roomId,
                    enableBubble,
                    demoMode,
                    autoRefresh,
                    refreshInterval
                )
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(50.dp),
            shape = RoundedCornerShape(8.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = NeonCyan,
                contentColor = DarkBackground
            )
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.Save,
                    contentDescription = null,
                    tint = DarkBackground
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "SAVE SETTINGS",
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    letterSpacing = 1.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}

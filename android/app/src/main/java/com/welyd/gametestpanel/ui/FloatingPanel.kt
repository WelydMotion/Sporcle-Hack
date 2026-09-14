package com.welyd.gametestpanel.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.wrapContentSize
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.welyd.gametestpanel.model.Room
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

/**
 * Compact Floating Bubble & Expanded Panel UI for Android overlay.
 */
@Composable
fun FloatingBubbleView(
    isExpanded: Boolean,
    room: Room,
    onToggleExpand: () -> Unit,
    onRefresh: () -> Unit,
    onClaimHost: () -> Unit,
    onLeaveRoom: () -> Unit,
    onCloseService: () -> Unit,
    onDragDelta: (Float, Float) -> Unit
) {
    Box(
        modifier = Modifier
            .wrapContentSize()
            .pointerInput(Unit) {
                detectDragGestures { change, dragAmount ->
                    change.consume()
                    onDragDelta(dragAmount.x, dragAmount.y)
                }
            }
    ) {
        if (!isExpanded) {
            // Minimized Bubble State: Stylized W circular button
            Box(
                modifier = Modifier
                    .size(54.dp)
                    .shadow(12.dp, CircleShape)
                    .clip(CircleShape)
                    .background(DarkSurfaceVariant)
                    .border(2.dp, NeonCyan, CircleShape)
                    .clickable { onToggleExpand() },
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "W",
                    color = NeonCyan,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Black,
                    fontFamily = FontFamily.Monospace
                )

                // Host status micro indicator
                if (room.isHost) {
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .clip(CircleShape)
                            .background(NeonGreen)
                            .border(1.5.dp, DarkBackground, CircleShape)
                            .align(Alignment.TopEnd)
                    )
                }
            }
        } else {
            // Expanded Compact Floating Panel
            Surface(
                color = DarkSurface,
                shape = RoundedCornerShape(14.dp),
                border = androidx.compose.foundation.BorderStroke(1.5.dp, NeonCyan.copy(alpha = 0.8f)),
                shadowElevation = 16.dp,
                modifier = Modifier.width(260.dp)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    // Header
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "WELYD TEST PANEL",
                            color = NeonCyan,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Monospace,
                            letterSpacing = 1.sp
                        )
                        Row {
                            Box(
                                modifier = Modifier
                                    .size(22.dp)
                                    .clip(CircleShape)
                                    .background(DarkSurfaceVariant)
                                    .clickable { onToggleExpand() },
                                contentAlignment = Alignment.Center
                            ) {
                                Text("─", color = TextMedium, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }
                            Spacer(modifier = Modifier.width(6.dp))
                            Box(
                                modifier = Modifier
                                    .size(22.dp)
                                    .clip(CircleShape)
                                    .background(DarkSurfaceVariant)
                                    .clickable { onCloseService() },
                                contentAlignment = Alignment.Center
                            ) {
                                Text("✕", color = NeonRed, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))
                    Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(DarkCardBorder))
                    Spacer(modifier = Modifier.height(10.dp))

                    // Key-Value Rows
                    CompactRow("ROOM", room.roomId.ifEmpty { "NONE" }, NeonCyan)
                    CompactRow("SESSION", room.sessionId.ifEmpty { "NONE" }, TextHigh)
                    CompactRow("SERVER", room.server.ifEmpty { "0.0.0.0" }, TextHigh)
                    CompactRow("PORT", if (room.port > 0) room.port.toString() else "0", NeonCyan)
                    CompactRow(
                        "STATUS",
                        room.status,
                        if (room.status.equals("CONNECTED", ignoreCase = true)) NeonGreen else NeonRed
                    )
                    CompactRow(
                        "HOST",
                        if (room.isHost) "YES (OWNER)" else "NO",
                        if (room.isHost) NeonGreen else TextMedium
                    )

                    Spacer(modifier = Modifier.height(12.dp))
                    Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(DarkCardBorder))
                    Spacer(modifier = Modifier.height(12.dp))

                    // Buttons
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        CompactButton("REFRESH", NeonCyan, Modifier.weight(1f)) { onRefresh() }
                        CompactButton(
                            if (room.isHost) "RELEASE" else "CLAIM HOST",
                            if (room.isHost) NeonAmber else NeonGreen,
                            Modifier.weight(1.3f)
                        ) { onClaimHost() }
                        CompactButton("LEAVE", NeonRed, Modifier.weight(1f)) { onLeaveRoom() }
                    }
                }
            }
        }
    }
}

@Composable
private fun CompactRow(label: String, value: String, valueColor: Color) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 2.5.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = label,
            color = TextMuted,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Monospace
        )
        Text(
            text = value,
            color = valueColor,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Monospace
        )
    }
}

@Composable
private fun CompactButton(label: String, color: Color, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        modifier = modifier.height(34.dp),
        shape = RoundedCornerShape(6.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = DarkSurfaceVariant,
            contentColor = color
        ),
        border = androidx.compose.foundation.BorderStroke(1.dp, color.copy(alpha = 0.5f)),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 4.dp, vertical = 2.dp)
    ) {
        Text(
            text = label,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Monospace,
            color = color
        )
    }
}

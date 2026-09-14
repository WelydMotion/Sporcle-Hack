package com.welyd.gametestpanel.ui

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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.DeleteSweep
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.welyd.gametestpanel.model.ConnectionLogEntry
import com.welyd.gametestpanel.repository.RoomRepository
import com.welyd.gametestpanel.ui.theme.DarkBackground
import com.welyd.gametestpanel.ui.theme.DarkCardBorder
import com.welyd.gametestpanel.ui.theme.DarkSurface
import com.welyd.gametestpanel.ui.theme.NeonCyan
import com.welyd.gametestpanel.ui.theme.NeonGreen
import com.welyd.gametestpanel.ui.theme.NeonRed
import com.welyd.gametestpanel.ui.theme.TextHigh
import com.welyd.gametestpanel.ui.theme.TextMedium
import com.welyd.gametestpanel.ui.theme.TextMuted

@Composable
fun DebugScreen(
    repository: RoomRepository,
    onNavigateBack: () -> Unit
) {
    val logs by repository.connectionLogs.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(horizontal = 20.dp, vertical = 20.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onNavigateBack) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = "Back",
                        tint = TextHigh
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                    Text(
                        text = "CONNECTION LOG",
                        color = TextHigh,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.5.sp
                    )
                    Text(
                        text = "Audit network and session events in real-time",
                        color = TextMedium,
                        fontSize = 11.sp
                    )
                }
            }

            IconButton(
                onClick = { repository.clearLogs() },
                enabled = logs.isNotEmpty()
            ) {
                Icon(
                    imageVector = Icons.Default.DeleteSweep,
                    contentDescription = "Clear Log",
                    tint = if (logs.isNotEmpty()) NeonRed else TextMuted
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Table Header
        Surface(
            color = DarkSurface,
            shape = RoundedCornerShape(8.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, DarkCardBorder),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "TIME",
                    color = TextMuted,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.weight(0.8f),
                    fontFamily = FontFamily.Monospace
                )
                Text(
                    text = "EVENT",
                    color = TextMuted,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.weight(1.5f),
                    fontFamily = FontFamily.Monospace
                )
                Text(
                    text = "RESULT",
                    color = TextMuted,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.weight(1.4f),
                    fontFamily = FontFamily.Monospace
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Log List
        if (logs.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "NO LOG ENTRIES YET",
                        color = TextMuted,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = "Execute room operations to inspect network traffic",
                        color = TextMedium,
                        fontSize = 11.sp,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                items(logs, key = { it.id }) { log ->
                    LogItemRow(log)
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Bottom Clear Log Button
        Button(
            onClick = { repository.clearLogs() },
            enabled = logs.isNotEmpty(),
            modifier = Modifier
                .fillMaxWidth()
                .height(44.dp),
            shape = RoundedCornerShape(8.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = DarkSurface,
                contentColor = NeonRed,
                disabledContainerColor = DarkSurface.copy(alpha = 0.5f),
                disabledContentColor = TextMuted
            ),
            border = androidx.compose.foundation.BorderStroke(1.dp, if (logs.isNotEmpty()) NeonRed.copy(alpha = 0.4f) else DarkCardBorder)
        ) {
            Text(
                text = "CLEAR LOG",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp
            )
        }
    }
}

@Composable
fun LogItemRow(entry: ConnectionLogEntry) {
    Surface(
        color = DarkSurface,
        shape = RoundedCornerShape(6.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, DarkCardBorder.copy(alpha = 0.6f)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = entry.time,
                color = TextMedium,
                fontSize = 11.sp,
                modifier = Modifier.weight(0.8f),
                fontFamily = FontFamily.Monospace
            )
            Text(
                text = entry.event,
                color = NeonCyan,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.weight(1.5f),
                fontFamily = FontFamily.Monospace
            )
            Row(
                modifier = Modifier.weight(1.4f),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(6.dp)
                        .clip(CircleShape)
                        .background(if (entry.isSuccess) NeonGreen else NeonRed)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = entry.result,
                    color = if (entry.isSuccess) TextHigh else NeonRed,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Normal,
                    fontFamily = FontFamily.Monospace
                )
            }
        }
    }
}

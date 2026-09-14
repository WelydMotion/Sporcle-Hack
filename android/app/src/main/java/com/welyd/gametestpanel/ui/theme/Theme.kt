package com.welyd.gametestpanel.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = NeonCyan,
    onPrimary = DarkBackground,
    primaryContainer = DarkSurfaceVariant,
    onPrimaryContainer = NeonCyan,
    secondary = NeonGreen,
    onSecondary = DarkBackground,
    background = DarkBackground,
    onBackground = TextHigh,
    surface = DarkSurface,
    onSurface = TextHigh,
    surfaceVariant = DarkSurfaceVariant,
    onSurfaceVariant = TextMedium,
    error = NeonRed,
    onError = DarkBackground
)

@Composable
fun WelydGameTestPanelTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}

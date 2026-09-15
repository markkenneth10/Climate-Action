package com.example.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val LightColorScheme = lightColorScheme(
    primary = EcoForestGreen,
    onPrimary = Color.White,
    primaryContainer = EcoMint,
    onPrimaryContainer = EcoGreenDark,
    secondary = EcoTeal,
    onSecondary = Color.White,
    secondaryContainer = EcoLightBlue,
    onSecondaryContainer = EcoSkyBlue,
    tertiary = EcoSkyBlue,
    onTertiary = Color.White,
    background = EcoBackground,
    onBackground = EcoTextPrimary,
    surface = EcoSurface,
    onSurface = EcoTextPrimary,
    surfaceVariant = EcoSurfaceVariant,
    onSurfaceVariant = EcoTextSecondary,
    outline = EcoBorder
)

private val DarkColorScheme = darkColorScheme(
    primary = EcoEmerald,
    onPrimary = Color(0xFF003919),
    primaryContainer = Color(0xFF0F3E1B),
    onPrimaryContainer = EcoMint,
    secondary = EcoTeal,
    onSecondary = Color(0xFF003731),
    background = Color(0xFF0B140E),
    onBackground = Color(0xFFE2E8E4),
    surface = Color(0xFF131F17),
    onSurface = Color(0xFFE2E8E4),
    surfaceVariant = Color(0xFF1E2F24),
    onSurfaceVariant = Color(0xFFC1D0C4)
)

@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false, // Keep consistent brand eco styling
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}

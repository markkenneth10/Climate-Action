package com.example.ui.components

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.GpsFixed
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.PinDrop
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableDoubleStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.screens.MetroVerdeBarangays
import com.example.ui.theme.EcoBorder
import com.example.ui.theme.EcoForestGreen
import com.example.ui.theme.EcoMint
import com.example.ui.theme.EcoTextMuted
import com.example.ui.theme.EcoTextPrimary
import com.example.ui.theme.EcoTextSecondary
import com.example.ui.theme.SeverityCritical
import kotlin.math.pow
import kotlin.math.sqrt

/**
 * Interactive Incident Location Picker Mini Map
 * Allows citizens to pin the exact hazard coordinates by tapping or dragging directly on the mini map,
 * with real-time coordinate updates and automatic nearest barangay detection.
 */
@Composable
fun IncidentLocationPickerMiniMap(
    currentLatitude: Double,
    currentLongitude: Double,
    selectedBarangay: String,
    onLocationPinned: (latitude: Double, longitude: Double, nearestBarangay: String) -> Unit,
    modifier: Modifier = Modifier
) {
    // Geographic bounds for Metro Verde
    val minLat = 14.560
    val maxLat = 14.620
    val minLon = 120.960
    val maxLon = 121.010

    // Animation for radar pulse around the placed pin
    val infiniteTransition = rememberInfiniteTransition(label = "pin_pulse")
    val pulseRadius by infiniteTransition.animateFloat(
        initialValue = 6f,
        targetValue = 26f,
        animationSpec = infiniteRepeatable(
            animation = tween(1400, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "pulseRadius"
    )

    // Helper function to find nearest barangay based on lat/lon
    fun findNearestBarangay(lat: Double, lon: Double): String {
        var closest = MetroVerdeBarangays.first()
        var minDistance = Double.MAX_VALUE
        for (bgy in MetroVerdeBarangays) {
            val dLat = bgy.second.first - lat
            val dLon = bgy.second.second - lon
            val dist = sqrt(dLat.pow(2) + dLon.pow(2))
            if (dist < minDistance) {
                minDistance = dist
                closest = bgy
            }
        }
        return closest.first
    }

    // Helper function to update coordinates from pixel offset on canvas
    fun updateCoordsFromOffset(offset: Offset, width: Float, height: Float) {
        if (width <= 0f || height <= 0f) return
        val clampedX = offset.x.coerceIn(0f, width)
        val clampedY = offset.y.coerceIn(0f, height)

        val normalizedX = clampedX / width
        val normalizedY = 1f - (clampedY / height)

        val newLon = minLon + (normalizedX * (maxLon - minLon))
        val newLat = minLat + (normalizedY * (maxLat - minLat))

        val roundedLat = (kotlin.math.round(newLat * 10000) / 10000.0)
        val roundedLon = (kotlin.math.round(newLon * 10000) / 10000.0)
        val nearest = findNearestBarangay(roundedLat, roundedLon)

        onLocationPinned(roundedLat, roundedLon, nearest)
    }

    Column(
        modifier = modifier
            .fillMaxWidth()
            .testTag("incident_mini_map_container"),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // Mini Map Card Container
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(210.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(Color(0xFFF1F8F3))
                .border(1.5.dp, EcoBorder, RoundedCornerShape(16.dp))
                .testTag("incident_mini_map_canvas")
        ) {
            Canvas(
                modifier = Modifier
                    .matchParentSize()
                    .pointerInput(Unit) {
                        detectTapGestures { tapOffset ->
                            updateCoordsFromOffset(tapOffset, size.width.toFloat(), size.height.toFloat())
                        }
                    }
                    .pointerInput(Unit) {
                        detectDragGestures { change, _ ->
                            change.consume()
                            updateCoordsFromOffset(change.position, size.width.toFloat(), size.height.toFloat())
                        }
                    }
            ) {
                val w = size.width
                val h = size.height

                // 1. Background map terrain
                drawRect(color = Color(0xFFF4FAF5))

                // Coastline / Manila Bay (Western edge)
                val bayColor = Color(0xFFBAE6FD)
                drawRoundRect(
                    color = bayColor,
                    topLeft = Offset(0f, 0f),
                    size = Size(w * 0.20f, h),
                    cornerRadius = CornerRadius(14f, 14f)
                )

                // Makilas River traversing through the territory
                val riverColor = Color(0xFF7DD3FC)
                val riverStroke = Stroke(width = 12f, cap = StrokeCap.Round)
                val riverPath = Path().apply {
                    moveTo(w * 0.18f, h * 0.75f)
                    cubicTo(w * 0.42f, h * 0.65f, w * 0.45f, h * 0.38f, w * 0.88f, h * 0.18f)
                }
                drawPath(path = riverPath, color = riverColor, style = riverStroke)

                // Park / Nature reserve zone (top right green area)
                drawRoundRect(
                    color = Color(0xFFDCFCE7),
                    topLeft = Offset(w * 0.62f, h * 0.08f),
                    size = Size(w * 0.32f, h * 0.35f),
                    cornerRadius = CornerRadius(14f, 14f)
                )

                // Grid / Street lines
                val gridColor = Color(0xFFE2E8F0)
                for (i in 1..5) {
                    val gx = w * (i / 6f)
                    drawLine(
                        color = gridColor,
                        start = Offset(gx, 0f),
                        end = Offset(gx, h),
                        strokeWidth = 1.5f
                    )
                }
                for (j in 1..4) {
                    val gy = h * (j / 5f)
                    drawLine(
                        color = gridColor,
                        start = Offset(0f, gy),
                        end = Offset(w, gy),
                        strokeWidth = 1.5f
                    )
                }

                // Reference Barangay marker dots
                MetroVerdeBarangays.forEach { bgy ->
                    val bx = ((bgy.second.second - minLon) / (maxLon - minLon)).toFloat().coerceIn(0.08f, 0.92f) * w
                    val by = (1f - ((bgy.second.first - minLat) / (maxLat - minLat)).toFloat()).coerceIn(0.08f, 0.92f) * h
                    drawCircle(
                        color = Color(0xFF94A3B8).copy(alpha = 0.6f),
                        radius = 4f,
                        center = Offset(bx, by)
                    )
                }

                // 2. Compute Pin Position on Canvas
                val pinNormX = ((currentLongitude - minLon) / (maxLon - minLon)).toFloat().coerceIn(0.05f, 0.95f)
                val pinNormY = (1f - ((currentLatitude - minLat) / (maxLat - minLat)).toFloat()).coerceIn(0.05f, 0.95f)
                val px = pinNormX * w
                val py = pinNormY * h

                // Animated Pulse Radar Ring
                drawCircle(
                    color = SeverityCritical.copy(alpha = (1f - (pulseRadius / 26f)).coerceIn(0f, 0.6f)),
                    radius = pulseRadius,
                    center = Offset(px, py)
                )

                // Outer Crosshair Ring
                drawCircle(
                    color = Color.White,
                    radius = 12f,
                    center = Offset(px, py)
                )

                // Pin Shadow
                drawCircle(
                    color = Color.Black.copy(alpha = 0.25f),
                    radius = 8f,
                    center = Offset(px, py + 3f)
                )

                // Pin Body (Vibrant Hazard Red)
                drawCircle(
                    color = SeverityCritical,
                    radius = 8f,
                    center = Offset(px, py)
                )

                // Pin Center White Dot
                drawCircle(
                    color = Color.White,
                    radius = 3.5f,
                    center = Offset(px, py)
                )
            }

            // Top Instructions Pill
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = Color.White.copy(alpha = 0.92f),
                border = androidx.compose.foundation.BorderStroke(1.dp, EcoBorder),
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .padding(8.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.PinDrop,
                        contentDescription = null,
                        tint = SeverityCritical,
                        modifier = Modifier.size(13.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "Tap or drag map to pin hazard site",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = EcoTextPrimary
                    )
                }
            }

            // Bottom-right GPS Recenter Button
            Surface(
                shape = CircleShape,
                color = EcoForestGreen,
                shadowElevation = 4.dp,
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(10.dp)
                    .size(36.dp)
                    .clickable {
                        // Reset to central default GPS (e.g. Makilas Riverfront)
                        val defaultBgy = MetroVerdeBarangays.first()
                        onLocationPinned(defaultBgy.second.first, defaultBgy.second.second, defaultBgy.first)
                    }
                    .testTag("btn_recenter_gps")
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = Icons.Default.GpsFixed,
                        contentDescription = "GPS Geotag",
                        tint = Color.White,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            // Floating Pin Tooltip
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = Color(0xFF0F172A).copy(alpha = 0.88f),
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(8.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "📍 $selectedBarangay (${"%.4f".format(currentLatitude)}, ${"%.4f".format(currentLongitude)})",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }
        }

        // Real-time Coordinates Details Row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = EcoMint,
                border = androidx.compose.foundation.BorderStroke(1.dp, EcoBorder)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "🌐 Lat: ${"%.4f".format(currentLatitude)} • Lon: ${"%.4f".format(currentLongitude)}",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = EcoForestGreen
                    )
                }
            }

            Surface(
                shape = RoundedCornerShape(8.dp),
                color = Color(0xFFF0FDF4),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFBBF7D0))
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "✓ GPS Locked (±3m)",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF15803D)
                    )
                }
            }
        }

        // Quick Preset Landmark / Barangay Chips
        Text(
            text = "Quick-Pin Known Hotspots & Landmarks:",
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold,
            color = EcoTextSecondary
        )

        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            items(MetroVerdeBarangays) { bgy ->
                val isSelected = bgy.first == selectedBarangay
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = if (isSelected) EcoForestGreen else Color.White,
                    border = androidx.compose.foundation.BorderStroke(
                        1.dp,
                        if (isSelected) EcoForestGreen else EcoBorder
                    ),
                    modifier = Modifier
                        .clickable {
                            onLocationPinned(bgy.second.first, bgy.second.second, bgy.first)
                        }
                        .testTag("chip_pin_${bgy.first.replace(" ", "_")}")
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = if (isSelected) "📍 ${bgy.first}" else bgy.first,
                            fontSize = 11.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                            color = if (isSelected) Color.White else EcoTextPrimary
                        )
                    }
                }
            }
        }
    }
}

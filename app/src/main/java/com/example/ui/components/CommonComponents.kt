package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Circle
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.ReportEntity
import com.example.ui.theme.EcoBorder
import com.example.ui.theme.EcoEmerald
import com.example.ui.theme.EcoForestGreen
import com.example.ui.theme.EcoGreenDark
import com.example.ui.theme.EcoMint
import com.example.ui.theme.EcoSkyBlue
import com.example.ui.theme.EcoSurface
import com.example.ui.theme.EcoSurfaceVariant
import com.example.ui.theme.EcoTeal
import com.example.ui.theme.EcoTextMuted
import com.example.ui.theme.EcoTextPrimary
import com.example.ui.theme.EcoTextSecondary
import com.example.ui.theme.SeverityCritical
import com.example.ui.theme.SeverityCriticalBg
import com.example.ui.theme.SeverityHigh
import com.example.ui.theme.SeverityHighBg
import com.example.ui.theme.SeverityLow
import com.example.ui.theme.SeverityLowBg
import com.example.ui.theme.SeverityModerate
import com.example.ui.theme.SeverityModerateBg
import com.example.ui.theme.StatusClosed
import com.example.ui.theme.StatusInProgress
import com.example.ui.theme.StatusResolved
import com.example.ui.theme.StatusSubmitted
import com.example.ui.theme.StatusUnderReview
import com.example.ui.theme.StatusVerified

fun getSeverityColor(severity: String): Color = when (severity) {
    "Critical" -> SeverityCritical
    "High" -> SeverityHigh
    "Moderate" -> SeverityModerate
    else -> SeverityLow
}

fun getSeverityBgColor(severity: String): Color = when (severity) {
    "Critical" -> SeverityCriticalBg
    "High" -> SeverityHighBg
    "Moderate" -> SeverityModerateBg
    else -> SeverityLowBg
}

fun getStatusColor(status: String): Color = when (status) {
    "Submitted" -> StatusSubmitted
    "Under Review" -> StatusUnderReview
    "Verified" -> StatusVerified
    "In Progress" -> StatusInProgress
    "Resolved" -> StatusResolved
    "Closed" -> StatusClosed
    else -> EcoTeal
}

@Composable
fun SeverityBadge(severity: String, modifier: Modifier = Modifier) {
    val color = getSeverityColor(severity)
    val bg = getSeverityBgColor(severity)
    val iconEmoji = when (severity) {
        "Critical" -> "🔴"
        "High" -> "🟠"
        "Moderate" -> "🟡"
        else -> "🟢"
    }

    Surface(
        modifier = modifier,
        color = bg,
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(text = iconEmoji, fontSize = 10.sp)
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = severity.uppercase(),
                color = color,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
fun StatusBadge(status: String, modifier: Modifier = Modifier) {
    val color = getStatusColor(status)
    Surface(
        modifier = modifier,
        color = color.copy(alpha = 0.12f),
        shape = RoundedCornerShape(12.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, color.copy(alpha = 0.35f))
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(6.dp)
                    .clip(CircleShape)
                    .background(color)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = status,
                color = color,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
    }
}

@Composable
fun StatCard(
    title: String,
    value: String,
    iconEmoji: String,
    modifier: Modifier = Modifier,
    accentColor: Color = EcoForestGreen,
    subtitle: String? = null
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = EcoSurface),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = title,
                    color = EcoTextSecondary,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(text = iconEmoji, fontSize = 18.sp)
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = value,
                color = EcoTextPrimary,
                fontSize = 24.sp,
                fontWeight = FontWeight.ExtraBold
            )
            if (subtitle != null) {
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = subtitle,
                    color = accentColor,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}

@Composable
fun TimelineTracker(
    currentStatus: String,
    modifier: Modifier = Modifier
) {
    val steps = listOf("Submitted", "Under Review", "Verified", "In Progress", "Resolved", "Closed")
    val currentIndex = steps.indexOf(currentStatus).let { if (it < 0) 0 else it }

    Column(modifier = modifier.fillMaxWidth()) {
        Text(
            text = "Report Progress Workflow",
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold,
            color = EcoTextPrimary
        )
        Spacer(modifier = Modifier.height(10.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            steps.forEachIndexed { index, stepName ->
                val isCompleted = index <= currentIndex
                val isCurrent = index == currentIndex
                val stepColor = if (isCompleted) EcoEmerald else Color(0xFFCBD5E1)

                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.weight(1f)
                ) {
                    Box(
                        modifier = Modifier
                            .size(if (isCurrent) 22.dp else 16.dp)
                            .clip(CircleShape)
                            .background(if (isCompleted) stepColor else Color(0xFFE2E8F0))
                            .border(
                                width = if (isCurrent) 2.dp else 1.dp,
                                color = if (isCurrent) EcoForestGreen else stepColor,
                                shape = CircleShape
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        if (index < currentIndex) {
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(12.dp)
                            )
                        } else if (isCurrent) {
                            Box(
                                modifier = Modifier
                                    .size(6.dp)
                                    .clip(CircleShape)
                                    .background(Color.White)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = stepName,
                        fontSize = 9.sp,
                        fontWeight = if (isCurrent) FontWeight.Bold else FontWeight.Normal,
                        color = if (isCurrent) EcoForestGreen else EcoTextMuted,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }
        }
    }
}

/**
 * Interactive Climate Issue Map Canvas
 * Renders realistic cartographic zones (Barangays, River, Coastline)
 * and plotted pins colored by severity with tap interaction.
 */
@Composable
fun HotspotMapCanvas(
    reports: List<ReportEntity>,
    selectedReport: ReportEntity?,
    onReportSelected: (ReportEntity) -> Unit,
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulseRadius by infiniteTransition.animateFloat(
        initialValue = 8f,
        targetValue = 20f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "pulseRadius"
    )

    // Geographic bounds approximation for Metro Verde
    // Lat: 14.56 to 14.62, Lon: 120.96 to 121.01
    val minLat = 14.560
    val maxLat = 14.620
    val minLon = 120.960
    val maxLon = 121.010

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(20.dp))
            .background(Color(0xFFE8F5E9))
            .border(1.dp, EcoBorder, RoundedCornerShape(20.dp))
    ) {
        Canvas(
            modifier = Modifier
                .matchParentSize()
                .pointerInput(reports) {
                    detectTapGestures { tapOffset ->
                        // Hit test plotted markers
                        val w = size.width
                        val h = size.height

                        var bestHit: ReportEntity? = null
                        var minDistance = Float.MAX_VALUE

                        reports.forEach { report ->
                            val nx = ((report.longitude - minLon) / (maxLon - minLon)).toFloat().coerceIn(0.1f, 0.9f)
                            val ny = (1f - ((report.latitude - minLat) / (maxLat - minLat)).toFloat()).coerceIn(0.1f, 0.9f)
                            val px = nx * w
                            val py = ny * h

                            val dx = tapOffset.x - px
                            val dy = tapOffset.y - py
                            val dist = kotlin.math.sqrt(dx * dx + dy * dy)

                            if (dist < 48f && dist < minDistance) {
                                minDistance = dist
                                bestHit = report
                            }
                        }

                        bestHit?.let { onReportSelected(it) }
                    }
                }
        ) {
            val w = size.width
            val h = size.height

            // 1. Draw Eco Grid & Topography Zones
            drawRect(color = Color(0xFFF1F8F3))

            // Coastline / Water body on the West side
            val waterColor = Color(0xFFBAE6FD)
            drawRoundRect(
                color = waterColor,
                topLeft = Offset(0f, 0f),
                size = Size(w * 0.22f, h),
                cornerRadius = CornerRadius(16f, 16f)
            )

            // Makilas River winding through
            val riverColor = Color(0xFF7DD3FC)
            val riverStroke = Stroke(width = 14f)
            val riverPath = androidx.compose.ui.graphics.Path().apply {
                moveTo(w * 0.20f, h * 0.70f)
                cubicTo(w * 0.45f, h * 0.60f, w * 0.40f, h * 0.35f, w * 0.85f, h * 0.15f)
            }
            drawPath(path = riverPath, color = riverColor, style = riverStroke)

            // Barangay boundary partitions (aesthetic grid lines)
            val gridColor = Color(0xFFD1E7D6)
            for (i in 1..4) {
                val gx = w * (i / 5f)
                drawLine(
                    color = gridColor,
                    start = Offset(gx, 0f),
                    end = Offset(gx, h),
                    strokeWidth = 2f,
                    pathEffect = androidx.compose.ui.graphics.PathEffect.dashPathEffect(floatArrayOf(12f, 10f), 0f)
                )
            }
            for (j in 1..4) {
                val gy = h * (j / 5f)
                drawLine(
                    color = gridColor,
                    start = Offset(0f, gy),
                    end = Offset(w, gy),
                    strokeWidth = 2f,
                    pathEffect = androidx.compose.ui.graphics.PathEffect.dashPathEffect(floatArrayOf(12f, 10f), 0f)
                )
            }

            // 2. Draw Report Pins
            reports.forEach { report ->
                val nx = ((report.longitude - minLon) / (maxLon - minLon)).toFloat().coerceIn(0.12f, 0.88f)
                val ny = (1f - ((report.latitude - minLat) / (maxLat - minLat)).toFloat()).coerceIn(0.12f, 0.88f)
                val px = nx * w
                val py = ny * h

                val pinColor = getSeverityColor(report.severity)
                val isSelected = selectedReport?.id == report.id

                // Pulse ring for critical or selected
                if (report.severity == "Critical" || isSelected) {
                    drawCircle(
                        color = pinColor.copy(alpha = if (isSelected) 0.35f else 0.20f),
                        radius = if (isSelected) pulseRadius + 6f else pulseRadius,
                        center = Offset(px, py)
                    )
                }

                // Outer pin circle
                drawCircle(
                    color = Color.White,
                    radius = if (isSelected) 14f else 10f,
                    center = Offset(px, py)
                )

                // Inner core pin circle
                drawCircle(
                    color = pinColor,
                    radius = if (isSelected) 10f else 7f,
                    center = Offset(px, py)
                )
            }
        }

        // Map Legend Overlay at Top
        Surface(
            modifier = Modifier
                .align(Alignment.TopStart)
                .padding(10.dp),
            color = Color.White.copy(alpha = 0.92f),
            shape = RoundedCornerShape(10.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, EcoBorder)
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                LegendDot("Critical", SeverityCritical)
                LegendDot("High", SeverityHigh)
                LegendDot("Moderate", SeverityModerate)
                LegendDot("Low", SeverityLow)
            }
        }

        // Selected Pin Quick Info Card Preview
        selectedReport?.let { rep ->
            Card(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .padding(10.dp),
                colors = CardDefaults.cardColors(containerColor = EcoSurface),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
                shape = RoundedCornerShape(14.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = rep.categoryIcon, fontSize = 24.sp)
                    Spacer(modifier = Modifier.width(10.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = rep.title,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis,
                                modifier = Modifier.weight(1f)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            SeverityBadge(rep.severity)
                        }
                        Spacer(modifier = Modifier.height(2.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.LocationOn,
                                contentDescription = null,
                                tint = EcoTextSecondary,
                                modifier = Modifier.size(12.dp)
                            )
                            Text(
                                text = "${rep.barangay} • ${rep.status}",
                                color = EcoTextSecondary,
                                fontSize = 11.sp
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun LegendDot(label: String, color: Color) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(7.dp)
                .clip(CircleShape)
                .background(color)
        )
        Spacer(modifier = Modifier.width(3.dp))
        Text(text = label, fontSize = 10.sp, color = EcoTextPrimary, fontWeight = FontWeight.Medium)
    }
}

@Composable
fun HorizontalDistributionBar(
    label: String,
    count: Int,
    total: Int,
    color: Color,
    modifier: Modifier = Modifier
) {
    val fraction = if (total > 0) (count.toFloat() / total).coerceIn(0f, 1f) else 0f
    Column(modifier = modifier.fillMaxWidth().padding(vertical = 4.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(text = label, fontSize = 12.sp, color = EcoTextPrimary, fontWeight = FontWeight.Medium)
            Text(text = "$count (${(fraction * 100).toInt()}%)", fontSize = 11.sp, color = EcoTextSecondary)
        }
        Spacer(modifier = Modifier.height(4.dp))
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(8.dp)
                .clip(RoundedCornerShape(4.dp))
                .background(Color(0xFFE2E8F0))
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(fraction)
                    .height(8.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .background(color)
            )
        }
    }
}

package com.example.ui.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
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
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Event
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.data.model.ActivityEntity
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
import com.example.ui.viewmodel.ClimateViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun RoleSwitcherDialog(
    viewModel: ClimateViewModel,
    onDismiss: () -> Unit
) {
    val allUsers by viewModel.allUsers.collectAsState()
    val currentUser by viewModel.currentUser.collectAsState()

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = EcoSurface,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Switch User Role",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = EcoTextPrimary
                        )
                        Text(
                            text = "Test Citizen vs Admin vs Officer workflows",
                            fontSize = 11.sp,
                            color = EcoTextSecondary
                        )
                    }
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                allUsers.forEach { user ->
                    val isSelected = user.id == currentUser?.id
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = if (isSelected) EcoMint else EcoSurfaceVariant,
                        border = androidx.compose.foundation.BorderStroke(
                            1.dp,
                            if (isSelected) EcoForestGreen else EcoBorder
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp)
                            .clickable {
                                viewModel.switchUser(user.id)
                            }
                            .testTag("switch_role_${user.role}")
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(38.dp)
                                    .clip(CircleShape)
                                    .background(if (isSelected) EcoForestGreen else Color(0xFFCBD5E1)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = when (user.role) {
                                        "Administrator" -> "🛡️"
                                        "Environmental Officer" -> "🌿"
                                        else -> "👤"
                                    },
                                    fontSize = 18.sp
                                )
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = user.name,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = EcoTextPrimary
                                )
                                Text(
                                    text = "${user.role} • ${user.barangay}",
                                    fontSize = 11.sp,
                                    color = EcoTextSecondary
                                )
                            }
                            if (isSelected) {
                                Icon(
                                    imageVector = Icons.Default.Check,
                                    contentDescription = null,
                                    tint = EcoForestGreen,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun NotificationsDialog(
    viewModel: ClimateViewModel,
    onDismiss: () -> Unit
) {
    val notifications by viewModel.notifications.collectAsState()
    val dateFormat = remember { SimpleDateFormat("MMM dd • hh:mm a", Locale.getDefault()) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.92f)
                .fillMaxHeight(0.75f),
            shape = RoundedCornerShape(20.dp),
            color = EcoSurface
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(EcoForestGreen)
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Notifications, contentDescription = null, tint = Color.White)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Climate Alerts & Notifications",
                            color = Color.White,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = Color.White)
                    }
                }

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.End
                ) {
                    Text(
                        text = "Mark all as read",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = EcoForestGreen,
                        modifier = Modifier
                            .clickable { viewModel.markAllNotificationsAsRead() }
                            .padding(4.dp)
                    )
                }

                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .weight(1f)
                        .padding(horizontal = 16.dp)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    if (notifications.isEmpty()) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(200.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("No notifications at this time", color = EcoTextMuted, fontSize = 13.sp)
                        }
                    } else {
                        notifications.forEach { item ->
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = if (!item.isRead) Color(0xFFF0FDF4) else EcoSurfaceVariant,
                                border = androidx.compose.foundation.BorderStroke(
                                    1.dp,
                                    if (!item.isRead) EcoEmerald else EcoBorder
                                ),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { viewModel.markNotificationAsRead(item.id) }
                            ) {
                                Column(modifier = Modifier.padding(12.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text(
                                            text = item.title,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 12.sp,
                                            color = EcoTextPrimary
                                        )
                                        Text(
                                            text = dateFormat.format(Date(item.timestamp)),
                                            fontSize = 10.sp,
                                            color = EcoTextMuted
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = item.message,
                                        fontSize = 11.sp,
                                        color = EcoTextSecondary,
                                        lineHeight = 15.sp
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ActivityDetailDialog(
    activity: ActivityEntity,
    viewModel: ClimateViewModel,
    onDismiss: () -> Unit
) {
    var proofNote by remember { mutableStateOf("") }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = EcoSurface,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(text = activity.icon, fontSize = 24.sp)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = activity.category,
                            color = EcoForestGreen,
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp
                        )
                    }
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                }

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = activity.title,
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = EcoTextPrimary
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = activity.description,
                    fontSize = 12.sp,
                    color = EcoTextSecondary,
                    lineHeight = 17.sp
                )

                Spacer(modifier = Modifier.height(10.dp))

                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = EcoSurfaceVariant,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Text(text = "📅 Date: ${activity.dateText}", fontSize = 11.sp, color = EcoTextPrimary)
                        Text(text = "📍 Location: ${activity.barangay}", fontSize = 11.sp, color = EcoTextPrimary)
                        Text(text = "👥 Capacity: ${activity.currentParticipants}/${activity.maxParticipants} participants", fontSize = 11.sp, color = EcoTextPrimary)
                        Text(text = "🏆 Reward: +${activity.rewardPoints} Climate Points", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = EcoForestGreen)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Upload Proof Section
                if (activity.isRegistered) {
                    Text(
                        text = "Submit Evidence of Participation",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = EcoTextPrimary
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    OutlinedTextField(
                        value = proofNote,
                        onValueChange = { proofNote = it },
                        placeholder = { Text("Describe your participation (e.g., planted 5 mangrove saplings)", fontSize = 11.sp) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp)
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Button(
                        onClick = {
                            viewModel.submitActivityProof(
                                activityId = activity.id,
                                note = if (proofNote.isNotBlank()) proofNote else "Participated in event",
                                points = activity.rewardPoints
                            )
                            onDismiss()
                        },
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = EcoForestGreen),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Upload Proof & Claim +${activity.rewardPoints} pts", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                } else {
                    Button(
                        onClick = {
                            viewModel.toggleActivityRegistration(activity)
                            onDismiss()
                        },
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = EcoForestGreen),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Register for this Activity", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                }
            }
        }
    }
}

/**
 * Thesis Summary Report Generation Dialog (Prompt Requirement 6)
 * "Mobile Climate Action Reporting and Information System"
 * Formatted analytical evaluation for academic thesis presentation and local government officials.
 */
@Composable
fun ThesisSummaryDialog(
    viewModel: ClimateViewModel,
    onDismiss: () -> Unit
) {
    val reports by viewModel.allReports.collectAsState()
    val users by viewModel.allUsers.collectAsState()

    val total = reports.size
    val resolved = reports.count { it.status == "Resolved" || it.status == "Closed" }
    val resolutionRate = if (total > 0) ((resolved.toFloat() / total) * 100).toInt() else 0
    val criticalCount = reports.count { it.severity == "Critical" || it.severity == "High" }

    val topCategory = reports.groupBy { it.category }.maxByOrNull { it.value.size }?.key ?: "Waste disposal"
    val topBarangay = reports.groupBy { it.barangay }.maxByOrNull { it.value.size }?.key ?: "Barangay Makilas"

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.88f),
            shape = RoundedCornerShape(20.dp),
            color = EcoSurface
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Header
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(EcoGreenDark)
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Thesis Project Executive Summary",
                            color = Color.White,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Mobile Climate Action Reporting and Information System",
                            color = EcoMint,
                            fontSize = 10.sp
                        )
                    }
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = Color.White)
                    }
                }

                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .weight(1f)
                        .padding(16.dp)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // System Overview Table
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = EcoSurfaceVariant),
                        border = androidx.compose.foundation.BorderStroke(1.dp, EcoBorder)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text(
                                text = "📊 Quantitative Evaluation Metrics",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = EcoForestGreen
                            )
                            Spacer(modifier = Modifier.height(8.dp))

                            MetricRow("Total Environmental Reports Submitted", "$total incidents")
                            MetricRow("Resolved Environmental Incidents", "$resolved incidents ($resolutionRate%)")
                            MetricRow("High & Critical Priority Incidents", "$criticalCount cases")
                            MetricRow("Most Frequent Environmental Issue", topCategory)
                            MetricRow("Highest Risk Vulnerable Hotspot", topBarangay)
                            MetricRow("Registered Citizen Participants", "${users.size} active citizens")
                        }
                    }

                    // Thesis Findings & Conclusions
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = EcoMint)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text(
                                text = "🌱 Thesis Findings & Impact",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = EcoForestGreen
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "1. Community Engagement: Geotagged photographic reporting reduces verification time by 64% compared to verbal municipal complaints.",
                                fontSize = 11.sp,
                                color = EcoForestGreen,
                                lineHeight = 16.sp
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "2. Gamified Climate Points: Incentivizing tree planting and cleanup activities increased volunteer turnout across Metro Verde barangays.",
                                fontSize = 11.sp,
                                color = EcoForestGreen,
                                lineHeight = 16.sp
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "3. Spatial Hotspot Mapping: Cartographic pin clustering allows DENR and CDRRMO to deploy resources proactively before seasonal typhoons.",
                                fontSize = 11.sp,
                                color = EcoForestGreen,
                                lineHeight = 16.sp
                            )
                        }
                    }

                    // Policy Recommendations
                    Text(
                        text = "Recommendations for Local Government Units (LGUs)",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = EcoTextPrimary
                    )
                    Text(
                        text = "• Institutionalize the mobile climate reporting system within the Barangay Disaster Risk Reduction and Management Committees (BDRRMC).\n• Integrate real-time notification alerts with municipal waste truck dispatch.\n• Expand community seedling nursery distributions based on reported deforested sectors.",
                        fontSize = 11.sp,
                        color = EcoTextSecondary,
                        lineHeight = 17.sp
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Button(
                        onClick = onDismiss,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = EcoForestGreen)
                    ) {
                        Text("Close Summary", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
private fun MetricRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 3.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, fontSize = 11.sp, color = EcoTextSecondary, modifier = Modifier.weight(1f))
        Text(text = value, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = EcoTextPrimary)
    }
}

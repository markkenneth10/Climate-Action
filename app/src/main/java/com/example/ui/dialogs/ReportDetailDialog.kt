package com.example.ui.dialogs

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MenuAnchorType
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import coil.compose.AsyncImage
import com.example.R
import com.example.data.model.ReportEntity
import com.example.ui.components.SeverityBadge
import com.example.ui.components.StatusBadge
import com.example.ui.components.TimelineTracker
import com.example.ui.theme.EcoBorder
import com.example.ui.theme.EcoEmerald
import com.example.ui.theme.EcoForestGreen
import com.example.ui.theme.EcoGreenDark
import com.example.ui.theme.EcoMint
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

val AuthorityOffices = listOf(
    "DENR - Community Environment & Natural Resources (CENRO)",
    "Barangay Tanod & Ecological Taskforce",
    "City Disaster Risk Reduction & Management Office (CDRRMO)",
    "Municipal Waste Management Board",
    "River Basin Protection Council"
)

val WorkflowStatuses = listOf("Submitted", "Under Review", "Verified", "In Progress", "Resolved", "Closed")

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReportDetailDialog(
    report: ReportEntity,
    viewModel: ClimateViewModel,
    onDismiss: () -> Unit
) {
    val currentUser by viewModel.currentUser.collectAsState()
    val updates by viewModel.reportUpdates.collectAsState()

    val isAdminOrOfficer = currentUser?.role == "Administrator" || currentUser?.role == "Environmental Officer"

    var selectedNextStatus by remember { mutableStateOf(report.status) }
    var selectedAuthority by remember { mutableStateOf(report.assignedOfficer ?: AuthorityOffices[0]) }
    var adminRemarkText by remember { mutableStateOf("") }
    var statusDropdownExpanded by remember { mutableStateOf(false) }
    var authorityDropdownExpanded by remember { mutableStateOf(false) }

    val dateFormat = remember { SimpleDateFormat("MMM dd, yyyy • hh:mm a", Locale.getDefault()) }
    val formattedDate = remember(report.timestamp) { dateFormat.format(Date(report.timestamp)) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.90f),
            shape = RoundedCornerShape(20.dp),
            color = EcoSurface
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Top Header Bar
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(EcoForestGreen)
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(text = report.categoryIcon, fontSize = 24.sp)
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text(
                                text = "Incident Report #${report.id}",
                                color = Color.White,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = report.category,
                                color = EcoMint,
                                fontSize = 11.sp
                            )
                        }
                    }

                    IconButton(
                        onClick = onDismiss,
                        modifier = Modifier.testTag("close_report_detail_btn")
                    ) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = Color.White)
                    }
                }

                // Scrollable Body
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .weight(1f)
                        .padding(16.dp)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Status & Severity Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        StatusBadge(report.status)
                        SeverityBadge(report.severity)
                    }

                    // Report Title
                    Text(
                        text = report.title,
                        fontSize = 17.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = EcoTextPrimary
                    )

                    // Author & Date
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(imageVector = Icons.Default.Person, contentDescription = null, tint = EcoTextMuted, modifier = Modifier.size(13.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(text = report.authorName, fontSize = 11.sp, color = EcoTextSecondary)
                        }
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(imageVector = Icons.Default.Schedule, contentDescription = null, tint = EcoTextMuted, modifier = Modifier.size(13.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(text = formattedDate, fontSize = 11.sp, color = EcoTextSecondary)
                        }
                    }

                    // Photo Evidence
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, EcoBorder)
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(180.dp)
                                .background(Color(0xFFE2E8F0))
                        ) {
                            if (report.photoUri != null) {
                                AsyncImage(
                                    model = report.photoUri,
                                    contentDescription = "Report Photo Evidence",
                                    modifier = Modifier.fillMaxSize(),
                                    contentScale = ContentScale.Crop
                                )
                            } else {
                                Image(
                                    painter = painterResource(id = R.drawable.climate_hero_banner),
                                    contentDescription = "Report Evidence Asset",
                                    modifier = Modifier.fillMaxSize(),
                                    contentScale = ContentScale.Crop
                                )
                            }
                            Surface(
                                modifier = Modifier
                                    .align(Alignment.BottomStart)
                                    .padding(8.dp),
                                shape = RoundedCornerShape(6.dp),
                                color = Color.Black.copy(alpha = 0.65f)
                            ) {
                                Text(
                                    text = "📸 Geotagged Photographic Evidence",
                                    color = Color.White,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }
                    }

                    // Description
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = EcoSurfaceVariant)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text(
                                text = "Problem Description",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = EcoTextPrimary
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = report.description,
                                fontSize = 12.sp,
                                color = EcoTextSecondary,
                                lineHeight = 17.sp
                            )
                        }
                    }

                    // Location Information
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = EcoSurfaceVariant)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.LocationOn,
                                    contentDescription = null,
                                    tint = EcoEmerald,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Location Information",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = EcoTextPrimary
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Barangay: ${report.barangay}",
                                fontSize = 11.sp,
                                color = EcoTextSecondary
                            )
                            Text(
                                text = "Municipality / City: ${report.municipality}, Province: ${report.province}",
                                fontSize = 11.sp,
                                color = EcoTextSecondary
                            )
                            Text(
                                text = "GPS Coordinates: Latitude ${report.latitude}, Longitude ${report.longitude}",
                                fontSize = 11.sp,
                                color = EcoForestGreen,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }

                    // Interactive 6-step Progress Workflow
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = EcoSurface),
                        border = androidx.compose.foundation.BorderStroke(1.dp, EcoBorder)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            TimelineTracker(currentStatus = report.status)
                        }
                    }

                    // Progress Updates Log
                    if (updates.isNotEmpty()) {
                        Column(modifier = Modifier.fillMaxWidth()) {
                            Text(
                                text = "Action Tracking Timeline",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = EcoTextPrimary
                            )
                            Spacer(modifier = Modifier.height(8.dp))

                            updates.forEach { update ->
                                val updateDate = dateFormat.format(Date(update.timestamp))
                                Surface(
                                    shape = RoundedCornerShape(10.dp),
                                    color = Color(0xFFF1F5F9),
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 3.dp)
                                ) {
                                    Column(modifier = Modifier.padding(10.dp)) {
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween
                                        ) {
                                            Text(
                                                text = update.status,
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 12.sp,
                                                color = EcoForestGreen
                                            )
                                            Text(
                                                text = updateDate,
                                                fontSize = 10.sp,
                                                color = EcoTextMuted
                                            )
                                        }
                                        Spacer(modifier = Modifier.height(2.dp))
                                        Text(
                                            text = update.remarks,
                                            fontSize = 11.sp,
                                            color = EcoTextSecondary
                                        )
                                        Spacer(modifier = Modifier.height(2.dp))
                                        Text(
                                            text = "Logged by: ${update.updatedBy}",
                                            fontSize = 10.sp,
                                            color = EcoTextMuted
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // Administrator / Officer Controls (Thesis Feature)
                    if (isAdminOrOfficer) {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFFF0FDF4)),
                            border = androidx.compose.foundation.BorderStroke(1.dp, EcoEmerald)
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Text(
                                    text = "🛡️ Administrative Action & Assignment",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = EcoGreenDark
                                )
                                Spacer(modifier = Modifier.height(8.dp))

                                // Status selector dropdown
                                ExposedDropdownMenuBox(
                                    expanded = statusDropdownExpanded,
                                    onExpandedChange = { statusDropdownExpanded = it }
                                ) {
                                    OutlinedTextField(
                                        value = selectedNextStatus,
                                        onValueChange = {},
                                        readOnly = true,
                                        label = { Text("Advance Workflow Status") },
                                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = statusDropdownExpanded) },
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .menuAnchor(MenuAnchorType.PrimaryNotEditable),
                                        shape = RoundedCornerShape(8.dp)
                                    )
                                    ExposedDropdownMenu(
                                        expanded = statusDropdownExpanded,
                                        onDismissRequest = { statusDropdownExpanded = false }
                                    ) {
                                        WorkflowStatuses.forEach { st ->
                                            DropdownMenuItem(
                                                text = { Text(st) },
                                                onClick = {
                                                    selectedNextStatus = st
                                                    statusDropdownExpanded = false
                                                }
                                            )
                                        }
                                    }
                                }

                                Spacer(modifier = Modifier.height(8.dp))

                                // Assign Authority Office Dropdown
                                ExposedDropdownMenuBox(
                                    expanded = authorityDropdownExpanded,
                                    onExpandedChange = { authorityDropdownExpanded = it }
                                ) {
                                    OutlinedTextField(
                                        value = selectedAuthority,
                                        onValueChange = {},
                                        readOnly = true,
                                        label = { Text("Assign Authority Agency") },
                                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = authorityDropdownExpanded) },
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .menuAnchor(MenuAnchorType.PrimaryNotEditable),
                                        shape = RoundedCornerShape(8.dp)
                                    )
                                    ExposedDropdownMenu(
                                        expanded = authorityDropdownExpanded,
                                        onDismissRequest = { authorityDropdownExpanded = false }
                                    ) {
                                        AuthorityOffices.forEach { auth ->
                                            DropdownMenuItem(
                                                text = { Text(auth) },
                                                onClick = {
                                                    selectedAuthority = auth
                                                    authorityDropdownExpanded = false
                                                }
                                            )
                                        }
                                    }
                                }

                                Spacer(modifier = Modifier.height(8.dp))

                                OutlinedTextField(
                                    value = adminRemarkText,
                                    onValueChange = { adminRemarkText = it },
                                    placeholder = { Text("Official action remarks...", fontSize = 12.sp) },
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(8.dp),
                                    singleLine = true
                                )

                                Spacer(modifier = Modifier.height(10.dp))

                                Button(
                                    onClick = {
                                        val remarks = if (adminRemarkText.isNotBlank()) adminRemarkText else "Status changed to $selectedNextStatus by ${currentUser?.name}."
                                        viewModel.updateReportStatus(
                                            reportId = report.id,
                                            newStatus = selectedNextStatus,
                                            remarks = remarks,
                                            assignedOfficer = selectedAuthority
                                        )
                                        onDismiss()
                                    },
                                    shape = RoundedCornerShape(10.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = EcoForestGreen),
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .testTag("confirm_admin_update_btn")
                                ) {
                                    Text("Apply Status & Authority Assignment", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

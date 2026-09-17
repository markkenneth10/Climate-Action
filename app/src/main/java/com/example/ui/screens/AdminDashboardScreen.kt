package com.example.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AssignmentTurnedIn
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.R
import com.example.ui.components.HorizontalDistributionBar
import com.example.ui.components.SeverityBadge
import com.example.ui.components.StatCard
import com.example.ui.components.StatusBadge
import com.example.ui.components.getSeverityColor
import com.example.ui.components.getStatusColor
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
import com.example.ui.theme.SeverityHigh
import com.example.ui.theme.SeverityLow
import com.example.ui.theme.SeverityModerate
import com.example.ui.viewmodel.ClimateViewModel

@Composable
fun AdminDashboardScreen(
    viewModel: ClimateViewModel,
    modifier: Modifier = Modifier
) {
    val reports by viewModel.allReports.collectAsState()
    val currentUser by viewModel.currentUser.collectAsState()

    var statusFilter by remember { mutableStateOf<String?>(null) }
    var barangayFilter by remember { mutableStateOf<String?>(null) }
    var adminSearch by remember { mutableStateOf("") }

    val filteredReports = reports.filter { rep ->
        val matchesStatus = statusFilter == null || rep.status == statusFilter
        val matchesBarangay = barangayFilter == null || rep.barangay == barangayFilter
        val matchesSearch = adminSearch.isBlank() ||
                rep.title.contains(adminSearch, ignoreCase = true) ||
                rep.barangay.contains(adminSearch, ignoreCase = true) ||
                rep.category.contains(adminSearch, ignoreCase = true) ||
                rep.authorName.contains(adminSearch, ignoreCase = true)
        matchesStatus && matchesBarangay && matchesSearch
    }

    // Analytics computation
    val total = reports.size
    val pendingReviewCount = reports.count { it.status == "Submitted" || it.status == "Under Review" }
    val verifiedCount = reports.count { it.status == "Verified" }
    val inProgressCount = reports.count { it.status == "In Progress" }
    val resolvedCount = reports.count { it.status == "Resolved" || it.status == "Closed" }

    val categoryDistribution = reports.groupBy { it.category }
        .mapValues { it.value.size }
        .toList()
        .sortedByDescending { it.second }

    val barangayDistribution = reports.groupBy { it.barangay }
        .mapValues { it.value.size }
        .toList()
        .sortedByDescending { it.second }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAF8)),
        contentPadding = PaddingValues(bottom = 96.dp)
    ) {
        // 1. Admin Header
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(EcoGreenDark)
                    .padding(horizontal = 20.dp, vertical = 20.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(Color.White)
                                .padding(3.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Image(
                                painter = painterResource(id = R.drawable.app_logo),
                                contentDescription = "Admin Portal Logo",
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Fit
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Admin & Officer Portal",
                                color = EcoMint,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Environmental Governance & Analytics",
                                color = Color.White,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        OutlinedButton(
                            onClick = { viewModel.showWebPortalDialog.value = true },
                            shape = RoundedCornerShape(10.dp),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp),
                            modifier = Modifier.testTag("admin_web_portal_button"),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White)
                        ) {
                            Text("🌐 Web", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }

                        Button(
                            onClick = { viewModel.showThesisSummaryDialog.value = true },
                            colors = ButtonDefaults.buttonColors(containerColor = EcoEmerald),
                            shape = RoundedCornerShape(10.dp),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp),
                            modifier = Modifier.testTag("export_thesis_summary_button")
                        ) {
                            Icon(
                                imageVector = Icons.Default.Download,
                                contentDescription = null,
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Export", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Search field
                OutlinedTextField(
                    value = adminSearch,
                    onValueChange = { adminSearch = it },
                    placeholder = { Text("Filter reports by keyword, barangay, or citizen...", fontSize = 12.sp, color = EcoTextMuted) },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = null,
                            tint = EcoEmerald,
                            modifier = Modifier.size(18.dp)
                        )
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("admin_search_field"),
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true,
                    colors = androidx.compose.material3.OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White
                    )
                )
            }
        }

        // 2. Overview Metrics Cards
        item {
            Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 14.dp)) {
                Text(
                    text = "Operational Metrics",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = EcoTextPrimary
                )
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    StatCard(
                        title = "Pending Review",
                        value = "$pendingReviewCount",
                        iconEmoji = "⏳",
                        modifier = Modifier.weight(1f),
                        accentColor = SeverityHigh,
                        subtitle = "Needs verification"
                    )
                    StatCard(
                        title = "In Progress",
                        value = "$inProgressCount",
                        iconEmoji = "🛠️",
                        modifier = Modifier.weight(1f),
                        accentColor = EcoSkyBlue,
                        subtitle = "Teams dispatched"
                    )
                    StatCard(
                        title = "Resolved",
                        value = "$resolvedCount",
                        iconEmoji = "✅",
                        modifier = Modifier.weight(1f),
                        accentColor = EcoEmerald,
                        subtitle = "Action complete"
                    )
                }
            }
        }

        // 3. Thesis Analytics Charts (Category & Barangay breakdown)
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 6.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = EcoSurface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, EcoBorder)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.BarChart,
                                contentDescription = null,
                                tint = EcoForestGreen,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Most Reported Environmental Issues",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = EcoTextPrimary
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    categoryDistribution.take(5).forEach { (cat, count) ->
                        val color = when {
                            cat.contains("waste", ignoreCase = true) -> EcoTeal
                            cat.contains("cutting", ignoreCase = true) -> EcoForestGreen
                            cat.contains("Water", ignoreCase = true) -> EcoSkyBlue
                            cat.contains("Flood", ignoreCase = true) -> Color(0xFF6366F1)
                            else -> SeverityModerate
                        }
                        HorizontalDistributionBar(
                            label = cat,
                            count = count,
                            total = total,
                            color = color
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = "Barangay Incident Frequency Assessment",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = EcoTextPrimary
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    barangayDistribution.take(4).forEach { (bgy, count) ->
                        HorizontalDistributionBar(
                            label = bgy,
                            count = count,
                            total = total,
                            color = EcoEmerald
                        )
                    }
                }
            }
        }

        // 4. Filter Tabs for Incident Queue
        item {
            Column(modifier = Modifier.padding(top = 10.dp)) {
                Text(
                    text = "Incident Queue & Management (${filteredReports.size})",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = EcoTextPrimary,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
                Spacer(modifier = Modifier.height(8.dp))
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    item {
                        Surface(
                            shape = RoundedCornerShape(14.dp),
                            color = if (statusFilter == null) EcoForestGreen else EcoSurfaceVariant,
                            modifier = Modifier
                                .clickable { statusFilter = null }
                                .testTag("admin_filter_all")
                        ) {
                            Text(
                                text = "All Status ($total)",
                                fontSize = 11.sp,
                                fontWeight = if (statusFilter == null) FontWeight.Bold else FontWeight.Normal,
                                color = if (statusFilter == null) Color.White else EcoTextPrimary,
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                            )
                        }
                    }
                    items(listOf("Submitted", "Under Review", "Verified", "In Progress", "Resolved")) { st ->
                        val count = reports.count { it.status == st }
                        Surface(
                            shape = RoundedCornerShape(14.dp),
                            color = if (statusFilter == st) EcoForestGreen else EcoSurfaceVariant,
                            modifier = Modifier
                                .clickable { statusFilter = if (statusFilter == st) null else st }
                                .testTag("admin_filter_$st")
                        ) {
                            Text(
                                text = "$st ($count)",
                                fontSize = 11.sp,
                                fontWeight = if (statusFilter == st) FontWeight.Bold else FontWeight.Normal,
                                color = if (statusFilter == st) Color.White else EcoTextPrimary,
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                            )
                        }
                    }
                }
            }
        }

        // 5. Manageable Report Cards
        items(filteredReports) { rep ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 6.dp)
                    .clickable { viewModel.openReportDetail(rep) }
                    .testTag("admin_report_card_${rep.id}"),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = EcoSurface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, EcoBorder)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(text = rep.categoryIcon, fontSize = 20.sp)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Report #${rep.id} • ${rep.category}",
                                fontSize = 11.sp,
                                color = EcoTextSecondary,
                                fontWeight = FontWeight.Medium
                            )
                        }
                        SeverityBadge(rep.severity)
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = rep.title,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = EcoTextPrimary
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = "Reported by ${rep.authorName} in ${rep.barangay}",
                        fontSize = 11.sp,
                        color = EcoTextSecondary
                    )

                    if (rep.assignedOfficer != null) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Assigned Officer: ${rep.assignedOfficer}",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = EcoForestGreen
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        StatusBadge(rep.status)

                        // Quick Admin Action workflow buttons
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            if (rep.status == "Submitted" || rep.status == "Under Review") {
                                Button(
                                    onClick = {
                                        viewModel.updateReportStatus(
                                            reportId = rep.id,
                                            newStatus = "Verified",
                                            remarks = "Report verified by administrative review. Dispatched to CENRO.",
                                            assignedOfficer = "Officer Elena Torres (CENRO)"
                                        )
                                    },
                                    shape = RoundedCornerShape(8.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = EcoForestGreen),
                                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                    modifier = Modifier.testTag("admin_action_verify_${rep.id}")
                                ) {
                                    Text("Verify", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                            }

                            if (rep.status == "Verified") {
                                Button(
                                    onClick = {
                                        viewModel.updateReportStatus(
                                            reportId = rep.id,
                                            newStatus = "In Progress",
                                            remarks = "Clean-up and remediation team on-site.",
                                            assignedOfficer = "Barangay Tanod Response Unit"
                                        )
                                    },
                                    shape = RoundedCornerShape(8.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = EcoTeal),
                                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text("Dispatch", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                            }

                            if (rep.status == "In Progress") {
                                Button(
                                    onClick = {
                                        viewModel.updateReportStatus(
                                            reportId = rep.id,
                                            newStatus = "Resolved",
                                            remarks = "Environmental violation resolved and site rehabilitated.",
                                            assignedOfficer = "CENRO Enforcement Team"
                                        )
                                    },
                                    shape = RoundedCornerShape(8.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = EcoEmerald),
                                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text("Resolve", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                            }

                            OutlinedButton(
                                onClick = { viewModel.openReportDetail(rep) },
                                shape = RoundedCornerShape(8.dp),
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text("Details", fontSize = 11.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}

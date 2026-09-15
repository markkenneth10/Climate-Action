package com.example.ui.screens

import androidx.compose.foundation.background
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
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.ReportEntity
import com.example.ui.components.HotspotMapCanvas
import com.example.ui.components.SeverityBadge
import com.example.ui.components.StatusBadge
import com.example.ui.components.getSeverityColor
import com.example.ui.theme.EcoBorder
import com.example.ui.theme.EcoForestGreen
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
fun MapScreen(
    viewModel: ClimateViewModel,
    modifier: Modifier = Modifier
) {
    val reports by viewModel.allReports.collectAsState()
    var selectedSeverityFilter by remember { mutableStateOf<String?>(null) }
    var selectedBarangayFilter by remember { mutableStateOf<String?>(null) }
    var selectedReportOnMap by remember { mutableStateOf<ReportEntity?>(reports.firstOrNull()) }
    var mapSearchQuery by remember { mutableStateOf("") }

    val filteredReports = reports.filter { rep ->
        val matchesSeverity = selectedSeverityFilter == null || rep.severity == selectedSeverityFilter
        val matchesBarangay = selectedBarangayFilter == null || rep.barangay == selectedBarangayFilter
        val matchesSearch = mapSearchQuery.isBlank() ||
                rep.title.contains(mapSearchQuery, ignoreCase = true) ||
                rep.barangay.contains(mapSearchQuery, ignoreCase = true) ||
                rep.category.contains(mapSearchQuery, ignoreCase = true)
        matchesSeverity && matchesBarangay && matchesSearch
    }

    // Compute Hotspots per Barangay
    val barangayCounts = reports.groupBy { it.barangay }
        .mapValues { entry ->
            val total = entry.value.size
            val critical = entry.value.count { it.severity == "Critical" || it.severity == "High" }
            Pair(total, critical)
        }
        .toList()
        .sortedByDescending { it.second.first }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAF8)),
        contentPadding = PaddingValues(bottom = 96.dp)
    ) {
        // Top Header
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(EcoForestGreen)
                    .padding(horizontal = 20.dp, vertical = 16.dp)
            ) {
                Text(
                    text = "Interactive Climate Issue Map",
                    color = Color.White,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Geospatial monitoring of environmental hotspots in Metro Verde",
                    color = EcoMint,
                    fontSize = 12.sp
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Search Bar
                OutlinedTextField(
                    value = mapSearchQuery,
                    onValueChange = { mapSearchQuery = it },
                    placeholder = { Text("Search by issue, category, or barangay...", fontSize = 12.sp, color = EcoTextMuted) },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = null,
                            tint = EcoForestGreen,
                            modifier = Modifier.size(18.dp)
                        )
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("map_search_field"),
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true,
                    colors = androidx.compose.material3.OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White
                    )
                )
            }
        }

        // Severity Filter Chips
        item {
            Column(modifier = Modifier.padding(top = 12.dp, bottom = 6.dp)) {
                Text(
                    text = "Filter by Severity",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = EcoTextPrimary,
                    modifier = Modifier.padding(horizontal = 20.dp)
                )
                Spacer(modifier = Modifier.height(6.dp))
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 20.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    item {
                        FilterPill(
                            label = "All Severities (${reports.size})",
                            isSelected = selectedSeverityFilter == null,
                            onClick = { selectedSeverityFilter = null },
                            activeColor = EcoForestGreen
                        )
                    }
                    items(listOf("Critical" to SeverityCritical, "High" to SeverityHigh, "Moderate" to SeverityModerate, "Low" to SeverityLow)) { (sev, col) ->
                        val count = reports.count { it.severity == sev }
                        FilterPill(
                            label = "$sev ($count)",
                            isSelected = selectedSeverityFilter == sev,
                            onClick = { selectedSeverityFilter = if (selectedSeverityFilter == sev) null else sev },
                            activeColor = col
                        )
                    }
                }
            }
        }

        // Map Canvas Box
        item {
            Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Metro Verde Cartographic Grid",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = EcoTextPrimary
                    )
                    Text(
                        text = "${filteredReports.size} pins plotted",
                        fontSize = 11.sp,
                        color = EcoTextSecondary
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                HotspotMapCanvas(
                    reports = filteredReports,
                    selectedReport = selectedReportOnMap,
                    onReportSelected = { rep ->
                        selectedReportOnMap = rep
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(320.dp)
                )

                Text(
                    text = "💡 Tap any pin on the map to inspect location, category, severity, and workflow status.",
                    fontSize = 10.sp,
                    color = EcoTextMuted,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }
        }

        // Selected Pin Quick Inspector Card
        selectedReportOnMap?.let { rep ->
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 6.dp)
                        .clickable { viewModel.openReportDetail(rep) }
                        .testTag("map_inspected_card"),
                    colors = CardDefaults.cardColors(containerColor = EcoSurface),
                    elevation = CardDefaults.cardElevation(defaultElevation = 3.dp),
                    shape = RoundedCornerShape(16.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, EcoBorder)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(text = rep.categoryIcon, fontSize = 22.sp)
                                Spacer(modifier = Modifier.width(8.dp))
                                Column {
                                    Text(
                                        text = rep.title,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp,
                                        color = EcoTextPrimary
                                    )
                                    Text(
                                        text = "${rep.barangay} • Lat: ${rep.latitude}, Lon: ${rep.longitude}",
                                        fontSize = 10.sp,
                                        color = EcoTextSecondary
                                    )
                                }
                            }
                            SeverityBadge(rep.severity)
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = rep.description,
                            fontSize = 11.sp,
                            color = EcoTextSecondary,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            StatusBadge(rep.status)

                            Button(
                                onClick = { viewModel.openReportDetail(rep) },
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = EcoForestGreen)
                            ) {
                                Text(text = "View Incident Tracking →", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }

        // Barangay Frequency Hotspot Breakdown (Thesis Core Requirement)
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 10.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = EcoSurface),
                border = androidx.compose.foundation.BorderStroke(1.dp, EcoBorder)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Barangay Hotspot Ranking",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = EcoTextPrimary
                        )
                        Text(
                            text = "Frequent Problem Areas",
                            fontSize = 11.sp,
                            color = EcoTeal,
                            fontWeight = FontWeight.SemiBold
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    barangayCounts.forEach { (bgy, counts) ->
                        val isSelected = selectedBarangayFilter == bgy
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isSelected) EcoMint else Color.Transparent)
                                .clickable {
                                    selectedBarangayFilter = if (selectedBarangayFilter == bgy) null else bgy
                                }
                                .padding(horizontal = 8.dp, vertical = 6.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.LocationOn,
                                    contentDescription = null,
                                    tint = if (counts.second > 0) SeverityCritical else EcoTeal,
                                    modifier = Modifier.size(14.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = bgy,
                                    fontSize = 12.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                    color = EcoTextPrimary
                                )
                            }

                            Row(verticalAlignment = Alignment.CenterVertically) {
                                if (counts.second > 0) {
                                    Surface(
                                        shape = RoundedCornerShape(6.dp),
                                        color = SeverityCritical.copy(alpha = 0.1f)
                                    ) {
                                        Text(
                                            text = "${counts.second} High/Crit",
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = SeverityCritical,
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                        )
                                    }
                                    Spacer(modifier = Modifier.width(6.dp))
                                }
                                Text(
                                    text = "${counts.first} reports",
                                    fontSize = 11.sp,
                                    color = EcoTextSecondary,
                                    fontWeight = FontWeight.SemiBold
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
private fun FilterPill(
    label: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    activeColor: Color
) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = if (isSelected) activeColor else EcoSurfaceVariant,
        modifier = Modifier.clickable(onClick = onClick)
    ) {
        Text(
            text = label,
            fontSize = 11.sp,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
            color = if (isSelected) Color.White else EcoTextPrimary,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
        )
    }
}

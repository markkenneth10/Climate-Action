package com.example.ui.screens

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddPhotoAlternate
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Verified
import com.example.data.model.UserEntity
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MenuAnchorType
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableDoubleStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.example.ui.components.IncidentLocationPickerMiniMap
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
import coil.compose.AsyncImage
import com.example.R
import com.example.ui.components.SeverityBadge
import com.example.ui.components.StatusBadge
import com.example.ui.components.TimelineTracker
import com.example.ui.components.getSeverityBgColor
import com.example.ui.components.getSeverityColor
import com.example.ui.theme.EcoBorder
import com.example.ui.theme.EcoEmerald
import com.example.ui.theme.EcoForestGreen
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

val ClimateCategories = listOf(
    "🌳" to "Illegal cutting of trees",
    "🗑️" to "Improper waste disposal",
    "🔥" to "Open burning",
    "💧" to "Water pollution",
    "🌊" to "Flooding",
    "🌡️" to "Extreme heat",
    "🌪️" to "Storm-related damage",
    "🌱" to "Lack of vegetation",
    "🚰" to "Water shortage",
    "🏭" to "Air pollution",
    "🐟" to "Environmental destruction",
    "⚠️" to "Other environmental concerns"
)

val MetroVerdeBarangays = listOf(
    "Barangay Makilas" to Pair(14.5995, 120.9842),
    "Barangay Riverside" to Pair(14.5880, 120.9780),
    "Barangay San Jose" to Pair(14.5750, 120.9890),
    "Barangay Central" to Pair(14.6050, 120.9750),
    "Barangay Maligaya" to Pair(14.6100, 120.9920),
    "Barangay Poblacion" to Pair(14.5920, 120.9990),
    "Barangay Coastal Bay" to Pair(14.5650, 120.9650)
)

val Severities = listOf("Critical", "High", "Moderate", "Low")

@OptIn(ExperimentalLayoutApi::class, ExperimentalMaterial3Api::class)
@Composable
fun ReportScreen(
    viewModel: ClimateViewModel,
    modifier: Modifier = Modifier
) {
    var selectedSubTab by remember { mutableStateOf(0) } // 0: Submit New, 1: Track Reports

    // Form fields
    var title by remember { mutableStateOf("") }
    var selectedCategoryPair by remember { mutableStateOf(ClimateCategories[1]) }
    var description by remember { mutableStateOf("") }
    var selectedBarangayPair by remember { mutableStateOf(MetroVerdeBarangays[0]) }
    var pinnedLatitude by remember { mutableDoubleStateOf(MetroVerdeBarangays[0].second.first) }
    var pinnedLongitude by remember { mutableDoubleStateOf(MetroVerdeBarangays[0].second.second) }
    var selectedSeverity by remember { mutableStateOf("High") }
    var photoUriString by remember { mutableStateOf<String?>(null) }
    var barangayDropdownExpanded by remember { mutableStateOf(false) }
    var gpsLocked by remember { mutableStateOf(true) }

    // Photo picker launcher
    val photoPickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia()
    ) { uri: Uri? ->
        photoUriString = uri?.toString()
    }

    val reports by viewModel.allReports.collectAsState()
    val currentUser by viewModel.currentUser.collectAsState()

    // Filtered reports for the tracking subtab
    var trackingFilter by remember { mutableStateOf("All") }
    val userReports = if (currentUser?.role == "Citizen") {
        reports.filter { it.userId == (currentUser?.id ?: 1) }
    } else {
        reports
    }

    val displayedTrackingReports = when (trackingFilter) {
        "All" -> userReports
        "Under Review" -> userReports.filter { it.status == "Under Review" || it.status == "Submitted" }
        "In Progress" -> userReports.filter { it.status == "In Progress" || it.status == "Verified" }
        "Resolved" -> userReports.filter { it.status == "Resolved" || it.status == "Closed" }
        else -> userReports
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAF8))
    ) {
        // Top Header
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(EcoForestGreen)
                .padding(horizontal = 20.dp, vertical = 16.dp)
        ) {
            Text(
                text = "Climate Issue Reporting & Tracking",
                color = Color.White,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Empowering citizens with photo and geotagged reporting",
                color = EcoMint,
                fontSize = 12.sp
            )

            Spacer(modifier = Modifier.height(14.dp))

            // Sub-Tab Switcher
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                color = Color.White.copy(alpha = 0.15f)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(4.dp)
                ) {
                    Surface(
                        modifier = Modifier
                            .weight(1f)
                            .clickable { selectedSubTab = 0 }
                            .testTag("tab_submit_report"),
                        shape = RoundedCornerShape(10.dp),
                        color = if (selectedSubTab == 0) Color.White else Color.Transparent
                    ) {
                        Text(
                            text = "✍️ Submit Report",
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp,
                            color = if (selectedSubTab == 0) EcoForestGreen else Color.White,
                            modifier = Modifier.padding(vertical = 8.dp)
                        )
                    }

                    Surface(
                        modifier = Modifier
                            .weight(1f)
                            .clickable { selectedSubTab = 1 }
                            .testTag("tab_track_reports"),
                        shape = RoundedCornerShape(10.dp),
                        color = if (selectedSubTab == 1) Color.White else Color.Transparent
                    ) {
                        Text(
                            text = "📊 Track Submissions (${userReports.size})",
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp,
                            color = if (selectedSubTab == 1) EcoForestGreen else Color.White,
                            modifier = Modifier.padding(vertical = 8.dp)
                        )
                    }
                }
            }
        }

        // Content Area
        if (selectedSubTab == 0) {
            if (currentUser == null) {
                CitizenAccountRequiredGate(viewModel = viewModel)
            } else if (!currentUser!!.isVerified || currentUser!!.kycStatus != "verified") {
                CitizenKycRequiredGate(currentUser = currentUser!!, viewModel = viewModel)
            } else {
                // SUBMIT NEW REPORT FORM
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    contentPadding = PaddingValues(top = 16.dp, bottom = 96.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // Verified Citizen Reporter Banner
                    item {
                        VerifiedCitizenBanner(currentUser = currentUser!!)
                    }

                    // Step Guidance Banner
                    item {
                        Surface(
                            modifier = Modifier.fillMaxWidth(),
                            color = EcoMint,
                            shape = RoundedCornerShape(12.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, EcoBorder)
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(text = "📌", fontSize = 20.sp)
                                Spacer(modifier = Modifier.width(10.dp))
                                Text(
                                    text = "Take Photo → Select Location → Describe Problem → Submit Report (+10 Points)",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = EcoForestGreen
                                )
                            }
                        }
                    }

                // 1. Report Title
                item {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = EcoSurface),
                        shape = RoundedCornerShape(14.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, EcoBorder)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text(
                                text = "1. Report Title",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = EcoTextPrimary
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            OutlinedTextField(
                                value = title,
                                onValueChange = { title = it },
                                placeholder = { Text("e.g., Plastic trash dumped near riverside", fontSize = 13.sp) },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("report_title_input"),
                                shape = RoundedCornerShape(10.dp),
                                singleLine = true
                            )
                        }
                    }
                }

                // 2. Category Selection (All 12 Thesis Categories)
                item {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = EcoSurface),
                        shape = RoundedCornerShape(14.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, EcoBorder)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text(
                                text = "2. Select Issue Category",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = EcoTextPrimary
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            FlowRow(
                                horizontalArrangement = Arrangement.spacedBy(6.dp),
                                verticalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                ClimateCategories.forEach { cat ->
                                    val isSelected = selectedCategoryPair.second == cat.second
                                    Surface(
                                        shape = RoundedCornerShape(20.dp),
                                        color = if (isSelected) EcoForestGreen else EcoSurfaceVariant,
                                        modifier = Modifier
                                            .clickable { selectedCategoryPair = cat }
                                            .testTag("category_chip_${cat.second}")
                                    ) {
                                        Text(
                                            text = "${cat.first} ${cat.second}",
                                            fontSize = 11.sp,
                                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                            color = if (isSelected) Color.White else EcoTextPrimary,
                                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                // 3. Severity Level
                item {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = EcoSurface),
                        shape = RoundedCornerShape(14.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, EcoBorder)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text(
                                text = "3. Severity Assessment",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = EcoTextPrimary
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Severities.forEach { sev ->
                                    val isSelected = selectedSeverity == sev
                                    val sevColor = getSeverityColor(sev)
                                    val sevBg = getSeverityBgColor(sev)

                                    Surface(
                                        modifier = Modifier
                                            .weight(1f)
                                            .clickable { selectedSeverity = sev }
                                            .testTag("severity_selector_$sev"),
                                        shape = RoundedCornerShape(10.dp),
                                        color = if (isSelected) sevColor else sevBg,
                                        border = androidx.compose.foundation.BorderStroke(
                                            1.dp,
                                            if (isSelected) sevColor else sevColor.copy(alpha = 0.3f)
                                        )
                                    ) {
                                        Column(
                                            modifier = Modifier.padding(vertical = 8.dp),
                                            horizontalAlignment = Alignment.CenterHorizontally
                                        ) {
                                            Text(
                                                text = when (sev) {
                                                    "Critical" -> "🔴"
                                                    "High" -> "🟠"
                                                    "Moderate" -> "🟡"
                                                    else -> "🟢"
                                                },
                                                fontSize = 12.sp
                                            )
                                            Text(
                                                text = sev,
                                                fontSize = 11.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = if (isSelected) Color.White else sevColor
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // 4. Photo Evidence
                item {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = EcoSurface),
                        shape = RoundedCornerShape(14.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, EcoBorder)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text(
                                text = "4. Photo Evidence",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = EcoTextPrimary
                            )
                            Spacer(modifier = Modifier.height(8.dp))

                            if (photoUriString != null) {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(160.dp)
                                        .clip(RoundedCornerShape(12.dp))
                                ) {
                                    AsyncImage(
                                        model = photoUriString,
                                        contentDescription = "Selected evidence photo",
                                        modifier = Modifier.fillMaxSize(),
                                        contentScale = ContentScale.Crop
                                    )
                                    Surface(
                                        modifier = Modifier
                                            .align(Alignment.TopEnd)
                                            .padding(8.dp)
                                            .clickable { photoUriString = null },
                                        shape = CircleShape,
                                        color = Color.Black.copy(alpha = 0.6f)
                                    ) {
                                        Text(
                                            text = "✕",
                                            color = Color.White,
                                            fontSize = 12.sp,
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                        )
                                    }
                                }
                            } else {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    OutlinedButton(
                                        onClick = {
                                            photoPickerLauncher.launch(
                                                PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                                            )
                                        },
                                        modifier = Modifier
                                            .weight(1f)
                                            .testTag("pick_photo_button"),
                                        shape = RoundedCornerShape(10.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.AddPhotoAlternate,
                                            contentDescription = null,
                                            modifier = Modifier.size(16.dp)
                                        )
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text("Pick Photo", fontSize = 12.sp)
                                    }

                                    Button(
                                        onClick = {
                                            // Mock photo capture simulation
                                            photoUriString = "android.resource://com.example/drawable/climate_hero_banner"
                                        },
                                        modifier = Modifier
                                            .weight(1f)
                                            .testTag("use_sample_evidence_button"),
                                        shape = RoundedCornerShape(10.dp),
                                        colors = ButtonDefaults.buttonColors(containerColor = EcoTeal)
                                    ) {
                                        Text("📷 Quick Evidence", fontSize = 12.sp)
                                    }
                                }
                            }
                        }
                    }
                }

                // 5. Location Tagging (Interactive Mini Map + GPS + Barangay)
                item {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = EcoSurface),
                        shape = RoundedCornerShape(14.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, EcoBorder)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(
                                        text = "5. Pin Incident Location",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp,
                                        color = EcoTextPrimary
                                    )
                                    Text(
                                        text = "Interactive Mini Map • Tap or drag to mark exact violation site",
                                        fontSize = 11.sp,
                                        color = EcoTextSecondary
                                    )
                                }
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier.clickable { gpsLocked = !gpsLocked }
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.MyLocation,
                                        contentDescription = null,
                                        tint = if (gpsLocked) EcoEmerald else EcoTextMuted,
                                        modifier = Modifier.size(14.dp)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        text = if (gpsLocked) "GPS Geotagged" else "Manual Tag",
                                        fontSize = 10.sp,
                                        color = if (gpsLocked) EcoForestGreen else EcoTextMuted,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            // Interactive Mini Map with Pin Placement
                            IncidentLocationPickerMiniMap(
                                currentLatitude = pinnedLatitude,
                                currentLongitude = pinnedLongitude,
                                selectedBarangay = selectedBarangayPair.first,
                                onLocationPinned = { lat, lon, nearestBgy ->
                                    pinnedLatitude = lat
                                    pinnedLongitude = lon
                                    val matched = MetroVerdeBarangays.find { it.first == nearestBgy } ?: MetroVerdeBarangays.first()
                                    selectedBarangayPair = matched
                                }
                            )

                            Spacer(modifier = Modifier.height(12.dp))

                            ExposedDropdownMenuBox(
                                expanded = barangayDropdownExpanded,
                                onExpandedChange = { barangayDropdownExpanded = it }
                            ) {
                                OutlinedTextField(
                                    value = selectedBarangayPair.first,
                                    onValueChange = {},
                                    readOnly = true,
                                    label = { Text("Detected / Assigned Barangay") },
                                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = barangayDropdownExpanded) },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .menuAnchor(MenuAnchorType.PrimaryNotEditable),
                                    shape = RoundedCornerShape(10.dp)
                                )
                                ExposedDropdownMenu(
                                    expanded = barangayDropdownExpanded,
                                    onDismissRequest = { barangayDropdownExpanded = false }
                                ) {
                                    MetroVerdeBarangays.forEach { bgy ->
                                        DropdownMenuItem(
                                            text = { Text(bgy.first) },
                                            onClick = {
                                                selectedBarangayPair = bgy
                                                pinnedLatitude = bgy.second.first
                                                pinnedLongitude = bgy.second.second
                                                barangayDropdownExpanded = false
                                            }
                                        )
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "City: Metro Verde • Pinned GPS: ${"%.4f".format(pinnedLatitude)}° N, ${"%.4f".format(pinnedLongitude)}° E",
                                fontSize = 10.sp,
                                color = EcoTextSecondary
                            )
                        }
                    }
                }

                // 6. Detailed Problem Description
                item {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = EcoSurface),
                        shape = RoundedCornerShape(14.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, EcoBorder)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text(
                                text = "6. Problem Description",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = EcoTextPrimary
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            OutlinedTextField(
                                value = description,
                                onValueChange = { description = it },
                                placeholder = {
                                    Text(
                                        "Provide specific details: When did it start? How long has it persisted? What is the impact on nearby residents?",
                                        fontSize = 12.sp,
                                        color = EcoTextMuted
                                    )
                                },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(100.dp)
                                    .testTag("report_description_input"),
                                shape = RoundedCornerShape(10.dp)
                            )
                        }
                    }
                }

                // Submit Button
                item {
                    Button(
                        onClick = {
                            if (title.isNotBlank() && description.isNotBlank()) {
                                viewModel.submitNewReport(
                                    title = title,
                                    category = selectedCategoryPair.second,
                                    categoryIcon = selectedCategoryPair.first,
                                    description = description,
                                    photoUri = photoUriString,
                                    barangay = selectedBarangayPair.first,
                                    severity = selectedSeverity,
                                    latitude = pinnedLatitude,
                                    longitude = pinnedLongitude
                                )
                                // Clear fields
                                title = ""
                                description = ""
                                photoUriString = null
                                selectedSubTab = 1 // Jump to tracking view
                            }
                        },
                        enabled = title.isNotBlank() && description.isNotBlank(),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp)
                            .testTag("submit_report_button"),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = EcoForestGreen)
                    ) {
                        Text(
                            text = "🚀 Submit Environmental Report (+10 pts)",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                    }
                }
            }
        }
    } else {
        // TRACK SUBMISSIONS LIST VIEW
        if (currentUser == null) {
            CitizenAccountRequiredGate(
                viewModel = viewModel,
                customTitle = "Citizen Account Required to Track",
                customSubtitle = "Sign in or create an account to view and follow up on your reported environmental hazards."
            )
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp)
            ) {
                // Filter chips for tracking
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 12.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf("All", "Under Review", "In Progress", "Resolved").forEach { statusLabel ->
                        val isSelected = trackingFilter == statusLabel
                        Surface(
                            shape = RoundedCornerShape(16.dp),
                            color = if (isSelected) EcoForestGreen else EcoSurfaceVariant,
                            modifier = Modifier
                                .clickable { trackingFilter = statusLabel }
                                .testTag("filter_tracking_$statusLabel")
                        ) {
                            Text(
                                text = statusLabel,
                                fontSize = 11.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                color = if (isSelected) Color.White else EcoTextPrimary,
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                            )
                        }
                    }
                }

                if (displayedTrackingReports.isEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(text = "📭", fontSize = 40.sp)
                            Spacer(modifier = Modifier.height(10.dp))
                            Text(
                                text = "No reports found in this category",
                                fontSize = 14.sp,
                                color = EcoTextSecondary,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(bottom = 96.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(displayedTrackingReports) { rep ->
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { viewModel.openReportDetail(rep) }
                                    .testTag("report_tracking_card_${rep.id}"),
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
                                            Spacer(modifier = Modifier.width(8.dp))
                                            Text(
                                                text = rep.category,
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
                                        text = rep.description,
                                        fontSize = 12.sp,
                                        color = EcoTextSecondary,
                                        maxLines = 2,
                                        overflow = TextOverflow.Ellipsis
                                    )

                                    Spacer(modifier = Modifier.height(12.dp))

                                    // Interactive 6-step progress workflow
                                    TimelineTracker(currentStatus = rep.status)

                                    Spacer(modifier = Modifier.height(10.dp))

                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Icon(
                                                imageVector = Icons.Default.LocationOn,
                                                contentDescription = null,
                                                tint = EcoTextMuted,
                                                modifier = Modifier.size(13.dp)
                                            )
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text(
                                                text = rep.barangay,
                                                fontSize = 11.sp,
                                                color = EcoTextSecondary
                                            )
                                        }

                                        StatusBadge(status = rep.status)
                                    }

                                    if (rep.adminRemarks != null) {
                                        Spacer(modifier = Modifier.height(8.dp))
                                        Surface(
                                            color = Color(0xFFF1F5F9),
                                            shape = RoundedCornerShape(8.dp),
                                            modifier = Modifier.fillMaxWidth()
                                        ) {
                                            Row(
                                                modifier = Modifier.padding(8.dp),
                                                verticalAlignment = Alignment.CenterVertically
                                            ) {
                                                Text(text = "💬", fontSize = 12.sp)
                                                Spacer(modifier = Modifier.width(6.dp))
                                                Text(
                                                    text = "Admin: ${rep.adminRemarks}",
                                                    fontSize = 11.sp,
                                                    color = Color(0xFF334155),
                                                    maxLines = 1,
                                                    overflow = TextOverflow.Ellipsis
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
        }
    }
}
}

@Composable
fun CitizenAccountRequiredGate(
    viewModel: ClimateViewModel,
    customTitle: String? = null,
    customSubtitle: String? = null
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .testTag("account_required_gate_card"),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, EcoBorder)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Surface(
                    shape = CircleShape,
                    color = EcoMint,
                    modifier = Modifier.size(64.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text(text = "🌱", fontSize = 32.sp)
                    }
                }

                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = EcoForestGreen.copy(alpha = 0.1f)
                ) {
                    Text(
                        text = "Ordinance #2026-04 Compliance",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = EcoForestGreen,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                    )
                }

                Text(
                    text = customTitle ?: "Citizen Account Required to Report",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = EcoTextPrimary,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )

                Text(
                    text = customSubtitle ?: "Under Metro Verde Environmental Ordinance #2026-04, citizens must create an account and verify their government ID before submitting environmental hazard reports to CENRO.",
                    fontSize = 12.sp,
                    color = EcoTextSecondary,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                    lineHeight = 17.sp
                )

                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = EcoSurface,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(12.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(text = "📍", fontSize = 16.sp)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Geotagged routing to Barangay & CENRO taskforces",
                                fontSize = 11.sp,
                                color = EcoTextPrimary
                            )
                        }
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(text = "🔔", fontSize = 16.sp)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Real-time updates as officers validate and resolve issues",
                                fontSize = 11.sp,
                                color = EcoTextPrimary
                            )
                        }
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(text = "🏆", fontSize = 16.sp)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "+50 Welcome Points on signup, +10 points per report",
                                fontSize = 11.sp,
                                color = EcoTextPrimary
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(4.dp))

                Button(
                    onClick = { viewModel.openAuthDialog("register") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                        .testTag("btn_gate_create_account"),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = EcoForestGreen)
                ) {
                    Text(
                        text = "🌱 Create Citizen Account",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }

                OutlinedButton(
                    onClick = { viewModel.openAuthDialog("login") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(46.dp)
                        .testTag("btn_gate_login"),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = "🔑 Sign In to Existing Account",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = EcoForestGreen
                    )
                }
            }
        }
    }
}

@Composable
fun CitizenKycRequiredGate(
    currentUser: UserEntity,
    viewModel: ClimateViewModel
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .testTag("kyc_required_gate_card"),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, EcoBorder)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Surface(
                    shape = CircleShape,
                    color = Color(0xFFFEF3C7),
                    modifier = Modifier.size(64.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text(text = "🛡️", fontSize = 32.sp)
                    }
                }

                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color(0xFFFEE2E2)
                ) {
                    Text(
                        text = "KYC Status: Unverified",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFDC2626),
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                    )
                }

                Text(
                    text = "ID Verification Required to Report",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = EcoTextPrimary,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )

                Text(
                    text = "Hello, ${currentUser.name}! Your citizen account is created. To prevent spam, false alarms, and anonymous abuse, City Ordinance #2026-04 requires one-time government ID verification before filing environmental incident reports.",
                    fontSize = 12.sp,
                    color = EcoTextSecondary,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                    lineHeight = 17.sp
                )

                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = EcoSurface,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(12.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(text = "🪪", fontSize = 16.sp)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Accepted: PhilSys, Driver's License, Passport, UMID",
                                fontSize = 11.sp,
                                color = EcoTextPrimary
                            )
                        }
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(text = "⚡", fontSize = 16.sp)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Instant verification approval in seconds",
                                fontSize = 11.sp,
                                color = EcoTextPrimary
                            )
                        }
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(text = "🎁", fontSize = 16.sp)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Earn +25 Bonus Climate Points upon verification",
                                fontSize = 11.sp,
                                color = EcoTextPrimary
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(4.dp))

                Button(
                    onClick = { viewModel.openKycDialog() },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                        .testTag("btn_gate_verify_kyc"),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = EcoForestGreen)
                ) {
                    Text(
                        text = "🛡️ Verify Government ID (KYC)",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }
            }
        }
    }
}

@Composable
fun VerifiedCitizenBanner(currentUser: UserEntity) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("verified_citizen_reporter_banner"),
        shape = RoundedCornerShape(12.dp),
        color = Color(0xFFF0FDF4),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFBBF7D0))
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                shape = CircleShape,
                color = EcoEmerald,
                modifier = Modifier.size(36.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = Icons.Default.Verified,
                        contentDescription = "Verified",
                        tint = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "Verified Citizen Reporter: ${currentUser.name}",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = EcoForestGreen
                    )
                }
                Text(
                    text = "ID Verified (${if (currentUser.kycIdType.isNotBlank()) currentUser.kycIdType else "PhilSys National ID"}) • Reporting Authorized",
                    fontSize = 11.sp,
                    color = Color(0xFF15803D)
                )
            }
        }
    }
}


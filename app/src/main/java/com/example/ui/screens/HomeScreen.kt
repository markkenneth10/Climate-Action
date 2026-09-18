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
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.AddAlert
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Campaign
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.R
import com.example.ui.components.SeverityBadge
import com.example.ui.components.StatCard
import com.example.ui.components.StatusBadge
import com.example.ui.theme.EcoBorder
import com.example.ui.theme.EcoEmerald
import com.example.ui.theme.EcoForestGreen
import com.example.ui.theme.EcoGreenDark
import com.example.ui.theme.EcoLightBlue
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
import com.example.ui.viewmodel.ClimateViewModel

@Composable
fun HomeScreen(
    viewModel: ClimateViewModel,
    modifier: Modifier = Modifier
) {
    val currentUser by viewModel.currentUser.collectAsState()
    val reports by viewModel.allReports.collectAsState()
    val articles by viewModel.allArticles.collectAsState()
    val activities by viewModel.allActivities.collectAsState()
    val unreadNotifications by viewModel.unreadNotificationsCount.collectAsState()

    val totalReportsCount = reports.size
    val resolvedCount = reports.count { it.status == "Resolved" || it.status == "Closed" }
    val userPoints = currentUser?.points ?: 0

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAF8)),
        contentPadding = PaddingValues(bottom = 96.dp)
    ) {
        // 1. Top Greeting & Role Switcher Bar
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(EcoForestGreen, Color(0xFF134E24))
                        )
                    )
                    .padding(horizontal = 20.dp, vertical = 20.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier.size(46.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Image(
                                painter = painterResource(id = R.drawable.app_logo),
                                contentDescription = "Official Brand Logo",
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Fit
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "Climate Action System",
                                color = EcoMint,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(
                                text = if (currentUser == null) "Hello, Guest Citizen!" else "Hello, ${currentUser?.name}!",
                                color = Color.White,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        // Citizen / KYC Status Badge
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = Color.White.copy(alpha = 0.2f),
                            modifier = Modifier
                                .clickable {
                                    if (currentUser == null) {
                                        viewModel.openAuthDialog("register")
                                    } else if (!currentUser!!.isVerified || currentUser!!.kycStatus != "verified") {
                                        viewModel.openKycDialog()
                                    }
                                }
                                .testTag("citizen_badge")
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = when {
                                        currentUser == null -> "🌱 Join / Sign In"
                                        !currentUser!!.isVerified || currentUser!!.kycStatus != "verified" -> "⚠️ Verify ID"
                                        else -> "🛡️ Verified Citizen"
                                    },
                                    color = Color.White,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }

                        Spacer(modifier = Modifier.width(8.dp))

                        // Notification Icon with Badge
                        Box(
                            modifier = Modifier
                                .size(38.dp)
                                .clip(CircleShape)
                                .background(Color.White.copy(alpha = 0.15f))
                                .clickable { viewModel.showNotificationsDialog.value = true }
                                .testTag("notifications_button"),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Notifications,
                                contentDescription = "Notifications",
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                            if (unreadNotifications > 0) {
                                Box(
                                    modifier = Modifier
                                        .size(14.dp)
                                        .align(Alignment.TopEnd)
                                        .clip(CircleShape)
                                        .background(SeverityCritical),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = "$unreadNotifications",
                                        color = Color.White,
                                        fontSize = 8.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Hero CTA: Report an Environmental Issue
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Spot an environmental problem?",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = EcoTextPrimary
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Take a photo, tag the location, and alert local authorities to take action.",
                                fontSize = 12.sp,
                                color = EcoTextSecondary,
                                lineHeight = 16.sp
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Button(
                                onClick = {
                                    if (currentUser == null) {
                                        viewModel.openAuthDialog("register")
                                    } else if (!currentUser!!.isVerified || currentUser!!.kycStatus != "verified") {
                                        viewModel.openKycDialog()
                                    } else {
                                        viewModel.setActiveTab("Report")
                                    }
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = EcoForestGreen),
                                shape = RoundedCornerShape(10.dp),
                                modifier = Modifier.testTag("report_issue_hero_button")
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(text = "📸 Report an Issue", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                }
                            }
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Image(
                            painter = painterResource(id = R.drawable.climate_hero_banner),
                            contentDescription = "Climate Action",
                            modifier = Modifier
                                .size(90.dp)
                                .clip(RoundedCornerShape(12.dp)),
                            contentScale = ContentScale.Crop
                        )
                    }
                }

                // Auth / KYC Banner for Guest & Unverified users
                if (currentUser == null) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { viewModel.openAuthDialog("register") },
                        color = Color(0xFF1E3A2F),
                        shape = RoundedCornerShape(12.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, EcoMint.copy(alpha = 0.3f))
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(text = "🌱", fontSize = 20.sp)
                            Spacer(modifier = Modifier.width(10.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Guest Mode Active",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = EcoMint
                                )
                                Text(
                                    text = "Create account & verify ID to submit hazard reports and earn 50 welcome points.",
                                    fontSize = 10.sp,
                                    color = Color.White.copy(alpha = 0.8f)
                                )
                            }
                            Text(
                                text = "Join →",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                    }
                } else if (!currentUser!!.isVerified || currentUser!!.kycStatus != "verified") {
                    Spacer(modifier = Modifier.height(12.dp))
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { viewModel.openKycDialog() },
                        color = Color(0xFF451A03),
                        shape = RoundedCornerShape(12.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF59E0B).copy(alpha = 0.4f))
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(text = "🛡️", fontSize = 20.sp)
                            Spacer(modifier = Modifier.width(10.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "KYC Verification Required",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFFFBBF24)
                                )
                                Text(
                                    text = "Upload government ID to unlock reporting and earn +25 points.",
                                    fontSize = 10.sp,
                                    color = Color.White.copy(alpha = 0.8f)
                                )
                            }
                            Text(
                                text = "Verify →",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                    }
                }
            }
        }

        // 2. Summary KPI Metric Cards (Personalized Citizen Data)
        item {
            val myReports = reports.filter { it.userId == currentUser?.id }
            val myResolved = myReports.count { it.status == "Resolved" }
            Column(modifier = Modifier.padding(horizontal = 20.dp, vertical = 16.dp)) {
                Text(
                    text = "My Environmental Impact",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = EcoTextPrimary
                )
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    StatCard(
                        title = "My Reports",
                        value = "${myReports.size}",
                        iconEmoji = "📋",
                        modifier = Modifier.weight(1f),
                        subtitle = "${myReports.count { it.status == "In Progress" || it.status == "Submitted" }} active cases"
                    )
                    StatCard(
                        title = "Resolved",
                        value = "$myResolved",
                        iconEmoji = "✅",
                        modifier = Modifier.weight(1f),
                        accentColor = EcoEmerald,
                        subtitle = "Verified solved"
                    )
                    StatCard(
                        title = "Eco Points",
                        value = "$userPoints",
                        iconEmoji = "🏆",
                        modifier = Modifier.weight(1f),
                        accentColor = EcoSkyBlue,
                        subtitle = "Rank #1"
                    )
                }
            }
        }

        // 3. Emergency Climate Advisory Banner
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 4.dp),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFFFF7ED)),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFED7AA))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "⚠️", fontSize = 22.sp)
                    Spacer(modifier = Modifier.width(10.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Climate Advisory: High Heat Index Warning",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF9A3412)
                        )
                        Text(
                            text = "Metro Verde temperatures forecast to reach 42°C. Hydrate and report urban heat hotspots.",
                            fontSize = 11.sp,
                            color = Color(0xFF7C2D12),
                            lineHeight = 15.sp
                        )
                    }
                }
            }
        }

        // 4. Quick Action Shortcuts: Map & Quizzes
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Interactive Map Shortcut
                Card(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { viewModel.setActiveTab("Map") }
                        .testTag("shortcut_map_card"),
                    colors = CardDefaults.cardColors(containerColor = EcoLightBlue),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "🗺️", fontSize = 22.sp)
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Issue Map",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = EcoSkyBlue
                            )
                            Text(
                                text = "View geotagged pins",
                                fontSize = 10.sp,
                                color = EcoTextSecondary
                            )
                        }
                    }
                }

                // Climate Quiz Shortcut
                Card(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { viewModel.startQuiz() }
                        .testTag("shortcut_quiz_card"),
                    colors = CardDefaults.cardColors(containerColor = EcoMint),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "🧠", fontSize = 22.sp)
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Climate Quiz",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = EcoGreenDark
                            )
                            Text(
                                text = "Earn +10 pts",
                                fontSize = 10.sp,
                                color = EcoTextSecondary
                            )
                        }
                    }
                }
            }
        }

        // 5. Recent Environmental Submissions
        item {
            Column(modifier = Modifier.padding(top = 8.dp)) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Recent Community Reports",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = EcoTextPrimary
                    )
                    Text(
                        text = "View All →",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = EcoForestGreen,
                        modifier = Modifier
                            .clickable { viewModel.setActiveTab("Report") }
                            .padding(4.dp)
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                LazyRow(
                    contentPadding = PaddingValues(horizontal = 20.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(reports.take(5)) { report ->
                        Card(
                            modifier = Modifier
                                .width(250.dp)
                                .clickable { viewModel.openReportDetail(report) }
                                .testTag("recent_report_${report.id}"),
                            colors = CardDefaults.cardColors(containerColor = EcoSurface),
                            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                            shape = RoundedCornerShape(14.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, EcoBorder)
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(text = report.categoryIcon, fontSize = 20.sp)
                                    SeverityBadge(severity = report.severity)
                                }
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = report.title,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = report.description,
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
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(
                                            imageVector = Icons.Default.LocationOn,
                                            contentDescription = null,
                                            tint = EcoTextMuted,
                                            modifier = Modifier.size(12.dp)
                                        )
                                        Text(
                                            text = report.barangay.replace("Barangay ", "Brgy "),
                                            fontSize = 10.sp,
                                            color = EcoTextSecondary
                                        )
                                    }
                                    StatusBadge(status = report.status)
                                }
                            }
                        }
                    }
                }
            }
        }

        // 6. Featured Climate Information
        item {
            Column(modifier = Modifier.padding(horizontal = 20.dp, vertical = 16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Verified Climate Information",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = EcoTextPrimary
                    )
                    Text(
                        text = "Explore →",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = EcoForestGreen,
                        modifier = Modifier
                            .clickable { viewModel.setActiveTab("Learn") }
                            .padding(4.dp)
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                val featuredArticle = articles.firstOrNull()
                if (featuredArticle != null) {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { viewModel.openArticleDetail(featuredArticle) }
                            .testTag("featured_article_card"),
                        colors = CardDefaults.cardColors(containerColor = EcoSurface),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                        shape = RoundedCornerShape(16.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, EcoBorder)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Surface(
                                    color = EcoMint,
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text(
                                        text = "${featuredArticle.icon} ${featuredArticle.category}",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = EcoForestGreen,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "${featuredArticle.readTimeMinutes} min read",
                                    fontSize = 11.sp,
                                    color = EcoTextMuted
                                )
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = featuredArticle.title,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = EcoTextPrimary
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = featuredArticle.summary,
                                fontSize = 12.sp,
                                color = EcoTextSecondary,
                                maxLines = 2,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }
                }
            }
        }

        // 7. Upcoming Climate Activities Section
        item {
            Column(modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp)) {
                Text(
                    text = "Upcoming Climate Activities",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = EcoTextPrimary
                )
                Spacer(modifier = Modifier.height(8.dp))

                activities.take(2).forEach { activity ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp)
                            .clickable { viewModel.openActivityDetail(activity) }
                            .testTag("activity_item_${activity.id}"),
                        colors = CardDefaults.cardColors(containerColor = EcoSurface),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                        shape = RoundedCornerShape(14.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, EcoBorder)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(46.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(EcoMint),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(text = activity.icon, fontSize = 24.sp)
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = activity.title,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = "${activity.dateText} • ${activity.barangay}",
                                    fontSize = 11.sp,
                                    color = EcoTextSecondary
                                )
                            }
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = Color(0xFFFEF3C7)
                            ) {
                                Text(
                                    text = "+${activity.rewardPoints} pts",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFFB45309),
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

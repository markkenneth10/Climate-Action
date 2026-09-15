package com.example.ui.screens

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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Event
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
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

@Composable
fun ProfileScreen(
    viewModel: ClimateViewModel,
    modifier: Modifier = Modifier
) {
    val currentUser by viewModel.currentUser.collectAsState()
    val allUsers by viewModel.allUsers.collectAsState()
    val activities by viewModel.allActivities.collectAsState()

    val sortedLeaderboard = allUsers.sortedByDescending { it.points }

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
                    .padding(horizontal = 20.dp, vertical = 20.dp)
            ) {
                Text(
                    text = "Citizen Profile & Community Actions",
                    color = Color.White,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Track points, community activities, and gamified ranking",
                    color = EcoMint,
                    fontSize = 12.sp
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Profile Card
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
                        Box(
                            modifier = Modifier
                                .size(56.dp)
                                .clip(CircleShape)
                                .background(EcoMint),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = currentUser?.name?.take(2)?.uppercase() ?: "MK",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = EcoForestGreen
                            )
                        }

                        Spacer(modifier = Modifier.width(14.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = currentUser?.name ?: "Mark Kenneth",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = EcoTextPrimary
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Icon(
                                    imageVector = Icons.Default.Verified,
                                    contentDescription = "Verified Citizen",
                                    tint = EcoSkyBlue,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                            Text(
                                text = currentUser?.email ?: "mark.citizen@climateaction.org",
                                fontSize = 11.sp,
                                color = EcoTextSecondary
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = EcoForestGreen.copy(alpha = 0.1f)
                                ) {
                                    Text(
                                        text = currentUser?.role ?: "Citizen",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = EcoForestGreen,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = currentUser?.barangay ?: "Barangay Makilas",
                                    fontSize = 10.sp,
                                    color = EcoTextMuted
                                )
                            }
                        }

                        // Switch role button
                        OutlinedButton(
                            onClick = { viewModel.showRoleSwitcherDialog.value = true },
                            shape = RoundedCornerShape(10.dp),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                            modifier = Modifier.testTag("profile_role_switch_btn")
                        ) {
                            Text(text = "Switch", fontSize = 11.sp)
                        }
                    }
                }
            }
        }

        // Admin Portal Shortcut if Admin / Officer
        if (currentUser?.role == "Administrator" || currentUser?.role == "Environmental Officer") {
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                        .clickable { viewModel.setActiveTab("Admin") }
                        .testTag("shortcut_admin_dashboard_card"),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFF3E8FF)),
                    shape = RoundedCornerShape(14.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFD8B4FE))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF9333EA)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.AdminPanelSettings,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(22.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Admin & Officer Dashboard",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF581C87)
                            )
                            Text(
                                text = "Verify reports, view charts, assign officers, and generate thesis reports.",
                                fontSize = 11.sp,
                                color = Color(0xFF6B21A8)
                            )
                        }
                        Text(text = "Go →", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color(0xFF7E22CE))
                    }
                }
            }
        }

        // Gamification: Climate Action Points Breakdown & Total
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 10.dp),
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
                        Column {
                            Text(
                                text = "Climate Action Points",
                                fontSize = 13.sp,
                                color = EcoTextSecondary,
                                fontWeight = FontWeight.Medium
                            )
                            Text(
                                text = "${currentUser?.points ?: 350} PTS",
                                fontSize = 28.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = EcoForestGreen
                            )
                        }
                        Surface(
                            shape = CircleShape,
                            color = Color(0xFFFEF3C7),
                            modifier = Modifier.size(50.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text(text = "🏆", fontSize = 24.sp)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))
                    Text(
                        text = "How to Earn Climate Points:",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = EcoTextPrimary
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    val pointsRules = listOf(
                        "Tree Planting Activity" to "+30 pts",
                        "Join Coastal / Community Cleanup" to "+20 pts",
                        "Submit Activity Participation Proof" to "+15 pts",
                        "Submit Verified Environmental Report" to "+10 pts",
                        "Complete Climate Awareness Quiz" to "+10 pts"
                    )

                    pointsRules.forEach { (action, pts) ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 3.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(text = "• $action", fontSize = 11.sp, color = EcoTextSecondary)
                            Text(text = pts, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = EcoForestGreen)
                        }
                    }
                }
            }
        }

        // Community Leaderboard (Thesis Gamification Feature)
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 6.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = EcoSurface),
                border = androidx.compose.foundation.BorderStroke(1.dp, EcoBorder)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(text = "🏆", fontSize = 18.sp)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Community Leaderboard",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = EcoTextPrimary
                            )
                        }
                        Text(
                            text = "Metro Verde Champions",
                            fontSize = 10.sp,
                            color = EcoTextMuted
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    sortedLeaderboard.forEachIndexed { index, user ->
                        val medal = when (index) {
                            0 -> "🥇"
                            1 -> "🥈"
                            2 -> "🥉"
                            else -> "#${index + 1}"
                        }
                        val isSelf = user.id == currentUser?.id

                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (isSelf) EcoMint else Color.Transparent)
                                .padding(horizontal = 10.dp, vertical = 8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = medal,
                                    fontSize = if (index < 3) 16.sp else 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.width(26.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Column {
                                    Text(
                                        text = user.name + if (isSelf) " (You)" else "",
                                        fontSize = 13.sp,
                                        fontWeight = if (isSelf) FontWeight.Bold else FontWeight.Medium,
                                        color = EcoTextPrimary
                                    )
                                    Text(
                                        text = user.barangay,
                                        fontSize = 10.sp,
                                        color = EcoTextSecondary
                                    )
                                }
                            }
                            Text(
                                text = "${user.points} pts",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSelf) EcoForestGreen else EcoTextPrimary
                            )
                        }
                    }
                }
            }
        }

        // Climate Action Activities Section
        item {
            Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 14.dp)) {
                Text(
                    text = "🌱 Climate Action Activities",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = EcoTextPrimary
                )
                Text(
                    text = "Register for on-ground environmental events and submit proof of participation",
                    fontSize = 11.sp,
                    color = EcoTextSecondary
                )
            }
        }

        items(activities) { act ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 6.dp)
                    .clickable { viewModel.openActivityDetail(act) }
                    .testTag("activity_card_${act.id}"),
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
                            Text(text = act.icon, fontSize = 22.sp)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = act.category,
                                fontSize = 11.sp,
                                color = EcoForestGreen,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = Color(0xFFFEF3C7)
                        ) {
                            Text(
                                text = "+${act.rewardPoints} pts",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFFB45309),
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = act.title,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = EcoTextPrimary
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = act.description,
                        fontSize = 11.sp,
                        color = EcoTextSecondary,
                        lineHeight = 16.sp
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Event,
                                contentDescription = null,
                                tint = EcoTextMuted,
                                modifier = Modifier.size(13.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(text = act.dateText, fontSize = 10.sp, color = EcoTextSecondary)
                        }

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Group,
                                contentDescription = null,
                                tint = EcoTextMuted,
                                modifier = Modifier.size(13.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "${act.currentParticipants}/${act.maxParticipants} joined",
                                fontSize = 10.sp,
                                color = EcoTextSecondary
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = { viewModel.toggleActivityRegistration(act) },
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (act.isRegistered) EcoTeal else EcoForestGreen
                            ),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text(
                                text = if (act.isRegistered) "✓ Registered" else "Register Now",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        if (act.isRegistered) {
                            OutlinedButton(
                                onClick = { viewModel.openActivityDetail(act) },
                                shape = RoundedCornerShape(10.dp),
                                modifier = Modifier.weight(1f)
                            ) {
                                Text(
                                    text = if (act.proofSubmitted) "Proof Verified ✓" else "Upload Proof",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material.icons.filled.AutoStories
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.ReportProblem
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.FloatingActionButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarDuration
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.dialogs.ActivityDetailDialog
import com.example.ui.dialogs.ArticleDetailDialog
import com.example.ui.dialogs.AuthDialog
import com.example.ui.dialogs.KycVerificationDialog
import com.example.ui.dialogs.NotificationsDialog
import com.example.ui.dialogs.QuizDialog
import com.example.ui.dialogs.ReportDetailDialog
import com.example.ui.dialogs.ThesisSummaryDialog
import com.example.ui.screens.HomeScreen
import com.example.ui.screens.LearnScreen
import com.example.ui.screens.MapScreen
import com.example.ui.screens.ProfileScreen
import com.example.ui.screens.ReportScreen
import com.example.ui.theme.EcoForestGreen
import com.example.ui.theme.EcoMint
import com.example.ui.theme.EcoSurface
import com.example.ui.theme.EcoTeal
import com.example.ui.theme.EcoTextMuted
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.viewmodel.ClimateViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: ClimateViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                MainAppScreen(viewModel = viewModel)
            }
        }
    }
}

@Composable
fun MainAppScreen(viewModel: ClimateViewModel) {
    val activeTab by viewModel.activeTab.collectAsState()
    val currentUser by viewModel.currentUser.collectAsState()
    val currentUserId by viewModel.currentUserId.collectAsState()

    // When user opens the app, automatically show create and login form to proceed
    LaunchedEffect(Unit) {
        if (currentUserId == null) {
            viewModel.openAuthDialog("register")
        }
    }

    // Dialog state collectors
    val selectedReport by viewModel.selectedReport.collectAsState()
    val selectedArticle by viewModel.selectedArticle.collectAsState()
    val selectedActivity by viewModel.selectedActivity.collectAsState()
    val showQuizDialog by viewModel.showQuizDialog.collectAsState()
    val showNotificationsDialog by viewModel.showNotificationsDialog.collectAsState()
    val showThesisSummaryDialog by viewModel.showThesisSummaryDialog.collectAsState()
    val showAuthDialog by viewModel.showAuthDialog.collectAsState()
    val authDialogInitialMode by viewModel.authDialogInitialMode.collectAsState()
    val showKycDialog by viewModel.showKycDialog.collectAsState()
    val snackbarMessage by viewModel.showSuccessSnackbar.collectAsState()

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(snackbarMessage) {
        snackbarMessage?.let {
            snackbarHostState.showSnackbar(
                message = it,
                duration = SnackbarDuration.Short
            )
            viewModel.showSuccessSnackbar.value = null
        }
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        snackbarHost = { SnackbarHost(snackbarHostState) },
        floatingActionButton = {
            // Quick FAB to report climate incident
            if (activeTab != "Report") {
                FloatingActionButton(
                    onClick = {
                        if (currentUser == null) {
                            viewModel.openAuthDialog("login")
                        } else if (!currentUser!!.isVerified || currentUser!!.kycStatus != "verified") {
                            viewModel.setActiveTab("Report")
                            viewModel.openKycDialog()
                        } else {
                            viewModel.setActiveTab("Report")
                        }
                    },
                    containerColor = EcoForestGreen,
                    contentColor = Color.White,
                    shape = CircleShape,
                    elevation = FloatingActionButtonDefaults.elevation(defaultElevation = 4.dp),
                    modifier = Modifier.testTag("fab_quick_report")
                ) {
                    Icon(
                        imageVector = Icons.Default.CameraAlt,
                        contentDescription = "Report Environmental Incident",
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
        },
        bottomBar = {
            NavigationBar(
                containerColor = EcoSurface,
                tonalElevation = 8.dp,
                modifier = Modifier.height(68.dp)
            ) {
                // Home
                NavigationBarItem(
                    selected = activeTab == "Home",
                    onClick = { viewModel.setActiveTab("Home") },
                    icon = {
                        Icon(
                            imageVector = Icons.Default.Home,
                            contentDescription = "Home",
                            modifier = Modifier.size(22.dp)
                        )
                    },
                    label = {
                        Text(
                            text = "Home",
                            fontSize = 11.sp,
                            fontWeight = if (activeTab == "Home") FontWeight.Bold else FontWeight.Normal
                        )
                    },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = EcoForestGreen,
                        selectedTextColor = EcoForestGreen,
                        indicatorColor = EcoMint,
                        unselectedIconColor = EcoTextMuted,
                        unselectedTextColor = EcoTextMuted
                    ),
                    modifier = Modifier.testTag("nav_item_home")
                )

                // Report
                NavigationBarItem(
                    selected = activeTab == "Report",
                    onClick = { viewModel.setActiveTab("Report") },
                    icon = {
                        Icon(
                            imageVector = Icons.Default.ReportProblem,
                            contentDescription = "Report",
                            modifier = Modifier.size(22.dp)
                        )
                    },
                    label = {
                        Text(
                            text = "Report",
                            fontSize = 11.sp,
                            fontWeight = if (activeTab == "Report") FontWeight.Bold else FontWeight.Normal
                        )
                    },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = EcoForestGreen,
                        selectedTextColor = EcoForestGreen,
                        indicatorColor = EcoMint,
                        unselectedIconColor = EcoTextMuted,
                        unselectedTextColor = EcoTextMuted
                    ),
                    modifier = Modifier.testTag("nav_item_report")
                )

                // Map
                NavigationBarItem(
                    selected = activeTab == "Map",
                    onClick = { viewModel.setActiveTab("Map") },
                    icon = {
                        Icon(
                            imageVector = Icons.Default.Map,
                            contentDescription = "Map",
                            modifier = Modifier.size(22.dp)
                        )
                    },
                    label = {
                        Text(
                            text = "Map",
                            fontSize = 11.sp,
                            fontWeight = if (activeTab == "Map") FontWeight.Bold else FontWeight.Normal
                        )
                    },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = EcoForestGreen,
                        selectedTextColor = EcoForestGreen,
                        indicatorColor = EcoMint,
                        unselectedIconColor = EcoTextMuted,
                        unselectedTextColor = EcoTextMuted
                    ),
                    modifier = Modifier.testTag("nav_item_map")
                )

                // Learn
                NavigationBarItem(
                    selected = activeTab == "Learn",
                    onClick = { viewModel.setActiveTab("Learn") },
                    icon = {
                        Icon(
                            imageVector = Icons.Default.AutoStories,
                            contentDescription = "Learn",
                            modifier = Modifier.size(22.dp)
                        )
                    },
                    label = {
                        Text(
                            text = "Learn",
                            fontSize = 11.sp,
                            fontWeight = if (activeTab == "Learn") FontWeight.Bold else FontWeight.Normal
                        )
                    },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = EcoForestGreen,
                        selectedTextColor = EcoForestGreen,
                        indicatorColor = EcoMint,
                        unselectedIconColor = EcoTextMuted,
                        unselectedTextColor = EcoTextMuted
                    ),
                    modifier = Modifier.testTag("nav_item_learn")
                )

                // Profile Navigation Item
                NavigationBarItem(
                    selected = activeTab == "Profile",
                    onClick = { viewModel.setActiveTab("Profile") },
                    icon = {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = "Profile",
                            modifier = Modifier.size(22.dp)
                        )
                    },
                    label = {
                        Text(
                            text = "Profile",
                            fontSize = 11.sp,
                            fontWeight = if (activeTab == "Profile") FontWeight.Bold else FontWeight.Normal
                        )
                    },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = EcoForestGreen,
                        selectedTextColor = EcoForestGreen,
                        indicatorColor = EcoMint,
                        unselectedIconColor = EcoTextMuted,
                        unselectedTextColor = EcoTextMuted
                    ),
                    modifier = Modifier.testTag("nav_item_profile")
                )
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            AnimatedContent(
                targetState = activeTab,
                transitionSpec = { fadeIn() togetherWith fadeOut() },
                label = "ScreenTransition"
            ) { targetScreen ->
                when (targetScreen) {
                    "Home" -> HomeScreen(viewModel = viewModel)
                    "Report" -> ReportScreen(viewModel = viewModel)
                    "Map" -> MapScreen(viewModel = viewModel)
                    "Learn" -> LearnScreen(viewModel = viewModel)
                    "Profile" -> ProfileScreen(viewModel = viewModel)
                    else -> HomeScreen(viewModel = viewModel)
                }
            }
        }
    }

    // Modal Dialogs
    selectedReport?.let { rep ->
        ReportDetailDialog(
            report = rep,
            viewModel = viewModel,
            onDismiss = { viewModel.closeReportDetail() }
        )
    }

    selectedArticle?.let { art ->
        ArticleDetailDialog(
            article = art,
            onDismiss = { viewModel.closeArticleDetail() }
        )
    }

    selectedActivity?.let { act ->
        ActivityDetailDialog(
            activity = act,
            viewModel = viewModel,
            onDismiss = { viewModel.closeActivityDetail() }
        )
    }

    if (showQuizDialog) {
        QuizDialog(
            viewModel = viewModel,
            onDismiss = { viewModel.showQuizDialog.value = false }
        )
    }

    if (showNotificationsDialog) {
        NotificationsDialog(
            viewModel = viewModel,
            onDismiss = { viewModel.showNotificationsDialog.value = false }
        )
    }

    if (showThesisSummaryDialog) {
        ThesisSummaryDialog(
            viewModel = viewModel,
            onDismiss = { viewModel.showThesisSummaryDialog.value = false }
        )
    }

    if (showAuthDialog) {
        AuthDialog(
            viewModel = viewModel,
            initialMode = authDialogInitialMode,
            onDismiss = { viewModel.closeAuthDialog() }
        )
    }

    if (showKycDialog) {
        KycVerificationDialog(
            viewModel = viewModel,
            onDismiss = { viewModel.closeKycDialog() }
        )
    }
}

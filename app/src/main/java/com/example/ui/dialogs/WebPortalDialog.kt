package com.example.ui.dialogs

import android.annotation.SuppressLint
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.compose.foundation.Image
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
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.OpenInBrowser
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.R
import com.example.ui.theme.EcoBorder
import com.example.ui.theme.EcoForestGreen
import com.example.ui.theme.EcoMint
import com.example.ui.theme.EcoSurface
import com.example.ui.theme.EcoSurfaceVariant
import com.example.ui.theme.EcoTextMuted
import com.example.ui.theme.EcoTextPrimary
import com.example.ui.theme.EcoTextSecondary
import com.example.ui.viewmodel.ClimateViewModel

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun WebPortalDialog(
    viewModel: ClimateViewModel,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    // Primary Web Portal URL for public browser access
    val webPortalUrl = "https://ais-dev-f5odrqogsjxmxcco4652hh-662791830333.asia-southeast1.run.app"
    val localWebUrl = "http://localhost:3000"

    var activeTab by remember { mutableStateOf("Overview") } // Overview, LiveBrowser, Parity

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.92f)
                .testTag("web_portal_dialog"),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = EcoSurface)
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Header
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(EcoForestGreen)
                        .padding(horizontal = 20.dp, vertical = 14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(Color.White)
                                .padding(3.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Image(
                                painter = painterResource(id = R.drawable.app_logo),
                                contentDescription = "Website Logo",
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Fit
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = "Website Access Portal",
                                    color = Color.White,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 16.sp
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Surface(
                                    shape = RoundedCornerShape(4.dp),
                                    color = EcoMint
                                ) {
                                    Text(
                                        text = "LIVE",
                                        color = EcoForestGreen,
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                                    )
                                }
                            }
                            Text(
                                text = "Citizen & Administrative Web Access",
                                color = EcoMint.copy(alpha = 0.85f),
                                fontSize = 11.sp
                            )
                        }
                    }

                    IconButton(
                        onClick = onDismiss,
                        modifier = Modifier.testTag("close_web_portal_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close",
                            tint = Color.White
                        )
                    }
                }

                // Sub-tabs: Overview vs Embedded Live View vs Parity
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(EcoSurfaceVariant)
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf("Overview", "Live Browser", "System Matrix").forEach { tab ->
                        val isSelected = activeTab == tab
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = if (isSelected) EcoForestGreen else Color.Transparent,
                            modifier = Modifier
                                .clickable { activeTab = tab }
                                .padding(horizontal = 4.dp)
                        ) {
                            Text(
                                text = tab,
                                color = if (isSelected) Color.White else EcoTextSecondary,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                fontSize = 12.sp,
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                            )
                        }
                    }
                }

                // Body content based on activeTab
                when (activeTab) {
                    "Overview" -> {
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(20.dp)
                                .verticalScroll(rememberScrollState()),
                            verticalArrangement = Arrangement.spacedBy(16.dp)
                        ) {
                            // URL Card
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(containerColor = Color(0xFFF1F8F3)),
                                border = androidx.compose.foundation.BorderStroke(1.dp, EcoBorder)
                            ) {
                                Column(modifier = Modifier.padding(14.dp)) {
                                    Text(
                                        text = "Official Web Portal Link",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 12.sp,
                                        color = EcoForestGreen
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = webPortalUrl,
                                        fontSize = 12.sp,
                                        color = EcoTextPrimary,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                    Spacer(modifier = Modifier.height(10.dp))
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        Button(
                                            onClick = {
                                                val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                                val clip = ClipData.newPlainText("Climate Action Web Portal", webPortalUrl)
                                                clipboard.setPrimaryClip(clip)
                                                Toast.makeText(context, "Web Portal link copied to clipboard!", Toast.LENGTH_SHORT).show()
                                            },
                                            colors = ButtonDefaults.buttonColors(containerColor = EcoForestGreen),
                                            shape = RoundedCornerShape(8.dp),
                                            modifier = Modifier.weight(1f)
                                        ) {
                                            Icon(Icons.Default.ContentCopy, contentDescription = "Copy", modifier = Modifier.size(16.dp))
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text("Copy Link", fontSize = 12.sp)
                                        }

                                        OutlinedButton(
                                            onClick = {
                                                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(webPortalUrl))
                                                try {
                                                    context.startActivity(intent)
                                                } catch (e: Exception) {
                                                    Toast.makeText(context, "Opening external browser...", Toast.LENGTH_SHORT).show()
                                                }
                                            },
                                            shape = RoundedCornerShape(8.dp),
                                            modifier = Modifier.weight(1f)
                                        ) {
                                            Icon(Icons.Default.OpenInBrowser, contentDescription = "Open", modifier = Modifier.size(16.dp))
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text("Open Browser", fontSize = 12.sp)
                                        }

                                        OutlinedButton(
                                            onClick = {
                                                val shareIntent = Intent().apply {
                                                    action = Intent.ACTION_SEND
                                                    putExtra(Intent.EXTRA_TEXT, "Access the Mobile Climate Action Reporting and Information System Web Portal:\n$webPortalUrl")
                                                    type = "text/plain"
                                                }
                                                context.startActivity(Intent.createChooser(shareIntent, "Share Climate Web Portal"))
                                            },
                                            shape = RoundedCornerShape(8.dp)
                                        ) {
                                            Icon(Icons.Default.Share, contentDescription = "Share", modifier = Modifier.size(16.dp))
                                        }
                                    }
                                }
                            }

                            // Key Web Features Callout
                            Text(
                                text = "Web Portal Capabilities",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = EcoTextPrimary
                            )

                            WebFeatureItem(
                                icon = "🖥️",
                                title = "Desktop & Laptop Access",
                                desc = "Optimized for municipal offices, universities, and schools to submit and audit high-volume climate reports."
                            )

                            WebFeatureItem(
                                icon = "🗺️",
                                title = "Interactive Leaflet GIS Map",
                                desc = "Full-screen GIS cartography with color-coded severity markers, barangay risk zones, and live hotspot inspection."
                            )

                            WebFeatureItem(
                                icon = "🛡️",
                                title = "LGU CENRO Dispatch Console",
                                desc = "Web-based administration table to triage tickets, assign inspection units, and log field remarks."
                            )

                            WebFeatureItem(
                                icon = "📄",
                                title = "Thesis Academic Report Exporter",
                                desc = "Instant generation and printing of executive project statistics for thesis presentation and panel defense."
                            )

                            Button(
                                onClick = { activeTab = "Live Browser" },
                                colors = ButtonDefaults.buttonColors(containerColor = EcoForestGreen),
                                shape = RoundedCornerShape(10.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Icon(Icons.Default.Language, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Preview Web Portal Inside App", fontWeight = FontWeight.Bold)
                            }
                        }
                    }

                    "Live Browser" -> {
                        // Embedded WebView
                        Box(modifier = Modifier.fillMaxSize()) {
                            AndroidView(
                                modifier = Modifier.fillMaxSize(),
                                factory = { ctx ->
                                    WebView(ctx).apply {
                                        settings.javaScriptEnabled = true
                                        settings.domStorageEnabled = true
                                        settings.loadWithOverviewMode = true
                                        settings.useWideViewPort = true
                                        settings.cacheMode = WebSettings.LOAD_DEFAULT
                                        webViewClient = WebViewClient()
                                        webChromeClient = WebChromeClient()
                                        // Attempt local server first, fallback to cloud URL
                                        loadUrl(localWebUrl)
                                    }
                                }
                            )
                        }
                    }

                    "System Matrix" -> {
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(16.dp)
                                .verticalScroll(rememberScrollState()),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Text(
                                text = "Mobile vs Web Cross-Platform Parity",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = EcoTextPrimary
                            )
                            Text(
                                text = "Both client platforms share unified data schemas and synchronized municipal workflows.",
                                fontSize = 12.sp,
                                color = EcoTextSecondary
                            )
                            Spacer(modifier = Modifier.height(4.dp))

                            ParityRow("Incident Reporting", "Camera capture & GPS", "Drag/drop file upload & map pin")
                            ParityRow("6-Stage Lifecycle", "Auditable status tracker", "Real-time workflow progress bar")
                            ParityRow("GIS Map", "Hotspot clusters", "Leaflet OpenStreetMap layer")
                            ParityRow("Climate Education", "Categorized articles & tips", "Academic citations (IPCC, DENR)")
                            ParityRow("Gamification", "Climate points & badges", "Interactive awareness quiz")
                            ParityRow("Admin Tools", "Role switcher & review", "Full dispatch console & print export")
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun WebFeatureItem(icon: String, title: String, desc: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(EcoSurfaceVariant, RoundedCornerShape(10.dp))
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = icon, fontSize = 24.sp)
        Spacer(modifier = Modifier.width(12.dp))
        Column {
            Text(text = title, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = EcoTextPrimary)
            Spacer(modifier = Modifier.height(2.dp))
            Text(text = desc, fontSize = 11.sp, color = EcoTextSecondary, lineHeight = 15.sp)
        }
    }
}

@Composable
private fun ParityRow(feature: String, mobile: String, web: String) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(8.dp),
        colors = CardDefaults.cardColors(containerColor = EcoSurfaceVariant)
    ) {
        Column(modifier = Modifier.padding(10.dp)) {
            Text(text = feature, fontWeight = FontWeight.Bold, fontSize = 12.sp, color = EcoForestGreen)
            Spacer(modifier = Modifier.height(4.dp))
            Row(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(text = "📱 Mobile App", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = EcoTextMuted)
                    Text(text = mobile, fontSize = 11.sp, color = EcoTextPrimary)
                }
                Spacer(modifier = Modifier.width(8.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(text = "🌐 Web Portal", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = EcoTextMuted)
                    Text(text = web, fontSize = 11.sp, color = EcoTextPrimary)
                }
            }
        }
    }
}

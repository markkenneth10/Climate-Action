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
import androidx.compose.material.icons.filled.Badge
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.PhotoCamera
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.CircularProgressIndicator
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.ui.theme.EcoBorder
import com.example.ui.theme.EcoEmerald
import com.example.ui.theme.EcoForestGreen
import com.example.ui.theme.EcoMint
import com.example.ui.theme.EcoSurface
import com.example.ui.theme.EcoTextMuted
import com.example.ui.theme.EcoTextPrimary
import com.example.ui.theme.EcoTextSecondary
import com.example.ui.viewmodel.ClimateViewModel

val ValidGovernmentIdTypes = listOf(
    "Philippine National ID (PhilSys)",
    "Driver's License (LTO)",
    "Philippine Passport (DFA)",
    "Unified Multi-Purpose ID (UMID)",
    "Postal ID (PhilPost)",
    "Voter's ID / COMELEC Certificate",
    "PRC Professional License",
    "Barangay Resident ID Card",
    "Senior Citizen / PWD Identification"
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun KycVerificationDialog(
    viewModel: ClimateViewModel,
    onDismiss: () -> Unit
) {
    val currentUser by viewModel.currentUser.collectAsState()

    var selectedIdType by remember { mutableStateOf(ValidGovernmentIdTypes[0]) }
    var idTypeDropdownExpanded by remember { mutableStateOf(false) }
    var idNumber by remember { mutableStateOf("") }
    var isCertifyChecked by remember { mutableStateOf(false) }
    var frontPhotoSelected by remember { mutableStateOf(false) }
    var backPhotoSelected by remember { mutableStateOf(false) }
    var selfiePhotoSelected by remember { mutableStateOf(false) }

    var errorMessage by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(false) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.94f)
                .fillMaxHeight(0.92f)
                .testTag("kyc_dialog"),
            shape = RoundedCornerShape(22.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 10.dp)
        ) {
            Column(
                modifier = Modifier.fillMaxSize()
            ) {
                // Header
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(EcoForestGreen)
                        .padding(horizontal = 18.dp, vertical = 16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Surface(
                                shape = CircleShape,
                                color = EcoMint,
                                modifier = Modifier.size(38.dp)
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Text(text = "🛡️", fontSize = 20.sp)
                                }
                            }
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(
                                    text = "Government ID Verification",
                                    color = Color.White,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 17.sp
                                )
                                Text(
                                    text = "Know-Your-Citizen (KYC) Compliance",
                                    color = EcoMint,
                                    fontSize = 11.sp
                                )
                            }
                        }

                        IconButton(
                            onClick = onDismiss,
                            modifier = Modifier.testTag("close_kyc_dialog")
                        ) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Close",
                                tint = Color.White
                            )
                        }
                    }
                }

                // Scrollable Content
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState())
                        .padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // Citizen Info Preview
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = EcoSurface,
                        border = androidx.compose.foundation.BorderStroke(1.dp, EcoBorder),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Surface(
                                shape = CircleShape,
                                color = EcoForestGreen.copy(alpha = 0.15f),
                                modifier = Modifier.size(40.dp)
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Text(
                                        text = currentUser?.name?.take(2)?.uppercase() ?: "CZ",
                                        fontWeight = FontWeight.Bold,
                                        color = EcoForestGreen,
                                        fontSize = 14.sp
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(
                                    text = currentUser?.name ?: "Guest Citizen",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp,
                                    color = EcoTextPrimary
                                )
                                Text(
                                    text = "${currentUser?.barangay ?: "Metro Verde"} • ${currentUser?.email ?: ""}",
                                    fontSize = 11.sp,
                                    color = EcoTextSecondary
                                )
                            }
                        }
                    }

                    // Notice
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = Color(0xFFFEF3C7),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFDE68A)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(text = "⚠️", fontSize = 20.sp)
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = "Under City Ordinance #2026-04, all environmental incident reports submitted to CENRO require verified citizen identity to prevent spam, false alerts, and malicious reporting.",
                                fontSize = 11.sp,
                                color = Color(0xFF92400E),
                                lineHeight = 16.sp
                            )
                        }
                    }

                    // Error Message Banner
                    errorMessage?.let { errorText ->
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = Color(0xFFFEE2E2),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFCA5A5)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(10.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(text = "⚠️", fontSize = 16.sp)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = errorText,
                                    color = Color(0xFFDC2626),
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }
                    }

                    // Step 1: Select ID Type
                    Text(
                        text = "1. Select Government Issued ID",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = EcoTextPrimary
                    )

                    ExposedDropdownMenuBox(
                        expanded = idTypeDropdownExpanded,
                        onExpandedChange = { idTypeDropdownExpanded = it }
                    ) {
                        OutlinedTextField(
                            value = selectedIdType,
                            onValueChange = {},
                            readOnly = true,
                            label = { Text("ID Type") },
                            leadingIcon = { Icon(Icons.Default.Badge, contentDescription = null, tint = EcoForestGreen) },
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = idTypeDropdownExpanded) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .menuAnchor(MenuAnchorType.PrimaryNotEditable),
                            shape = RoundedCornerShape(10.dp)
                        )
                        ExposedDropdownMenu(
                            expanded = idTypeDropdownExpanded,
                            onDismissRequest = { idTypeDropdownExpanded = false }
                        ) {
                            ValidGovernmentIdTypes.forEach { idType ->
                                DropdownMenuItem(
                                    text = { Text(idType) },
                                    onClick = {
                                        selectedIdType = idType
                                        idTypeDropdownExpanded = false
                                    }
                                )
                            }
                        }
                    }

                    // Step 2: ID Card Number
                    Text(
                        text = "2. Government ID / Serial Number",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = EcoTextPrimary
                    )

                    OutlinedTextField(
                        value = idNumber,
                        onValueChange = { idNumber = it },
                        placeholder = { Text("e.g. 4819-2049-1823-9901") },
                        label = { Text("ID Card Number") },
                        singleLine = true,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("kyc_id_number_input")
                    )

                    // Step 3: Document Attachments
                    Text(
                        text = "3. ID Document Images",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = EcoTextPrimary
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        // Front Photo Box
                        Surface(
                            modifier = Modifier
                                .weight(1f)
                                .height(88.dp)
                                .clickable { frontPhotoSelected = !frontPhotoSelected }
                                .testTag("btn_kyc_front_photo"),
                            shape = RoundedCornerShape(12.dp),
                            color = if (frontPhotoSelected) EcoMint else EcoSurface,
                            border = androidx.compose.foundation.BorderStroke(
                                1.dp,
                                if (frontPhotoSelected) EcoEmerald else EcoBorder
                            )
                        ) {
                            Column(
                                modifier = Modifier.fillMaxSize(),
                                verticalArrangement = Arrangement.Center,
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = if (frontPhotoSelected) "✅" else "📷",
                                    fontSize = 22.sp
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = if (frontPhotoSelected) "Front Captured" else "Front of ID",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = if (frontPhotoSelected) EcoForestGreen else EcoTextPrimary
                                )
                            }
                        }

                        // Back Photo Box
                        Surface(
                            modifier = Modifier
                                .weight(1f)
                                .height(88.dp)
                                .clickable { backPhotoSelected = !backPhotoSelected }
                                .testTag("btn_kyc_back_photo"),
                            shape = RoundedCornerShape(12.dp),
                            color = if (backPhotoSelected) EcoMint else EcoSurface,
                            border = androidx.compose.foundation.BorderStroke(
                                1.dp,
                                if (backPhotoSelected) EcoEmerald else EcoBorder
                            )
                        ) {
                            Column(
                                modifier = Modifier.fillMaxSize(),
                                verticalArrangement = Arrangement.Center,
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = if (backPhotoSelected) "✅" else "📷",
                                    fontSize = 22.sp
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = if (backPhotoSelected) "Back Captured" else "Back of ID",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = if (backPhotoSelected) EcoForestGreen else EcoTextPrimary
                                )
                            }
                        }

                        // Verification Selfie Box
                        Surface(
                            modifier = Modifier
                                .weight(1f)
                                .height(88.dp)
                                .clickable { selfiePhotoSelected = !selfiePhotoSelected }
                                .testTag("btn_kyc_selfie"),
                            shape = RoundedCornerShape(12.dp),
                            color = if (selfiePhotoSelected) EcoMint else EcoSurface,
                            border = androidx.compose.foundation.BorderStroke(
                                1.dp,
                                if (selfiePhotoSelected) EcoEmerald else EcoBorder
                            )
                        ) {
                            Column(
                                modifier = Modifier.fillMaxSize(),
                                verticalArrangement = Arrangement.Center,
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = if (selfiePhotoSelected) "✅" else "🤳",
                                    fontSize = 22.sp
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = if (selfiePhotoSelected) "Selfie Verified" else "Citizen Selfie",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = if (selfiePhotoSelected) EcoForestGreen else EcoTextPrimary
                                )
                            }
                        }
                    }

                    // Certification Checkbox
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { isCertifyChecked = !isCertifyChecked }
                            .padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Checkbox(
                            checked = isCertifyChecked,
                            onCheckedChange = { isCertifyChecked = it },
                            colors = CheckboxDefaults.colors(checkedColor = EcoForestGreen)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "I solemnly affirm that the government credentials provided are authentic and match my citizen profile under penalty of law.",
                            fontSize = 11.sp,
                            color = EcoTextPrimary,
                            lineHeight = 15.sp
                        )
                    }

                    // Submit Verification Button
                    Button(
                        onClick = {
                            errorMessage = null
                            when {
                                idNumber.isBlank() -> errorMessage = "Please enter your government ID number."
                                !isCertifyChecked -> errorMessage = "Please certify the authenticity of your ID credentials."
                                else -> {
                                    isLoading = true
                                    viewModel.submitKycVerification(
                                        idType = selectedIdType,
                                        idNumber = idNumber,
                                        onSuccess = {
                                            isLoading = false
                                            onDismiss()
                                        },
                                        onError = { err ->
                                            isLoading = false
                                            errorMessage = err
                                        }
                                    )
                                }
                            }
                        },
                        enabled = !isLoading,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp)
                            .testTag("btn_submit_kyc_verification"),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = EcoForestGreen)
                    ) {
                        if (isLoading) {
                            CircularProgressIndicator(color = Color.White, modifier = Modifier.size(22.dp), strokeWidth = 2.dp)
                        } else {
                            Text(
                                text = "🛡️ Verify Identity & Activate Reporting (+25 pts)",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp
                            )
                        }
                    }
                }
            }
        }
    }
}

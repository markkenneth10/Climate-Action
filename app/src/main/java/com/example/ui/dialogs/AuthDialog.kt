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
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MenuAnchorType
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.ui.theme.EcoBorder
import com.example.ui.theme.EcoForestGreen
import com.example.ui.theme.EcoMint
import com.example.ui.theme.EcoSurface
import com.example.ui.theme.EcoTextMuted
import com.example.ui.theme.EcoTextPrimary
import com.example.ui.theme.EcoTextSecondary
import com.example.ui.viewmodel.ClimateViewModel

val CitizenBarangayList = listOf(
    "Barangay Makilas",
    "Barangay San Jose",
    "Barangay Poblacion",
    "Barangay Central",
    "Barangay Riverside",
    "Barangay Maligaya",
    "Barangay Pag-asa",
    "Barangay Bagong Silang"
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AuthDialog(
    viewModel: ClimateViewModel,
    initialMode: String = "register",
    onDismiss: () -> Unit
) {
    var isRegisterMode by remember { mutableStateOf(initialMode == "register") }

    // Register fields
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var selectedBarangay by remember { mutableStateOf(CitizenBarangayList[0]) }
    var address by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }

    // Login fields
    var loginEmail by remember { mutableStateOf("") }
    var loginPassword by remember { mutableStateOf("") }
    var loginPasswordVisible by remember { mutableStateOf(false) }

    var barangayDropdownExpanded by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(false) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.94f)
                .fillMaxHeight(0.90f)
                .testTag("auth_dialog"),
            shape = RoundedCornerShape(22.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 10.dp)
        ) {
            Column(
                modifier = Modifier.fillMaxSize()
            ) {
                // Header Bar
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
                                    Text(text = "🌱", fontSize = 20.sp)
                                }
                            }
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(
                                    text = "Citizen Portal Access",
                                    color = Color.White,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 17.sp
                                )
                                Text(
                                    text = "Metro Verde Environmental Taskforce",
                                    color = EcoMint,
                                    fontSize = 11.sp
                                )
                            }
                        }

                        IconButton(
                            onClick = onDismiss,
                            modifier = Modifier.testTag("close_auth_dialog")
                        ) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Close",
                                tint = Color.White
                            )
                        }
                    }
                }

                // Mode Tabs (Create Account vs Sign In)
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    shape = RoundedCornerShape(12.dp),
                    color = EcoSurface
                ) {
                    Row(modifier = Modifier.padding(4.dp)) {
                        Surface(
                            modifier = Modifier
                                .weight(1f)
                                .clickable {
                                    isRegisterMode = true
                                    errorMessage = null
                                }
                                .testTag("tab_create_account"),
                            shape = RoundedCornerShape(10.dp),
                            color = if (isRegisterMode) EcoForestGreen else Color.Transparent
                        ) {
                            Text(
                                text = "🌱 Create Account",
                                textAlign = TextAlign.Center,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = if (isRegisterMode) Color.White else EcoTextSecondary,
                                modifier = Modifier.padding(vertical = 10.dp)
                            )
                        }

                        Surface(
                            modifier = Modifier
                                .weight(1f)
                                .clickable {
                                    isRegisterMode = false
                                    errorMessage = null
                                }
                                .testTag("tab_sign_in"),
                            shape = RoundedCornerShape(10.dp),
                            color = if (!isRegisterMode) EcoForestGreen else Color.Transparent
                        ) {
                            Text(
                                text = "🔑 Sign In",
                                textAlign = TextAlign.Center,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = if (!isRegisterMode) Color.White else EcoTextSecondary,
                                modifier = Modifier.padding(vertical = 10.dp)
                            )
                        }
                    }
                }

                // Scrollable Form Content
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState())
                        .padding(horizontal = 20.dp, vertical = 4.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Ordinance Policy Notice
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = Color(0xFFF0FDF4),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFBBF7D0)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(text = "📜", fontSize = 20.sp)
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = "City Ordinance #2026-04 requires citizens to register and complete one-time government ID verification (KYC) before filing environmental incident reports.",
                                fontSize = 11.sp,
                                color = EcoForestGreen,
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

                    if (isRegisterMode) {
                        // CREATE ACCOUNT FORM
                        Text(
                            text = "Citizen Information",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = EcoTextPrimary
                        )

                        // Full Name
                        OutlinedTextField(
                            value = name,
                            onValueChange = { name = it },
                            label = { Text("Full Legal Name") },
                            placeholder = { Text("e.g. Juan dela Cruz") },
                            leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = EcoForestGreen) },
                            singleLine = true,
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("register_name_input")
                        )

                        // Email
                        OutlinedTextField(
                            value = email,
                            onValueChange = { email = it },
                            label = { Text("Email Address") },
                            placeholder = { Text("juan.delacruz@example.ph") },
                            leadingIcon = { Icon(Icons.Default.Email, contentDescription = null, tint = EcoForestGreen) },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("register_email_input")
                        )

                        // Mobile Phone
                        OutlinedTextField(
                            value = phone,
                            onValueChange = { phone = it },
                            label = { Text("Mobile Phone Number") },
                            placeholder = { Text("0917-123-4567") },
                            leadingIcon = { Icon(Icons.Default.Phone, contentDescription = null, tint = EcoForestGreen) },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("register_phone_input")
                        )

                        // Barangay Selector
                        ExposedDropdownMenuBox(
                            expanded = barangayDropdownExpanded,
                            onExpandedChange = { barangayDropdownExpanded = it }
                        ) {
                            OutlinedTextField(
                                value = selectedBarangay,
                                onValueChange = {},
                                readOnly = true,
                                label = { Text("Barangay Residence") },
                                leadingIcon = { Icon(Icons.Default.Home, contentDescription = null, tint = EcoForestGreen) },
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
                                CitizenBarangayList.forEach { bgy ->
                                    DropdownMenuItem(
                                        text = { Text(bgy) },
                                        onClick = {
                                            selectedBarangay = bgy
                                            barangayDropdownExpanded = false
                                        }
                                    )
                                }
                            }
                        }

                        // Street Address
                        OutlinedTextField(
                            value = address,
                            onValueChange = { address = it },
                            label = { Text("Street Address / Purok") },
                            placeholder = { Text("Block 2, Lot 5, Sampaguita St.") },
                            singleLine = true,
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("register_address_input")
                        )

                        // Password
                        OutlinedTextField(
                            value = password,
                            onValueChange = { password = it },
                            label = { Text("Create Password (min. 6 characters)") },
                            leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = EcoForestGreen) },
                            trailingIcon = {
                                IconButton(onClick = { passwordVisible = !passwordVisible }) {
                                    Icon(
                                        imageVector = if (passwordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                        contentDescription = if (passwordVisible) "Hide password" else "Show password"
                                    )
                                }
                            },
                            visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                            singleLine = true,
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("register_password_input")
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        // Submit Register Button
                        Button(
                            onClick = {
                                errorMessage = null
                                when {
                                    name.isBlank() -> errorMessage = "Please enter your full legal name."
                                    email.isBlank() || !email.contains("@") -> errorMessage = "Please enter a valid email address."
                                    password.length < 6 -> errorMessage = "Password must be at least 6 characters."
                                    else -> {
                                        isLoading = true
                                        viewModel.registerCitizen(
                                            name = name,
                                            email = email,
                                            phone = phone,
                                            barangay = selectedBarangay,
                                            address = address,
                                            password = password,
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
                                .height(50.dp)
                                .testTag("btn_submit_register"),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = EcoForestGreen)
                        ) {
                            if (isLoading) {
                                CircularProgressIndicator(color = Color.White, modifier = Modifier.size(22.dp), strokeWidth = 2.dp)
                            } else {
                                Text("🌱 Create Citizen Account (+50 Pts)", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            }
                        }

                        // Switch to sign in helper
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    isRegisterMode = false
                                    errorMessage = null
                                }
                                .padding(vertical = 6.dp),
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Text(
                                text = "Already have an account? ",
                                fontSize = 12.sp,
                                color = EcoTextSecondary
                            )
                            Text(
                                text = "Sign In Here",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = EcoForestGreen
                            )
                        }

                    } else {
                        // SIGN IN FORM
                        Text(
                            text = "Sign In to Your Account",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = EcoTextPrimary
                        )

                        // Email
                        OutlinedTextField(
                            value = loginEmail,
                            onValueChange = { loginEmail = it },
                            label = { Text("Registered Email Address") },
                            placeholder = { Text("e.g. citizen@climateaction.org") },
                            leadingIcon = { Icon(Icons.Default.Email, contentDescription = null, tint = EcoForestGreen) },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("login_email_input")
                        )

                        // Password
                        OutlinedTextField(
                            value = loginPassword,
                            onValueChange = { loginPassword = it },
                            label = { Text("Account Password") },
                            leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = EcoForestGreen) },
                            trailingIcon = {
                                IconButton(onClick = { loginPasswordVisible = !loginPasswordVisible }) {
                                    Icon(
                                        imageVector = if (loginPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                        contentDescription = if (loginPasswordVisible) "Hide password" else "Show password"
                                    )
                                }
                            },
                            visualTransformation = if (loginPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                            singleLine = true,
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("login_password_input")
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        // Submit Login Button
                        Button(
                            onClick = {
                                errorMessage = null
                                when {
                                    loginEmail.isBlank() -> errorMessage = "Please enter your email address."
                                    loginPassword.isBlank() -> errorMessage = "Please enter your password."
                                    else -> {
                                        isLoading = true
                                        viewModel.loginCitizen(
                                            email = loginEmail,
                                            password = loginPassword,
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
                                .height(50.dp)
                                .testTag("btn_submit_login"),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = EcoForestGreen)
                        ) {
                            if (isLoading) {
                                CircularProgressIndicator(color = Color.White, modifier = Modifier.size(22.dp), strokeWidth = 2.dp)
                            } else {
                                Text("🔑 Sign In to Citizen Portal", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            }
                        }

                        // Switch to register helper
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    isRegisterMode = true
                                    errorMessage = null
                                }
                                .padding(vertical = 6.dp),
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Text(
                                text = "New to Climate Action? ",
                                fontSize = 12.sp,
                                color = EcoTextSecondary
                            )
                            Text(
                                text = "Create Citizen Account",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = EcoForestGreen
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    // Browse as Guest Button
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(44.dp)
                            .testTag("btn_browse_guest"),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text(
                            text = "👀 Browse Public Advisories as Guest",
                            fontSize = 12.sp,
                            color = EcoTextSecondary
                        )
                    }
                }
            }
        }
    }
}

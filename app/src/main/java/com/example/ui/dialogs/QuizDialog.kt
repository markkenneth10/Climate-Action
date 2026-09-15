package com.example.ui.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.data.model.QuizQuestionEntity
import com.example.ui.theme.EcoBorder
import com.example.ui.theme.EcoEmerald
import com.example.ui.theme.EcoForestGreen
import com.example.ui.theme.EcoMint
import com.example.ui.theme.EcoSurface
import com.example.ui.theme.EcoSurfaceVariant
import com.example.ui.theme.EcoTeal
import com.example.ui.theme.EcoTextPrimary
import com.example.ui.theme.EcoTextSecondary
import com.example.ui.theme.SeverityCritical
import com.example.ui.viewmodel.ClimateViewModel

@Composable
fun QuizDialog(
    viewModel: ClimateViewModel,
    onDismiss: () -> Unit
) {
    val questions: List<QuizQuestionEntity> by viewModel.allQuizzes.collectAsState()
    val currentIndex by viewModel.quizCurrentIndex.collectAsState()
    val selectedOption by viewModel.quizSelectedOption.collectAsState()
    val score by viewModel.quizScore.collectAsState()
    val isSubmitted by viewModel.quizAnswerSubmitted.collectAsState()
    val isFinished by viewModel.quizFinished.collectAsState()

    val currentQ = questions.getOrNull(currentIndex)
    val total = questions.size

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier.fillMaxWidth(0.92f),
            shape = RoundedCornerShape(20.dp),
            color = EcoSurface
        ) {
            Column(modifier = Modifier.fillMaxWidth()) {
                // Header
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(EcoForestGreen)
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(text = "🧠", fontSize = 22.sp)
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text(
                                text = "Climate Awareness Quiz",
                                color = Color.White,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = if (isFinished) "Completed" else "Question ${currentIndex + 1} of $total",
                                color = EcoMint,
                                fontSize = 11.sp
                            )
                        }
                    }

                    IconButton(onClick = onDismiss) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = Color.White)
                    }
                }

                // Body
                if (isFinished) {
                    // Result Celebration View
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier
                                .size(72.dp)
                                .clip(CircleShape)
                                .background(EcoMint),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(text = "🏆", fontSize = 36.sp)
                        }
                        Spacer(modifier = Modifier.height(14.dp))
                        Text(
                            text = "Quiz Mastered!",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = EcoTextPrimary
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "You scored $score out of $total questions",
                            fontSize = 14.sp,
                            color = EcoTextSecondary
                        )
                        Spacer(modifier = Modifier.height(12.dp))

                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = Color(0xFFFEF3C7)
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(text = "🎉", fontSize = 16.sp)
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "+10 Climate Points Added to Your Profile",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFFB45309)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(20.dp))

                        Button(
                            onClick = onDismiss,
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = EcoForestGreen)
                        ) {
                            Text(text = "Done", fontWeight = FontWeight.Bold)
                        }
                    }
                } else if (currentQ != null) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(18.dp)
                    ) {
                        // Category Pill
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = EcoMint
                        ) {
                            Text(
                                text = currentQ.category,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = EcoForestGreen,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(
                            text = currentQ.question,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = EcoTextPrimary,
                            lineHeight = 22.sp
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        val options: List<Pair<String, String>> = listOf(
                            Pair("A", currentQ.optionA),
                            Pair("B", currentQ.optionB),
                            Pair("C", currentQ.optionC),
                            Pair("D", currentQ.optionD)
                        )

                        options.forEachIndexed { optIndex, pair ->
                            val letter = pair.first
                            val text = pair.second
                            val isSelected = selectedOption == optIndex
                            val isCorrect = currentQ.correctAnswerIndex == optIndex

                            val borderColor = when {
                                isSubmitted && isCorrect -> EcoEmerald
                                isSubmitted && isSelected && !isCorrect -> SeverityCritical
                                isSelected -> EcoForestGreen
                                else -> EcoBorder
                            }

                            val bgColor = when {
                                isSubmitted && isCorrect -> Color(0xFFD1FAE5)
                                isSubmitted && isSelected && !isCorrect -> Color(0xFFFEE2E2)
                                isSelected -> EcoMint
                                else -> EcoSurfaceVariant
                            }

                            Surface(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp)
                                    .clickable(enabled = !isSubmitted) {
                                        viewModel.selectQuizOption(optIndex)
                                    }
                                    .testTag("quiz_option_$optIndex"),
                                shape = RoundedCornerShape(12.dp),
                                color = bgColor,
                                border = androidx.compose.foundation.BorderStroke(1.dp, borderColor)
                            ) {
                                Row(
                                    modifier = Modifier.padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(26.dp)
                                            .clip(CircleShape)
                                            .background(if (isSelected) EcoForestGreen else Color.White),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = letter,
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (isSelected) Color.White else EcoTextPrimary
                                        )
                                    }
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Text(
                                        text = text,
                                        fontSize = 12.sp,
                                        color = EcoTextPrimary,
                                        modifier = Modifier.weight(1f)
                                    )
                                }
                            }
                        }

                        // Explanation after answering
                        if (isSubmitted) {
                            Spacer(modifier = Modifier.height(10.dp))
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = Color(0xFFF1F5F9),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Column(modifier = Modifier.padding(10.dp)) {
                                    Text(
                                        text = if (selectedOption == currentQ.correctAnswerIndex) "✓ Correct Answer!" else "✕ Incorrect",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 12.sp,
                                        color = if (selectedOption == currentQ.correctAnswerIndex) EcoForestGreen else SeverityCritical
                                    )
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(
                                        text = currentQ.explanation,
                                        fontSize = 11.sp,
                                        color = EcoTextSecondary,
                                        lineHeight = 15.sp
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        if (!isSubmitted) {
                            Button(
                                onClick = { viewModel.submitQuizAnswer(currentQ.correctAnswerIndex) },
                                enabled = selectedOption != null,
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = EcoForestGreen)
                            ) {
                                Text(text = "Submit Answer", fontWeight = FontWeight.Bold)
                            }
                        } else {
                            Button(
                                onClick = { viewModel.nextQuizQuestion(total) },
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = EcoTeal)
                            ) {
                                Text(
                                    text = if (currentIndex + 1 < total) "Next Question →" else "Finish & Claim Points 🏆",
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

package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val name: String,
    val email: String,
    val password: String = "password123",
    val phone: String = "",
    val role: String = "Citizen", // "Citizen", "Administrator", "Environmental Officer"
    val points: Int = 50,
    val barangay: String = "Barangay Makilas",
    val municipality: String = "Metro Verde",
    val address: String = "",
    val isVerified: Boolean = false,
    val kycStatus: String = "unverified", // "unverified", "pending", "verified", "rejected"
    val kycIdType: String = "",
    val kycIdNumber: String = "",
    val avatarColorHex: String = "#10B981"
)

@Entity(tableName = "reports")
data class ReportEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val userId: Int,
    val authorName: String,
    val title: String,
    val category: String,
    val categoryIcon: String,
    val description: String,
    val photoUri: String? = null,
    val samplePhotoDrawable: String = "climate_hero_banner", // fallback or preset
    val latitude: Double,
    val longitude: Double,
    val barangay: String,
    val municipality: String = "Metro Verde",
    val province: String = "Eco Province",
    val severity: String, // "Critical", "High", "Moderate", "Low"
    val status: String, // "Submitted", "Under Review", "Verified", "In Progress", "Resolved", "Closed"
    val adminRemarks: String? = null,
    val assignedOfficer: String? = null,
    val resolutionEvidence: String? = null,
    val timestamp: Long = System.currentTimeMillis()
)

@Entity(tableName = "report_updates")
data class ReportUpdateEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val reportId: Long,
    val status: String,
    val remarks: String,
    val updatedBy: String,
    val timestamp: Long = System.currentTimeMillis()
)

@Entity(tableName = "climate_articles")
data class ClimateArticleEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val category: String,
    val icon: String,
    val summary: String,
    val content: String,
    val actionTips: String, // newline-separated tips
    val references: String,
    val readTimeMinutes: Int = 4
)

@Entity(tableName = "activities")
data class ActivityEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val category: String,
    val icon: String,
    val description: String,
    val location: String,
    val barangay: String,
    val dateText: String,
    val timeText: String,
    val rewardPoints: Int,
    val maxParticipants: Int,
    val currentParticipants: Int,
    val isRegistered: Boolean = false,
    val isCompleted: Boolean = false,
    val proofSubmitted: Boolean = false,
    val proofNote: String? = null
)

@Entity(tableName = "quizzes")
data class QuizQuestionEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val question: String,
    val optionA: String,
    val optionB: String,
    val optionC: String,
    val optionD: String,
    val correctAnswerIndex: Int, // 0 to 3
    val explanation: String,
    val category: String
)

@Entity(tableName = "points_log")
data class PointsLogEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val userId: Int,
    val action: String,
    val points: Int,
    val timestamp: Long = System.currentTimeMillis()
)

@Entity(tableName = "notifications")
data class NotificationEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val userId: Int,
    val title: String,
    val message: String,
    val type: String, // "Report", "Activity", "Advisory", "Quiz"
    val isRead: Boolean = false,
    val timestamp: Long = System.currentTimeMillis()
)

package com.example.data.repository

import com.example.data.AppDatabase
import com.example.data.InitialData
import com.example.data.model.ActivityEntity
import com.example.data.model.ClimateArticleEntity
import com.example.data.model.NotificationEntity
import com.example.data.model.PointsLogEntity
import com.example.data.model.QuizQuestionEntity
import com.example.data.model.ReportEntity
import com.example.data.model.ReportUpdateEntity
import com.example.data.model.UserEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext

class ClimateRepository(private val db: AppDatabase) {

    val allReports: Flow<List<ReportEntity>> = db.reportDao().getAllReports()
    val allArticles: Flow<List<ClimateArticleEntity>> = db.articleDao().getAllArticles()
    val allActivities: Flow<List<ActivityEntity>> = db.activityDao().getAllActivities()
    val allQuizzes: Flow<List<QuizQuestionEntity>> = db.quizDao().getAllQuestions()
    val allUsers: Flow<List<UserEntity>> = db.userDao().getAllUsers()
    val allNotifications: Flow<List<NotificationEntity>> = db.notificationDao().getAllNotifications()
    val unreadNotificationsCount: Flow<Int> = db.notificationDao().getUnreadCount()

    fun getUser(id: Int): Flow<UserEntity?> = db.userDao().getUserById(id)
    fun getReportsForUser(userId: Int): Flow<List<ReportEntity>> = db.reportDao().getReportsByUser(userId)
    fun getReportById(id: Long): Flow<ReportEntity?> = db.reportDao().getReportById(id)
    fun getReportUpdates(reportId: Long): Flow<List<ReportUpdateEntity>> = db.reportUpdateDao().getUpdatesForReport(reportId)
    fun getPointsLogs(userId: Int): Flow<List<PointsLogEntity>> = db.pointsDao().getPointsLogs(userId)

    suspend fun seedDatabaseIfEmpty() = withContext(Dispatchers.IO) {
        val userCount = db.userDao().getUserCount()
        if (userCount == 0) {
            db.userDao().insertUsers(InitialData.users)
            db.reportDao().insertReports(InitialData.reports)
            db.reportUpdateDao().insertUpdates(InitialData.reportUpdates)
            db.articleDao().insertArticles(InitialData.articles)
            db.activityDao().insertActivities(InitialData.activities)
            db.quizDao().insertQuestions(InitialData.quizzes)
            InitialData.pointsLogs.forEach { db.pointsDao().insertLog(it) }
            db.notificationDao().insertNotifications(InitialData.notifications)
        }
    }

    suspend fun submitReport(
        userId: Int,
        authorName: String,
        title: String,
        category: String,
        categoryIcon: String,
        description: String,
        photoUri: String?,
        latitude: Double,
        longitude: Double,
        barangay: String,
        municipality: String,
        province: String,
        severity: String
    ): Long = withContext(Dispatchers.IO) {
        val report = ReportEntity(
            userId = userId,
            authorName = authorName,
            title = title,
            category = category,
            categoryIcon = categoryIcon,
            description = description,
            photoUri = photoUri,
            latitude = latitude,
            longitude = longitude,
            barangay = barangay,
            municipality = municipality,
            province = province,
            severity = severity,
            status = "Submitted",
            timestamp = System.currentTimeMillis()
        )
        val reportId = db.reportDao().insertReport(report)

        // Add initial tracking update
        db.reportUpdateDao().insertUpdate(
            ReportUpdateEntity(
                reportId = reportId,
                status = "Submitted",
                remarks = "Environmental issue reported with photo and location evidence.",
                updatedBy = authorName,
                timestamp = System.currentTimeMillis()
            )
        )

        // Award submission points (+10)
        db.userDao().addPoints(userId, 10)
        db.pointsDao().insertLog(
            PointsLogEntity(
                userId = userId,
                action = "Submitted environmental incident report: $title",
                points = 10
            )
        )

        // Create notification
        db.notificationDao().insertNotification(
            NotificationEntity(
                userId = userId,
                title = "Report Submitted",
                message = "Your report \"$title\" has been submitted and queued for administrative review. (+10 pts)",
                type = "Report"
            )
        )

        reportId
    }

    suspend fun updateReportStatus(
        reportId: Long,
        newStatus: String,
        remarks: String,
        updatedBy: String,
        assignedOfficer: String? = null
    ) = withContext(Dispatchers.IO) {
        db.reportDao().updateReportStatus(reportId, newStatus, remarks, assignedOfficer)
        db.reportUpdateDao().insertUpdate(
            ReportUpdateEntity(
                reportId = reportId,
                status = newStatus,
                remarks = remarks,
                updatedBy = updatedBy,
                timestamp = System.currentTimeMillis()
            )
        )

        // Notify user about status advancement
        db.notificationDao().insertNotification(
            NotificationEntity(
                userId = 1,
                title = "Report Status: $newStatus",
                message = "Incident report #$reportId updated to $newStatus: \"$remarks\"",
                type = "Report"
            )
        )
    }

    suspend fun toggleActivityRegistration(activityId: Long, currentStatus: Boolean, activityTitle: String, userId: Int) = withContext(Dispatchers.IO) {
        val newStatus = !currentStatus
        db.activityDao().setRegistration(activityId, newStatus)
        if (newStatus) {
            db.notificationDao().insertNotification(
                NotificationEntity(
                    userId = userId,
                    title = "Activity Registered",
                    message = "You have registered for \"$activityTitle\". See you there!",
                    type = "Activity"
                )
            )
        }
    }

    suspend fun submitActivityProof(activityId: Long, proofNote: String, rewardPoints: Int, userId: Int) = withContext(Dispatchers.IO) {
        db.activityDao().submitProof(activityId, proofNote)
        db.userDao().addPoints(userId, rewardPoints)
        db.pointsDao().insertLog(
            PointsLogEntity(
                userId = userId,
                action = "Participated in community activity & verified proof",
                points = rewardPoints
            )
        )
        db.notificationDao().insertNotification(
            NotificationEntity(
                userId = userId,
                title = "Activity Completed!",
                message = "Your participation evidence was approved. You earned +$rewardPoints Climate Points!",
                type = "Activity"
            )
        )
    }

    suspend fun completeQuiz(userId: Int, score: Int, totalQuestions: Int) = withContext(Dispatchers.IO) {
        val points = 10
        db.userDao().addPoints(userId, points)
        db.pointsDao().insertLog(
            PointsLogEntity(
                userId = userId,
                action = "Completed Climate Awareness Quiz ($score/$totalQuestions)",
                points = points
            )
        )
        db.notificationDao().insertNotification(
            NotificationEntity(
                userId = userId,
                title = "Quiz Mastered: Score $score/$totalQuestions",
                message = "Great job sharpening your environmental awareness! You earned +$points Climate Points.",
                type = "Quiz"
            )
        )
    }

    suspend fun markNotificationAsRead(id: Long) = withContext(Dispatchers.IO) {
        db.notificationDao().markAsRead(id)
    }

    suspend fun markAllNotificationsAsRead() = withContext(Dispatchers.IO) {
        db.notificationDao().markAllAsRead()
    }

    suspend fun registerCitizen(
        name: String,
        email: String,
        phone: String,
        barangay: String,
        address: String,
        password: String
    ): Result<UserEntity> = withContext(Dispatchers.IO) {
        val cleanEmail = email.trim().lowercase()
        val existing = db.userDao().getUserByEmail(cleanEmail)
        if (existing != null) {
            return@withContext Result.failure(Exception("An account with this email ($cleanEmail) already exists. Please log in."))
        }

        val colors = listOf("#10B981", "#3B82F6", "#EC4899", "#8B5CF6", "#F59E0B", "#06B6D4")
        val randomColor = colors.random()

        val newUser = UserEntity(
            name = name.trim(),
            email = cleanEmail,
            phone = phone.trim(),
            password = password.trim(),
            role = "Citizen",
            points = 50, // Welcome bonus
            barangay = barangay.trim(),
            municipality = "Metro Verde",
            address = address.trim(),
            isVerified = false,
            kycStatus = "unverified",
            kycIdType = "",
            kycIdNumber = "",
            avatarColorHex = randomColor
        )

        val insertedId = db.userDao().insertUser(newUser).toInt()
        val created = newUser.copy(id = insertedId)

        db.pointsDao().insertLog(
            PointsLogEntity(
                userId = insertedId,
                action = "Welcome Bonus: Citizen Account Created",
                points = 50
            )
        )

        db.notificationDao().insertNotification(
            NotificationEntity(
                userId = insertedId,
                title = "Welcome to Metro Verde Climate Portal! 🌱",
                message = "Account created! Verify your government ID (KYC) to unlock environmental hazard reporting.",
                type = "Account"
            )
        )

        Result.success(created)
    }

    suspend fun loginCitizen(email: String, password: String): Result<UserEntity> = withContext(Dispatchers.IO) {
        val cleanEmail = email.trim().lowercase()
        val user = db.userDao().getUserByEmail(cleanEmail)
        if (user == null) {
            return@withContext Result.failure(Exception("Account not found. Please create a citizen account first."))
        }
        if (user.password.isNotBlank() && user.password != password.trim()) {
            return@withContext Result.failure(Exception("Incorrect password. Please verify your credentials."))
        }
        Result.success(user)
    }

    suspend fun verifyKyc(userId: Int, idType: String, idNumber: String): Result<Unit> = withContext(Dispatchers.IO) {
        db.userDao().updateKyc(
            userId = userId,
            verified = true,
            status = "verified",
            idType = idType,
            idNum = idNumber
        )

        // Award verification bonus
        val bonus = 25
        db.userDao().addPoints(userId, bonus)
        db.pointsDao().insertLog(
            PointsLogEntity(
                userId = userId,
                action = "KYC Verified ($idType)",
                points = bonus
            )
        )

        db.notificationDao().insertNotification(
            NotificationEntity(
                userId = userId,
                title = "Identity Verified (KYC) 🛡️",
                message = "Your government ID was verified! Reporting environmental incidents is now fully unlocked. +$bonus pts awarded.",
                type = "Verification"
            )
        )

        Result.success(Unit)
    }
}

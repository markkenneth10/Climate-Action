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
}

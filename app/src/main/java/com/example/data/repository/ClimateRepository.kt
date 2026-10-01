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
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class ClimateRepository(private val db: AppDatabase) {

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(6, TimeUnit.SECONDS)
        .readTimeout(8, TimeUnit.SECONDS)
        .build()

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

        // Push new report to live backend / website database
        try {
            val candidateUrls = listOf(
                "https://ais-dev-f5odrqogsjxmxcco4652hh-662791830333.asia-southeast1.run.app",
                "http://10.0.2.2:3000",
                "http://10.0.2.2:8080"
            )
            val jsonPayload = JSONObject().apply {
                put("id", "ECO-2026-$reportId")
                put("title", title)
                put("category", category)
                put("description", description)
                put("authorName", authorName)
                put("barangay", barangay)
                put("municipality", municipality)
                put("province", province)
                put("severity", severity)
                put("status", "Submitted")
                put("latitude", latitude)
                put("longitude", longitude)
                if (photoUri != null) put("photoUri", photoUri)
            }
            val body = jsonPayload.toString().toRequestBody("application/json".toMediaTypeOrNull())
            for (base in candidateUrls) {
                try {
                    val req = Request.Builder()
                        .url("${base.trimEnd('/')}/api/app/reports")
                        .post(body)
                        .build()
                    httpClient.newCall(req).execute().close()
                    break
                } catch (_: Exception) {}
            }
        } catch (_: Exception) {}

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

        // Push status update to live backend / website database
        try {
            val candidateUrls = listOf(
                "https://ais-dev-f5odrqogsjxmxcco4652hh-662791830333.asia-southeast1.run.app",
                "http://10.0.2.2:3000",
                "http://10.0.2.2:8080"
            )
            val updateJson = JSONObject().apply {
                put("status", newStatus)
                put("adminRemarks", remarks)
                if (assignedOfficer != null) put("assignedOfficer", assignedOfficer)
            }
            val body = updateJson.toString().toRequestBody("application/json".toMediaTypeOrNull())
            for (base in candidateUrls) {
                try {
                    val req = Request.Builder()
                        .url("${base.trimEnd('/')}/api/app/reports/$reportId/status")
                        .post(body)
                        .build()
                    httpClient.newCall(req).execute().close()
                    break
                } catch (_: Exception) {}
            }
        } catch (_: Exception) {}
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
                title = "Welcome to Metro Verde Climate Portal!",
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
                title = "Identity Verified (KYC)",
                message = "Your government ID was verified! Reporting environmental incidents is now fully unlocked. +$bonus pts awarded.",
                type = "Verification"
            )
        )

        Result.success(Unit)
    }

    suspend fun syncWithBackend(baseUrl: String = "https://ais-dev-f5odrqogsjxmxcco4652hh-662791830333.asia-southeast1.run.app"): Result<String> = withContext(Dispatchers.IO) {
        val candidateUrls = listOf(
            baseUrl,
            "http://10.0.2.2:3000",
            "http://10.0.2.2:8080",
            "http://localhost:3000",
            "http://127.0.0.1:3000"
        )

        var lastError: Exception? = null

        for (base in candidateUrls) {
            try {
                val url = "${base.trimEnd('/')}/api/app/sync"
                val request = Request.Builder()
                    .url(url)
                    .header("Accept", "application/json")
                    .get()
                    .build()

                httpClient.newCall(request).execute().use { response ->
                    if (response.isSuccessful) {
                        val body = response.body?.string()
                        if (!body.isNullOrBlank()) {
                            val json = JSONObject(body)

                            // Sync Reports from server
                            if (json.has("reports")) {
                                val reportsArray = json.getJSONArray("reports")
                                val reportsList = mutableListOf<ReportEntity>()
                                for (i in 0 until reportsArray.length()) {
                                    val r = reportsArray.getJSONObject(i)
                                    val idNum = r.optString("id").replace(Regex("[^0-9]"), "").toLongOrNull() ?: (i + 100L)
                                    reportsList.add(
                                        ReportEntity(
                                            id = idNum,
                                            userId = r.optInt("userId", 1),
                                            authorName = r.optString("authorName", r.optString("reporterName", "Citizen Reporter")),
                                            title = r.optString("title", "Environmental Incident"),
                                            category = r.optString("category", "General"),
                                            categoryIcon = r.optString("categoryIcon", "General"),
                                            description = r.optString("description", ""),
                                            photoUri = if (r.has("imageUrl") && !r.isNull("imageUrl")) r.getString("imageUrl") else null,
                                            latitude = r.optDouble("latitude", 14.5995),
                                            longitude = r.optDouble("longitude", 120.9842),
                                            barangay = r.optString("barangay", "Metro Verde"),
                                            municipality = r.optString("municipality", "Metro Verde"),
                                            province = r.optString("province", "Eco Province"),
                                            severity = r.optString("severity", "Moderate"),
                                            status = r.optString("status", "Submitted"),
                                            adminRemarks = if (r.has("adminRemarks") && !r.isNull("adminRemarks")) r.optString("adminRemarks") else null,
                                            assignedOfficer = if (r.has("assignedOfficer") && !r.isNull("assignedOfficer")) r.optString("assignedOfficer") else null,
                                            timestamp = r.optLong("timestamp", System.currentTimeMillis())
                                        )
                                    )
                                }
                                if (reportsList.isNotEmpty()) {
                                    db.reportDao().insertReports(reportsList)
                                }
                            }

                            // Sync Activities from server
                            if (json.has("activities")) {
                                val actArray = json.getJSONArray("activities")
                                val actList = mutableListOf<ActivityEntity>()
                                for (i in 0 until actArray.length()) {
                                    val a = actArray.getJSONObject(i)
                                    val idNum = a.optString("id").replace(Regex("[^0-9]"), "").toLongOrNull() ?: (i + 1L)
                                    actList.add(
                                        ActivityEntity(
                                            id = idNum,
                                            title = a.optString("title", "Community Eco Activity"),
                                            category = a.optString("category", "Community Action"),
                                            icon = a.optString("category", "Action"),
                                            description = a.optString("target", "Community ecological drive"),
                                            location = a.optString("location", "Metro Verde"),
                                            barangay = a.optString("location", "Metro Verde"),
                                            dateText = a.optString("date", "Upcoming"),
                                            timeText = "07:00 AM",
                                            rewardPoints = 25,
                                            maxParticipants = a.optInt("max", 100),
                                            currentParticipants = a.optInt("registered", 0),
                                            isRegistered = false,
                                            isCompleted = false
                                        )
                                    )
                                }
                                if (actList.isNotEmpty()) {
                                    db.activityDao().insertActivities(actList)
                                }
                            }

                            // Sync Announcements into Notifications
                            if (json.has("announcements")) {
                                val annArray = json.getJSONArray("announcements")
                                val notifs = mutableListOf<NotificationEntity>()
                                for (i in 0 until annArray.length()) {
                                    val ann = annArray.getJSONObject(i)
                                    notifs.add(
                                        NotificationEntity(
                                            userId = 1,
                                            title = ann.optString("title", "Official Advisory"),
                                            message = ann.optString("content", ann.optString("summary", "New official municipal notice issued.")),
                                            type = "Announcement",
                                            timestamp = ann.optLong("timestamp", System.currentTimeMillis()),
                                            isRead = false
                                        )
                                    )
                                }
                                if (notifs.isNotEmpty()) {
                                    db.notificationDao().insertNotifications(notifs)
                                }
                            }

                            // Sync User Guides / Articles from server
                            if (json.has("guides")) {
                                val guidesArray = json.getJSONArray("guides")
                                val guidesList = mutableListOf<ClimateArticleEntity>()
                                for (i in 0 until guidesArray.length()) {
                                    val g = guidesArray.getJSONObject(i)
                                    val idNum = g.optString("id").replace(Regex("[^0-9]"), "").toLongOrNull() ?: (i + 1L)
                                    guidesList.add(
                                        ClimateArticleEntity(
                                            id = idNum,
                                            title = g.optString("title", "Environmental Guide"),
                                            category = g.optString("category", "Guide"),
                                            icon = "Article",
                                            summary = g.optString("summary", ""),
                                            content = g.optString("content", ""),
                                            actionTips = "Follow municipal regulations\nParticipate in local cleanups\nReport hazards with photo evidence",
                                            references = "CENRO Environmental Code & Republic Act 9003",
                                            readTimeMinutes = 3
                                        )
                                    )
                                }
                                if (guidesList.isNotEmpty()) {
                                    db.articleDao().insertArticles(guidesList)
                                }
                            }

                            return@withContext Result.success("Synced successfully with $base")
                        }
                    }
                }
            } catch (e: Exception) {
                lastError = e
            }
        }
        Result.failure(lastError ?: Exception("Could not connect to server"))
    }
}

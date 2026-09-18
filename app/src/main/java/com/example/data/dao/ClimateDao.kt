package com.example.data.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.model.ActivityEntity
import com.example.data.model.ClimateArticleEntity
import com.example.data.model.NotificationEntity
import com.example.data.model.PointsLogEntity
import com.example.data.model.QuizQuestionEntity
import com.example.data.model.ReportEntity
import com.example.data.model.ReportUpdateEntity
import com.example.data.model.UserEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface UserDao {
    @Query("SELECT * FROM users WHERE id = :id LIMIT 1")
    fun getUserById(id: Int): Flow<UserEntity?>

    @Query("SELECT * FROM users ORDER BY points DESC")
    fun getAllUsers(): Flow<List<UserEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUser(user: UserEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUsers(users: List<UserEntity>)

    @Update
    suspend fun updateUser(user: UserEntity)

    @Query("UPDATE users SET points = points + :addPoints WHERE id = :userId")
    suspend fun addPoints(userId: Int, addPoints: Int)

    @Query("SELECT * FROM users WHERE LOWER(email) = LOWER(:email) LIMIT 1")
    suspend fun getUserByEmail(email: String): UserEntity?

    @Query("UPDATE users SET isVerified = :verified, kycStatus = :status, kycIdType = :idType, kycIdNumber = :idNum WHERE id = :userId")
    suspend fun updateKyc(userId: Int, verified: Boolean, status: String, idType: String, idNum: String)

    @Query("SELECT COUNT(*) FROM users")
    suspend fun getUserCount(): Int
}

@Dao
interface ReportDao {
    @Query("SELECT * FROM reports ORDER BY timestamp DESC")
    fun getAllReports(): Flow<List<ReportEntity>>

    @Query("SELECT * FROM reports WHERE userId = :userId ORDER BY timestamp DESC")
    fun getReportsByUser(userId: Int): Flow<List<ReportEntity>>

    @Query("SELECT * FROM reports WHERE id = :id LIMIT 1")
    fun getReportById(id: Long): Flow<ReportEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReport(report: ReportEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReports(reports: List<ReportEntity>)

    @Update
    suspend fun updateReport(report: ReportEntity)

    @Query("UPDATE reports SET status = :status, adminRemarks = :remarks, assignedOfficer = :officer WHERE id = :reportId")
    suspend fun updateReportStatus(reportId: Long, status: String, remarks: String?, officer: String?)

    @Query("DELETE FROM reports WHERE id = :id")
    suspend fun deleteReport(id: Long)

    @Query("SELECT COUNT(*) FROM reports")
    suspend fun getReportCount(): Int
}

@Dao
interface ReportUpdateDao {
    @Query("SELECT * FROM report_updates WHERE reportId = :reportId ORDER BY timestamp ASC")
    fun getUpdatesForReport(reportId: Long): Flow<List<ReportUpdateEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUpdate(update: ReportUpdateEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUpdates(updates: List<ReportUpdateEntity>)
}

@Dao
interface ArticleDao {
    @Query("SELECT * FROM climate_articles ORDER BY id ASC")
    fun getAllArticles(): Flow<List<ClimateArticleEntity>>

    @Query("SELECT * FROM climate_articles WHERE category = :category")
    fun getArticlesByCategory(category: String): Flow<List<ClimateArticleEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertArticles(articles: List<ClimateArticleEntity>)

    @Query("SELECT COUNT(*) FROM climate_articles")
    suspend fun getArticleCount(): Int
}

@Dao
interface ActivityDao {
    @Query("SELECT * FROM activities ORDER BY id ASC")
    fun getAllActivities(): Flow<List<ActivityEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertActivities(activities: List<ActivityEntity>)

    @Update
    suspend fun updateActivity(activity: ActivityEntity)

    @Query("UPDATE activities SET isRegistered = :registered, currentParticipants = currentParticipants + CASE WHEN :registered = 1 THEN 1 ELSE -1 END WHERE id = :id")
    suspend fun setRegistration(id: Long, registered: Boolean)

    @Query("UPDATE activities SET proofSubmitted = 1, proofNote = :proofNote WHERE id = :id")
    suspend fun submitProof(id: Long, proofNote: String)

    @Query("SELECT COUNT(*) FROM activities")
    suspend fun getActivityCount(): Int
}

@Dao
interface QuizDao {
    @Query("SELECT * FROM quizzes ORDER BY id ASC")
    fun getAllQuestions(): Flow<List<QuizQuestionEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertQuestions(questions: List<QuizQuestionEntity>)

    @Query("SELECT COUNT(*) FROM quizzes")
    suspend fun getQuestionCount(): Int
}

@Dao
interface PointsDao {
    @Query("SELECT * FROM points_log WHERE userId = :userId ORDER BY timestamp DESC")
    fun getPointsLogs(userId: Int): Flow<List<PointsLogEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLog(log: PointsLogEntity): Long
}

@Dao
interface NotificationDao {
    @Query("SELECT * FROM notifications ORDER BY timestamp DESC")
    fun getAllNotifications(): Flow<List<NotificationEntity>>

    @Query("SELECT COUNT(*) FROM notifications WHERE isRead = 0")
    fun getUnreadCount(): Flow<Int>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertNotification(notification: NotificationEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertNotifications(notifications: List<NotificationEntity>)

    @Query("UPDATE notifications SET isRead = 1 WHERE id = :id")
    suspend fun markAsRead(id: Long)

    @Query("UPDATE notifications SET isRead = 1")
    suspend fun markAllAsRead()
}

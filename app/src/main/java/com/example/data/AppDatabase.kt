package com.example.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.example.data.dao.ActivityDao
import com.example.data.dao.ArticleDao
import com.example.data.dao.NotificationDao
import com.example.data.dao.PointsDao
import com.example.data.dao.QuizDao
import com.example.data.dao.ReportDao
import com.example.data.dao.ReportUpdateDao
import com.example.data.dao.UserDao
import com.example.data.model.ActivityEntity
import com.example.data.model.ClimateArticleEntity
import com.example.data.model.NotificationEntity
import com.example.data.model.PointsLogEntity
import com.example.data.model.QuizQuestionEntity
import com.example.data.model.ReportEntity
import com.example.data.model.ReportUpdateEntity
import com.example.data.model.UserEntity

@Database(
    entities = [
        UserEntity::class,
        ReportEntity::class,
        ReportUpdateEntity::class,
        ClimateArticleEntity::class,
        ActivityEntity::class,
        QuizQuestionEntity::class,
        PointsLogEntity::class,
        NotificationEntity::class
    ],
    version = 2,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
    abstract fun reportDao(): ReportDao
    abstract fun reportUpdateDao(): ReportUpdateDao
    abstract fun articleDao(): ArticleDao
    abstract fun activityDao(): ActivityDao
    abstract fun quizDao(): QuizDao
    abstract fun pointsDao(): PointsDao
    abstract fun notificationDao(): NotificationDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "climate_action_database"
                )
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}

package com.example.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.AppDatabase
import com.example.data.model.ActivityEntity
import com.example.data.model.ClimateArticleEntity
import com.example.data.model.NotificationEntity
import com.example.data.model.QuizQuestionEntity
import com.example.data.model.ReportEntity
import com.example.data.model.ReportUpdateEntity
import com.example.data.model.UserEntity
import com.example.data.repository.ClimateRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class ClimateViewModel(application: Application) : AndroidViewModel(application) {

    private val db = AppDatabase.getDatabase(application)
    private val repository = ClimateRepository(db)

    val allReports: StateFlow<List<ReportEntity>> = repository.allReports
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val allArticles: StateFlow<List<ClimateArticleEntity>> = repository.allArticles
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val allActivities: StateFlow<List<ActivityEntity>> = repository.allActivities
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val allQuizzes: StateFlow<List<QuizQuestionEntity>> = repository.allQuizzes
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val allUsers: StateFlow<List<UserEntity>> = repository.allUsers
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val notifications: StateFlow<List<NotificationEntity>> = repository.allNotifications
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val unreadNotificationsCount: StateFlow<Int> = repository.unreadNotificationsCount
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    // Shared preferences for session persistence
    private val prefs = application.getSharedPreferences("climate_action_prefs", android.content.Context.MODE_PRIVATE)

    // Current user state - null by default (guest). Only restored if citizen previously signed in.
    private val _currentUserId = MutableStateFlow<Int?>(
        if (prefs.contains("logged_in_user_id")) {
            val savedId = prefs.getInt("logged_in_user_id", -1)
            if (savedId > 0) savedId else null
        } else null
    )
    val currentUserId: StateFlow<Int?> = _currentUserId.asStateFlow()

    val currentUser: StateFlow<UserEntity?> = combine(allUsers, _currentUserId) { users, id ->
        if (id == null) null else users.find { it.id == id }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    // Active bottom navigation tab
    private val _activeTab = MutableStateFlow("Home") // Home, Report, Map, Learn, Profile, Admin
    val activeTab: StateFlow<String> = _activeTab.asStateFlow()

    fun setActiveTab(tab: String) {
        _activeTab.value = tab
    }

    // Filter states
    val searchQuery = MutableStateFlow("")
    val selectedCategoryFilter = MutableStateFlow<String?>(null)
    val selectedBarangayFilter = MutableStateFlow<String?>(null)
    val selectedSeverityFilter = MutableStateFlow<String?>(null)
    val selectedStatusFilter = MutableStateFlow<String?>(null)

    // Detail Dialogs
    private val _selectedReport = MutableStateFlow<ReportEntity?>(null)
    val selectedReport: StateFlow<ReportEntity?> = _selectedReport.asStateFlow()

    private val _reportUpdates = MutableStateFlow<List<ReportUpdateEntity>>(emptyList())
    val reportUpdates: StateFlow<List<ReportUpdateEntity>> = _reportUpdates.asStateFlow()

    private val _selectedArticle = MutableStateFlow<ClimateArticleEntity?>(null)
    val selectedArticle: StateFlow<ClimateArticleEntity?> = _selectedArticle.asStateFlow()

    private val _selectedActivity = MutableStateFlow<ActivityEntity?>(null)
    val selectedActivity: StateFlow<ActivityEntity?> = _selectedActivity.asStateFlow()

    // Dialog Visibilities
    val showNewReportDialog = MutableStateFlow(false)
    val showQuizDialog = MutableStateFlow(false)
    val showNotificationsDialog = MutableStateFlow(false)
    val showThesisSummaryDialog = MutableStateFlow(false)
    val showWebPortalDialog = MutableStateFlow(false)
    val showSuccessSnackbar = MutableStateFlow<String?>(null)

    // Citizen Auth & KYC Dialogs
    val showAuthDialog = MutableStateFlow(false)
    val authDialogInitialMode = MutableStateFlow("register") // "register" or "login"
    val showKycDialog = MutableStateFlow(false)

    fun openAuthDialog(initialMode: String = "register") {
        authDialogInitialMode.value = initialMode
        showAuthDialog.value = true
    }

    fun closeAuthDialog() {
        showAuthDialog.value = false
    }

    fun openKycDialog() {
        showKycDialog.value = true
    }

    fun closeKycDialog() {
        showKycDialog.value = false
    }

    fun registerCitizen(
        name: String,
        email: String,
        phone: String,
        barangay: String,
        address: String,
        password: String,
        onSuccess: () -> Unit,
        onError: (String) -> Unit
    ) {
        viewModelScope.launch {
            val result = repository.registerCitizen(name, email, phone, barangay, address, password)
            result.onSuccess { user ->
                _currentUserId.value = user.id
                prefs.edit().putInt("logged_in_user_id", user.id).apply()
                showAuthDialog.value = false
                showSuccessSnackbar.value = "🌱 Account created! Welcome, ${user.name} (+50 pts). Complete KYC to report."
                onSuccess()
            }.onFailure { err ->
                onError(err.message ?: "Registration failed")
            }
        }
    }

    fun loginCitizen(
        email: String,
        password: String,
        onSuccess: () -> Unit,
        onError: (String) -> Unit
    ) {
        viewModelScope.launch {
            val result = repository.loginCitizen(email, password)
            result.onSuccess { user ->
                _currentUserId.value = user.id
                prefs.edit().putInt("logged_in_user_id", user.id).apply()
                showAuthDialog.value = false
                showSuccessSnackbar.value = "Welcome back, ${user.name}!"
                onSuccess()
            }.onFailure { err ->
                onError(err.message ?: "Invalid credentials")
            }
        }
    }

    fun logout() {
        _currentUserId.value = null
        prefs.edit().remove("logged_in_user_id").apply()
        showSuccessSnackbar.value = "Signed out of citizen account."
    }

    fun submitKycVerification(
        idType: String,
        idNumber: String,
        onSuccess: () -> Unit,
        onError: (String) -> Unit
    ) {
        val user = currentUser.value
        if (user == null) {
            onError("You must be signed in to submit KYC verification.")
            return
        }
        viewModelScope.launch {
            val result = repository.verifyKyc(user.id, idType, idNumber)
            result.onSuccess {
                showKycDialog.value = false
                showSuccessSnackbar.value = "🛡️ Identity Verified! Environmental reporting unlocked (+25 pts)."
                onSuccess()
            }.onFailure { err ->
                onError(err.message ?: "Verification failed")
            }
        }
    }

    // Quiz Session State
    val quizCurrentIndex = MutableStateFlow(0)
    val quizSelectedOption = MutableStateFlow<Int?>(null)
    val quizScore = MutableStateFlow(0)
    val quizAnswerSubmitted = MutableStateFlow(false)
    val quizFinished = MutableStateFlow(false)

    init {
        viewModelScope.launch {
            repository.seedDatabaseIfEmpty()
        }
    }

    fun openReportDetail(report: ReportEntity) {
        _selectedReport.value = report
        viewModelScope.launch {
            repository.getReportUpdates(report.id).collect { updates ->
                _reportUpdates.value = updates
            }
        }
    }

    fun closeReportDetail() {
        _selectedReport.value = null
    }

    fun openArticleDetail(article: ClimateArticleEntity) {
        _selectedArticle.value = article
    }

    fun closeArticleDetail() {
        _selectedArticle.value = null
    }

    fun openActivityDetail(activity: ActivityEntity) {
        _selectedActivity.value = activity
    }

    fun closeActivityDetail() {
        _selectedActivity.value = null
    }

    fun submitNewReport(
        title: String,
        category: String,
        categoryIcon: String,
        description: String,
        photoUri: String?,
        barangay: String,
        severity: String,
        latitude: Double,
        longitude: Double
    ) {
        val user = currentUser.value
        if (user == null) {
            showSuccessSnackbar.value = "⚠️ Please sign in or create an account to submit reports."
            openAuthDialog("login")
            return
        }
        if (!user.isVerified || user.kycStatus != "verified") {
            showSuccessSnackbar.value = "🛡️ Government ID verification (KYC) required before submitting reports."
            openKycDialog()
            return
        }
        viewModelScope.launch {
            repository.submitReport(
                userId = user.id,
                authorName = user.name,
                title = title,
                category = category,
                categoryIcon = categoryIcon,
                description = description,
                photoUri = photoUri,
                latitude = latitude,
                longitude = longitude,
                barangay = barangay,
                municipality = "Metro Verde",
                province = "Eco Province",
                severity = severity
            )
            showNewReportDialog.value = false
            showSuccessSnackbar.value = "Report submitted successfully! +10 Climate Points earned."
        }
    }

    fun updateReportStatus(reportId: Long, newStatus: String, remarks: String, assignedOfficer: String? = null) {
        val user = currentUser.value ?: return
        viewModelScope.launch {
            repository.updateReportStatus(
                reportId = reportId,
                newStatus = newStatus,
                remarks = remarks,
                updatedBy = user.name,
                assignedOfficer = assignedOfficer
            )
            // refresh selected report
            val updated = allReports.value.find { it.id == reportId }
            if (updated != null) {
                _selectedReport.value = updated.copy(
                    status = newStatus,
                    adminRemarks = remarks,
                    assignedOfficer = assignedOfficer ?: updated.assignedOfficer
                )
            }
            showSuccessSnackbar.value = "Report #$reportId updated to $newStatus"
        }
    }

    fun toggleActivityRegistration(activity: ActivityEntity) {
        val user = currentUser.value ?: return
        viewModelScope.launch {
            repository.toggleActivityRegistration(
                activityId = activity.id,
                currentStatus = activity.isRegistered,
                activityTitle = activity.title,
                userId = user.id
            )
            showSuccessSnackbar.value = if (!activity.isRegistered) "Registered for ${activity.title}!" else "Unregistered"
        }
    }

    fun submitActivityProof(activityId: Long, note: String, points: Int) {
        val user = currentUser.value ?: return
        viewModelScope.launch {
            repository.submitActivityProof(activityId, note, points, user.id)
            showSuccessSnackbar.value = "Proof submitted! +$points Climate Points awarded."
            _selectedActivity.value = null
        }
    }

    // Quiz Actions
    fun startQuiz() {
        quizCurrentIndex.value = 0
        quizSelectedOption.value = null
        quizScore.value = 0
        quizAnswerSubmitted.value = false
        quizFinished.value = false
        showQuizDialog.value = true
    }

    fun selectQuizOption(index: Int) {
        if (!quizAnswerSubmitted.value) {
            quizSelectedOption.value = index
        }
    }

    fun submitQuizAnswer(correctIndex: Int) {
        if (quizSelectedOption.value == null) return
        quizAnswerSubmitted.value = true
        if (quizSelectedOption.value == correctIndex) {
            quizScore.value += 1
        }
    }

    fun nextQuizQuestion(totalQuestions: Int) {
        if (quizCurrentIndex.value + 1 < totalQuestions) {
            quizCurrentIndex.value += 1
            quizSelectedOption.value = null
            quizAnswerSubmitted.value = false
        } else {
            quizFinished.value = true
            val user = currentUser.value
            if (user != null) {
                viewModelScope.launch {
                    repository.completeQuiz(user.id, quizScore.value, totalQuestions)
                }
            }
        }
    }

    fun markNotificationAsRead(id: Long) {
        viewModelScope.launch {
            repository.markNotificationAsRead(id)
        }
    }

    fun markAllNotificationsAsRead() {
        viewModelScope.launch {
            repository.markAllNotificationsAsRead()
        }
    }
}

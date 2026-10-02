package com.example.data

import com.example.data.model.ActivityEntity
import com.example.data.model.ClimateArticleEntity
import com.example.data.model.NotificationEntity
import com.example.data.model.PointsLogEntity
import com.example.data.model.QuizQuestionEntity
import com.example.data.model.ReportEntity
import com.example.data.model.ReportUpdateEntity
import com.example.data.model.UserEntity

object InitialData {
    val users = listOf(
        UserEntity(
            id = 1,
            name = "Mark Kenneth Ulgasan",
            email = "markkennethulgasan@gmail.com",
            password = "kenmark10",
            phone = "+63 917 123 4567",
            role = "Administrator",
            points = 999,
            barangay = "Barangay Central",
            municipality = "Metro Verde",
            address = "Executive Directorate & System Administration",
            isVerified = true,
            kycStatus = "verified",
            kycIdType = "Government / Civil Service ID",
            kycIdNumber = "CENRO-SUPER-ADMIN",
            avatarColorHex = "#2E7D32"
        )
    )

    val reports = emptyList<ReportEntity>()

    val reportUpdates = emptyList<ReportUpdateEntity>()

    val articles = emptyList<ClimateArticleEntity>()

    val activities = emptyList<ActivityEntity>()

    val quizzes = listOf(
        QuizQuestionEntity(
            question = "What is one of the most effective community-level ways to reduce municipal solid waste?",
            optionA = "Burning plastic bags in backyards",
            optionB = "Source segregation and composting of organics",
            optionC = "Throwing garbage into rivers at night",
            optionD = "Burying electronic batteries in soil",
            correctAnswerIndex = 1,
            explanation = "Composting organic waste diverts up to 50-70% of waste from landfills, eliminating methane emissions and groundwater leachate.",
            category = "Waste Management"
        ),
        QuizQuestionEntity(
            question = "Why are mangrove forests critical for coastal climate protection?",
            optionA = "They consume all ocean water during high tide",
            optionB = "They absorb up to 66% of wave energy and sequester massive blue carbon",
            optionC = "They increase ocean temperatures by 5 degrees",
            optionD = "They prevent rain clouds from forming over land",
            correctAnswerIndex = 1,
            explanation = "Mangroves dissipate wave impact during storm surges and store 3-5 times more carbon per hectare than terrestrial forests.",
            category = "Coastal Protection"
        ),
        QuizQuestionEntity(
            question = "What primary mechanism causes the Urban Heat Island (UHI) effect?",
            optionA = "High density of concrete, asphalt, and lack of tree shade",
            optionB = "Too many bicycles on public streets",
            optionC = "Planting excessive native flowering plants",
            optionD = "Over-consumption of chilled beverages",
            correctAnswerIndex = 0,
            explanation = "Asphalt and dark concrete absorb solar radiation, releasing heat slowly into surrounding air, exacerbated by minimal tree canopy.",
            category = "Climate Change"
        ),
        QuizQuestionEntity(
            question = "Under Clean Air Act policies, what is open burning (siga) of household waste classified as?",
            optionA = "An eco-friendly waste disposal technique",
            optionB = "A prohibited act that emits carcinogenic dioxins and particulate matter",
            optionC = "Mandatory weekly practice for all residents",
            optionD = "Recommended insect repellent method",
            correctAnswerIndex = 1,
            explanation = "Open burning emits toxic particulate matter (PM2.5) and dioxins that exacerbate respiratory illnesses like asthma and COPD.",
            category = "Air Pollution"
        )
    )

    val pointsLogs = emptyList<PointsLogEntity>()

    val notifications = emptyList<NotificationEntity>()
}

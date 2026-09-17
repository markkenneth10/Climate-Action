// ==========================================================================
// Climate Action Reporting & Information System (Metro Verde)
// Citizen Portal Client-Side Application Engine
// ==========================================================================

const CITIZEN_STORAGE_KEY = 'climate_citizen_session';

// Global Application State
const state = {
  activeTab: 'dashboard',
  currentUser: null,
  reports: [],
  config: {},
  weather: {},
  announcements: [],
  userGuides: [],
  uploadedPhotoData: null,
  fullMapInstance: null,
  previewMapInstance: null,
  fullMapMarkers: [],
  previewMapMarkers: [],
  currentQuizIndex: 0,
  quizScore: 0,
  joinedActivities: new Set(['act-1'])
};

// Educational & Scientific Library Articles
const articles = [
  {
    id: "art-1",
    title: "Understanding Urban Heat Islands & Canopy Defense",
    category: "Microclimate Science",
    readTime: "4 min read",
    summary: "How dense concrete coverage intensifies tropical temperatures and why neighborhood tree canopies are critical for municipal climate resilience.",
    content: "Urban Heat Islands (UHIs) occur when cities replace natural land cover with dense concentrations of pavement, asphalt, and buildings that absorb and retain heat. In Metro Verde, urban districts can be 3°C to 6°C warmer than surrounding rural barangays. Counteracting this requires aggressive tree planting, cool roofs, permeable pavements, and preserving riparian vegetation along river corridors.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "art-2",
    title: "Riparian Ecosystem Restoration & Flash Flood Defense",
    category: "Water Resource Management",
    readTime: "5 min read",
    summary: "Vegetated riverbanks absorb surge waters, stabilize riverbanks against landslides, and filter plastic pollutants before reaching drinking estuaries.",
    content: "Riparian buffer zones act as natural sponges. By retaining water-tolerant native trees like Bamboo, Narra, and Mangroves along river banks, communities drastically reduce flash flood velocity, mitigate erosion, and enhance water filtration naturally.",
    image: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "art-3",
    title: "Zero-Waste Circularity & Republic Act 9003 Enforcement",
    category: "Solid Waste Policy",
    readTime: "6 min read",
    summary: "How barangay materials recovery facilities (MRF) divert single-use plastic from waterways and transform organic waste into nutrient-dense compost.",
    content: "Under Philippine Republic Act 9003 (Ecological Solid Waste Management Act), open dumping and burning of municipal waste are criminal violations carrying severe fines and imprisonment. Segregation at source is mandatory for every household and commercial establishment.",
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80"
  }
];

// 6 Core Climate Information Pillars (Modal data)
const climatePillars = {
  'climate-change': {
    title: "🌡️ Climate Change Realities in Metro Verde",
    subtitle: "Understanding local risks, sea-surface warming, and adaptation pathways",
    image: "/assets/climate_change_thumb_1789457800658.jpg",
    content: `
      <p>Metro Verde is situated at the intersection of critical coastal and river basin drainage systems. Regional meteorological data indicates average temperature increases of +1.2°C over the past two decades, with dry season heat indexes frequently breaching the 42°C 'Danger' threshold.</p>
      <h4 style="margin: 1rem 0 0.5rem; color: var(--primary-dark);">Key Municipal Climate Impacts:</h4>
      <ul style="padding-left: 1.25rem; line-height: 1.6; color: var(--text-muted);">
        <li><strong>Hyper-Localized Flash Flooding:</strong> Intense cloudburst events overwhelm drainage culverts within 30 minutes.</li>
        <li><strong>Agricultural Stress:</strong> Highland barangays report shifting rainfall seasons, threatening rice and vegetable yields.</li>
        <li><strong>Vector-Borne Disease Surge:</strong> Warmer stagnant pools accelerate dengue vector reproduction rates.</li>
      </ul>
      <div style="background: var(--surface-alt); padding: 0.85rem; border-radius: 8px; margin-top: 1rem; border-left: 4px solid var(--emerald);">
        <strong>Citizen Adaptation Protocol:</strong> Plant native shade trees, install rainwater catchment barrels, and report obstructed waterways before monsoon onset.
      </div>
    `
  },
  'flood-safety': {
    title: "🌊 Stormwater & Flash Flood Preparedness",
    subtitle: "Protecting life, waterways, and community drainage corridors",
    image: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80",
    content: `
      <p>Flash floods in Metro Verde are intensified by illegal garbage dumping that clogs drainage culverts and spillway gates. Staying prepared saves lives and reduces disaster losses.</p>
      <h4 style="margin: 1rem 0 0.5rem; color: var(--primary-dark);">Barangay Action Checklist:</h4>
      <ul style="padding-left: 1.25rem; line-height: 1.6; color: var(--text-muted);">
        <li>Monitor PAGASA storm surge and rainfall color codes (Yellow, Orange, Red).</li>
        <li>Never wade into moving floodwaters; 15 cm of moving water can knock an adult off balance.</li>
        <li>Ensure family Go-Bags contain non-perishable rations, water purifying tablets, first-aid, and vital documents in waterproof pouches.</li>
        <li>Report blocked spillways or river obstructions using the Climate Action portal for immediate CENRO declogging dispatch.</li>
      </ul>
    `
  },
  'forest-protection': {
    title: "🌳 Watershed & Urban Forest Conservation",
    subtitle: "Preserving ecological canopy, slopes, and biodiversity",
    image: "/assets/climate_hero_banner.jpg",
    content: `
      <p>The upland forests of Metro Verde act as the primary watershed aquifer for the municipal potable water supply. Illegal timber felling and slash-and-burn clearing (kaingin) directly trigger catastrophic slope collapses during typhoons.</p>
      <h4 style="margin: 1rem 0 0.5rem; color: var(--primary-dark);">Legal Protections under PD 705:</h4>
      <ul style="padding-left: 1.25rem; line-height: 1.6; color: var(--text-muted);">
        <li>Cutting of premium indigenous species (Narra, Molave, Yakal) carries mandatory imprisonment without bail option under revised forestry codes.</li>
        <li>Municipal reforestation quotas mandate the planting of 10 saplings for every permitted utility trimming.</li>
        <li>Report suspected chainsaw operations or timber transport directly via the Incident Reporter for joint CENRO-PNP intercept.</li>
      </ul>
    `
  },
  'waste-mgmt': {
    title: "♻️ Ecological Solid Waste Management (RA 9003)",
    subtitle: "Source segregation, material recovery, and plastic elimination",
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80",
    content: `
      <p>Republic Act 9003 mandates that waste must be segregated at the household level into Biodegradable, Recyclable, Residual, and Special / Hazardous fractions. Open dumping and burning are strictly outlawed.</p>
      <h4 style="margin: 1rem 0 0.5rem; color: var(--primary-dark);">Zero-Waste Hierarchy:</h4>
      <ul style="padding-left: 1.25rem; line-height: 1.6; color: var(--text-muted);">
        <li><strong>Reduce:</strong> Refuse single-use plastics, carrier bags, and polystyrene food containers.</li>
        <li><strong>Reuse:</strong> Maintain refillable containers for household cleaning agents.</li>
        <li><strong>Compost:</strong> Turn kitchen scraps into organic compost for community urban gardens.</li>
        <li><strong>Report:</strong> Report roadside garbage dumping sites to earn eco-points and initiate municipal collection.</li>
      </ul>
    `
  },
  'water-protection': {
    title: "💧 Freshwater & Aquifer Protection (RA 9275)",
    subtitle: "Preventing industrial effluent discharge and toxic water contamination",
    image: "https://images.unsplash.com/photo-1618083707368-b3823daa2726?auto=format&fit=crop&w=600&q=80",
    content: `
      <p>The Philippine Clean Water Act of 2004 (RA 9275) protects freshwater bodies from industrial, commercial, and agricultural pollution. Direct discharge of untreated grease, dye, or wastewater into natural canals is punishable by daily fines of up to ₱200,000.</p>
      <h4 style="margin: 1rem 0 0.5rem; color: var(--primary-dark);">Signs of Chemical Contamination:</h4>
      <ul style="padding-left: 1.25rem; line-height: 1.6; color: var(--text-muted);">
        <li>Unusual discolored oily sheen, frothing, or opaque milky appearance in creeks.</li>
        <li>Pungent sulfur, ammonia, or chemical solvent odors emanating from storm outfalls.</li>
        <li>Sudden fish mortality or distressed aquatic wildlife.</li>
      </ul>
      <p style="margin-top: 0.75rem; color: var(--text-muted);">Immediate reporting allows municipal environmental inspectors to collect water samples for laboratory chain of custody.</p>
    `
  },
  'energy-saving': {
    title: "☀️ Low-Carbon Living & Energy Efficiency",
    subtitle: "Micro-actions to reduce municipal carbon footprint and grid strain",
    image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80",
    content: `
      <p>Decarbonization begins in our homes and commercial hubs. Reducing electricity consumption during peak midday hours prevents reliance on diesel peaker plants and lowers household utility costs.</p>
      <h4 style="margin: 1rem 0 0.5rem; color: var(--primary-dark);">Energy Conservation Tips:</h4>
      <ul style="padding-left: 1.25rem; line-height: 1.6; color: var(--text-muted);">
        <li>Set air-conditioning units to 24°C–25°C for optimal energy-to-cooling ratio.</li>
        <li>Switch all domestic lighting to high-efficiency LED fixtures.</li>
        <li>Unplug phantom electronics (chargers, televisions, microwave clocks) when not in use.</li>
        <li>Participate in Metro Verde's community rooftop solar collective programs.</li>
      </ul>
    `
  }
};

// Interactive Quiz Questions
const quizQuestions = [
  {
    question: "Under Philippine Republic Act 9003, what is the maximum penalty for open burning of municipal trash and yard waste?",
    options: [
      "A friendly verbal warning with no fine",
      "Fines from ₱300 up to ₱1,000 and/or 1 to 15 days imprisonment",
      "Community tree planting for 1 hour only",
      "No regulation exists for domestic burning"
    ],
    correct: 1,
    explanation: "Section 48 of RA 9003 strictly penalizes open burning of solid waste due to hazardous dioxins and particulate respiratory risks."
  },
  {
    question: "What is the primary cause of the Urban Heat Island effect in densely built districts?",
    options: [
      "Too many solar panels installed on rooftops",
      "Replacement of natural green vegetation with heat-absorbing asphalt and concrete",
      "Natural sea breezes blowing warm moisture inland",
      "Over-watering of domestic gardens"
    ],
    correct: 1,
    explanation: "Impervious dark asphalt surfaces absorb up to 90% of solar radiation, raising nighttime ambient temperatures significantly."
  },
  {
    question: "What is the optimal citizen response when observing industrial chemical discharge into a public creek?",
    options: [
      "Wait 30 days to see if rain dilutes it",
      "Take geotagged photos and submit an urgent incident report to CENRO immediately",
      "Attempt to drink water to test contamination",
      "Post anonymously on personal social media without reporting"
    ],
    correct: 1,
    explanation: "Rapid reporting enables CENRO environmental inspection units to extract laboratory samples and issue legal Cease and Desist orders."
  }
];

// Community Activities
const activities = [
  {
    id: "act-1",
    title: "Tree Planting Activity",
    date: "Sep 28, 2026 • 7:00 AM",
    location: "Upper Watershed Forest Reserve",
    category: "Reforestation",
    target: "1,200 Hardwood Saplings",
    registered: 120,
    max: 150
  },
  {
    id: "act-2",
    title: "Coastal & River Clean-up",
    date: "Oct 03, 2026 • 6:00 AM",
    location: "Makilas River Corridor Spillway",
    category: "River Restoration",
    target: "500 Native Bamboo Saplings & Trash Divert",
    registered: 85,
    max: 100
  },
  {
    id: "act-3",
    title: "Climate Awareness Seminar",
    date: "Oct 10, 2026 • 9:00 AM",
    location: "Barangay Malinis Civic Hall",
    category: "Civic Education",
    target: "60 Families Certified in Zero-Waste",
    registered: 60,
    max: 80
  }
];

// Default baseline citizen (Mark Kenneth Ulgasan) to match the mockup
const DEFAULT_CITIZEN = {
  id: "usr-mk-001",
  name: "Mark Kenneth",
  fullName: "Mark Kenneth Ulgasan",
  email: "markkennethulgasan@gmail.com",
  phone: "+63 917 889 1234",
  barangay: "Barangay Makilas",
  role: "citizen",
  ecoPoints: 750,
  level: "Climate Advocate",
  rank: "#12",
  badgesCount: 3,
  reportsCount: 5,
  registeredAt: "2026-03-10T08:00:00.000Z"
};

// ==========================================================================
// Initialization on DOM Load
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initCitizenSession();
  setupNavigation();
  loadAllData();
  renderArticles();
  renderQuiz();
  renderActivities();
  setupGlobalClickHandlers();
});

// 1. Citizen Session Handling & Authentication
async function initCitizenSession() {
  const saved = localStorage.getItem(CITIZEN_STORAGE_KEY);
  if (saved) {
    try {
      state.currentUser = JSON.parse(saved);
      // Fetch fresh profile from server to stay up-to-date with KYC status & edits
      if (state.currentUser && state.currentUser.email) {
        try {
          const res = await fetch(`/api/user/profile?email=${encodeURIComponent(state.currentUser.email)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              state.currentUser = { ...state.currentUser, ...data.user };
              localStorage.setItem(CITIZEN_STORAGE_KEY, JSON.stringify(state.currentUser));
            }
          }
        } catch (err) {
          console.warn('Profile background refresh fallback:', err);
        }
      }
    } catch (e) {
      state.currentUser = null;
      localStorage.removeItem(CITIZEN_STORAGE_KEY);
    }
  } else {
    state.currentUser = null;
  }
  updateAuthUI();
}

function updateAuthUI() {
  // 1. Mandatory Citizen Authentication Barrier
  const barrier = document.getElementById('auth-barrier-screen');
  if (barrier) {
    barrier.style.display = state.currentUser ? 'none' : 'flex';
  }

  const authContainer = document.getElementById('citizen-auth-container');
  const drawerUserCard = document.getElementById('drawer-user-card');
  const gateCard = document.getElementById('report-auth-gate');
  const reportForm = document.getElementById('report-form-container');
  const dashPoints = document.getElementById('dash-user-eco-points');

  if (dashPoints && state.currentUser) {
    dashPoints.textContent = state.currentUser.ecoPoints || 50;
  }

  if (state.currentUser) {
    const avatarHtml = state.currentUser.avatar
      ? `<img src="${state.currentUser.avatar}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
      : `<span>${getInitials(state.currentUser.fullName || state.currentUser.name)}</span>`;

    // Top Header User Profile Pill
    if (authContainer) {
      authContainer.innerHTML = `
        <div class="citizen-profile-menu-wrapper">
          <div class="user-profile-trigger" onclick="toggleUserDropdown(event)" role="button" aria-expanded="false">
            <div class="user-avatar-circle">
              ${avatarHtml}
            </div>
            <div class="user-text-info">
              <div class="user-name-title">${escapeHtml(state.currentUser.fullName || state.currentUser.name)}</div>
              <div class="user-role-subtitle">
                <span>${state.currentUser.kycStatus === 'verified' ? '🛡️ Verified Citizen' : 'Citizen Account'}</span>
                <span style="font-size:0.6rem;">▼</span>
              </div>
            </div>
          </div>

          <!-- Dropdown Card -->
          <div class="user-dropdown-menu" id="user-dropdown-menu" onclick="event.stopPropagation()">
            <div class="user-dropdown-header">
              <div style="font-weight: 800; font-size: 0.95rem; color: var(--primary-dark);">${escapeHtml(state.currentUser.fullName || state.currentUser.name)}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(state.currentUser.email)}</div>
              <div class="user-dropdown-stat-row">
                <span>🌱 Eco-Points:</span>
                <strong style="color: var(--primary-light); font-size: 0.9rem;">${state.currentUser.ecoPoints || 50} pts</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-top: 0.35rem;">
                <span>Rank: <strong>#${state.currentUser.rank || 1} in LGU</strong></span>
                <span>KYC: <strong>${state.currentUser.kycStatus === 'verified' ? '🛡️ Verified' : '⏳ ' + (state.currentUser.kycStatus || 'Unverified')}</strong></span>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.25rem;">
              <button class="dropdown-item-link" onclick="switchTab('profile'); closeAllDropdowns();">
                <span>👤</span> View Citizen Profile & KYC
              </button>
              <button class="dropdown-item-link" onclick="switchTab('tracker'); closeAllDropdowns();">
                <span>📋</span> My Incident Reports
              </button>
              <button class="dropdown-item-link" onclick="switchTab('quiz'); closeAllDropdowns();">
                <span>🏆</span> Climate Challenge & Badges
              </button>
              <button class="dropdown-item-link" onclick="switchTab('activities'); closeAllDropdowns();">
                <span>🌿</span> Joined Activities
              </button>
              <button class="dropdown-item-link text-danger" onclick="handleCitizenLogout(); closeAllDropdowns();">
                <span>🚪</span> Sign Out
              </button>
            </div>
          </div>
        </div>
      `;
    }

    // Drawer user card
    if (drawerUserCard) {
      drawerUserCard.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-weight: 800; font-size: 0.9rem; color: #fff;">${escapeHtml(state.currentUser.fullName || state.currentUser.name)}</div>
            <div style="font-size: 0.72rem; color: rgba(255,255,255,0.85);">${state.currentUser.ecoPoints || 50} Eco-Points • ${state.currentUser.kycStatus === 'verified' ? '🛡️ Verified' : '⏳ Action Needed'}</div>
          </div>
          <button onclick="handleCitizenLogout()" style="background: rgba(255,255,255,0.2); border:none; color:#fff; font-size:0.75rem; padding:0.25rem 0.6rem; border-radius: 999px; cursor:pointer;">Logout</button>
        </div>
      `;
    }

    // Incident Reporting Gating based on KYC
    const isKycVerified = state.currentUser.kycStatus === 'verified';
    if (isKycVerified) {
      if (gateCard) gateCard.style.display = 'none';
      if (reportForm) reportForm.style.display = 'grid';
      const reporterName = document.getElementById('reporter-display-name');
      const reporterEmail = document.getElementById('reporter-display-email');
      if (reporterName) reporterName.textContent = state.currentUser.fullName || state.currentUser.name;
      if (reporterEmail) reporterEmail.textContent = `(${state.currentUser.email})`;
    } else {
      if (reportForm) reportForm.style.display = 'none';
      if (gateCard) {
        gateCard.style.display = 'block';
        updateReportingKycGateCard();
      }
    }

    renderProfileUI();

  } else {
    // User is logged out / Guest
    if (authContainer) {
      authContainer.innerHTML = `
        <button class="btn-citizen-signin" onclick="setBarrierMode('login'); document.getElementById('auth-barrier-screen').style.display = 'flex';">
          Citizen Sign In
        </button>
      `;
    }

    if (drawerUserCard) {
      drawerUserCard.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 0.8rem; color: #fff;">Guest Citizen</span>
          <button onclick="setBarrierMode('login'); document.getElementById('auth-barrier-screen').style.display = 'flex'; closeMobileDrawer();" style="background: var(--emerald); border:none; color:#fff; font-size:0.75rem; padding:0.3rem 0.75rem; border-radius: 999px; cursor:pointer; font-weight:700;">Sign In</button>
        </div>
      `;
    }

    if (gateCard) gateCard.style.display = 'block';
    if (reportForm) reportForm.style.display = 'none';
  }
}

function updateReportingKycGateCard() {
  const gateCard = document.getElementById('report-auth-gate');
  if (!gateCard) return;

  const status = state.currentUser ? (state.currentUser.kycStatus || 'unverified') : 'unverified';
  if (status === 'pending') {
    gateCard.innerHTML = `
      <div style="font-size: 3rem; margin-bottom: 0.75rem;">⏳</div>
      <div style="display: inline-block; background: var(--amber-dark); color: #fff; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.75rem;">
        Verification Pending CENRO Review
      </div>
      <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--primary-dark); margin-bottom: 0.5rem;">
        Your Identity Documents Are Under Administrative Review
      </h3>
      <p style="font-size: 0.9rem; color: var(--text-muted); max-width: 540px; margin: 0 auto 1.25rem; line-height: 1.6;">
        Thank you for submitting your government ID for verification. Under City Environmental Ordinance #2026-04, CENRO compliance officers verify applicant records to ensure zero misinformation and fraudulent submissions. You will be authorized to submit live reports once verified.
      </p>
      <div style="display: flex; justify-content: center; gap: 0.75rem; flex-wrap: wrap;">
        <button class="btn-primary" onclick="openKycModal()" style="padding: 0.75rem 1.5rem;">
          🪪 View / Re-upload Submitted Documents
        </button>
        <button class="btn-secondary" onclick="switchTab('tracker')" style="padding: 0.75rem 1.5rem;">
          📋 View Community Incident Tracker
        </button>
      </div>
    `;
  } else if (status === 'rejected') {
    gateCard.innerHTML = `
      <div style="font-size: 3rem; margin-bottom: 0.75rem;">❌</div>
      <div style="display: inline-block; background: var(--red); color: #fff; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.75rem;">
        Verification Rejected / Incomplete
      </div>
      <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--primary-dark); margin-bottom: 0.5rem;">
        Document Verification Could Not Be Completed
      </h3>
      <p style="font-size: 0.9rem; color: var(--text-muted); max-width: 540px; margin: 0 auto 0.75rem; line-height: 1.6;">
        ${escapeHtml(state.currentUser.kycRejectReason || 'The uploaded document was unclear, expired, or information did not match municipal records.')}
      </p>
      <p style="font-size: 0.85rem; color: var(--text-main); font-weight: 600; margin-bottom: 1.25rem;">
        Please re-upload clear photos of a valid Philippine government-issued ID to activate incident reporting.
      </p>
      <button class="btn-primary" onclick="openKycModal()" style="padding: 0.75rem 1.5rem;">
        🪪 Upload Valid Government ID
      </button>
    `;
  } else {
    // Unverified
    gateCard.innerHTML = `
      <div style="font-size: 3rem; margin-bottom: 0.75rem;">🛡️</div>
      <div style="display: inline-block; background: var(--amber-dark); color: #fff; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.75rem;">
        Identity Verification Required
      </div>
      <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--primary-dark); margin-bottom: 0.5rem;">
        Verify Your Identity to Submit Environmental Reports
      </h3>
      <p style="font-size: 0.9rem; color: var(--text-muted); max-width: 540px; margin: 0 auto 1.25rem; line-height: 1.6;">
        To prevent misinformation, spam, and unverified hazards, all citizens are required to verify their account through KYC verification using a valid government ID before filing reports.
      </p>
      <button class="btn-primary" onclick="openKycModal()" style="padding: 0.75rem 1.5rem;">
        🪪 Upload & Verify Government ID
      </button>
    `;
  }
}

function renderProfileUI() {
  if (!state.currentUser) return;
  const u = state.currentUser;

  const nameEl = document.getElementById('profile-user-name');
  const bgyEl = document.getElementById('profile-user-barangay');
  const contEl = document.getElementById('profile-user-contacts');
  const pointsEl = document.getElementById('profile-eco-points');
  const levelEl = document.getElementById('profile-citizen-level');
  const rankEl = document.getElementById('profile-citizen-rank');
  const authStatusEl = document.getElementById('profile-report-auth-status');
  const badgeEl = document.getElementById('profile-kyc-badge');
  const avatarImg = document.getElementById('profile-avatar-img');
  const initialsSpan = document.getElementById('profile-avatar-initials');

  if (nameEl) nameEl.textContent = u.fullName || u.name;
  if (bgyEl) bgyEl.textContent = `📍 ${u.barangay || 'Metro Verde City'}`;
  if (contEl) contEl.textContent = `📧 ${u.email} • 📱 ${u.phone || 'No phone set'}`;
  if (pointsEl) pointsEl.innerHTML = `${u.ecoPoints || 50} <span style="font-size: 0.9rem;">pts</span>`;
  if (levelEl) levelEl.textContent = u.level || 'Eco Citizen';
  if (rankEl) rankEl.innerHTML = `Rank: <strong>#${u.rank || 1} in LGU</strong> • Status: <strong>${u.status || 'Active'}</strong>`;

  if (avatarImg && initialsSpan) {
    if (u.avatar) {
      avatarImg.src = u.avatar;
      avatarImg.style.display = 'block';
      initialsSpan.style.display = 'none';
    } else {
      avatarImg.style.display = 'none';
      initialsSpan.style.display = 'inline';
      initialsSpan.textContent = getInitials(u.fullName || u.name);
    }
  }

  // KYC Badge & Card
  const kycStatus = u.kycStatus || 'unverified';
  const kycCard = document.getElementById('profile-kyc-card');
  const kycChip = document.getElementById('profile-kyc-status-chip');
  const kycDesc = document.getElementById('profile-kyc-desc');
  const kycDetails = document.getElementById('profile-kyc-details');
  const kycActionBtn = document.getElementById('btn-profile-kyc-action');

  if (kycStatus === 'verified') {
    if (badgeEl) {
      badgeEl.textContent = '🛡️ Verified Citizen';
      badgeEl.style.background = 'var(--primary-light)';
    }
    if (authStatusEl) {
      authStatusEl.textContent = '✅ Authorized';
      authStatusEl.style.color = 'var(--primary-light)';
    }
    if (kycCard) kycCard.style.borderLeftColor = 'var(--primary-light)';
    if (kycChip) {
      kycChip.textContent = 'Verified Citizen';
      kycChip.style.background = 'var(--primary-light)';
    }
    if (kycDesc) {
      kycDesc.textContent = 'Your government ID has been verified by CENRO administration. Real-time incident reporting is fully authorized.';
    }
    if (kycDetails) {
      kycDetails.style.display = 'block';
      kycDetails.textContent = `📄 ${u.kycIdType || 'Government ID'} • Number: ${maskIdNumber(u.kycIdNumber || '')}`;
    }
    if (kycActionBtn) {
      kycActionBtn.textContent = '🪪 Update / Replace ID';
    }
  } else if (kycStatus === 'pending') {
    if (badgeEl) {
      badgeEl.textContent = '⏳ Verification Pending';
      badgeEl.style.background = 'var(--amber-dark)';
    }
    if (authStatusEl) {
      authStatusEl.textContent = '⏳ Pending Review';
      authStatusEl.style.color = 'var(--amber-dark)';
    }
    if (kycCard) kycCard.style.borderLeftColor = 'var(--amber)';
    if (kycChip) {
      kycChip.textContent = 'Pending Admin Review';
      kycChip.style.background = 'var(--amber-dark)';
    }
    if (kycDesc) {
      kycDesc.textContent = 'Your uploaded ID documents are currently in the CENRO administrative review queue. Verification typically completes within 24 hours.';
    }
    if (kycDetails) {
      kycDetails.style.display = 'block';
      kycDetails.textContent = `Submitted: ${u.kycIdType || 'Government ID'} (${maskIdNumber(u.kycIdNumber || '')})`;
    }
    if (kycActionBtn) {
      kycActionBtn.textContent = '🪪 Re-upload / Update Documents';
    }
  } else if (kycStatus === 'rejected') {
    if (badgeEl) {
      badgeEl.textContent = '❌ Verification Rejected';
      badgeEl.style.background = 'var(--red)';
    }
    if (authStatusEl) {
      authStatusEl.textContent = '❌ Not Authorized';
      authStatusEl.style.color = 'var(--red)';
    }
    if (kycCard) kycCard.style.borderLeftColor = 'var(--red)';
    if (kycChip) {
      kycChip.textContent = 'Submission Rejected';
      kycChip.style.background = 'var(--red)';
    }
    if (kycDesc) {
      kycDesc.textContent = `Verification issue: ${u.kycRejectReason || 'Document copy was unclear or invalid'}. Please re-upload a clear copy of a valid government ID.`;
    }
    if (kycDetails) kycDetails.style.display = 'none';
    if (kycActionBtn) {
      kycActionBtn.textContent = '🪪 Re-upload Valid ID';
    }
  } else {
    // Unverified
    if (badgeEl) {
      badgeEl.textContent = '⚠️ Unverified';
      badgeEl.style.background = 'var(--text-muted)';
    }
    if (authStatusEl) {
      authStatusEl.textContent = 'KYC Required';
      authStatusEl.style.color = 'var(--amber-dark)';
    }
    if (kycCard) kycCard.style.borderLeftColor = 'var(--amber)';
    if (kycChip) {
      kycChip.textContent = 'Action Needed';
      kycChip.style.background = 'var(--amber-dark)';
    }
    if (kycDesc) {
      kycDesc.textContent = 'To submit real-time environmental hazard reports and prevent false alerts, verify your identity with a valid government ID.';
    }
    if (kycDetails) kycDetails.style.display = 'none';
    if (kycActionBtn) {
      kycActionBtn.textContent = '🪪 Upload & Verify Government ID';
    }
  }

  // Pre-fill profile settings form
  const editName = document.getElementById('edit-profile-name');
  const editPhone = document.getElementById('edit-profile-phone');
  const editBgy = document.getElementById('edit-profile-barangay');
  const editAddr = document.getElementById('edit-profile-address');
  const editBio = document.getElementById('edit-profile-bio');
  const editEmgName = document.getElementById('edit-profile-emg-name');
  const editEmgPhone = document.getElementById('edit-profile-emg-phone');

  if (editName) editName.value = u.fullName || u.name || '';
  if (editPhone) editPhone.value = u.phone || '';
  if (editBgy && u.barangay) editBgy.value = u.barangay;
  if (editAddr) editAddr.value = u.address || '';
  if (editBio) editBio.value = u.bio || '';
  if (editEmgName) editEmgName.value = u.emergencyContactName || '';
  if (editEmgPhone) editEmgPhone.value = u.emergencyContactPhone || '';
}

function maskIdNumber(idStr) {
  if (!idStr) return '••••';
  if (idStr.length <= 4) return idStr;
  return '••••-••••-' + idStr.slice(-4);
}

// Barrier Auth Modal Handling
function setBarrierMode(mode) {
  const tabLogin = document.getElementById('barrier-tab-login');
  const tabReg = document.getElementById('barrier-tab-register');
  const formLogin = document.getElementById('barrier-login-form');
  const formReg = document.getElementById('barrier-register-form');

  if (mode === 'login') {
    if (tabLogin) tabLogin.className = 'auth-barrier-tab active';
    if (tabReg) tabReg.className = 'auth-barrier-tab';
    if (formLogin) formLogin.style.display = 'block';
    if (formReg) formReg.style.display = 'none';
  } else {
    if (tabLogin) tabLogin.className = 'auth-barrier-tab';
    if (tabReg) tabReg.className = 'auth-barrier-tab active';
    if (formLogin) formLogin.style.display = 'none';
    if (formReg) formReg.style.display = 'block';
  }
}

async function handleBarrierLogin(e) {
  e.preventDefault();
  const email = document.getElementById('barrier-login-email').value.trim();
  const password = document.getElementById('barrier-login-password').value.trim();
  const errBox = document.getElementById('barrier-login-error');
  if (errBox) errBox.style.display = 'none';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      if (errBox) {
        errBox.textContent = data.error || 'Invalid citizen email or password.';
        errBox.style.display = 'block';
      }
      return;
    }

    state.currentUser = data.user;
    localStorage.setItem(CITIZEN_STORAGE_KEY, JSON.stringify(state.currentUser));
    updateAuthUI();
    showToast(`👋 Welcome back, ${state.currentUser.fullName || state.currentUser.name}!`);
    await fetchReports();
  } catch (err) {
    if (errBox) {
      errBox.textContent = 'Network communication error. Please try again.';
      errBox.style.display = 'block';
    }
  }
}

async function handleBarrierRegister(e) {
  e.preventDefault();
  const name = document.getElementById('barrier-reg-name').value.trim();
  const email = document.getElementById('barrier-reg-email').value.trim();
  const phone = document.getElementById('barrier-reg-phone').value.trim();
  const barangay = document.getElementById('barrier-reg-barangay').value;
  const address = document.getElementById('barrier-reg-address').value.trim();
  const password = document.getElementById('barrier-reg-password').value.trim();
  const errBox = document.getElementById('barrier-reg-error');
  if (errBox) errBox.style.display = 'none';

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, barangay, address, password })
    });
    const data = await res.json();
    if (!res.ok) {
      if (errBox) {
        errBox.textContent = data.error || 'Registration failed. Please check your information.';
        errBox.style.display = 'block';
      }
      return;
    }

    state.currentUser = data.user;
    localStorage.setItem(CITIZEN_STORAGE_KEY, JSON.stringify(state.currentUser));
    updateAuthUI();
    showToast(`🎉 Citizen account created! Welcome, ${name}!`);
    await fetchReports();

    // Automatically prompt KYC modal for newly registered citizen
    setTimeout(() => {
      openKycModal();
    }, 600);
  } catch (err) {
    if (errBox) {
      errBox.textContent = 'Network error during registration.';
      errBox.style.display = 'block';
    }
  }
}

// Profile Settings & Photo Upload Handlers
async function handleAvatarFileChange(event) {
  const file = event.target.files[0];
  if (!file || !state.currentUser) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const dataUrl = e.target.result;
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: state.currentUser.email,
          avatar: dataUrl
        })
      });
      const data = await res.json();
      if (res.ok) {
        state.currentUser.avatar = dataUrl;
        localStorage.setItem(CITIZEN_STORAGE_KEY, JSON.stringify(state.currentUser));
        updateAuthUI();
        showToast('📷 Profile photo updated successfully!');
      } else {
        alert(data.error || 'Failed to update avatar.');
      }
    } catch (err) {
      alert('Network error updating profile photo.');
    }
  };
  reader.readAsDataURL(file);
}

async function handleSaveProfileSettings(event) {
  event.preventDefault();
  if (!state.currentUser) return;

  const name = document.getElementById('edit-profile-name').value.trim();
  const phone = document.getElementById('edit-profile-phone').value.trim();
  const barangay = document.getElementById('edit-profile-barangay').value;
  const address = document.getElementById('edit-profile-address').value.trim();
  const bio = document.getElementById('edit-profile-bio').value.trim();
  const emergencyContactName = document.getElementById('edit-profile-emg-name').value.trim();
  const emergencyContactPhone = document.getElementById('edit-profile-emg-phone').value.trim();

  const statusEl = document.getElementById('profile-save-status');

  try {
    const res = await fetch('/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: state.currentUser.email,
        name,
        phone,
        barangay,
        address,
        bio,
        emergencyContactName,
        emergencyContactPhone
      })
    });
    const data = await res.json();
    if (res.ok) {
      state.currentUser = { ...state.currentUser, ...data.user };
      localStorage.setItem(CITIZEN_STORAGE_KEY, JSON.stringify(state.currentUser));
      updateAuthUI();

      if (statusEl) {
        statusEl.style.display = 'block';
        statusEl.style.background = '#ECFDF5';
        statusEl.style.color = '#065F46';
        statusEl.style.border = '1px solid #A7F3D0';
        statusEl.textContent = '✅ Profile details and address saved successfully!';
        setTimeout(() => { statusEl.style.display = 'none'; }, 4000);
      }
      showToast('✅ Profile information updated!');
    } else {
      if (statusEl) {
        statusEl.style.display = 'block';
        statusEl.style.background = '#FEF2F2';
        statusEl.style.color = '#991B1B';
        statusEl.style.border = '1px solid #FECACA';
        statusEl.textContent = data.error || 'Failed to save changes.';
      }
    }
  } catch (err) {
    alert('Network error saving profile settings.');
  }
}

// KYC Verification Handling
let kycUploadState = { front: null, back: null, selfie: null };

function openKycModal() {
  if (!state.currentUser) {
    setBarrierMode('login');
    const barrier = document.getElementById('auth-barrier-screen');
    if (barrier) barrier.style.display = 'flex';
    return;
  }
  const modal = document.getElementById('kyc-modal');
  if (modal) {
    modal.style.display = 'flex';
    if (state.currentUser.kycIdType) {
      const typeSelect = document.getElementById('kyc-doc-type');
      if (typeSelect) typeSelect.value = state.currentUser.kycIdType;
    }
    if (state.currentUser.kycIdNumber) {
      const numInput = document.getElementById('kyc-doc-number');
      if (numInput) numInput.value = state.currentUser.kycIdNumber;
    }
    const errBox = document.getElementById('kyc-submit-error');
    if (errBox) errBox.style.display = 'none';
  }
}

function closeKycModal() {
  const modal = document.getElementById('kyc-modal');
  if (modal) modal.style.display = 'none';
}

function handleKycFileUpload(event, type) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    kycUploadState[type] = dataUrl;

    const preview = document.getElementById(`kyc-img-${type}`);
    const placeholder = document.getElementById(`kyc-preview-${type}-placeholder`);
    const removeBtn = document.getElementById(`kyc-btn-remove-${type}`);

    if (preview) {
      preview.src = dataUrl;
      preview.style.display = 'block';
    }
    if (placeholder) placeholder.style.display = 'none';
    if (removeBtn) removeBtn.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

function removeKycFile(event, type) {
  event.stopPropagation();
  kycUploadState[type] = null;

  const fileInput = document.getElementById(`kyc-file-${type}`);
  if (fileInput) fileInput.value = '';

  const preview = document.getElementById(`kyc-img-${type}`);
  const placeholder = document.getElementById(`kyc-preview-${type}-placeholder`);
  const removeBtn = document.getElementById(`kyc-btn-remove-${type}`);

  if (preview) preview.style.display = 'none';
  if (placeholder) placeholder.style.display = 'block';
  if (removeBtn) removeBtn.style.display = 'none';
}

async function handleKycSubmit(event) {
  event.preventDefault();
  if (!state.currentUser) return;

  const docType = document.getElementById('kyc-doc-type').value.trim();
  const docNumber = document.getElementById('kyc-doc-number').value.trim();
  const errBox = document.getElementById('kyc-submit-error');
  const submitBtn = document.getElementById('btn-submit-kyc');

  if (errBox) errBox.style.display = 'none';

  if (!kycUploadState.front) {
    if (errBox) {
      errBox.textContent = 'Please upload the front photo of your government ID.';
      errBox.style.display = 'block';
    }
    return;
  }
  if (!kycUploadState.selfie) {
    if (errBox) {
      errBox.textContent = 'Please upload a selfie of you holding your government ID.';
      errBox.style.display = 'block';
    }
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Encrypting & Submitting...';
  }

  try {
    const res = await fetch('/api/user/kyc/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: state.currentUser.email,
        idType: docType,
        idNumber: docNumber,
        frontImage: kycUploadState.front,
        backImage: kycUploadState.back || '',
        selfieImage: kycUploadState.selfie
      })
    });
    const data = await res.json();

    if (!res.ok) {
      if (errBox) {
        errBox.textContent = data.error || 'Failed to submit KYC documents.';
        errBox.style.display = 'block';
      }
      return;
    }

    state.currentUser.kycStatus = 'pending';
    state.currentUser.kycIdType = docType;
    state.currentUser.kycIdNumber = docNumber;
    state.currentUser.kycSubmittedAt = Date.now();
    localStorage.setItem(CITIZEN_STORAGE_KEY, JSON.stringify(state.currentUser));

    closeKycModal();
    updateAuthUI();
    showToast('🎉 KYC documents submitted! CENRO administration is reviewing your application.');

  } catch (err) {
    if (errBox) {
      errBox.textContent = 'Network error submitting verification documents.';
      errBox.style.display = 'block';
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = '📤 Submit Documents for Admin Review';
    }
  }
}

// Generic Auth Modal (for backwards compatibility)
function openAuthModal(mode = 'login') {
  setBarrierMode(mode);
  const barrier = document.getElementById('auth-barrier-screen');
  if (barrier) barrier.style.display = 'flex';
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.style.display = 'none';
}

function setAuthMode(mode) {
  setBarrierMode(mode);
}

async function handleCitizenLogin(e) {
  await handleBarrierLogin(e);
}

async function handleCitizenRegister(e) {
  await handleBarrierRegister(e);
}

function handleCitizenLogout() {
  localStorage.removeItem(CITIZEN_STORAGE_KEY);
  state.currentUser = null;
  updateAuthUI();
  showToast('Signed out of citizen session.');
}

// 2. Data Fetching
async function loadAllData() {
  await Promise.all([
    fetchConfig(),
    fetchWeather(),
    fetchAnnouncements(),
    fetchUserGuides(),
    fetchReports()
  ]);
}

async function fetchConfig() {
  try {
    const res = await fetch('/api/config');
    const data = await res.json();
    state.config = data.config || {};
    applyConfigUI(state.config);
  } catch (e) {
    console.warn('Using default config');
  }
}

function applyConfigUI(c) {
  if (c.websiteName) {
    const brandEl = document.getElementById('site-brand-name');
    if (brandEl) brandEl.textContent = c.websiteName;
  }
  if (c.websiteSubtitle) {
    const subEl = document.getElementById('site-brand-sub');
    if (subEl) subEl.textContent = c.websiteSubtitle;
  }
  // Site Logo Rendering (Emoji or Image)
  const siteLogoEl = document.getElementById('site-logo-icon');
  if (siteLogoEl) {
    if (c.logoType === 'image' && c.logoImageUrl) {
      const fallback = c.websiteLogo || '🌱';
      siteLogoEl.innerHTML = `<img src="${c.logoImageUrl}" alt="Logo" class="site-logo-img" style="width:100%!important; height:100%!important; max-width:36px!important; max-height:36px!important; object-fit:contain!important; display:block!important; margin:auto;" onerror="this.onerror=null; this.style.display='none'; this.parentElement.classList.remove('has-image'); this.parentElement.textContent='${fallback}';">`;
      siteLogoEl.classList.add('has-image');
    } else {
      siteLogoEl.textContent = c.websiteLogo || '🌱';
      siteLogoEl.classList.remove('has-image');
    }
  }
  if (c.climateChangeInfo) {
    const el = document.getElementById('cms-display-climate-change');
    if (el) el.textContent = c.climateChangeInfo;
  }
  if (c.climateActionInfo) {
    const el = document.getElementById('cms-display-climate-action');
    if (el) el.textContent = c.climateActionInfo;
  }
  if (c.climateAwarenessInfo) {
    const el = document.getElementById('cms-display-climate-awareness');
    if (el) el.textContent = c.climateAwarenessInfo;
  }
}

async function fetchWeather() {
  try {
    const res = await fetch('/api/weather');
    const data = await res.json();
    state.weather = data.weather || {};
    applyWeatherUI(state.weather);
  } catch (e) {
    console.warn('Weather fallback');
  }
}

function applyWeatherUI(w) {
  const headerPill = document.getElementById('header-weather-text');
  if (headerPill) {
    headerPill.textContent = `${w.temperature || 32}°C • ${w.alertLevel || 'Yellow'} Alert`;
  }

  const tempEl = document.getElementById('dash-weather-temp');
  const heatEl = document.getElementById('dash-weather-heat');
  const condEl = document.getElementById('dash-weather-condition');
  const feelsEl = document.getElementById('dash-weather-feels');
  const alertEl = document.getElementById('dash-weather-alert');
  const aqiEl = document.getElementById('dash-weather-aqi');
  const rainEl = document.getElementById('dash-weather-rain');
  const advEl = document.getElementById('dash-weather-advisory-text');

  if (tempEl) tempEl.textContent = w.temperature || 32;
  if (heatEl) heatEl.textContent = `${w.heatIndex || 38}°C`;
  if (condEl) condEl.textContent = w.condition || 'Partly Cloudy';
  if (feelsEl) feelsEl.textContent = `Feels like ${Math.round((w.temperature || 32) + 4)}°C`;
  if (aqiEl) aqiEl.textContent = w.airQuality || '68';
  if (rainEl) rainEl.textContent = w.rainRisk || '45%';
  if (alertEl) alertEl.textContent = `🟡 PAGASA STATUS: ${w.alertLevel || 'Yellow'} Alert`;
  if (advEl) advEl.textContent = `${w.advisoryNotice || 'Low Pressure Area approaching Eastern Seaboard. Preemptive culvert monitoring active.'} >`;
}

function refreshClimateTelemetry() {
  const indicator = document.querySelector('.status-updated-indicator');
  if (indicator) indicator.textContent = 'Updating... ⏳';
  setTimeout(async () => {
    await fetchWeather();
    if (indicator) indicator.textContent = 'Updated just now 🔄';
    showToast('🌤 Real-time climate telemetry refreshed.');
  }, 600);
}

function openAdvisoryModal() {
  const body = document.getElementById('modal-incident-body');
  body.innerHTML = `
    <div style="border-bottom: 1px solid var(--border); padding-bottom: 0.75rem; margin-bottom: 1rem;">
      <span class="status-badge" style="background:#FEF3C7; color:#B45309;">PAGASA METEOROLOGICAL BULLETIN</span>
      <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--primary-dark); margin-top: 0.35rem;">
        Tropical Depression & Monsoon Advisory #04
      </h3>
    </div>
    <div style="font-size: 0.88rem; line-height: 1.6; color: var(--text-main);">
      <p>A Low Pressure Area (LPA) was estimated based on all available data at 280 km East of Metro Verde. It is forecasted to bring moderate to heavy rainfall along mountain foothills and downstream river spillways.</p>
      <div style="background: var(--surface-alt); padding: 0.85rem; border-radius: 8px; margin: 1rem 0; border-left: 4px solid var(--amber);">
        <strong>⚠️ Municipal Directives:</strong>
        <ul style="padding-left: 1.25rem; margin-top: 0.25rem;">
          <li>Barangay DRRMO Eco-Wardens are mobilized for round-the-clock water level telemetry.</li>
          <li>Residents along river corridors are advised to clear roadside drainage culverts.</li>
          <li>Emergency Rescue Hotline (02) 8888-ECO is on heightened alert.</li>
        </ul>
      </div>
    </div>
  `;
  document.getElementById('incident-modal').style.display = 'flex';
}

async function fetchAnnouncements() {
  try {
    const res = await fetch('/api/announcements');
    const data = await res.json();
    state.announcements = data.announcements || [];
    renderAnnouncementsUI(state.announcements);
  } catch (e) {
    console.warn('Announcements fallback');
  }
}

function renderAnnouncementsUI(list) {
  const notifContainer = document.getElementById('notif-items-list');
  const badgeCount = document.getElementById('notif-badge-count');

  if (badgeCount) {
    badgeCount.textContent = list.length || 3;
    badgeCount.style.display = 'flex';
  }

  if (notifContainer) {
    if (list.length === 0) {
      notifContainer.innerHTML = `
        <div class="notif-item priority-high">
          <div style="font-weight:700; color:var(--text-main);">Yellow Rainfall Alert Raised</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">PAGASA raised alert for river corridor barangays. Please report culvert bottlenecks.</div>
        </div>
        <div class="notif-item priority-low">
          <div style="font-weight:700; color:var(--text-main);">Upcoming Watershed Tree Planting</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">Join the community planting this Saturday. Earn +30 Eco-Points!</div>
        </div>
      `;
    } else {
      notifContainer.innerHTML = list.map(a => `
        <div class="notif-item priority-${(a.priority || 'low').toLowerCase()}">
          <div style="font-weight:700; color:var(--text-main); margin-bottom:0.2rem;">${escapeHtml(a.title)}</div>
          <div style="color:var(--text-muted); font-size:0.75rem; line-height:1.4;">${escapeHtml(a.content)}</div>
          <div style="font-size:0.68rem; color:var(--text-muted); margin-top:0.3rem;">By ${escapeHtml(a.author)} • ${new Date(a.timestamp).toLocaleDateString()}</div>
        </div>
      `).join('');
    }
  }
}

function markAllNotifsRead() {
  const badge = document.getElementById('notif-badge-count');
  if (badge) badge.style.display = 'none';
  closeAllDropdowns();
  showToast('All notifications marked as read.');
}

async function fetchUserGuides() {
  try {
    const res = await fetch('/api/user-guides');
    const data = await res.json();
    state.userGuides = data.guides || [];
    renderUserGuidesUI(state.userGuides);
  } catch (e) {
    console.warn('User guides fallback');
  }
}

function renderUserGuidesUI(guides) {
  const container = document.getElementById('user-guides-container');
  if (!container) return;

  const defaultGuides = [
    {
      icon: "📷",
      title: "How to Take Valid Photographic Evidence",
      category: "Reporting Standard",
      summary: "High quality photographic evidence accelerates CENRO inspection and avoids ticket rejection.",
      content: "Ensure daylight capture when possible. Frame both the specific hazard (e.g. leaking culvert, illegal dumping) and a recognizable background landmark (street corner, bridge pillar, barangay hall) so wardens can locate the site immediately."
    },
    {
      icon: "🗺️",
      title: "Understanding the 5-Stage Ticket Lifecycle",
      category: "Municipal Workflow",
      summary: "From citizen submission to final field audit photo verification.",
      content: "Once submitted, your ticket is verified within 24 hours. The assigned CENRO team cleans or declogs the site. After remediation, the wardens upload an after-photo and credit 50 eco-points to your profile."
    },
    {
      icon: "🌱",
      title: "Redeeming Citizen Eco-Points",
      category: "Civic Rewards",
      summary: "Unlock tree saplings, compost starter kits, and civic commendations.",
      content: "Accumulated eco-points can be presented at the CENRO Municipal Helpdesk or during community activities to receive native seedling vouchers, recycling bins, and civic volunteer certificates."
    }
  ];

  const items = guides.length > 0 ? guides : defaultGuides;
  container.innerHTML = items.map(g => `
    <div class="card" style="border-left: 5px solid var(--primary-light);">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-size: 1.5rem;">${g.icon || '📖'}</span>
          <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--primary-dark);">${escapeHtml(g.title)}</h3>
        </div>
        <span class="badge-portal-pill" style="font-size: 0.7rem;">${escapeHtml(g.category || 'Guide')}</span>
      </div>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">${escapeHtml(g.summary || '')}</p>
      <div style="background: var(--surface-alt); padding: 0.85rem 1rem; border-radius: 8px; font-size: 0.85rem; line-height: 1.6; color: var(--text-main);">
        ${escapeHtml(g.content)}
      </div>
    </div>
  `).join('');
}

// 3. Reports Handling & Homepage Rendering
async function fetchReports() {
  try {
    const res = await fetch('/api/reports');
    const data = await res.json();
    state.reports = data.reports || [];
  } catch (e) {
    console.warn('Reports fetch fallback');
  }
  renderDashboardData();
  renderIncidentTracker();
  initOrUpdatePreviewMap();
  initOrUpdateFullMap();
}

function renderDashboardData() {
  if (!state.currentUser) return;

  const userEmail = (state.currentUser.email || '').toLowerCase();
  const userReports = (state.reports || []).filter(r => (r.submittedEmail || '').toLowerCase() === userEmail);

  // Update 4 Personalized KPI Stat Widgets based on citizen's real reports
  const total = userReports.length;
  const pending = userReports.filter(r => r.status === 'Pending' || r.status === 'Submitted').length;
  const inProgress = userReports.filter(r => r.status === 'In Progress' || r.status === 'Investigating' || r.status === 'Under Review').length;
  const resolved = userReports.filter(r => r.status === 'Resolved' || r.status === 'Closed').length;

  const totalEl = document.getElementById('kpi-total-reports');
  const pendEl = document.getElementById('kpi-pending-reports');
  const inProgEl = document.getElementById('kpi-inprogress-reports');
  const resEl = document.getElementById('kpi-resolved-reports');

  if (totalEl) totalEl.textContent = total;
  if (pendEl) pendEl.textContent = pending;
  if (inProgEl) inProgEl.textContent = inProgress;
  if (resEl) resEl.textContent = resolved;

  // Render My Citizen Activity & Reports Table showing real user reports only
  const tableBody = document.getElementById('dashboard-recent-table-body');
  if (tableBody) {
    if (userReports.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
            <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📋</div>
            <div style="font-weight: 800; color: var(--text-main); font-size: 1.05rem;">No Incident Reports Filed Yet</div>
            <div style="font-size: 0.85rem; margin-top: 0.35rem; line-height: 1.5; max-width: 480px; margin-left: auto; margin-right: auto;">
              ${state.currentUser.kycStatus === 'verified'
                ? 'Your citizen account is verified and fully authorized to report local environmental hazards, flooding, or waste violations.'
                : 'Under City Ordinance #2026-04, please complete one-time government ID verification to begin filing real-time hazard reports.'}
            </div>
            ${state.currentUser.kycStatus === 'verified'
              ? '<button class="btn-primary" onclick="switchTab(\'report\')" style="margin-top: 1.25rem; font-size: 0.88rem; padding: 0.65rem 1.25rem; display: inline-flex; align-items: center; gap: 0.4rem;">🚨 Submit Your First Incident Report</button>'
              : '<button class="btn-primary" onclick="openKycModal()" style="margin-top: 1.25rem; font-size: 0.88rem; padding: 0.65rem 1.25rem; display: inline-flex; align-items: center; gap: 0.4rem;">🪪 Complete KYC Verification (+100 pts)</button>'}
          </td>
        </tr>
      `;
    } else {
      tableBody.innerHTML = userReports.map(r => {
        const dateStr = r.timestamp ? new Date(r.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';
        const st = (r.status || 'Submitted');
        const stClass = st.toLowerCase().replace(' ', '-');
        const icon = st === 'Resolved' ? '🟢' : st === 'In Progress' ? '🔵' : st === 'Investigating' ? '🟡' : '🟠';

        return `
          <tr class="interactive-row" onclick="openReportTimelineModal('${r.id}', '${escapeHtml(r.category || r.title)}', '${escapeHtml(r.barangay || '')}', '${st}')">
            <td>
              <div class="report-type-cell">${escapeHtml(r.title || r.category)}</div>
            </td>
            <td>${escapeHtml(r.barangay || 'Metro Verde')}</td>
            <td>
              <span class="status-badge ${stClass}">
                ${icon} ${st}
              </span>
            </td>
            <td style="color: var(--text-muted); font-size: 0.78rem;">${dateStr}</td>
          </tr>
        `;
      }).join('');
    }
  }

  // Render Dashboard Activities List
  const activitiesContainer = document.getElementById('dashboard-activities-container');
  if (activitiesContainer) {
    activitiesContainer.innerHTML = activities.map(act => `
      <div class="activity-row-item">
        <div class="activity-info-block">
          <div class="activity-name">${act.title}</div>
          <div class="activity-meta">
            <span>📅 ${act.date}</span>
            <span>👤 ${act.registered} Participants</span>
          </div>
        </div>
        <button class="btn-join-activity ${state.joinedActivities.has(act.id) ? 'joined' : ''}" onclick="toggleJoinActivity('${act.id}')">
          ${state.joinedActivities.has(act.id) ? '✓ Joined' : 'Join Activity'}
        </button>
      </div>
    `).join('');
  }
}

// Quick action: Open Report tab and prefill category
function openReportWithCategory(categoryName = '') {
  switchTab('report');
  if (categoryName) {
    const sel = document.getElementById('report-category');
    if (sel) {
      for (let i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value.toLowerCase().includes(categoryName.toLowerCase())) {
          sel.selectedIndex = i;
          break;
        }
      }
    }
  }
  const titleInput = document.getElementById('report-title');
  if (titleInput) {
    titleInput.focus();
    titleInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// 4. Incident Status Timeline Modal
function openReportTimelineModal(reportId, type, location, status) {
  const modal = document.getElementById('incident-modal');
  const body = document.getElementById('modal-incident-body');
  if (!modal || !body) return;

  const isResolved = status.toLowerCase() === 'resolved';
  const isInProgress = status.toLowerCase().includes('progress');
  const isInvestigating = status.toLowerCase().includes('investigating');

  body.innerHTML = `
    <div style="border-bottom: 1px solid var(--border); padding-bottom: 0.75rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
      <div>
        <span style="font-size: 0.78rem; font-weight: 800; color: var(--primary-light);">${reportId}</span>
        <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin-top: 0.2rem;">
          ${type} at ${location}
        </h3>
      </div>
      <span class="status-badge ${status.toLowerCase().replace(' ', '-')}">
        ● ${status}
      </span>
    </div>

    <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
      Track the live 5-stage municipal resolution milestones and field inspection audits:
    </div>

    <!-- 5-Step Status Timeline -->
    <div class="status-timeline-track">
      <div class="timeline-step-item done">
        <div class="timeline-step-marker">✓</div>
        <div class="timeline-step-title">1. Report Submitted</div>
        <div class="timeline-step-meta">Logged by verified citizen. Geotagged and queued for dispatch.</div>
      </div>
      <div class="timeline-step-item done">
        <div class="timeline-step-marker">✓</div>
        <div class="timeline-step-title">2. Verified by Barangay Eco-Warden</div>
        <div class="timeline-step-meta">On-site photographic inspection confirmed validity.</div>
      </div>
      <div class="timeline-step-item ${isInvestigating || isInProgress || isResolved ? 'done' : 'current'}">
        <div class="timeline-step-marker">${isInvestigating || isInProgress || isResolved ? '✓' : '●'}</div>
        <div class="timeline-step-title">3. Assigned to CENRO Response Unit</div>
        <div class="timeline-step-meta">Ticket allocated to specialized Solid Waste or Flood Mitigation team.</div>
      </div>
      <div class="timeline-step-item ${isResolved ? 'done' : (isInProgress || isInvestigating ? 'current' : '')}">
        <div class="timeline-step-marker">${isResolved ? '✓' : (isInProgress || isInvestigating ? '●' : '○')}</div>
        <div class="timeline-step-title">4. Under Investigation & Active Remediation</div>
        <div class="timeline-step-meta">Drainage declogging crews, heavy equipment, or legal citations issued.</div>
      </div>
      <div class="timeline-step-item ${isResolved ? 'done' : ''}">
        <div class="timeline-step-marker">${isResolved ? '✓' : '○'}</div>
        <div class="timeline-step-title">5. Resolved & Field Audited</div>
        <div class="timeline-step-meta">Remediation photo uploaded. Community reward credited.</div>
      </div>
    </div>

    <div style="background: var(--surface-alt); padding: 0.85rem 1rem; border-radius: 8px; font-size: 0.82rem; margin-top: 1.25rem;">
      <strong>🏛️ CENRO Dispatch Log:</strong>
      <div style="color: var(--text-muted); margin-top: 0.25rem;">
        Team #4 Alpha deployed to ${location}. Environmental inspection conducted under Republic Act 9003. Citizen reporter notified via mobile alert.
      </div>
    </div>
  `;

  modal.style.display = 'flex';
}

// 5. Climate Information Pillar Modal
function openInfoCardModal(pillarKey) {
  const p = climatePillars[pillarKey];
  if (!p) return;

  const modal = document.getElementById('info-pillar-modal');
  const body = document.getElementById('modal-info-pillar-body');
  if (!modal || !body) return;

  body.innerHTML = `
    <div style="border-bottom: 1px solid var(--border); padding-bottom: 0.75rem; margin-bottom: 1rem;">
      <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--primary-dark);">${p.title}</h3>
      <div style="font-size: 0.82rem; color: var(--text-muted);">${p.subtitle}</div>
    </div>

    ${p.image ? `
      <div style="margin-bottom: 1rem; max-height: 200px; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--border);">
        <img src="${p.image}" alt="${p.title}" style="width: 100%; height: 100%; object-fit: cover; max-height: 200px; display: block;">
      </div>
    ` : ''}

    <div style="font-size: 0.88rem; line-height: 1.6; color: var(--text-main);">
      ${p.content}
    </div>

    <div style="display: flex; justify-content: flex-end; margin-top: 1.5rem;">
      <button class="btn-primary" onclick="closeModal('info-pillar-modal')">
        Close Knowledge Guide
      </button>
    </div>
  `;

  modal.style.display = 'flex';
}

function closeModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.style.display = 'none';
}

// 6. Interactive Leaflet GIS Maps (Preview + Full)
function initOrUpdatePreviewMap() {
  const container = document.getElementById('dashboard-preview-map');
  if (!container) return;

  // Safeguard: Leaflet script might load asynchronously or fail on slow mobile network
  if (typeof L === 'undefined' || !L.map) {
    console.warn('Leaflet GIS library not yet loaded. Map preview deferred.');
    return;
  }

  try {
    if (!state.previewMapInstance) {
      if (container._leaflet_id) {
        container._leaflet_id = null;
      }
      state.previewMapInstance = L.map('dashboard-preview-map', {
        zoomControl: false,
        attributionControl: false
      }).setView([14.6538, 121.0583], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18
      }).addTo(state.previewMapInstance);
    }

    // Clear previous markers
    if (state.previewMapMarkers) {
      state.previewMapMarkers.forEach(m => {
        try { state.previewMapInstance.removeLayer(m); } catch (e) {}
      });
    }
    state.previewMapMarkers = [];

    // Plot reports
    state.reports.forEach(r => {
      if (!r.latitude || !r.longitude) return;
      let color = '#16A765';
      let rad = 7;
      if (r.severity === 'Critical') { color = '#DC3545'; rad = 10; }
      else if (r.severity === 'High') { color = '#EA580C'; rad = 8; }
      else if (r.status === 'Investigating') { color = '#F4B400'; rad = 7; }

      const circle = L.circleMarker([r.latitude, r.longitude], {
        radius: rad,
        fillColor: color,
        color: '#FFFFFF',
        weight: 1.5,
        fillOpacity: 0.85
      }).addTo(state.previewMapInstance);

      circle.bindPopup(`<strong>${r.category}</strong><br>${escapeHtml(r.title)}<br>📍 ${r.barangay}`);
      state.previewMapMarkers.push(circle);
    });
  } catch (err) {
    console.warn('Preview map initialization handled safely:', err);
  }
}

function initOrUpdateFullMap() {
  const container = document.getElementById('web-map-container');
  if (!container) return;

  if (typeof L === 'undefined' || !L.map) {
    console.warn('Leaflet GIS library not yet loaded. Full map deferred.');
    return;
  }

  try {
    if (!state.fullMapInstance) {
      if (container._leaflet_id) {
        container._leaflet_id = null;
      }
      state.fullMapInstance = L.map('web-map-container').setView([14.6538, 121.0583], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors | Metro Verde GIS'
      }).addTo(state.fullMapInstance);
    }

    // Clear previous markers
    if (state.fullMapMarkers) {
      state.fullMapMarkers.forEach(m => {
        try { state.fullMapInstance.removeLayer(m); } catch (e) {}
      });
    }
    state.fullMapMarkers = [];

    state.reports.forEach(r => {
      if (!r.latitude || !r.longitude) return;
      let color = '#16A765';
      let rad = 8;
      if (r.severity === 'Critical') { color = '#DC3545'; rad = 12; }
      else if (r.severity === 'High') { color = '#EA580C'; rad = 10; }
      else if (r.status === 'Investigating') { color = '#F4B400'; rad = 8; }
      else if (r.status === 'In Progress') { color = '#0284C7'; rad = 8; }

      const circle = L.circleMarker([r.latitude, r.longitude], {
        radius: rad,
        fillColor: color,
        color: '#FFFFFF',
        weight: 2,
        fillOpacity: 0.85
      }).addTo(state.fullMapInstance);

      circle.bindPopup(`
        <div style="font-family:'Plus Jakarta Sans',sans-serif; font-size:12px; line-height:1.4;">
          <strong style="color:${color};">${r.category}</strong><br>
          <strong>${escapeHtml(r.title)}</strong><br>
          <span>📍 ${escapeHtml(r.barangay)}</span><br>
          <span style="font-size:11px; color:#5A6A80;">Status: ${r.status}</span>
        </div>
      `);

      circle.on('click', () => {
        const pinBox = document.getElementById('map-pin-detail-box');
        if (pinBox) {
          pinBox.innerHTML = `
            <div style="background: var(--surface-alt); padding: 0.85rem; border-radius: 8px; border-left: 4px solid ${color};">
              <div style="font-weight: 800; color: var(--text-main);">${escapeHtml(r.title)}</div>
              <div style="font-size: 0.78rem; color: var(--text-muted); margin: 0.35rem 0;">📍 ${escapeHtml(r.barangay)} • ${escapeHtml(r.landmark || '')}</div>
              <div style="display: flex; gap: 0.4rem; margin-top: 0.5rem;">
                <span class="status-badge" style="background:${color}22; color:${color}; font-size:0.72rem;">${r.severity}</span>
                <span class="status-badge in-progress" style="font-size:0.72rem;">${r.status}</span>
              </div>
              <button onclick="openReportTimelineModal('${r.id}', '${escapeHtml(r.category)}', '${escapeHtml(r.barangay)}', '${r.status}')" class="btn-primary" style="margin-top: 0.75rem; width: 100%; padding: 0.45rem; font-size: 0.78rem;">
                View Resolution Timeline
              </button>
            </div>
          `;
        }
      });

      state.fullMapMarkers.push(circle);
    });
  } catch (err) {
    console.warn('Full map initialization handled safely:', err);
  }
}

// 7. Incident Tracker View & Search
function renderIncidentTracker(statusFilter = 'All', searchQuery = '') {
  const grid = document.getElementById('tracker-reports-grid');
  if (!grid) return;

  const countAll = document.getElementById('tracker-count-all');
  if (countAll) countAll.textContent = state.reports.length;

  let filtered = state.reports;
  if (statusFilter !== 'All') {
    filtered = filtered.filter(r => (r.status || '').toLowerCase().includes(statusFilter.toLowerCase()));
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(r =>
      (r.title || '').toLowerCase().includes(q) ||
      (r.barangay || '').toLowerCase().includes(q) ||
      (r.id || '').toLowerCase().includes(q) ||
      (r.category || '').toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="card" style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 2.5rem;">No environmental incident reports match your filter criteria.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(r => `
    <div class="card" onclick="openReportTimelineModal('${r.id}', '${escapeHtml(r.category)}', '${escapeHtml(r.barangay)}', '${r.status}')" style="cursor: pointer; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; gap: 0.5rem;">
          <span style="font-size: 0.74rem; font-weight: 800; color: var(--primary-light);">${r.category}</span>
          <span class="status-badge" style="background:#FEE2E2; color:#991B1B; font-size:0.7rem;">${r.severity}</span>
        </div>
        <h4 style="font-size: 0.95rem; font-weight: 800; color: var(--text-main); line-height: 1.35;">${escapeHtml(r.title)}</h4>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0.5rem 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
          ${escapeHtml(r.description)}
        </p>
      </div>

      <div>
        <div style="font-size: 0.74rem; color: var(--text-muted); margin-bottom: 0.75rem; display: flex; justify-content: space-between;">
          <span>📍 ${escapeHtml(r.barangay)}</span>
          <span>📅 ${new Date(r.timestamp).toLocaleDateString()}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 0.65rem;">
          <span class="status-badge in-progress">${r.status}</span>
          <span style="font-size: 0.78rem; color: var(--primary-light); font-weight: 800;">Inspect Timeline →</span>
        </div>
      </div>
    </div>
  `).join('');
}

function handleTrackerSearch(e) {
  const activePill = document.querySelector('[data-tracker-filter].active');
  const filter = activePill ? activePill.getAttribute('data-tracker-filter') : 'All';
  renderIncidentTracker(filter, e.target.value);
}

function filterTrackerByStatus(status) {
  document.querySelectorAll('[data-tracker-filter]').forEach(btn => {
    if (btn.getAttribute('data-tracker-filter') === status) btn.classList.add('active');
    else btn.classList.remove('active');
  });
  const search = document.getElementById('tracker-search-input')?.value || '';
  renderIncidentTracker(status, search);
}

// 8. Form Submission (Strictly Requires Verified Citizen KYC)
async function handleFormSubmit(e) {
  e.preventDefault();

  if (!state.currentUser) {
    setBarrierMode('login');
    const barrier = document.getElementById('auth-barrier-screen');
    if (barrier) barrier.style.display = 'flex';
    showToast('⚠️ You must log in or register before submitting an incident report.');
    return;
  }

  if (state.currentUser.kycStatus !== 'verified') {
    alert('Identity Verification Required: Under City Ecological Ordinance #2026-04, citizens must verify their government ID before submitting environmental incident reports.');
    openKycModal();
    return;
  }

  const title = document.getElementById('report-title').value.trim();
  const category = document.getElementById('report-category').value;
  const severity = document.getElementById('report-severity').value;
  const barangay = document.getElementById('report-barangay').value;
  const landmark = document.getElementById('report-landmark').value.trim();
  const description = document.getElementById('report-desc').value.trim();

  const coordsMap = {
    'Barangay Makilas': { lat: 14.6520, lng: 121.0540 },
    'Poblacion': { lat: 14.6550, lng: 121.0580 },
    'Lumbia': { lat: 14.6460, lng: 121.0610 },
    'Taway': { lat: 14.6710, lng: 121.0720 },
    'Maasin': { lat: 14.6380, lng: 121.0420 },
    'Barangay San Isidro': { lat: 14.6640, lng: 121.0510 },
    'Barangay Riverside': { lat: 14.6590, lng: 121.0350 },
    'Barangay Malinis': { lat: 14.6640, lng: 121.0510 }
  };
  const coords = coordsMap[barangay] || { lat: 14.6538, lng: 121.0583 };

  const newReport = {
    title,
    category,
    severity,
    barangay,
    landmark,
    description,
    latitude: coords.lat + (Math.random() - 0.5) * 0.005,
    longitude: coords.lng + (Math.random() - 0.5) * 0.005,
    submittedBy: state.currentUser.fullName || state.currentUser.name,
    submittedEmail: state.currentUser.email,
    photoUrl: state.uploadedPhotoData || "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=600&q=80"
  };

  try {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReport)
    });
    const data = await res.json();

    if (res.status === 403 || data.requiresKyc) {
      alert(data.error || 'Identity Verification Required: Please verify your government ID with CENRO before submitting reports.');
      openKycModal();
      return;
    }

    if (res.ok) {
      state.currentUser.ecoPoints = (state.currentUser.ecoPoints || 50) + 50;
      state.currentUser.reportsCount = (state.currentUser.reportsCount || 0) + 1;
      localStorage.setItem(CITIZEN_STORAGE_KEY, JSON.stringify(state.currentUser));
      updateAuthUI();

      document.getElementById('incident-report-form').reset();
      const preview = document.getElementById('photo-preview-img');
      const placeholder = document.getElementById('photo-upload-placeholder');
      if (preview) preview.style.display = 'none';
      if (placeholder) placeholder.style.display = 'block';
      state.uploadedPhotoData = null;

      showToast(`🎉 Incident logged as Ticket ${data.report.id}! +50 Eco-Points awarded.`);
      await fetchReports();
      renderDashboardData();
      switchTab('tracker');
    } else {
      alert(data.error || 'Failed to submit report. Please check required fields.');
    }
  } catch (err) {
    alert('Network error submitting incident report.');
  }
}

function handlePhotoSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    state.uploadedPhotoData = ev.target.result;
    const preview = document.getElementById('photo-preview-img');
    const placeholder = document.getElementById('photo-upload-placeholder');
    preview.src = ev.target.result;
    preview.style.display = 'block';
    placeholder.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

// 9. Articles, Quiz & Activities
function renderArticles() {
  const grid = document.getElementById('articles-grid');
  if (!grid) return;

  grid.innerHTML = articles.map(a => `
    <div class="card" style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
      <img src="${a.image}" style="height: 160px; width: 100%; object-fit: cover;" alt="${a.title}">
      <div style="padding: 1.25rem; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <span class="badge-portal-pill" style="font-size: 0.68rem;">${a.category}</span>
          <h4 style="font-size: 1rem; font-weight: 800; color: var(--text-main); margin-top: 0.4rem;">${a.title}</h4>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin: 0.5rem 0; line-height: 1.5;">${a.summary}</p>
        </div>
        <div style="font-size: 0.75rem; color: var(--primary-light); font-weight: 800; margin-top: 0.75rem;">
          ⏱️ ${a.readTime}
        </div>
      </div>
    </div>
  `).join('');
}

function renderQuiz() {
  const container = document.getElementById('quiz-container');
  if (!container) return;

  if (state.currentQuizIndex >= quizQuestions.length) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">🏆</div>
        <h3 style="font-size: 1.35rem; font-weight: 800; color: var(--primary-dark); margin-bottom: 0.5rem;">Climate Literacy Champion!</h3>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.25rem;">
          You scored ${state.quizScore} out of ${quizQuestions.length} correct. Thank you for advancing environmental literacy in Metro Verde!
        </p>
        <button class="btn-primary" onclick="resetQuiz()">🔄 Retake Quiz</button>
      </div>
    `;
    return;
  }

  const q = quizQuestions[state.currentQuizIndex];
  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <span style="font-size: 0.8rem; font-weight: 800; color: var(--primary-light);">Question ${state.currentQuizIndex + 1} of ${quizQuestions.length}</span>
      <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700;">Score: ${state.quizScore}</span>
    </div>
    <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-main); margin-bottom: 1.25rem; line-height: 1.5;">${q.question}</h3>

    <div style="display: flex; flex-direction: column; gap: 0.65rem; margin-bottom: 1.5rem;">
      ${q.options.map((opt, i) => `
        <button class="btn-secondary" onclick="handleQuizAnswer(${i})" style="text-align: left; padding: 0.85rem 1rem; font-size: 0.88rem; font-weight: 600;">
          ${opt}
        </button>
      `).join('')}
    </div>
  `;
}

function handleQuizAnswer(selectedIdx) {
  const q = quizQuestions[state.currentQuizIndex];
  const isCorrect = selectedIdx === q.correct;
  if (isCorrect) {
    state.quizScore++;
    if (state.currentUser) {
      state.currentUser.ecoPoints = (state.currentUser.ecoPoints || 750) + 15;
      localStorage.setItem(CITIZEN_STORAGE_KEY, JSON.stringify(state.currentUser));
      updateAuthUI();
    }
  }

  alert(isCorrect ? `✅ Correct! ${q.explanation}` : `❌ Incorrect. ${q.explanation}`);
  state.currentQuizIndex++;
  renderQuiz();
}

function resetQuiz() {
  state.currentQuizIndex = 0;
  state.quizScore = 0;
  renderQuiz();
}

function renderActivities() {
  const grid = document.getElementById('activities-grid');
  if (!grid) return;

  grid.innerHTML = activities.map(act => `
    <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
          <span class="badge-portal-pill" style="font-size: 0.68rem;">${act.category}</span>
          <span class="status-badge resolved" style="font-size: 0.7rem;">${act.registered}/${act.max} Joined</span>
        </div>
        <h4 style="font-size: 1.05rem; font-weight: 800; color: var(--text-main);">${act.title}</h4>
        <div style="font-size: 0.82rem; color: var(--text-muted); margin: 0.5rem 0; line-height: 1.6;">
          <div>📅 <strong>Date:</strong> ${act.date}</div>
          <div>📍 <strong>Location:</strong> ${act.location}</div>
          <div>🎯 <strong>Target:</strong> ${act.target}</div>
        </div>
      </div>

      <button class="btn-primary" onclick="toggleJoinActivity('${act.id}')" style="width: 100%; margin-top: 1rem; font-size: 0.85rem; padding: 0.65rem;">
        ${state.joinedActivities.has(act.id) ? '✓ Registered Volunteer' : 'Join Activity (+30 pts)'}
      </button>
    </div>
  `).join('');
}

function toggleJoinActivity(actId) {
  if (!state.currentUser) {
    openAuthModal('login');
    showToast('Please sign in to register for community restoration drives.');
    return;
  }
  const act = activities.find(a => a.id === actId);
  if (!act) return;

  if (state.joinedActivities.has(actId)) {
    state.joinedActivities.delete(actId);
    act.registered = Math.max(0, act.registered - 1);
    showToast(`Cancelled RSVP for ${act.title}.`);
  } else {
    state.joinedActivities.add(actId);
    act.registered++;
    state.currentUser.ecoPoints = (state.currentUser.ecoPoints || 750) + 30;
    localStorage.setItem(CITIZEN_STORAGE_KEY, JSON.stringify(state.currentUser));
    updateAuthUI();
    showToast(`🌿 RSVP Confirmed for ${act.title}! +30 Eco-Points awarded.`);
  }
  renderDashboardData();
  renderActivities();
}

// 10. Navigation Coordination across Header, Drawer & Bottom Nav
function setupNavigation() {
  // Desktop header pills
  document.querySelectorAll('.nav-tab-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      if (tab) switchTab(tab);
    });
  });

  // Mobile drawer links
  document.querySelectorAll('.drawer-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      if (tab) {
        switchTab(tab);
        closeMobileDrawer();
      }
    });
  });
}

function switchTab(tabName) {
  state.activeTab = tabName;

  // Desktop Header Tabs
  document.querySelectorAll('.nav-tab-pill').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabName) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  // Drawer Buttons
  document.querySelectorAll('.drawer-nav-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabName) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  // Mobile Bottom Nav
  document.querySelectorAll('.bottom-nav-item').forEach(btn => {
    if (btn.getAttribute('data-bottom-tab') === tabName) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  // Sections
  document.querySelectorAll('.portal-section').forEach(sec => sec.classList.remove('active'));
  const activeSec = document.getElementById(`section-${tabName}`);
  if (activeSec) activeSec.classList.add('active');

  // Trigger leaflet recalculation when switching to map tab
  if (tabName === 'map' && state.fullMapInstance) {
    setTimeout(() => {
      state.fullMapInstance.invalidateSize();
    }, 200);
  } else if (tabName === 'dashboard' && state.previewMapInstance) {
    setTimeout(() => {
      state.previewMapInstance.invalidateSize();
    }, 200);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Global click handlers to dismiss dropdowns
function setupGlobalClickHandlers() {
  document.addEventListener('click', () => {
    closeAllDropdowns();
  });

  window.addEventListener('click', (e) => {
    const authModal = document.getElementById('auth-modal');
    const incModal = document.getElementById('incident-modal');
    const infoModal = document.getElementById('info-pillar-modal');

    if (e.target === authModal) closeAuthModal();
    if (e.target === incModal) closeModal('incident-modal');
    if (e.target === infoModal) closeModal('info-pillar-modal');
  });
}

// Toast
let toastTimeout = null;
function showToast(msg) {
  const toast = document.getElementById('toast-message');
  const toastText = document.getElementById('toast-text');
  if (!toast || !toastText) return;

  toastText.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3800);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g,
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Mobile & Web Climate Action Reporting and Information System
// Citizen Portal Client-Side Application Logic

const CITIZEN_STORAGE_KEY = 'climate_citizen_session';

// Application State
const state = {
  activeTab: 'dashboard',
  currentUser: null,
  reports: [],
  config: {},
  weather: {},
  announcements: [],
  userGuides: [],
  notificationsRead: false,
  uploadedPhotoData: null,
  mapInstance: null,
  mapMarkers: [],
  currentQuizIndex: 0,
  quizScore: 0
};

// Educational Articles
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
    question: "What is the primary cause of Urban Heat Island effect in densely built areas?",
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
    question: "What is the optimal response when observing industrial chemical discharge into a public creek?",
    options: [
      "Wait 30 days to see if the rain dilutes it",
      "Take clear geotagged photos and file an urgent incident report to CENRO immediately",
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
    title: "Makilas River Ecological Dredging & Bamboo Planting",
    date: "Saturday, Oct 3, 2026 • 6:30 AM",
    location: "Makilas River Corridor Spillway",
    category: "River Restoration",
    target: "500 Native Bamboo Saplings",
    registered: 48,
    max: 80
  },
  {
    id: "act-2",
    title: "San Isidro Watershed Tree Planting & Seedball Dispersal",
    date: "Sunday, Oct 11, 2026 • 7:00 AM",
    location: "Upper Ridge Watershed Reserve",
    category: "Reforestation",
    target: "1,200 Indigenous Hardwoods",
    registered: 92,
    max: 120
  },
  {
    id: "act-3",
    title: "Zero-Waste Household Composting & Bokashi Workshop",
    date: "Saturday, Oct 17, 2026 • 9:00 AM",
    location: "Barangay Malinis Community Hall",
    category: "Civic Workshop",
    target: "60 Families Certified",
    registered: 35,
    max: 50
  }
];

// DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
  initCitizenSession();
  setupNavigation();
  loadAllData();
  renderArticles();
  renderQuiz();
  renderActivities();
  setupEventListeners();
});

// 1. Citizen Session Handling
function initCitizenSession() {
  const saved = localStorage.getItem(CITIZEN_STORAGE_KEY);
  if (saved) {
    try {
      state.currentUser = JSON.parse(saved);
    } catch (e) {
      localStorage.removeItem(CITIZEN_STORAGE_KEY);
    }
  }
  updateAuthUI();
}

function updateAuthUI() {
  const authContainer = document.getElementById('citizen-auth-container');
  const gateCard = document.getElementById('report-auth-gate');
  const reportForm = document.getElementById('report-form-container');

  if (state.currentUser) {
    // User is logged in
    authContainer.innerHTML = `
      <div class="user-pill-nav">
        <span>👤</span>
        <span>${escapeHtml(state.currentUser.name)}</span>
        <span class="badge-points" id="header-user-points">${state.currentUser.ecoPoints || 0} pts</span>
        <button class="btn-logout-small" onclick="handleCitizenLogout()" title="Sign Out">Sign Out</button>
      </div>
    `;

    // Enable reporting form
    if (gateCard) gateCard.style.display = 'none';
    if (reportForm) reportForm.style.display = 'grid';

    const reporterName = document.getElementById('reporter-display-name');
    const reporterEmail = document.getElementById('reporter-display-email');
    if (reporterName) reporterName.textContent = state.currentUser.name;
    if (reporterEmail) reporterEmail.textContent = `(${state.currentUser.email})`;

  } else {
    // User is guest / not logged in
    authContainer.innerHTML = `
      <button class="btn-login-nav" onclick="openAuthModal('login')">
        🔑 Citizen Sign In / Register
      </button>
    `;

    // Disable reporting form, show gate
    if (gateCard) gateCard.style.display = 'block';
    if (reportForm) reportForm.style.display = 'none';
  }
}

function handleReportButtonClick() {
  if (!state.currentUser) {
    openAuthModal('login');
    showToast('⚠️ Please log in to your citizen account before filing reports.');
  } else {
    switchTab('report');
  }
}

// 2. Auth Modal Controls
function openAuthModal(mode = 'login') {
  setAuthMode(mode);
  document.getElementById('auth-modal').style.display = 'flex';
}

function closeAuthModal() {
  document.getElementById('auth-modal').style.display = 'none';
  const errLogin = document.getElementById('auth-login-error');
  const errReg = document.getElementById('auth-reg-error');
  if (errLogin) errLogin.style.display = 'none';
  if (errReg) errReg.style.display = 'none';
}

function setAuthMode(mode) {
  const tabLogin = document.getElementById('auth-tab-login');
  const tabReg = document.getElementById('auth-tab-register');
  const formLogin = document.getElementById('citizen-login-form');
  const formReg = document.getElementById('citizen-register-form');

  if (mode === 'login') {
    tabLogin.classList.add('active');
    tabReg.classList.remove('active');
    formLogin.style.display = 'block';
    formReg.style.display = 'none';
  } else {
    tabLogin.classList.remove('active');
    tabReg.classList.add('active');
    formLogin.style.display = 'none';
    formReg.style.display = 'block';
  }
}

async function handleCitizenLogin(e) {
  e.preventDefault();
  const email = document.getElementById('citizen-login-email').value.trim();
  const password = document.getElementById('citizen-login-password').value.trim();
  const errBox = document.getElementById('auth-login-error');
  errBox.style.display = 'none';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      errBox.textContent = data.error || 'Login failed. Please check your credentials.';
      errBox.style.display = 'block';
      return;
    }

    state.currentUser = data.user;
    localStorage.setItem(CITIZEN_STORAGE_KEY, JSON.stringify(state.currentUser));
    updateAuthUI();
    closeAuthModal();
    showToast(`👋 Welcome back, ${state.currentUser.name}!`);
  } catch (err) {
    errBox.textContent = 'Network error connecting to authentication service.';
    errBox.style.display = 'block';
  }
}

async function handleCitizenRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const barangay = document.getElementById('reg-barangay').value;
  const password = document.getElementById('reg-password').value.trim();
  const errBox = document.getElementById('auth-reg-error');
  errBox.style.display = 'none';

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, barangay, password })
    });
    const data = await res.json();

    if (!res.ok) {
      errBox.textContent = data.error || 'Registration failed.';
      errBox.style.display = 'block';
      return;
    }

    state.currentUser = data.user;
    localStorage.setItem(CITIZEN_STORAGE_KEY, JSON.stringify(state.currentUser));
    updateAuthUI();
    closeAuthModal();
    showToast(`🎉 Account created! Welcome, ${state.currentUser.name} (+50 Eco-Points)!`);
  } catch (err) {
    errBox.textContent = 'Network error connecting to registration service.';
    errBox.style.display = 'block';
  }
}

function handleCitizenLogout() {
  localStorage.removeItem(CITIZEN_STORAGE_KEY);
  state.currentUser = null;
  updateAuthUI();
  showToast('Logged out successfully.');
}

// 3. Load all telemetry and data from backend
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
    console.error('Failed to load website config:', e);
  }
}

function applyConfigUI(c) {
  if (c.websiteLogo) {
    const logoEl = document.getElementById('site-logo-icon');
    const footerLogo = document.getElementById('footer-logo');
    if (logoEl) logoEl.textContent = c.websiteLogo;
    if (footerLogo) footerLogo.textContent = c.websiteLogo;
  }
  if (c.websiteName) {
    const brandEl = document.getElementById('site-brand-name');
    const footerBrand = document.getElementById('footer-brand-name');
    const titleEl = document.getElementById('page-title');
    if (brandEl) brandEl.textContent = c.websiteName;
    if (footerBrand) footerBrand.textContent = c.websiteName;
    if (titleEl) titleEl.textContent = `${c.websiteName} | Mobile & Web Climate Action Reporting System`;
  }
  if (c.websiteSubtitle) {
    const subEl = document.getElementById('site-brand-sub');
    if (subEl) subEl.textContent = c.websiteSubtitle;
  }
  if (c.emergencyHotline) {
    const hotEl = document.getElementById('footer-hotline-eco');
    if (hotEl) hotEl.textContent = c.emergencyHotline;
  }

  // Dynamic CMS sections in Education tab
  const ccEl = document.getElementById('cms-display-climate-change');
  const caEl = document.getElementById('cms-display-climate-action');
  const cawEl = document.getElementById('cms-display-climate-awareness');
  const abEl = document.getElementById('cms-display-about');
  const whyEl = document.getElementById('cms-display-why');
  const whoEl = document.getElementById('cms-display-who');
  const partEl = document.getElementById('cms-display-partners');
  const guideEl = document.getElementById('reporting-guide-text');

  if (ccEl) ccEl.textContent = c.climateChangeInfo || '';
  if (caEl) caEl.textContent = c.climateActionInfo || '';
  if (cawEl) cawEl.textContent = c.climateAwarenessInfo || '';
  if (abEl) abEl.textContent = c.aboutWebsite || '';
  if (whyEl) whyEl.textContent = c.whyCreated || '';
  if (whoEl) whoEl.textContent = c.whoCreated || '';
  if (partEl) partEl.textContent = c.contactPartners || '';
  if (guideEl) guideEl.textContent = c.reportingGuideInfo || '';
}

async function fetchWeather() {
  try {
    const res = await fetch('/api/weather');
    const data = await res.json();
    state.weather = data.weather || {};
    applyWeatherUI(state.weather);
  } catch (e) {
    console.error('Failed to load weather:', e);
  }
}

function applyWeatherUI(w) {
  // Header Pill
  const pillText = document.getElementById('header-weather-text');
  if (pillText) {
    pillText.textContent = `${w.temperature || 32}°C • ${w.alertLevel || 'Normal'} Alert`;
  }

  // Dashboard Card
  const tempEl = document.getElementById('dash-weather-temp');
  const heatEl = document.getElementById('dash-weather-heat');
  const condEl = document.getElementById('dash-weather-condition');
  const alertEl = document.getElementById('dash-weather-alert');
  const aqiEl = document.getElementById('dash-weather-aqi');
  const typhoonEl = document.getElementById('dash-weather-typhoon');
  const advEl = document.getElementById('dash-weather-advisory-text');
  const tipEl = document.getElementById('dash-weather-safety-text');

  if (tempEl) tempEl.textContent = w.temperature || 32;
  if (heatEl) heatEl.textContent = `Heat Index: ${w.heatIndex || 38}°C`;
  if (condEl) condEl.textContent = w.condition || 'Partly Cloudy';
  if (aqiEl) aqiEl.textContent = w.airQuality || 'Moderate (AQI 68)';
  if (typhoonEl) typhoonEl.textContent = w.typhoonSignal || 'None';
  if (advEl) advEl.textContent = w.advisoryNotice || '';
  if (tipEl) tipEl.textContent = w.safetyTip || '';

  if (alertEl) {
    alertEl.textContent = `${w.alertLevel || 'Normal'} Alert`;
    alertEl.className = 'badge-val-pill';
    const lvl = (w.alertLevel || 'normal').toLowerCase();
    if (lvl === 'yellow') alertEl.classList.add('alert-yellow');
    else if (lvl === 'orange') alertEl.classList.add('alert-orange');
    else if (lvl === 'red') alertEl.classList.add('alert-red');
    else alertEl.classList.add('alert-yellow');
  }
}

async function fetchAnnouncements() {
  try {
    const res = await fetch('/api/announcements');
    const data = await res.json();
    state.announcements = data.announcements || [];
    renderAnnouncementsUI(state.announcements);
  } catch (e) {
    console.error('Failed to load announcements:', e);
  }
}

function renderAnnouncementsUI(list) {
  // Update Notification Menu
  const notifContainer = document.getElementById('notif-items-list');
  const badgeCount = document.getElementById('notif-badge-count');

  if (badgeCount) {
    badgeCount.textContent = list.length;
    badgeCount.style.display = list.length > 0 ? 'flex' : 'none';
  }

  if (notifContainer) {
    if (list.length === 0) {
      notifContainer.innerHTML = `<div style="text-align:center; padding:1rem; color:var(--text-muted); font-size:0.8rem;">No active announcements.</div>`;
    } else {
      notifContainer.innerHTML = list.map(a => `
        <div class="notif-item priority-${a.priority.toLowerCase()}">
          <div style="font-weight:700; color:var(--text-main); margin-bottom:0.2rem;">${escapeHtml(a.title)}</div>
          <div style="color:var(--text-muted); font-size:0.75rem; line-height:1.4;">${escapeHtml(a.content)}</div>
          <div style="font-size:0.68rem; color:var(--text-muted); margin-top:0.3rem;">By ${escapeHtml(a.author)} • ${new Date(a.timestamp).toLocaleDateString()}</div>
        </div>
      `).join('');
    }
  }

  // Check for critical / urgent announcement to display as hero banner
  const critical = list.find(a => a.priority === 'Critical' || a.priority === 'High');
  const banner = document.getElementById('urgent-announcement-banner');
  if (banner) {
    if (critical) {
      document.getElementById('urgent-ann-title').textContent = critical.title;
      document.getElementById('urgent-ann-body').textContent = critical.content;
      banner.style.display = 'flex';
    } else {
      banner.style.display = 'none';
    }
  }
}

function dismissUrgentBanner() {
  const banner = document.getElementById('urgent-announcement-banner');
  if (banner) banner.style.display = 'none';
}

function toggleNotificationsMenu() {
  const menu = document.getElementById('notif-dropdown-menu');
  if (menu) menu.classList.toggle('active');
}

function markAllNotifsRead() {
  const badge = document.getElementById('notif-badge-count');
  if (badge) badge.style.display = 'none';
  const menu = document.getElementById('notif-dropdown-menu');
  if (menu) menu.classList.remove('active');
  showToast('Marked announcements as read.');
}

async function fetchUserGuides() {
  try {
    const res = await fetch('/api/user-guides');
    const data = await res.json();
    state.userGuides = data.guides || [];
    renderUserGuidesUI(state.userGuides);
  } catch (e) {
    console.error('Failed to load user guides:', e);
  }
}

function renderUserGuidesUI(guides) {
  const container = document.getElementById('user-guides-container');
  if (!container) return;

  if (guides.length === 0) {
    container.innerHTML = `<div class="card" style="text-align:center; color:var(--text-muted);">No guides published yet. Check back soon.</div>`;
    return;
  }

  container.innerHTML = guides.map((g, idx) => `
    <div class="card" style="border-left: 4px solid var(--primary);">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-size: 1.5rem;">${g.icon || '📖'}</span>
          <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--primary-dark);">${escapeHtml(g.title)}</h3>
        </div>
        <span class="badge-low" style="font-size: 0.7rem;">${escapeHtml(g.category || 'Guide')}</span>
      </div>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">${escapeHtml(g.summary || '')}</p>
      <div style="background: var(--surface-alt); padding: 0.85rem 1rem; border-radius: 8px; font-size: 0.85rem; line-height: 1.6; color: var(--text-main);">
        ${escapeHtml(g.content)}
      </div>
    </div>
  `).join('');
}

// 4. Incident Reports Handling
async function fetchReports() {
  try {
    const res = await fetch('/api/reports');
    const data = await res.json();
    state.reports = data.reports || [];
    renderDashboardTelemetry();
    renderIncidentTracker();
    initOrUpdateLeafletMap();
  } catch (e) {
    console.error('Failed to fetch reports:', e);
  }
}

function renderDashboardTelemetry() {
  const total = state.reports.length;
  const resolved = state.reports.filter(r => r.status === 'Resolved' || r.status === 'Closed').length;
  const critical = state.reports.filter(r => r.severity === 'Critical' || r.severity === 'High').length;
  const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const totalEl = document.getElementById('kpi-total-reports');
  const resEl = document.getElementById('kpi-resolved-reports');
  const critEl = document.getElementById('kpi-critical-reports');
  const rateEl = document.getElementById('kpi-resolution-rate');

  if (totalEl) totalEl.textContent = total;
  if (resEl) resEl.textContent = `${resolved}`;
  if (rateEl) rateEl.textContent = `${rate}%`;
  if (critEl) critEl.textContent = critical;

  // Recent 3 reports
  const recentList = document.getElementById('dashboard-recent-list');
  if (recentList) {
    const recents = state.reports.slice(0, 3);
    recentList.innerHTML = recents.map(r => `
      <div style="padding: 0.65rem; background: var(--surface-alt); border-radius: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem;">
        <div>
          <div style="font-weight: 700; color: var(--text-main);">${escapeHtml(r.title)}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${escapeHtml(r.barangay)} • ${escapeHtml(r.category)}</div>
        </div>
        <span class="status-pill status-${(r.status || 'submitted').toLowerCase().replace(' ', '-')}">${r.status}</span>
      </div>
    `).join('');
  }

  // Vulnerable Barangays breakdown
  const hotspotList = document.getElementById('dashboard-hotspot-list');
  if (hotspotList) {
    const bCounts = {};
    state.reports.forEach(r => {
      bCounts[r.barangay] = (bCounts[r.barangay] || 0) + 1;
    });
    const sorted = Object.entries(bCounts).sort((a,b) => b[1] - a[1]).slice(0, 4);

    hotspotList.innerHTML = sorted.map(([bName, count]) => `
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; padding: 0.4rem 0; border-bottom: 1px dashed var(--border);">
        <span style="font-weight: 600;">📍 ${escapeHtml(bName)}</span>
        <span class="badge-critical" style="font-size: 0.72rem;">${count} Incidents</span>
      </div>
    `).join('');
  }

  // Dashboard community activity snippet
  const actList = document.getElementById('dashboard-activity-list');
  if (actList) {
    actList.innerHTML = activities.slice(0, 2).map(a => `
      <div style="padding: 0.65rem; background: var(--surface-alt); border-radius: 8px; font-size: 0.82rem;">
        <div style="font-weight: 700; color: var(--primary-dark);">${a.title}</div>
        <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem;">📅 ${a.date}</div>
      </div>
    `).join('');
  }
}

// 5. Incident Tracker View
function renderIncidentTracker(statusFilter = 'All', searchQuery = '') {
  const grid = document.getElementById('tracker-reports-grid');
  if (!grid) return;

  const countAll = document.getElementById('count-all');
  if (countAll) countAll.textContent = state.reports.length;

  let filtered = state.reports;
  if (statusFilter !== 'All') {
    filtered = filtered.filter(r => r.status.toLowerCase() === statusFilter.toLowerCase());
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(r => 
      r.title.toLowerCase().includes(q) ||
      r.barangay.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="card" style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 2.5rem;">No environmental incident reports match your filter criteria.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(r => `
    <div class="report-card" onclick="openReportDetail('${r.id}')" style="cursor: pointer;">
      <div>
        <div class="report-header">
          <span class="report-category">${escapeHtml(r.category)}</span>
          <span class="badge-${(r.severity || 'low').toLowerCase()}">${r.severity}</span>
        </div>
        <div class="report-title">${escapeHtml(r.title)}</div>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 0.4rem; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
          ${escapeHtml(r.description)}
        </p>
      </div>

      <div>
        <div class="report-meta" style="margin-bottom: 0.75rem;">
          <span>📍 ${escapeHtml(r.barangay)}</span>
          <span>📅 ${new Date(r.timestamp).toLocaleDateString()}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 0.65rem;">
          <span class="status-pill status-${(r.status || 'submitted').toLowerCase().replace(' ', '-')}">${r.status}</span>
          <span style="font-size: 0.75rem; color: var(--primary); font-weight: 700;">Inspect Ticket →</span>
        </div>
      </div>
    </div>
  `).join('');
}

function openReportDetail(reportId) {
  const r = state.reports.find(item => item.id === reportId);
  if (!r) return;

  const body = document.getElementById('modal-incident-body');
  body.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid var(--border); padding-bottom: 0.75rem;">
      <div>
        <span style="font-size: 0.8rem; font-weight: 800; color: var(--primary);">${r.id}</span>
        <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin-top: 0.2rem;">${escapeHtml(r.title)}</h3>
      </div>
      <span class="status-pill status-${(r.status || 'submitted').toLowerCase().replace(' ', '-')}">${r.status}</span>
    </div>

    ${r.photoUrl ? `
      <div style="margin-bottom: 1rem; text-align: center;">
        <img src="${r.photoUrl}" style="max-height: 240px; width: 100%; object-fit: cover; border-radius: 8px; border: 1px solid var(--border);" alt="Evidence">
      </div>
    ` : ''}

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; background: var(--surface-alt); padding: 0.85rem; border-radius: 8px; font-size: 0.8rem; margin-bottom: 1rem;">
      <div><strong>Barangay:</strong><br>${escapeHtml(r.barangay)}</div>
      <div><strong>Exact Landmark:</strong><br>${escapeHtml(r.landmark || 'N/A')}</div>
      <div><strong>Hazard Category:</strong><br>${escapeHtml(r.category)}</div>
      <div><strong>Severity:</strong><br><span class="badge-${(r.severity || 'low').toLowerCase()}">${r.severity}</span></div>
      <div><strong>Submitted By:</strong><br>${escapeHtml(r.submittedBy || 'Citizen')}</div>
      <div><strong>Assigned Response Team:</strong><br>${escapeHtml(r.assignedTo || 'Under Review')}</div>
    </div>

    <div style="margin-bottom: 1rem;">
      <strong style="display: block; font-size: 0.85rem; margin-bottom: 0.35rem;">Detailed Citizen Account:</strong>
      <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.6; background: var(--surface); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border);">
        ${escapeHtml(r.description)}
      </p>
    </div>

    ${r.statusRemarks || r.inspectionNotes ? `
      <div style="background: #F0FDF4; border-left: 4px solid #10B981; padding: 0.85rem; border-radius: 6px; font-size: 0.85rem;">
        <strong style="color: #065F46;">🏛️ Official LGU / CENRO Inspection Remarks:</strong>
        <p style="color: #064E3B; margin-top: 0.25rem;">${escapeHtml(r.statusRemarks || r.inspectionNotes)}</p>
      </div>
    ` : ''}
  `;

  document.getElementById('incident-modal').style.display = 'flex';
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

// 6. Interactive Leaflet GIS Hotspot Map
function initOrUpdateLeafletMap() {
  const container = document.getElementById('web-map-container');
  if (!container) return;

  // Initialize map if not yet done
  if (!state.mapInstance) {
    state.mapInstance = L.map('web-map-container').setView([14.6538, 121.0583], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors | Metro Verde GIS'
    }).addTo(state.mapInstance);
  }

  // Clear existing markers
  state.mapMarkers.forEach(m => state.mapInstance.removeLayer(m));
  state.mapMarkers = [];

  // Plot reports as circles with severity colors
  state.reports.forEach(r => {
    if (!r.latitude || !r.longitude) return;

    let color = '#10B981';
    let radius = 8;
    if (r.severity === 'Critical') { color = '#DC2626'; radius = 12; }
    else if (r.severity === 'High') { color = '#EA580C'; radius = 10; }
    else if (r.severity === 'Moderate') { color = '#F59E0B'; radius = 8; }

    const circle = L.circleMarker([r.latitude, r.longitude], {
      radius: radius,
      fillColor: color,
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.85
    }).addTo(state.mapInstance);

    circle.bindPopup(`
      <div style="font-family:'Plus Jakarta Sans',sans-serif; font-size:12px; line-height:1.4;">
        <strong style="color:${color};">${r.category}</strong><br>
        <strong>${escapeHtml(r.title)}</strong><br>
        <span>📍 ${escapeHtml(r.barangay)}</span><br>
        <span style="font-size:11px; color:#64748B;">Status: ${r.status}</span>
      </div>
    `);

    circle.on('click', () => {
      const pinBox = document.getElementById('map-pin-detail-box');
      if (pinBox) {
        pinBox.innerHTML = `
          <div style="background: var(--surface-alt); padding: 0.75rem; border-radius: 8px; border-left: 4px solid ${color};">
            <div style="font-weight: 800; color: var(--text-main);">${escapeHtml(r.title)}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin: 0.25rem 0;">📍 ${escapeHtml(r.barangay)} • ${escapeHtml(r.landmark || '')}</div>
            <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
              <span class="badge-${(r.severity || 'low').toLowerCase()}">${r.severity}</span>
              <span class="status-pill status-${(r.status || 'submitted').toLowerCase().replace(' ', '-')}">${r.status}</span>
            </div>
            <button onclick="openReportDetail('${r.id}')" class="btn-primary" style="margin-top: 0.75rem; width: 100%; padding: 0.4rem; font-size: 0.75rem;">
              View Full Incident Details
            </button>
          </div>
        `;
      }
    });

    state.mapMarkers.push(circle);
  });
}

// 7. Form Submission (Requires Citizen Authentication)
async function handleFormSubmit(e) {
  e.preventDefault();

  if (!state.currentUser) {
    openAuthModal('login');
    showToast('⚠️ You must log in or register before submitting an incident report.');
    return;
  }

  const title = document.getElementById('report-title').value.trim();
  const category = document.getElementById('report-category').value;
  const severity = document.getElementById('report-severity').value;
  const barangay = document.getElementById('report-barangay').value;
  const landmark = document.getElementById('report-landmark').value.trim();
  const description = document.getElementById('report-desc').value.trim();

  // Coordinates mapping per barangay
  const coordsMap = {
    'Barangay Makilas': { lat: 14.6520, lng: 121.0540 },
    'Barangay San Isidro': { lat: 14.6710, lng: 121.0720 },
    'Barangay Bagong Silang': { lat: 14.6380, lng: 121.0420 },
    'Barangay Tabing Ilog': { lat: 14.6460, lng: 121.0610 },
    'Barangay Riverside': { lat: 14.6590, lng: 121.0350 },
    'Barangay Malinis': { lat: 14.6640, lng: 121.0510 },
    'Barangay Pag-asa': { lat: 14.6310, lng: 121.0550 },
    'Barangay Maligaya': { lat: 14.6500, lng: 121.0650 }
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
    submittedBy: state.currentUser.name,
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

    if (res.ok) {
      // Award points to current user
      state.currentUser.ecoPoints = (state.currentUser.ecoPoints || 0) + 50;
      state.currentUser.reportsCount = (state.currentUser.reportsCount || 0) + 1;
      localStorage.setItem(CITIZEN_STORAGE_KEY, JSON.stringify(state.currentUser));
      updateAuthUI();

      // Reset form
      document.getElementById('incident-report-form').reset();
      document.getElementById('photo-preview-img').style.display = 'none';
      document.getElementById('photo-upload-placeholder').style.display = 'block';
      state.uploadedPhotoData = null;

      showToast(`🎉 Incident logged as Ticket ${data.report.id}! +50 Eco-Points awarded.`);
      await fetchReports();
      switchTab('tracker');
    } else {
      alert('Failed to submit report. Please check required fields.');
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

// 8. Scientific Articles & Research Library
function renderArticles() {
  const grid = document.getElementById('articles-grid');
  if (!grid) return;

  grid.innerHTML = articles.map(a => `
    <div class="card" style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
      <img src="${a.image}" style="height: 160px; width: 100%; object-fit: cover;" alt="${a.title}">
      <div style="padding: 1.25rem; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <span class="report-category">${a.category}</span>
          <h4 style="font-size: 1rem; font-weight: 800; color: var(--text-main); margin-top: 0.35rem;">${a.title}</h4>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin: 0.5rem 0; line-height: 1.5;">${a.summary}</p>
        </div>
        <div style="font-size: 0.75rem; color: var(--primary); font-weight: 700; margin-top: 0.75rem;">
          ⏱️ ${a.readTime}
        </div>
      </div>
    </div>
  `).join('');
}

// 9. Interactive Climate Quiz
function renderQuiz() {
  const container = document.getElementById('quiz-container');
  if (!container) return;

  if (state.currentQuizIndex >= quizQuestions.length) {
    // Quiz finished
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
      <span style="font-size: 0.8rem; font-weight: 700; color: var(--primary);">Question ${state.currentQuizIndex + 1} of ${quizQuestions.length}</span>
      <span style="font-size: 0.8rem; color: var(--text-muted);">Score: ${state.quizScore}</span>
    </div>
    <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main); margin-bottom: 1.25rem; line-height: 1.5;">${q.question}</h3>
    
    <div style="display: flex; flex-direction: column; gap: 0.65rem; margin-bottom: 1.5rem;">
      ${q.options.map((opt, i) => `
        <button class="btn-secondary" onclick="handleQuizAnswer(${i})" style="text-align: left; padding: 0.75rem 1rem; font-size: 0.88rem;">
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
      state.currentUser.ecoPoints = (state.currentUser.ecoPoints || 0) + 15;
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

// 10. Community Activities View
function renderActivities() {
  const grid = document.getElementById('activities-grid');
  if (!grid) return;

  grid.innerHTML = activities.map(act => `
    <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
          <span class="report-category">${act.category}</span>
          <span class="badge-low" style="font-size: 0.7rem;">${act.registered}/${act.max} Joined</span>
        </div>
        <h4 style="font-size: 1.05rem; font-weight: 800; color: var(--text-main);">${act.title}</h4>
        <div style="font-size: 0.8rem; color: var(--text-muted); margin: 0.5rem 0;">
          <div>📅 ${act.date}</div>
          <div>📍 ${act.location}</div>
          <div>🎯 Target: ${act.target}</div>
        </div>
      </div>

      <button class="btn-primary" onclick="rsvpActivity('${act.id}')" style="width: 100%; margin-top: 1rem; font-size: 0.82rem; padding: 0.6rem;">
        Volunteer & RSVP (+30 pts)
      </button>
    </div>
  `).join('');
}

function rsvpActivity(actId) {
  if (!state.currentUser) {
    openAuthModal('login');
    showToast('Please sign in to register for community restoration drives.');
    return;
  }
  const act = activities.find(a => a.id === actId);
  if (act) {
    act.registered++;
    state.currentUser.ecoPoints = (state.currentUser.ecoPoints || 0) + 30;
    localStorage.setItem(CITIZEN_STORAGE_KEY, JSON.stringify(state.currentUser));
    updateAuthUI();
    renderActivities();
    showToast(`🌿 RSVP Confirmed for ${act.title}! +30 Eco-Points awarded.`);
  }
}

// Navigation Tab Switcher
function setupNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });
}

function switchTab(tabName) {
  state.activeTab = tabName;

  // If user clicked report and is not logged in, show auth gate cleanly
  if (tabName === 'report' && !state.currentUser) {
    updateAuthUI();
  }

  // Update Nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Switch Sections
  document.querySelectorAll('.portal-section').forEach(sec => sec.classList.remove('active'));
  const activeSec = document.getElementById(`section-${tabName}`);
  if (activeSec) {
    activeSec.classList.add('active');
  }

  // Trigger leaflet resize when switching to map tab
  if (tabName === 'map' && state.mapInstance) {
    setTimeout(() => {
      state.mapInstance.invalidateSize();
    }, 200);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Setup Event Listeners
function setupEventListeners() {
  // Tracker Filter pills
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const status = pill.getAttribute('data-status');
      const search = document.getElementById('tracker-search-input')?.value || '';
      renderIncidentTracker(status, search);
    });
  });

  // Tracker search input
  const searchInput = document.getElementById('tracker-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const activeFilter = document.querySelector('.filter-pill.active')?.getAttribute('data-status') || 'All';
      renderIncidentTracker(activeFilter, e.target.value);
    });
  }

  // Close modals on backdrop click
  window.addEventListener('click', (e) => {
    const authModal = document.getElementById('auth-modal');
    const incModal = document.getElementById('incident-modal');
    if (e.target === authModal) closeAuthModal();
    if (e.target === incModal) closeModal('incident-modal');
  });
}

// Toast Helper
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

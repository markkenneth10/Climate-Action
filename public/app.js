// ClimateAction Web Portal JavaScript
// Cross-Platform Mobile & Web Climate Action Reporting and Information System

// Core Data Store
const state = {
  activeTab: 'dashboard',
  currentRole: 'citizen',
  userPoints: 120,
  uploadedPhotoData: null,
  mapInstance: null,
  mapMarkers: [],
  reports: [
    {
      id: "ECO-2026-1001",
      title: "Massive plastic dumping along Makilas Riverbank",
      description: "Severe accumulation of single-use plastic, nylon bags, and domestic refuse obstructing downstream waterflow and threatening local fish nursery.",
      category: "Improper waste disposal",
      severity: "Critical",
      barangay: "Barangay Makilas",
      landmark: "Near Makilas Spillway, Sitio Ilaya",
      latitude: 14.6520,
      longitude: 121.0540,
      status: "In Progress",
      assignedTo: "CENRO River Cleanup Taskforce Alpha",
      statusRemarks: "Excavator and 3 sanitation dump trucks deployed to dredge riverbank.",
      submittedBy: "Juan Dela Cruz",
      timestamp: Date.now() - 3600000 * 28,
      photoUrl: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "ECO-2026-1002",
      title: "Unauthorized felling of mature hardwood trees",
      description: "Chainsaw logging observed near mountain watershed boundary. At least 12 indigenous narra and mahogany trees cut down without DENR clearance.",
      category: "Illegal cutting of trees",
      severity: "Critical",
      barangay: "Barangay San Isidro",
      landmark: "Kilometer 14, Upper Ridge Road",
      latitude: 14.6710,
      longitude: 121.0720,
      status: "Verified",
      assignedTo: "DENR Forest Protection Officers & PNP Maritime/BDRRMC",
      statusRemarks: "Field inspection conducted. Cease and desist order issued to property developer.",
      submittedBy: "Maria Santos",
      timestamp: Date.now() - 3600000 * 46,
      photoUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "ECO-2026-1003",
      title: "Open burning of agricultural yard waste and tires",
      description: "Heavy noxious black smoke billowing across residential subdivisions causing respiratory distress among children and elderly residents.",
      category: "Open burning",
      severity: "High",
      barangay: "Barangay Bagong Silang",
      landmark: "Purok 4 behind rice granary",
      latitude: 14.6380,
      longitude: 121.0420,
      status: "Resolved",
      assignedTo: "Barangay Tanod Environmental Enforcers",
      statusRemarks: "Fire extinguished by BFP. Citation ticket issued under RA 9003 Section 48.",
      submittedBy: "Carlos Mendoza",
      timestamp: Date.now() - 3600000 * 72,
      photoUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "ECO-2026-1004",
      title: "Severe flash flooding due to choked storm drainage",
      description: "Main storm canal clogged with construction gravel and discarded packaging. Floodwaters rising above knee-level during 30-minute tropical rain.",
      category: "Flooding",
      severity: "High",
      barangay: "Barangay Tabing Ilog",
      landmark: "Corner Mabini St & River Drive",
      latitude: 14.6460,
      longitude: 121.0610,
      status: "Resolved",
      assignedTo: "City Engineering Office & CDRRMO Disaster Quick Response",
      statusRemarks: "High-pressure jetting truck cleared culvert blockages. Flow restored.",
      submittedBy: "Elena Ramos",
      timestamp: Date.now() - 3600000 * 96,
      photoUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "ECO-2026-1005",
      title: "Industrial chemical discharge into creek",
      description: "Discolored purple effluent with pungent ammonia odor flowing directly into public tributary leading to agricultural irrigation canals.",
      category: "Water pollution",
      severity: "Critical",
      barangay: "Barangay Riverside",
      landmark: "Behind Industrial Park Sector 3",
      latitude: 14.6590,
      longitude: 121.0350,
      status: "Under Review",
      assignedTo: "City Environmental Management Bureau & Water Quality Division",
      statusRemarks: "Water samples extracted for laboratory analysis and biological oxygen demand test.",
      submittedBy: "Engr. Danilo Cruz",
      timestamp: Date.now() - 3600000 * 12,
      photoUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "ECO-2026-1006",
      title: "Severe urban heat island due to asphalt coverage",
      description: "Unshaded commercial corridor reaching surface temperature of 44°C. Lack of street trees and public cooling stations.",
      category: "Extreme heat vulnerability",
      severity: "Moderate",
      barangay: "Barangay Malinis",
      landmark: "Central Commercial Plaza",
      latitude: 14.6640,
      longitude: 121.0510,
      status: "Submitted",
      assignedTo: "City Planning & Urban Greening Office",
      statusRemarks: "Initial assessment logged for municipal tree canopy expansion program.",
      submittedBy: "Patricia Lee",
      timestamp: Date.now() - 3600000 * 6,
      photoUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "ECO-2026-1007",
      title: "Dry community well and ground contamination",
      description: "Subterranean water pump inoperative for 5 days. Community of 140 families lacking potable drinking water.",
      category: "Water shortage",
      severity: "Moderate",
      barangay: "Barangay Pag-asa",
      landmark: "Sitio Riverside Purok 1",
      latitude: 14.6310,
      longitude: 121.0550,
      status: "Resolved",
      assignedTo: "Metro Water Utility & Municipal Disaster Relief",
      statusRemarks: "Emergency water tankers deployed and pump motor replaced.",
      submittedBy: "Antonio Garcia",
      timestamp: Date.now() - 3600000 * 120,
      photoUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "ECO-2026-1008",
      title: "Heavy black smoke emissions from metal recycling furnace",
      description: "Unfiltered smokestack releasing dense soot particulate matter directly into adjacent elementary school grounds.",
      category: "Air pollution",
      severity: "High",
      barangay: "Barangay Riverside",
      landmark: "Lot 18 Industrial East",
      latitude: 14.6605,
      longitude: 121.0375,
      status: "In Progress",
      assignedTo: "DENR Clean Air Monitoring Taskforce",
      statusRemarks: "Continuous emission monitoring system (CEMS) inspection initiated.",
      submittedBy: "Teresa Morales",
      timestamp: Date.now() - 3600000 * 18,
      photoUrl: "https://images.unsplash.com/photo-1584281722572-8d76db841f39?auto=format&fit=crop&w=600&q=80"
    }
  ],
  articles: [
    {
      id: "art-1",
      title: "Understanding Urban Heat Islands & Heat Stress Mitigation",
      category: "Climate Resilience",
      readTime: 4,
      icon: "☀️",
      summary: "How replacing vegetation with asphalt amplifies temperature by 4-7°C and evidence-based municipal countermeasures.",
      content: "Urban heat islands occur when cities replace natural land cover with dense concentrations of pavement, buildings, and surfaces that absorb and retain heat. In tropical metropolitan areas like Metro Verde, nighttime temperatures remain elevated by up to 5°C, preventing human physiological recovery and elevating cardiovascular risks.\n\nStrategies to counter urban heat islands include increasing tree canopy cover to at least 30%, mandating cool reflective roofs, implementing bioswales, and creating shaded pedestrian corridors along school and transit zones.",
      tips: [
        "Plant native shade trees (such as Narra, Banaba, and Molave) around southern and western building exposures.",
        "Use light-colored or reflective paint coatings on residential rooftops.",
        "Incorporate permeable pavers to facilitate groundwater cooling through evapotranspiration."
      ],
      references: "IPCC 6th Assessment Report (WGII), PAGASA Climate Projections (2024), WHO Urban Health Guidelines."
    },
    {
      id: "art-2",
      title: "Mangrove Bioshields & Blue Carbon Coastal Protection",
      category: "Ecosystem Restoration",
      readTime: 5,
      icon: "🌊",
      summary: "Mangrove root architectures dissipate up to 66% of typhoon wave energy while sequestering carbon 5x faster than terrestrial forests.",
      content: "Mangroves serve as the first line of natural defense for coastal Philippine barangays. Their prop root networks attenuate storm surge velocity, trap suspended sediments, prevent coastal erosion, and provide essential spawning nurseries for 75% of commercial fish species.\n\nFurthermore, mangrove ecosystems represent critical 'Blue Carbon' sinks, capturing organic carbon in waterlogged, anaerobic soils where decomposition is extremely slow, locking away carbon for millennia.",
      tips: [
        "Participate only in scientifically verified mangrove planting using site-appropriate species (Rhizophora vs. Avicennia).",
        "Never clear seagrass beds or natural mudflats to plant mangroves.",
        "Report illegal coastal mangrove reclamation to CENRO."
      ],
      references: "DENR Coastal and Marine Ecosystems Management Program (CMEMP), UNEP Blue Carbon Report."
    },
    {
      id: "art-3",
      title: "Ecological Solid Waste Management (RA 9003) & Zero-Waste",
      category: "Waste Management",
      readTime: 3,
      icon: "♻️",
      summary: "Comprehensive guide to source segregation, biodegradable composting, and eliminating open dumpsites.",
      content: "Republic Act 9003 mandates that waste segregation must be conducted at the source (household, business, or institution). Over 52% of Philippine municipal solid waste consists of biodegradable organics that can be transformed into nutrient-rich compost, preventing methane generation at landfills.\n\nSingle-use plastics clog waterways, fragment into hazardous microplastics, and choke aquatic ecosystems.",
      tips: [
        "Implement mandatory 3-stream segregation: Biodegradable, Recyclable, and Residual/Special Waste.",
        "Establish community composting bins for fruit rinds, vegetable clippings, and dry leaves.",
        "Bring reusable canvas bags and tumblers to public wet markets."
      ],
      references: "RA 9003 Philippine Ecological Solid Waste Management Act, National Solid Waste Management Commission."
    },
    {
      id: "art-4",
      title: "Community Disaster Preparedness & Typhoons Resilience",
      category: "Disaster Preparedness",
      readTime: 4,
      icon: "🌀",
      summary: "Pre-disaster risk reduction protocols, Go-Bag checklists, and barangay early warning siren systems.",
      content: "With an average of 20 tropical cyclones entering the Philippine Area of Responsibility each year, community-level disaster preparedness saves lives. Climate change intensifies typhoon rainfall rates and accelerates rapid intensification over warm ocean waters.",
      tips: [
        "Prepare a 72-hour family Go-Bag with potable water, non-perishable food, flashlight, power bank, and vital medicine.",
        "Clear household roof gutters and secure loose corrugated sheets before storm signals reach Signal No. 2.",
        "Heed preemptive evacuation advisories issued by your local BDRRMC without delay."
      ],
      references: "NDRRMC National Disaster Risk Reduction & Management Framework, PAGASA Severe Weather Protocols."
    }
  ],
  activities: [
    {
      id: "act-1",
      title: "River Basin Mangrove & Bamboo Reforestation",
      category: "Tree Planting",
      dateText: "Saturday, Sept 26 • 6:30 AM",
      barangay: "Barangay Makilas (Riverbank Sector)",
      maxParticipants: 100,
      currentParticipants: 84,
      rewardPoints: 30,
      icon: "🌱",
      isRegistered: false,
      description: "Join community volunteers and CENRO rangers in planting 500 giant bamboo and endemic riverside saplings to stabilize the Makilas riverbank against erosion."
    },
    {
      id: "act-2",
      title: "Coastal Plastic Recovery & Microplastic Survey",
      category: "Clean-up Drive",
      dateText: "Sunday, Oct 4 • 7:00 AM",
      barangay: "Barangay Bagong Silang (Fisherfolk Wharf)",
      maxParticipants: 80,
      currentParticipants: 62,
      rewardPoints: 20,
      icon: "🌊",
      isRegistered: false,
      description: "Collect marine debris, audit single-use plastics under international ICC standards, and clear coastal nesting grounds."
    },
    {
      id: "act-3",
      title: "Community Seed Bomb & Backyard Composting Workshop",
      category: "Zero-Waste Workshop",
      dateText: "Saturday, Oct 10 • 9:00 AM",
      barangay: "Barangay Malinis (Community Center)",
      maxParticipants: 50,
      currentParticipants: 38,
      rewardPoints: 15,
      icon: "🪴",
      isRegistered: false,
      description: "Hands-on tutorial creating clay seed balls with native tree seeds for aerial dispersal in denuded watershed sectors."
    }
  ],
  quizQuestions: [
    {
      id: 1,
      category: "Climate Science",
      question: "Which greenhouse gas has the largest overall warming effect on Earth due to its abundance, despite CO2 being the primary driver of anthropogenic climate change?",
      options: [
        "Water vapor (H2O)",
        "Methane (CH4)",
        "Nitrous oxide (N2O)",
        "Sulfur hexafluoride (SF6)"
      ],
      correctIndex: 0,
      explanation: "Water vapor is the most abundant greenhouse gas in the atmosphere, creating a powerful positive feedback loop as rising temperatures increase evaporation."
    },
    {
      id: 2,
      category: "Environmental Law",
      question: "Under Philippine Republic Act 9003, which of the following acts is explicitly prohibited and subject to municipal fines or imprisonment?",
      options: [
        "Composting biodegradable food scraps in gardens",
        "Open burning of solid waste and agricultural residues",
        "Returning glass beverage bottles for deposit",
        "Using solar panels on residential roofs"
      ],
      correctIndex: 1,
      explanation: "Section 48 of RA 9003 strictly prohibits open burning (siga) of solid waste due to toxic dioxins and particulate air pollution."
    },
    {
      id: 3,
      category: "Urban Resilience",
      question: "What is an effective nature-based solution to mitigate the Urban Heat Island effect in densely built barangays?",
      options: [
        "Paving open lots with dark asphalt",
        "Increasing urban tree canopy cover and green bioswales",
        "Running diesel air conditioning outdoors",
        "Removing roadside shrubs to widen vehicle lanes"
      ],
      correctIndex: 1,
      explanation: "Tree canopy and vegetation provide shade and cooling through evapotranspiration, reducing ambient temperatures by up to 5°C."
    },
    {
      id: 4,
      category: "Ecosystem Restoration",
      question: "Why are mangrove ecosystems referred to as 'Blue Carbon' reservoirs in climate mitigation strategies?",
      options: [
        "Their leaves turn blue during severe tropical droughts",
        "They capture and store massive amounts of carbon in sediment for centuries",
        "They only grow in deep oceanic trenches",
        "They release oxygen only at nighttime"
      ],
      correctIndex: 1,
      explanation: "Mangrove soils are waterlogged and oxygen-poor, preventing the breakdown of organic material and locking away carbon up to 5x faster than terrestrial tropical forests."
    },
    {
      id: 5,
      category: "Disaster Preparedness",
      question: "According to PAGASA and NDRRMC disaster protocols, what should a standard household emergency Go-Bag contain at minimum?",
      options: [
        "Only expensive electronic entertainment devices",
        "72 hours of water, non-perishable food, flashlight, first aid, and documents",
        "A full set of winter clothing and skis",
        "One week of perishable cooked meats"
      ],
      correctIndex: 1,
      explanation: "A standard Go-Bag provides critical sustenance for the first 72 hours following a disaster before municipal relief operations fully establish."
    }
  ],
  quizCurrentIndex: 0,
  quizSelectedOption: null,
  quizScore: 0,
  quizSubmitted: false,
  quizFinished: false
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initRoleSwitcher();
  renderDashboard();
  renderTracker();
  renderArticles();
  renderQuiz();
  renderActivities();
  renderAdminTable();
  updateKPIs();
});

// Navigation Tab Switching
function initNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tabName = btn.getAttribute('data-tab');
      switchTab(tabName);
    });
  });

  document.getElementById('btn-show-thesis-summary').addEventListener('click', () => {
    openModal('thesis-modal');
  });

  // Photo Uploader Drag & Drop
  const dropBox = document.getElementById('photo-upload-box');
  ['dragenter', 'dragover'].forEach(eventName => {
    dropBox.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropBox.style.borderColor = 'var(--emerald)';
      dropBox.style.background = 'var(--primary-tint)';
    });
  });
  ['dragleave', 'drop'].forEach(eventName => {
    dropBox.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropBox.style.borderColor = 'var(--border)';
      dropBox.style.background = 'var(--surface-alt)';
    });
  });
  dropBox.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      previewFile(files[0]);
    }
  });

  // Form submission
  document.getElementById('report-form').addEventListener('submit', handleReportSubmit);

  // Search input in tracker
  document.getElementById('tracker-search-input').addEventListener('input', (e) => {
    renderTracker(e.target.value);
  });

  // Filter pills in tracker
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const status = pill.getAttribute('data-status');
      renderTracker(document.getElementById('tracker-search-input').value, status);
    });
  });
}

function switchTab(tabName) {
  state.activeTab = tabName;

  // Update navigation buttons
  document.querySelectorAll('.nav-btn').forEach(b => {
    if (b.getAttribute('data-tab') === tabName) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  // Update section visibility
  document.querySelectorAll('.portal-section').forEach(sec => {
    sec.classList.remove('active');
  });
  const targetSection = document.getElementById(`section-${tabName}`);
  if (targetSection) {
    targetSection.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // If map tab, initialize or invalidate map sizing
  if (tabName === 'map') {
    setTimeout(initOrRefreshMap, 150);
  }
}

// User Role Switcher
function initRoleSwitcher() {
  const select = document.getElementById('user-role-select');
  select.addEventListener('change', (e) => {
    state.currentRole = e.target.value;
    showToast(`Switched active user role to: ${select.options[select.selectedIndex].text}`);
    if (state.currentRole === 'admin' || state.currentRole === 'officer') {
      switchTab('admin');
    }
  });
}

// Render Dashboard
function renderDashboard() {
  const recentList = document.getElementById('dashboard-recent-list');
  recentList.innerHTML = '';

  state.reports.slice(0, 3).forEach(rep => {
    const item = document.createElement('div');
    item.style.padding = '0.75rem';
    item.style.border = '1px solid var(--border)';
    item.style.borderRadius = 'var(--radius-md)';
    item.style.background = 'var(--surface-alt)';
    item.style.cursor = 'pointer';
    item.onclick = () => openReportDetail(rep.id);

    item.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
        <span class="badge ${getSeverityBadgeClass(rep.severity)}">${rep.severity}</span>
        <span class="badge-status ${getStatusBadgeClass(rep.status)}">${rep.status}</span>
      </div>
      <div style="font-weight:700; font-size:0.88rem; color:var(--text-main); margin-bottom:0.2rem;">${escapeHtml(rep.title)}</div>
      <div style="font-size:0.75rem; color:var(--text-muted);">${rep.barangay} • ${rep.category}</div>
    `;
    recentList.appendChild(item);
  });

  // Top Vulnerable Barangays
  const hotspotList = document.getElementById('dashboard-hotspot-list');
  hotspotList.innerHTML = '';
  const counts = {};
  state.reports.forEach(r => {
    counts[r.barangay] = (counts[r.barangay] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 4);

  sorted.forEach(([bgy, count]) => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.style.alignItems = 'center';
    row.style.padding = '0.5rem 0.75rem';
    row.style.background = 'var(--surface-alt)';
    row.style.borderRadius = 'var(--radius-sm)';

    row.innerHTML = `
      <span style="font-size:0.85rem; font-weight:600;">📍 ${bgy}</span>
      <span style="font-size:0.75rem; font-weight:700; background:var(--primary-tint); color:var(--primary); padding:0.15rem 0.5rem; border-radius:999px;">${count} Incidents</span>
    `;
    hotspotList.appendChild(row);
  });

  // Upcoming Activities preview
  const actList = document.getElementById('dashboard-activity-list');
  actList.innerHTML = '';
  state.activities.slice(0, 2).forEach(act => {
    const item = document.createElement('div');
    item.style.padding = '0.75rem';
    item.style.border = '1px solid var(--border)';
    item.style.borderRadius = 'var(--radius-md)';
    item.style.background = 'var(--surface-alt)';

    item.innerHTML = `
      <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
        <span style="font-size:1.2rem;">${act.icon}</span>
        <span style="font-weight:700; font-size:0.85rem;">${act.title}</span>
      </div>
      <div style="font-size:0.75rem; color:var(--text-muted);">${act.dateText}</div>
    `;
    actList.appendChild(item);
  });
}

// Render Incident Tracker
function renderTracker(searchQuery = '', statusFilter = 'All') {
  const container = document.getElementById('tracker-reports-grid');
  container.innerHTML = '';

  let filtered = state.reports;
  if (statusFilter && statusFilter !== 'All') {
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

  document.getElementById('count-all').innerText = state.reports.length;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: #fff; border-radius: var(--radius-lg); border: 1px solid var(--border);">
        <p style="font-size: 1.5rem; margin-bottom: 0.5rem;">🔍</p>
        <h4 style="font-weight: 700; color: var(--text-main);">No reports match your filters</h4>
        <p style="font-size: 0.85rem; color: var(--text-muted);">Try adjusting your search terms or filter criteria.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(rep => {
    const card = document.createElement('div');
    card.className = 'report-card';
    card.onclick = () => openReportDetail(rep.id);

    card.innerHTML = `
      <div>
        <div class="report-header">
          <span class="report-category">${rep.category}</span>
          <span class="badge ${getSeverityBadgeClass(rep.severity)}">${rep.severity}</span>
        </div>
        <h4 class="report-title">${escapeHtml(rep.title)}</h4>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin: 0.5rem 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
          ${escapeHtml(rep.description)}
        </p>
      </div>

      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 0.65rem; margin-top: 0.5rem;">
          <div class="report-meta">
            <span>📍 ${rep.barangay}</span>
            <span>🆔 ${rep.id}</span>
          </div>
          <span class="badge-status ${getStatusBadgeClass(rep.status)}">${rep.status}</span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Leaflet GIS Map
function initOrRefreshMap() {
  const container = document.getElementById('web-map-container');
  if (!container) return;

  if (!state.mapInstance) {
    // Metro Verde coordinate center (14.6520, 121.0540)
    state.mapInstance = L.map('web-map-container').setView([14.6530, 121.0520], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors'
    }).addTo(state.mapInstance);
  } else {
    state.mapInstance.invalidateSize();
  }

  // Clear existing markers
  state.mapMarkers.forEach(m => state.mapInstance.removeLayer(m));
  state.mapMarkers = [];

  // Add Incident Pins
  state.reports.forEach(rep => {
    const pinColor = getSeverityColor(rep.severity);
    
    // Custom SVG circle marker
    const marker = L.circleMarker([rep.latitude, rep.longitude], {
      radius: rep.severity === 'Critical' ? 12 : 9,
      fillColor: pinColor,
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9
    }).addTo(state.mapInstance);

    const popupHtml = `
      <div style="font-family: inherit; min-width: 180px;">
        <div style="font-size: 0.7rem; font-weight: 700; color: ${pinColor}; text-transform: uppercase;">${rep.severity} • ${rep.category}</div>
        <div style="font-size: 0.85rem; font-weight: 800; margin: 0.2rem 0;">${escapeHtml(rep.title)}</div>
        <div style="font-size: 0.75rem; color: #64748B;">📍 ${rep.barangay}</div>
        <div style="margin-top: 0.4rem;">
          <span style="font-size: 0.7rem; padding: 0.15rem 0.4rem; background: #E2E8F0; border-radius: 4px; font-weight: 700;">${rep.status}</span>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml);
    marker.on('click', () => {
      displayMapPinDetail(rep);
    });

    state.mapMarkers.push(marker);
  });
}

function displayMapPinDetail(rep) {
  const box = document.getElementById('map-pin-detail-box');
  box.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="badge ${getSeverityBadgeClass(rep.severity)}">${rep.severity} Priority</span>
        <span class="badge-status ${getStatusBadgeClass(rep.status)}">${rep.status}</span>
      </div>
      <h4 style="font-size: 0.95rem; font-weight: 800; color: var(--text-main);">${escapeHtml(rep.title)}</h4>
      <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.5;">${escapeHtml(rep.description)}</p>
      <div style="font-size: 0.75rem; color: var(--text-muted); background: var(--surface-alt); padding: 0.5rem; border-radius: var(--radius-sm);">
        <div>📍 <strong>Location:</strong> ${rep.barangay} (${rep.landmark})</div>
        <div>👥 <strong>Assigned Unit:</strong> ${rep.assignedTo}</div>
      </div>
      <button class="btn-outline" style="width:100%;" onclick="openReportDetail('${rep.id}')">Inspect Full Audit Trail</button>
    </div>
  `;
}

// Photo Handling
function triggerPhotoPick() {
  document.getElementById('photo-file-input').click();
}

function handlePhotoUpload(input) {
  if (input.files && input.files[0]) {
    previewFile(input.files[0]);
  }
}

function previewFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    state.uploadedPhotoData = e.target.result;
    const previewImg = document.getElementById('photo-preview-img');
    const placeholder = document.getElementById('photo-placeholder-content');
    previewImg.src = state.uploadedPhotoData;
    previewImg.style.display = 'block';
    placeholder.style.display = 'none';
    showToast("📸 Photographic evidence attached with geotag");
  };
  reader.readAsDataURL(file);
}

// Handle Report Submission
function handleReportSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('report-title').value.trim();
  const description = document.getElementById('report-description').value.trim();
  const category = document.getElementById('report-category').value;
  const barangay = document.getElementById('report-barangay').value;
  const landmark = document.getElementById('report-landmark').value.trim() || "Nearby community road";
  
  const sevRadio = document.querySelector('input[name="report-severity"]:checked');
  const severity = sevRadio ? sevRadio.value : 'Moderate';

  // Generate unique Ticket ID
  const newId = `ECO-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  // Approximate localized coordinates around Metro Verde
  const latOffset = (Math.random() - 0.5) * 0.03;
  const lngOffset = (Math.random() - 0.5) * 0.03;

  const newReport = {
    id: newId,
    title,
    description,
    category,
    severity,
    barangay,
    landmark,
    latitude: 14.6530 + latOffset,
    longitude: 121.0520 + lngOffset,
    status: "Submitted",
    assignedTo: "Barangay BDRRMC Initial Assessment Desk",
    statusRemarks: "Report received via ClimateAction Web Portal. Queued for technical verification.",
    submittedBy: "Juan Dela Cruz (Web Citizen)",
    timestamp: Date.now(),
    photoUrl: state.uploadedPhotoData || "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=600&q=80"
  };

  // Prepend new report to state
  state.reports.unshift(newReport);
  state.userPoints += 10;

  // Reset form
  document.getElementById('report-form').reset();
  document.getElementById('photo-preview-img').style.display = 'none';
  document.getElementById('photo-placeholder-content').style.display = 'block';
  state.uploadedPhotoData = null;

  // Refresh UI
  updateKPIs();
  renderDashboard();
  renderTracker();
  renderAdminTable();

  showToast(`✅ Report ${newId} submitted! +10 Climate Points added to your profile.`);

  // Switch to tracker tab to see the report
  setTimeout(() => {
    switchTab('tracker');
    openReportDetail(newId);
  }, 700);
}

// Open Detailed Report Modal
function openReportDetail(reportId) {
  const rep = state.reports.find(r => r.id === reportId);
  if (!rep) return;

  const body = document.getElementById('modal-incident-body');
  body.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
      <div>
        <span class="report-category">${rep.category}</span>
        <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin-top: 0.2rem;">${escapeHtml(rep.title)}</h3>
      </div>
      <span class="badge ${getSeverityBadgeClass(rep.severity)}">${rep.severity}</span>
    </div>

    <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem;">
      Ticket ID: <strong>${rep.id}</strong> • Submitted by: <strong>${rep.submittedBy}</strong> • ${new Date(rep.timestamp).toLocaleString()}
    </div>

    <!-- 6-Stage Workflow Tracker -->
    <div class="workflow-track" style="margin-bottom: 1.25rem;">
      ${renderWorkflowStep(rep.status, "Submitted", 1)}
      ${renderWorkflowStep(rep.status, "Under Review", 2)}
      ${renderWorkflowStep(rep.status, "Verified", 3)}
      ${renderWorkflowStep(rep.status, "In Progress", 4)}
      ${renderWorkflowStep(rep.status, "Resolved", 5)}
      ${renderWorkflowStep(rep.status, "Closed", 6)}
    </div>

    <!-- Evidence & Content -->
    <div style="display: flex; gap: 1rem; flex-direction: column;">
      ${rep.photoUrl ? `
        <div style="border-radius: var(--radius-md); overflow: hidden; max-height: 240px;">
          <img src="${rep.photoUrl}" style="width: 100%; height: 240px; object-fit: cover;" alt="Evidence photo">
        </div>
      ` : ''}

      <div class="card" style="background: var(--surface-alt);">
        <h4 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.4rem;">Incident Details & Public Risk</h4>
        <p style="font-size: 0.85rem; color: var(--text-main); line-height: 1.6;">${escapeHtml(rep.description)}</p>
        <div style="margin-top: 0.75rem; font-size: 0.8rem; color: var(--text-muted);">
          📍 <strong>Geographic Coordinates:</strong> ${rep.latitude.toFixed(4)}, ${rep.longitude.toFixed(4)} (${rep.barangay}, ${rep.landmark})
        </div>
      </div>

      <!-- Investigation & Resolution Log -->
      <div class="card" style="border-left: 4px solid var(--primary);">
        <h4 style="font-size: 0.85rem; font-weight: 700; color: var(--primary-dark); margin-bottom: 0.35rem;">
          🛡️ LGU & CENRO Inspection Log
        </h4>
        <p style="font-size: 0.82rem; color: var(--text-main); margin-bottom: 0.4rem;">
          ${escapeHtml(rep.statusRemarks)}
        </p>
        <div style="font-size: 0.75rem; color: var(--text-muted);">
          <strong>Assigned Unit:</strong> ${rep.assignedTo}
        </div>
      </div>
    </div>
  `;

  openModal('incident-modal');
}

function renderWorkflowStep(currentStatus, stepName, stepNumber) {
  const order = ["Submitted", "Under Review", "Verified", "In Progress", "Resolved", "Closed"];
  const currentIndex = order.indexOf(currentStatus);
  const thisIndex = order.indexOf(stepName);

  let stateClass = "";
  if (thisIndex < currentIndex) stateClass = "completed";
  else if (thisIndex === currentIndex) stateClass = "current";

  return `
    <div class="workflow-step ${stateClass}">
      <div class="step-node">${thisIndex < currentIndex ? '✓' : stepNumber}</div>
      <div class="step-label">${stepName}</div>
    </div>
  `;
}

// Render Education Articles
function renderArticles() {
  const container = document.getElementById('articles-grid');
  container.innerHTML = '';

  state.articles.forEach(art => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.justifyContent = 'space-between';

    card.innerHTML = `
      <div>
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">${art.icon}</div>
        <span style="font-size: 0.75rem; font-weight: 700; color: var(--primary); text-transform: uppercase;">${art.category}</span>
        <h3 style="font-size: 1.05rem; font-weight: 800; margin: 0.25rem 0 0.5rem;">${art.title}</h3>
        <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.6;">${art.summary}</p>
      </div>

      <div style="margin-top: 1rem; border-top: 1px solid var(--border); padding-top: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.75rem; color: var(--text-muted);">⏱️ ${art.readTime} min read</span>
        <button class="btn-outline" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;" onclick="openArticleModal('${art.id}')">Read Guide</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function openArticleModal(articleId) {
  const art = state.articles.find(a => a.id === articleId);
  if (!art) return;

  const body = document.getElementById('modal-incident-body');
  body.innerHTML = `
    <div style="margin-bottom: 1rem;">
      <span style="font-size: 2rem;">${art.icon}</span>
      <div style="font-size: 0.8rem; font-weight: 700; color: var(--primary); text-transform: uppercase; margin-top: 0.25rem;">${art.category} • ${art.readTime} min read</div>
      <h2 style="font-size: 1.35rem; font-weight: 800; color: var(--text-main); margin-top: 0.25rem;">${art.title}</h2>
    </div>

    <div class="card" style="background: var(--primary-tint); border-color: #A7F3D0; margin-bottom: 1rem;">
      <p style="font-size: 0.85rem; color: var(--primary-dark); font-weight: 600; line-height: 1.6;">${art.summary}</p>
    </div>

    <div style="font-size: 0.85rem; color: var(--text-main); line-height: 1.7; margin-bottom: 1.25rem; white-space: pre-line;">
      ${art.content}
    </div>

    <div class="card" style="background: var(--surface-alt); margin-bottom: 1rem;">
      <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--primary-dark); margin-bottom: 0.5rem;">🌱 Community Action Tips:</h4>
      <ul style="font-size: 0.82rem; padding-left: 1.2rem; line-height: 1.6;">
        ${art.tips.map(t => `<li>${t}</li>`).join('')}
      </ul>
    </div>

    <div style="font-size: 0.75rem; color: var(--text-muted); border-top: 1px solid var(--border); padding-top: 0.5rem;">
      📚 <strong>Academic & Agency Citations:</strong> ${art.references}
    </div>
  `;
  openModal('incident-modal');
}

// Climate Quiz
function renderQuiz() {
  const box = document.getElementById('quiz-container');
  const q = state.quizQuestions[state.quizCurrentIndex];
  const total = state.quizQuestions.length;

  if (state.quizFinished) {
    box.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">🏆</div>
        <h3 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 0.25rem;">Quiz Mastered!</h3>
        <p style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 1rem;">
          You scored <strong>${state.quizScore} out of ${total}</strong> questions correctly.
        </p>
        <div style="display: inline-block; background: #FEF3C7; color: #92400E; font-size: 0.85rem; font-weight: 700; padding: 0.5rem 1rem; border-radius: 999px; margin-bottom: 1.5rem;">
          🎉 +10 Climate Points Awarded
        </div>
        <br>
        <button class="btn-primary" onclick="restartQuiz()">Restart Quiz</button>
      </div>
    `;
    return;
  }

  box.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
      <span class="badge" style="background: var(--primary-tint); color: var(--primary);">${q.category}</span>
      <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Question ${state.quizCurrentIndex + 1} of ${total}</span>
    </div>

    <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--text-main); margin-bottom: 1.25rem; line-height: 1.5;">
      ${q.question}
    </h3>

    <div style="display: flex; flex-direction: column; gap: 0.65rem; margin-bottom: 1.25rem;">
      ${q.options.map((opt, idx) => {
        let optClass = "quiz-option";
        if (state.quizSelectedOption === idx) optClass += " selected";
        if (state.quizSubmitted) {
          if (idx === q.correctIndex) optClass += " correct";
          else if (state.quizSelectedOption === idx && idx !== q.correctIndex) optClass += " wrong";
        }
        return `
          <div class="${optClass}" onclick="selectQuizOption(${idx})">
            <span style="width: 24px; height: 24px; border-radius: 50%; background: #E2E8F0; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem;">
              ${['A','B','C','D'][idx]}
            </span>
            <span>${opt}</span>
          </div>
        `;
      }).join('')}
    </div>

    ${state.quizSubmitted ? `
      <div class="card" style="background: var(--surface-alt); margin-bottom: 1.25rem;">
        <h4 style="font-size: 0.85rem; font-weight: 700; color: ${state.quizSelectedOption === q.correctIndex ? 'var(--primary)' : 'var(--severity-critical)'}; margin-bottom: 0.25rem;">
          ${state.quizSelectedOption === q.correctIndex ? '✓ Correct Answer!' : '✕ Incorrect'}
        </h4>
        <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.5;">${q.explanation}</p>
      </div>
      <button class="btn-primary" style="width: 100%; justify-content: center;" onclick="nextQuizQuestion()">
        ${state.quizCurrentIndex + 1 < total ? 'Next Question →' : 'Finish Quiz & Claim Points 🏆'}
      </button>
    ` : `
      <button class="btn-primary" style="width: 100%; justify-content: center;" onclick="submitQuizAnswer()" ${state.quizSelectedOption === null ? 'disabled' : ''}>
        Submit Answer
      </button>
    `}
  `;
}

function selectQuizOption(idx) {
  if (state.quizSubmitted) return;
  state.quizSelectedOption = idx;
  renderQuiz();
}

function submitQuizAnswer() {
  if (state.quizSelectedOption === null) return;
  state.quizSubmitted = true;
  const q = state.quizQuestions[state.quizCurrentIndex];
  if (state.quizSelectedOption === q.correctIndex) {
    state.quizScore++;
  }
  renderQuiz();
}

function nextQuizQuestion() {
  if (state.quizCurrentIndex + 1 < state.quizQuestions.length) {
    state.quizCurrentIndex++;
    state.quizSelectedOption = null;
    state.quizSubmitted = false;
  } else {
    state.quizFinished = true;
    state.userPoints += 10;
    showToast("🏆 Quiz finished! +10 points added.");
  }
  renderQuiz();
}

function restartQuiz() {
  state.quizCurrentIndex = 0;
  state.quizSelectedOption = null;
  state.quizScore = 0;
  state.quizSubmitted = false;
  state.quizFinished = false;
  renderQuiz();
}

// Community Activities
function renderActivities() {
  const container = document.getElementById('activities-grid');
  container.innerHTML = '';

  state.activities.forEach(act => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.justifyContent = 'space-between';

    card.innerHTML = `
      <div>
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">${act.icon}</div>
        <span style="font-size: 0.75rem; font-weight: 700; color: var(--primary); text-transform: uppercase;">${act.category}</span>
        <h3 style="font-size: 1.05rem; font-weight: 800; margin: 0.25rem 0 0.5rem;">${act.title}</h3>
        <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 0.75rem;">${act.description}</p>
        <div style="font-size: 0.75rem; color: var(--text-muted); background: var(--surface-alt); padding: 0.5rem; border-radius: var(--radius-sm);">
          <div>📅 ${act.dateText}</div>
          <div>📍 ${act.barangay}</div>
          <div>👥 Capacity: ${act.currentParticipants}/${act.maxParticipants} Volunteers</div>
        </div>
      </div>

      <div style="margin-top: 1rem; border-top: 1px solid var(--border); padding-top: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.8rem; font-weight: 700; color: var(--primary);">+${act.rewardPoints} Points</span>
        <button class="${act.isRegistered ? 'btn-outline' : 'btn-primary'}" style="padding: 0.45rem 0.85rem; font-size: 0.8rem;" onclick="toggleActivityRegistration('${act.id}')">
          ${act.isRegistered ? '✓ Registered' : 'Register'}
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function toggleActivityRegistration(actId) {
  const act = state.activities.find(a => a.id === actId);
  if (!act) return;
  act.isRegistered = !act.isRegistered;
  if (act.isRegistered) {
    act.currentParticipants++;
    state.userPoints += act.rewardPoints;
    showToast(`🎉 Registered for ${act.title}! +${act.rewardPoints} points queued.`);
  } else {
    act.currentParticipants--;
    showToast(`Cancelled registration for ${act.title}`);
  }
  renderActivities();
}

// Admin Table & Status Dispatch
function renderAdminTable() {
  const tbody = document.getElementById('admin-incident-table-body');
  tbody.innerHTML = '';

  state.reports.forEach(rep => {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid var(--border)';

    tr.innerHTML = `
      <td style="padding: 0.75rem 1rem; font-weight: 700;">${rep.id}</td>
      <td style="padding: 0.75rem 1rem;">${rep.category}</td>
      <td style="padding: 0.75rem 1rem;"><span class="badge ${getSeverityBadgeClass(rep.severity)}">${rep.severity}</span></td>
      <td style="padding: 0.75rem 1rem;">${rep.barangay}</td>
      <td style="padding: 0.75rem 1rem;">
        <select onchange="updateReportStatusAdmin('${rep.id}', this.value)" style="padding: 0.35rem 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 0.75rem; font-weight: 700;">
          <option value="Submitted" ${rep.status === 'Submitted' ? 'selected' : ''}>Submitted</option>
          <option value="Under Review" ${rep.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
          <option value="Verified" ${rep.status === 'Verified' ? 'selected' : ''}>Verified</option>
          <option value="In Progress" ${rep.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option value="Resolved" ${rep.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
          <option value="Closed" ${rep.status === 'Closed' ? 'selected' : ''}>Closed</option>
        </select>
      </td>
      <td style="padding: 0.75rem 1rem;">
        <button class="btn-outline" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;" onclick="openReportDetail('${rep.id}')">Audit</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function updateReportStatusAdmin(reportId, newStatus) {
  const rep = state.reports.find(r => r.id === reportId);
  if (!rep) return;
  rep.status = newStatus;
  if (newStatus === 'Resolved') {
    rep.statusRemarks = "CENRO & BDRRMC on-ground operations completed. Site cleared and certified resolved.";
  } else if (newStatus === 'In Progress') {
    rep.statusRemarks = "Response personnel dispatched to site. Cleanup and remediation active.";
  }
  updateKPIs();
  renderDashboard();
  renderTracker();
  showToast(`Updated ticket ${reportId} status to: ${newStatus}`);
}

// Helper: Update KPIs
function updateKPIs() {
  const total = state.reports.length;
  const resolved = state.reports.filter(r => r.status === 'Resolved' || r.status === 'Closed').length;
  const critical = state.reports.filter(r => r.severity === 'Critical' || r.severity === 'High').length;
  const pending = state.reports.filter(r => r.status === 'Submitted' || r.status === 'Under Review').length;
  const inProg = state.reports.filter(r => r.status === 'In Progress' || r.status === 'Verified').length;
  const rate = total > 0 ? ((resolved / total) * 100).toFixed(1) : 0;

  document.getElementById('kpi-total-reports').innerText = total;
  document.getElementById('kpi-resolved-reports').innerText = `${resolved} (${rate}%)`;
  document.getElementById('kpi-critical-reports').innerText = critical;

  document.getElementById('admin-kpi-pending').innerText = pending;
  document.getElementById('admin-kpi-progress').innerText = inProg;
  document.getElementById('admin-kpi-resolved').innerText = resolved;
  document.getElementById('admin-kpi-rate').innerText = `${rate}%`;

  document.getElementById('thesis-total-incidents').innerText = total;
  document.getElementById('thesis-resolution-rate').innerText = `${rate}%`;
}

// Thesis Project Summary Export
function exportThesisSummary() {
  openModal('thesis-modal');
}

// Modal controls
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('active');
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('active');
}

// Toast Helper
let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast-message');
  document.getElementById('toast-text').innerText = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('show');
  }, 3500);
}

// Utility styling classes
function getSeverityBadgeClass(sev) {
  switch (sev) {
    case 'Critical': return 'badge-critical';
    case 'High': return 'badge-high';
    case 'Moderate': return 'badge-moderate';
    case 'Low': return 'badge-low';
    default: return 'badge-moderate';
  }
}

function getStatusBadgeClass(st) {
  switch (st) {
    case 'Submitted': return 'status-submitted';
    case 'Under Review': return 'status-under-review';
    case 'Verified': return 'status-verified';
    case 'In Progress': return 'status-in-progress';
    case 'Resolved': return 'status-resolved';
    case 'Closed': return 'status-closed';
    default: return 'status-submitted';
  }
}

function getSeverityColor(sev) {
  switch (sev) {
    case 'Critical': return '#DC2626';
    case 'High': return '#EA580C';
    case 'Moderate': return '#F59E0B';
    case 'Low': return '#10B981';
    default: return '#10B981';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

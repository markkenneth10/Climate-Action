// LGU CENRO Administrative Command Console JavaScript
// Handles Admin Authentication, CMS editing, Weather control, Announcements,
// Sub-Admin delegation, and Super Admin credential settings.

const ADMIN_STORAGE_KEY = 'climate_admin_session';

let currentAdmin = null;
let activeTriageReportId = null;
let allReports = [];
let allUsers = [];
let allSubAdmins = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  checkAdminSession();
});

// Centralized authenticated fetch helper with cookie credentials
async function adminFetch(url, options = {}) {
  const opts = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  };

  const res = await fetch(url, opts);
  if (res.status === 401 && !url.includes('/api/admin/login')) {
    // Session expired or invalid
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    currentAdmin = null;
    showAdminLogin();
  }
  return res;
}

// Session Check: Verify against backend session store
async function checkAdminSession() {
  try {
    const res = await fetch('/api/admin/session', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      if (data.authenticated && data.admin && (data.role === 'super_admin' || data.role === 'sub_admin')) {
        currentAdmin = data.admin;
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(currentAdmin));
        showAdminWorkspace();
        return;
      }
    }
  } catch (e) {
    console.warn('Session verification check failed:', e);
  }

  localStorage.removeItem(ADMIN_STORAGE_KEY);
  currentAdmin = null;
  showAdminLogin();
}

function showAdminLogin() {
  document.getElementById('admin-auth-view').style.display = 'flex';
  document.getElementById('admin-workspace-view').style.display = 'none';
}

function showAdminWorkspace() {
  document.getElementById('admin-auth-view').style.display = 'none';
  document.getElementById('admin-workspace-view').style.display = 'flex';

  // Set Profile info in Topbar
  document.getElementById('admin-profile-name').textContent = currentAdmin.name || 'Administrator';
  document.getElementById('admin-profile-dept').textContent = currentAdmin.department || 'LGU CENRO';

  const badge = document.getElementById('admin-role-badge');
  if (currentAdmin.role === 'super_admin') {
    badge.textContent = '👑 SUPER ADMIN';
    badge.className = 'admin-badge-super';
    document.getElementById('nav-subadmins').style.display = 'flex';
    document.getElementById('nav-settings').style.display = 'flex';
  } else {
    badge.textContent = '🛡️ SUB-ADMIN';
    badge.className = 'admin-badge-sub';
    // Sub-admins cannot see super admin settings or manage sub-admins
    document.getElementById('nav-subadmins').style.display = 'none';
    document.getElementById('nav-settings').style.display = 'none';
  }

  // Load all data
  refreshAllAdminData();
}

// Handle Admin Login
async function handleAdminLogin(e) {
  e.preventDefault();
  const email = document.getElementById('admin-email-input').value.trim();
  const password = document.getElementById('admin-password-input').value.trim();
  const errBox = document.getElementById('admin-login-error');
  errBox.style.display = 'none';

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      errBox.textContent = data.error || 'Administrative login failed';
      errBox.style.display = 'block';
      return;
    }

    currentAdmin = data.admin;
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(currentAdmin));
    showAdminWorkspace();
  } catch (err) {
    errBox.textContent = 'Network error connecting to administrative server';
    errBox.style.display = 'block';
  }
}

// Handle Admin Logout
async function handleAdminLogout() {
  try {
    await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'include'
    });
  } catch (e) {
    console.error('Logout error:', e);
  }
  localStorage.removeItem(ADMIN_STORAGE_KEY);
  currentAdmin = null;
  showAdminLogin();
}

// Tab Switching
function switchAdminTab(tabName) {
  // Update nav buttons
  document.querySelectorAll('.admin-nav-item').forEach(btn => btn.classList.remove('active'));
  const clicked = Array.from(document.querySelectorAll('.admin-nav-item')).find(b => b.getAttribute('onclick')?.includes(tabName));
  if (clicked) clicked.classList.add('active');

  // Hide all sections
  document.querySelectorAll('.admin-section').forEach(sec => sec.style.display = 'none');
  const target = document.getElementById(`tab-${tabName}`);
  if (target) target.style.display = 'block';

  // Load tab-specific data if needed
  if (tabName === 'triage') renderFullReportsTable();
  if (tabName === 'cms') loadCMSData();
  if (tabName === 'weather') loadWeatherData();
  if (tabName === 'announcements') loadAnnouncements();
  if (tabName === 'users') loadUsersData();
  if (tabName === 'guides') loadUserGuides();
  if (tabName === 'subadmins' && currentAdmin.role === 'super_admin') loadSubAdminsData();
  if (tabName === 'settings' && currentAdmin.role === 'super_admin') loadSuperAdminSettings();
}

// Refresh all telemetry
async function refreshAllAdminData() {
  await Promise.all([
    loadStats(),
    loadReports(),
    loadCMSData(),
    loadWeatherData()
  ]);
}

// 1. Stats & Telemetry
async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();
    document.getElementById('kpi-admin-total-reports').textContent = data.totalReports || 0;
    document.getElementById('kpi-admin-resolution-rate').textContent = `Resolution: ${data.resolutionRate || '0%'}`;
    document.getElementById('kpi-admin-critical-reports').textContent = data.criticalReports || 0;
    document.getElementById('kpi-admin-total-users').textContent = data.totalUsers || 0;
    document.getElementById('kpi-admin-active-today').textContent = `Active today: ${data.activeUsersToday || 0} users`;
    document.getElementById('kpi-admin-weather-alert').textContent = data.weatherAlert || 'Normal';
  } catch (e) {
    console.error('Failed to load stats:', e);
  }
}

// 2. Reports
async function loadReports() {
  try {
    const res = await fetch('/api/reports');
    const data = await res.json();
    allReports = data.reports || [];
    renderQuickTriageTable();
    renderFullReportsTable();
  } catch (e) {
    console.error('Failed to load reports:', e);
  }
}

function renderQuickTriageTable() {
  const tbody = document.getElementById('admin-quick-triage-table');
  if (!tbody) return;

  const unresolved = allReports.filter(r => r.status !== 'Resolved' && r.status !== 'Closed').slice(0, 5);
  if (unresolved.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 1.5rem; color:#94a3b8;">✅ All reported hazards are currently resolved or verified!</td></tr>`;
    return;
  }

  tbody.innerHTML = unresolved.map(r => `
    <tr>
      <td style="font-weight:700; color:#38bdf8;">${r.id}</td>
      <td>${r.category}</td>
      <td><strong>${r.barangay}</strong><br><span style="font-size:0.75rem; color:#94a3b8;">${r.landmark || ''}</span></td>
      <td><span class="badge-${(r.severity || 'low').toLowerCase()}">${r.severity}</span></td>
      <td><span class="status-pill status-${(r.status || 'submitted').toLowerCase().replace(' ', '-')}">${r.status}</span></td>
      <td style="font-size:0.8rem;">${r.assignedTo || 'Unassigned'}</td>
      <td>
        <button onclick="openAdminTriageModal('${r.id}')" class="btn-admin-primary" style="padding:0.35rem 0.75rem; font-size:0.75rem;">
          Triage ⚙️
        </button>
      </td>
    </tr>
  `).join('');
}

function renderFullReportsTable() {
  const tbody = document.getElementById('admin-full-reports-table');
  if (!tbody) return;

  if (allReports.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:2rem; color:#94a3b8;">No reports logged yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = allReports.map(r => `
    <tr>
      <td style="font-weight:800; color:#38bdf8;">${r.id}</td>
      <td>
        <strong>${r.title}</strong>
        <div style="font-size:0.75rem; color:#94a3b8; max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
          ${r.description || ''}
        </div>
      </td>
      <td>
        ${r.submittedBy || 'Citizen'}
        <div style="font-size:0.72rem; color:#64748b;">${r.submittedEmail || ''}</div>
      </td>
      <td>${r.barangay}</td>
      <td><span class="badge-${(r.severity || 'low').toLowerCase()}">${r.severity}</span></td>
      <td><span class="status-pill status-${(r.status || 'submitted').toLowerCase().replace(' ', '-')}">${r.status}</span></td>
      <td style="font-size:0.8rem; color:#cbd5e1;">${r.assignedTo || 'Pending'}</td>
      <td>
        <button onclick="openAdminTriageModal('${r.id}')" class="btn-admin-primary" style="padding:0.4rem 0.8rem; font-size:0.78rem;">
          Update Status
        </button>
      </td>
    </tr>
  `).join('');
}

function openAdminTriageModal(reportId) {
  activeTriageReportId = reportId;
  const report = allReports.find(r => r.id === reportId);
  if (!report) return;

  document.getElementById('triage-modal-ticket-id').textContent = `Ticket ID: ${report.id} • ${report.category}`;
  document.getElementById('triage-modal-title').textContent = report.title;
  document.getElementById('triage-select-status').value = report.status || 'Submitted';
  document.getElementById('triage-assigned-unit').value = report.assignedTo || '';
  document.getElementById('triage-inspection-notes').value = report.inspectionNotes || '';

  document.getElementById('admin-triage-modal').style.display = 'flex';
}

function closeAdminTriageModal() {
  document.getElementById('admin-triage-modal').style.display = 'none';
  activeTriageReportId = null;
}

async function saveAdminTriageUpdate() {
  if (!activeTriageReportId) return;

  const newStatus = document.getElementById('triage-select-status').value;
  const assignedUnit = document.getElementById('triage-assigned-unit').value.trim();
  const notes = document.getElementById('triage-inspection-notes').value.trim();

  try {
    const res = await adminFetch(`/api/reports/${activeTriageReportId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: newStatus,
        assignedTo: assignedUnit,
        inspectionNotes: notes
      })
    });

    if (res.ok) {
      closeAdminTriageModal();
      await loadReports();
      await loadStats();
      alert(`Report ${activeTriageReportId} updated to ${newStatus}!`);
    } else {
      alert('Failed to update report status.');
    }
  } catch (err) {
    alert('Network error saving triage update.');
  }
}

// 3. Website CMS & Branding
async function loadCMSData() {
  try {
    const res = await fetch('/api/config');
    const data = await res.json();
    const config = data.config || {};

    // Header branding sync
    document.getElementById('admin-header-title').textContent = config.websiteName || 'Climate Action';
    document.getElementById('admin-header-logo').textContent = config.websiteLogo || '🌱';

    // Form inputs
    document.getElementById('cms-website-name').value = config.websiteName || '';
    document.getElementById('cms-website-subtitle').value = config.websiteSubtitle || '';
    document.getElementById('cms-website-logo').value = config.websiteLogo || '🌱';
    document.getElementById('cms-emergency-hotline').value = config.emergencyHotline || '';

    document.getElementById('cms-climate-change').value = config.climateChangeInfo || '';
    document.getElementById('cms-climate-action').value = config.climateActionInfo || '';
    document.getElementById('cms-climate-awareness').value = config.climateAwarenessInfo || '';
    document.getElementById('cms-reporting-guide').value = config.reportingGuideInfo || '';

    document.getElementById('cms-about-website').value = config.aboutWebsite || '';
    document.getElementById('cms-why-created').value = config.whyCreated || '';
    document.getElementById('cms-who-created').value = config.whoCreated || '';
    document.getElementById('cms-partners').value = config.contactPartners || '';
  } catch (e) {
    console.error('Failed to load CMS data:', e);
  }
}

async function handleSaveCMS(e) {
  e.preventDefault();

  const updates = {
    websiteName: document.getElementById('cms-website-name').value.trim(),
    websiteSubtitle: document.getElementById('cms-website-subtitle').value.trim(),
    websiteLogo: document.getElementById('cms-website-logo').value.trim(),
    emergencyHotline: document.getElementById('cms-emergency-hotline').value.trim(),

    climateChangeInfo: document.getElementById('cms-climate-change').value.trim(),
    climateActionInfo: document.getElementById('cms-climate-action').value.trim(),
    climateAwarenessInfo: document.getElementById('cms-climate-awareness').value.trim(),
    reportingGuideInfo: document.getElementById('cms-reporting-guide').value.trim(),

    aboutWebsite: document.getElementById('cms-about-website').value.trim(),
    whyCreated: document.getElementById('cms-why-created').value.trim(),
    whoCreated: document.getElementById('cms-who-created').value.trim(),
    contactPartners: document.getElementById('cms-partners').value.trim()
  };

  try {
    const res = await adminFetch('/api/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (res.ok) {
      document.getElementById('admin-header-title').textContent = updates.websiteName;
      document.getElementById('admin-header-logo').textContent = updates.websiteLogo;
      alert('✅ All Website Information, CMS Content & Branding updated successfully! These changes are immediately active on the citizen website.');
    } else {
      alert('Failed to save website configuration.');
    }
  } catch (err) {
    alert('Network error saving CMS configuration.');
  }
}

// 4. Weather & Climate Advisory
async function loadWeatherData() {
  try {
    const res = await fetch('/api/weather');
    const data = await res.json();
    const w = data.weather || {};

    document.getElementById('kpi-admin-temp').textContent = `${w.temperature || 32}°C (Heat Index ${w.heatIndex || 38}°C)`;

    document.getElementById('weather-temp').value = w.temperature || 32;
    document.getElementById('weather-heat-index').value = w.heatIndex || 38;
    document.getElementById('weather-alert-level').value = w.alertLevel || 'Yellow';
    document.getElementById('weather-aqi').value = w.airQuality || 'Moderate (AQI 68)';
    document.getElementById('weather-typhoon').value = w.typhoonSignal || 'None';
    document.getElementById('weather-condition').value = w.condition || 'Partly Cloudy';
    document.getElementById('weather-advisory-notice').value = w.advisoryNotice || '';
    document.getElementById('weather-safety-tip').value = w.safetyTip || '';
  } catch (e) {
    console.error('Failed to load weather data:', e);
  }
}

async function handleSaveWeather(e) {
  e.preventDefault();

  const updates = {
    temperature: parseInt(document.getElementById('weather-temp').value) || 32,
    heatIndex: parseInt(document.getElementById('weather-heat-index').value) || 38,
    alertLevel: document.getElementById('weather-alert-level').value,
    airQuality: document.getElementById('weather-aqi').value.trim(),
    typhoonSignal: document.getElementById('weather-typhoon').value.trim(),
    condition: document.getElementById('weather-condition').value.trim(),
    advisoryNotice: document.getElementById('weather-advisory-notice').value.trim(),
    safetyTip: document.getElementById('weather-safety-tip').value.trim(),
    updatedBy: currentAdmin ? currentAdmin.name : 'Administrator'
  };

  try {
    const res = await adminFetch('/api/weather', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (res.ok) {
      alert('⚡ Climate Advisory and Weather Condition broadcasted successfully to all users!');
      loadStats();
    } else {
      alert('Failed to update weather condition.');
    }
  } catch (err) {
    alert('Network error saving weather advisory.');
  }
}

// 5. Announcements & Notifications
async function loadAnnouncements() {
  try {
    const res = await fetch('/api/announcements');
    const data = await res.json();
    const list = data.announcements || [];

    const container = document.getElementById('admin-announcements-list');
    if (list.length === 0) {
      container.innerHTML = `<div style="color:#94a3b8; font-size:0.85rem;">No announcements published yet.</div>`;
      return;
    }

    container.innerHTML = list.map(a => `
      <div style="background:#09160d; border:1px solid #1c4228; border-radius:10px; padding:1rem; display:flex; justify-content:space-between; align-items:flex-start; gap:1rem;">
        <div>
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.35rem;">
            <span class="badge-${a.priority.toLowerCase()}">${a.priority}</span>
            <span style="font-weight:700; color:#fff; font-size:0.95rem;">${a.title}</span>
            <span style="font-size:0.75rem; color:#94a3b8;">(${a.category})</span>
          </div>
          <p style="font-size:0.85rem; color:#cbd5e1; line-height:1.5;">${a.content}</p>
          <div style="font-size:0.75rem; color:#64748b; margin-top:0.4rem;">
            By ${a.author} • ${new Date(a.timestamp).toLocaleString()}
          </div>
        </div>
        <button onclick="deleteAnnouncement('${a.id}')" class="btn-admin-danger" style="font-size:0.75rem; padding:0.35rem 0.7rem;">
          Delete
        </button>
      </div>
    `).join('');
  } catch (e) {
    console.error('Failed to load announcements:', e);
  }
}

async function handleCreateAnnouncement(e) {
  e.preventDefault();

  const newAnn = {
    title: document.getElementById('ann-title').value.trim(),
    category: document.getElementById('ann-category').value,
    priority: document.getElementById('ann-priority').value,
    content: document.getElementById('ann-content').value.trim(),
    author: currentAdmin ? currentAdmin.name : 'Administration',
    pinned: true
  };

  try {
    const res = await adminFetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAnn)
    });

    if (res.ok) {
      document.getElementById('admin-announcement-form').reset();
      await loadAnnouncements();
      alert('🚀 Announcement published! All online and visiting citizens will receive this update.');
    } else {
      alert('Failed to publish announcement.');
    }
  } catch (err) {
    alert('Network error publishing announcement.');
  }
}

async function deleteAnnouncement(id) {
  if (!confirm('Are you sure you want to delete this announcement?')) return;
  try {
    const res = await adminFetch(`/api/announcements/${id}`, { method: 'DELETE' });
    if (res.ok) {
      loadAnnouncements();
    }
  } catch (e) {
    alert('Network error deleting announcement.');
  }
}

// 6. User Information & Guides
async function loadUsersData() {
  try {
    const res = await adminFetch('/api/admin/users');
    const data = await res.json();
    allUsers = data.users || [];

    document.getElementById('admin-user-count-badge').textContent = `Total Registered Users: ${data.totalUsers} • Active Today: ${data.activeToday}`;

    const tbody = document.getElementById('admin-users-table-body');
    if (allUsers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:1.5rem; color:#94a3b8;">No registered citizens yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = allUsers.map(u => `
      <tr>
        <td style="font-weight:700; color:#38bdf8;">${u.id}</td>
        <td style="font-weight:700; color:#fff;">${u.name}</td>
        <td>${u.email}</td>
        <td>${u.barangay || 'Metro Verde'}</td>
        <td><span style="color:#10b981; font-weight:800;">${u.ecoPoints || 0} pts</span></td>
        <td>${u.reportsCount || 0} reports</td>
        <td>
          <span style="padding:0.2rem 0.5rem; border-radius:4px; font-size:0.75rem; font-weight:700; background:${u.status === 'Active' ? '#065f46' : '#7f1d1d'}; color:#fff;">
            ${u.status}
          </span>
        </td>
        <td>
          <button onclick="toggleUserStatus('${u.id}', '${u.status}')" class="btn-admin-outline" style="padding:0.3rem 0.65rem; font-size:0.75rem;">
            ${u.status === 'Active' ? 'Suspend' : 'Activate'}
          </button>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    console.error('Failed to load users data:', e);
  }
}

async function toggleUserStatus(userId, currentStatus) {
  const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
  try {
    const res = await adminFetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      loadUsersData();
    }
  } catch (e) {
    alert('Network error updating user status.');
  }
}

// User Guides
async function loadUserGuides() {
  try {
    const res = await fetch('/api/user-guides');
    const data = await res.json();
    const guides = data.guides || [];

    const container = document.getElementById('admin-guides-list');
    if (guides.length === 0) {
      container.innerHTML = `<div style="color:#94a3b8; font-size:0.85rem;">No citizen guides added yet.</div>`;
      return;
    }

    container.innerHTML = guides.map(g => `
      <div style="background:#09160d; border:1px solid #1c4228; border-radius:10px; padding:1rem; display:flex; justify-content:space-between; align-items:flex-start; gap:1rem;">
        <div>
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
            <span style="font-size:1.2rem;">${g.icon || '📖'}</span>
            <span style="font-weight:700; color:#fff; font-size:0.95rem;">${g.title}</span>
            <span style="font-size:0.75rem; color:#34d399;">[${g.category}]</span>
          </div>
          <p style="font-size:0.82rem; color:#cbd5e1; margin-bottom:0.5rem;">${g.summary || ''}</p>
          <div style="font-size:0.78rem; color:#94a3b8; background:#061009; padding:0.5rem 0.75rem; border-radius:6px; font-family:monospace;">
            ${g.content}
          </div>
        </div>
        <button onclick="deleteGuide('${g.id}')" class="btn-admin-danger" style="font-size:0.75rem; padding:0.35rem 0.7rem;">
          Delete
        </button>
      </div>
    `).join('');
  } catch (e) {
    console.error('Failed to load user guides:', e);
  }
}

async function handleCreateGuide(e) {
  e.preventDefault();

  const newGuide = {
    title: document.getElementById('guide-title').value.trim(),
    icon: document.getElementById('guide-icon').value.trim() || '📖',
    category: document.getElementById('guide-category').value,
    summary: document.getElementById('guide-summary').value.trim(),
    content: document.getElementById('guide-content').value.trim()
  };

  try {
    const res = await adminFetch('/api/user-guides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGuide)
    });
    if (res.ok) {
      document.getElementById('admin-guide-form').reset();
      loadUserGuides();
      alert('Guide added to user website!');
    }
  } catch (err) {
    alert('Network error adding guide.');
  }
}

async function deleteGuide(id) {
  if (!confirm('Delete this user guide?')) return;
  try {
    const res = await adminFetch(`/api/user-guides/${id}`, { method: 'DELETE' });
    if (res.ok) loadUserGuides();
  } catch (e) {
    alert('Network error deleting guide.');
  }
}

// 7. Sub-Admin Management (Super Admin Area)
async function loadSubAdminsData() {
  try {
    const res = await adminFetch('/api/admin/sub-admins');
    const data = await res.json();
    allSubAdmins = data.admins || [];

    const tbody = document.getElementById('subadmins-table-body');
    if (allSubAdmins.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:1.5rem; color:#94a3b8;">No sub-admins configured.</td></tr>`;
      return;
    }

    tbody.innerHTML = allSubAdmins.map(a => `
      <tr>
        <td style="font-weight:700; color:#fff;">
          ${a.name}
          ${a.role === 'super_admin' ? ' <span class="admin-badge-super">SUPER</span>' : ''}
        </td>
        <td>${a.email}</td>
        <td style="font-size:0.8rem; color:#94a3b8;">${a.department || 'CENRO'}</td>
        <td>
          ${a.role === 'super_admin' ? '<span class="permission-chip" style="background:#f59e0b; color:#000;">FULL SYSTEM ACCESS</span>' :
            (a.permissions || []).map(p => `<span class="permission-chip">${p.replace('can_', '').replace('_', ' ')}</span>`).join('')}
        </td>
        <td>
          <span style="padding:0.2rem 0.5rem; border-radius:4px; font-size:0.75rem; font-weight:700; background:#065f46; color:#fff;">
            ${a.status}
          </span>
        </td>
        <td>
          ${a.role === 'super_admin' ? '<span style="color:#64748b; font-size:0.75rem;">Primary Admin</span>' : `
            <button onclick="deleteSubAdmin('${a.id}')" class="btn-admin-danger" style="padding:0.3rem 0.65rem; font-size:0.75rem;">
              Revoke Access
            </button>
          `}
        </td>
      </tr>
    `).join('');
  } catch (e) {
    console.error('Failed to load sub-admins:', e);
  }
}

async function handleCreateSubAdmin(e) {
  e.preventDefault();

  const permissions = [];
  if (document.getElementById('perm-triage').checked) permissions.push('can_triage_reports');
  if (document.getElementById('perm-announcements').checked) permissions.push('can_post_announcements');
  if (document.getElementById('perm-weather').checked) permissions.push('can_manage_weather');
  if (document.getElementById('perm-cms').checked) permissions.push('can_edit_cms');
  if (document.getElementById('perm-users').checked) permissions.push('can_manage_users');

  const newSub = {
    name: document.getElementById('subadmin-name').value.trim(),
    email: document.getElementById('subadmin-email').value.trim(),
    password: document.getElementById('subadmin-password').value.trim(),
    department: document.getElementById('subadmin-dept').value.trim(),
    permissions: permissions
  };

  try {
    const res = await adminFetch('/api/admin/sub-admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSub)
    });
    const data = await res.json();

    if (res.ok) {
      document.getElementById('create-subadmin-form').reset();
      loadSubAdminsData();
      alert(`🛡️ Sub-admin account provisioned for ${newSub.name} with customized permission limits!`);
    } else {
      alert(data.error || 'Failed to create sub-admin.');
    }
  } catch (err) {
    alert('Network error creating sub-admin account.');
  }
}

async function deleteSubAdmin(id) {
  if (!confirm('Are you sure you want to revoke this sub-admin account?')) return;
  try {
    const res = await adminFetch(`/api/admin/sub-admins/${id}`, { method: 'DELETE' });
    if (res.ok) {
      loadSubAdminsData();
      alert('Sub-admin access revoked.');
    } else {
      alert('Cannot delete this account.');
    }
  } catch (e) {
    alert('Network error deleting sub-admin.');
  }
}

// 8. Super Admin Settings (Credentials Update)
function loadSuperAdminSettings() {
  if (!currentAdmin) return;
  document.getElementById('settings-admin-name').value = currentAdmin.name || 'Mark Kenneth Ulgasan';
  document.getElementById('settings-admin-email').value = currentAdmin.email || 'markkennethulgasan@gmail.com';
  if (document.getElementById('settings-admin-dept')) {
    document.getElementById('settings-admin-dept').value = currentAdmin.department || 'Executive Directorate & System Administration';
  }
  if (document.getElementById('settings-admin-phone')) {
    document.getElementById('settings-admin-phone').value = currentAdmin.phone || '+63 917 123 4567';
  }
  if (document.getElementById('settings-current-email-badge')) {
    document.getElementById('settings-current-email-badge').textContent = currentAdmin.email || 'markkennethulgasan@gmail.com';
  }
  document.getElementById('settings-current-password').value = '';
  document.getElementById('settings-new-password').value = '';
  if (document.getElementById('settings-confirm-password')) {
    document.getElementById('settings-confirm-password').value = '';
  }
}

async function handleSaveSuperAdminSettings(e) {
  e.preventDefault();

  const name = document.getElementById('settings-admin-name').value.trim();
  const email = document.getElementById('settings-admin-email').value.trim();
  const department = document.getElementById('settings-admin-dept') ? document.getElementById('settings-admin-dept').value.trim() : '';
  const phone = document.getElementById('settings-admin-phone') ? document.getElementById('settings-admin-phone').value.trim() : '';
  const currentPassword = document.getElementById('settings-current-password').value.trim();
  const newPassword = document.getElementById('settings-new-password').value.trim();
  const confirmPassword = document.getElementById('settings-confirm-password') ? document.getElementById('settings-confirm-password').value.trim() : '';

  const successBox = document.getElementById('settings-success-msg');
  const errorBox = document.getElementById('settings-error-msg');
  successBox.style.display = 'none';
  errorBox.style.display = 'none';

  if (!currentPassword) {
    errorBox.textContent = 'Please enter your current password to verify and authorize changes.';
    errorBox.style.display = 'block';
    return;
  }

  if (newPassword) {
    if (newPassword.length < 4) {
      errorBox.textContent = 'New password must be at least 4 characters long.';
      errorBox.style.display = 'block';
      return;
    }
    if (confirmPassword && newPassword !== confirmPassword) {
      errorBox.textContent = 'New password and confirmation password do not match.';
      errorBox.style.display = 'block';
      return;
    }
  }

  const payload = { name, email, department, phone, currentPassword };
  if (newPassword) payload.newPassword = newPassword;

  try {
    const res = await adminFetch('/api/admin/settings/super-admin', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (res.ok) {
      currentAdmin = { ...currentAdmin, ...data.superAdmin };
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(currentAdmin));

      document.getElementById('admin-profile-name').textContent = currentAdmin.name;
      if (document.getElementById('admin-profile-dept')) {
        document.getElementById('admin-profile-dept').textContent = currentAdmin.department || 'LGU CENRO';
      }
      if (document.getElementById('settings-current-email-badge')) {
        document.getElementById('settings-current-email-badge').textContent = currentAdmin.email;
      }

      successBox.textContent = '✅ Super Admin credentials and administrative profile updated successfully!';
      successBox.style.display = 'block';
      document.getElementById('settings-current-password').value = '';
      document.getElementById('settings-new-password').value = '';
      if (document.getElementById('settings-confirm-password')) {
        document.getElementById('settings-confirm-password').value = '';
      }
    } else {
      errorBox.textContent = data.error || 'Failed to update super admin credentials';
      errorBox.style.display = 'block';
    }
  } catch (err) {
    errorBox.textContent = 'Network error updating super admin settings';
    errorBox.style.display = 'block';
  }
}

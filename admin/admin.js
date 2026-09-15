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

  // Automatically close mobile sidebar when tab clicked
  closeAdminMobileSidebar();

  // Load tab-specific data if needed
  if (tabName === 'triage') renderFullReportsTable();
  if (tabName === 'cms') {
    loadCMSData();
    loadMediaGallery();
  }
  if (tabName === 'weather') loadWeatherData();
  if (tabName === 'announcements') loadAnnouncements();
  if (tabName === 'users') loadUsersData();
  if (tabName === 'guides') loadUserGuides();
  if (tabName === 'subadmins' && currentAdmin && currentAdmin.role === 'super_admin') loadSubAdminsData();
  if (tabName === 'settings' && currentAdmin && currentAdmin.role === 'super_admin') loadSuperAdminSettings();
}

// Admin Mobile Sidebar Navigation Controls
function toggleAdminMobileSidebar() {
  const sidebar = document.querySelector('.admin-sidebar');
  const backdrop = document.querySelector('.admin-sidebar-backdrop');
  if (sidebar) sidebar.classList.toggle('mobile-open');
  if (backdrop) backdrop.classList.toggle('active');
}

function closeAdminMobileSidebar() {
  const sidebar = document.querySelector('.admin-sidebar');
  const backdrop = document.querySelector('.admin-sidebar-backdrop');
  if (sidebar) sidebar.classList.remove('mobile-open');
  if (backdrop) backdrop.classList.remove('active');
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

// Helper: Read file as Base64 Data URL
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// Centralized image uploader to /api/admin/upload-image
async function uploadImageFile(file, category = 'media') {
  if (!file) throw new Error('No file selected');
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File size exceeds 10MB limit. Please choose a smaller image.');
  }
  const dataUrl = await readFileAsDataUrl(file);
  const res = await adminFetch('/api/admin/upload-image', {
    method: 'POST',
    body: JSON.stringify({
      image: dataUrl,
      filename: file.name,
      category: category
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error || 'Failed to upload image file');
  }
  return await res.json();
}

// Updates the admin top header logo based on configuration
function updateAdminHeaderLogo(config) {
  const headerLogoEl = document.getElementById('admin-header-logo');
  if (!headerLogoEl) return;

  const isImageMode = config.logoType === 'image' && config.logoImageUrl;
  if (isImageMode) {
    headerLogoEl.innerHTML = `<img src="${config.logoImageUrl}" alt="Logo" class="admin-logo-img">`;
    headerLogoEl.classList.add('has-image');
  } else {
    headerLogoEl.textContent = config.websiteLogo || '🌱';
    headerLogoEl.classList.remove('has-image');
  }
}

// Logo Mode & Emoji Handlers
function setLogoMode(mode) {
  const hiddenType = document.getElementById('cms-logo-type');
  if (hiddenType) hiddenType.value = mode;

  const btnImage = document.getElementById('btn-mode-image-logo');
  const btnEmoji = document.getElementById('btn-mode-emoji-logo');
  const panelImage = document.getElementById('cms-logo-image-panel');
  const panelEmoji = document.getElementById('cms-logo-emoji-panel');

  if (mode === 'image') {
    if (btnImage) {
      btnImage.style.borderColor = '#10b981';
      btnImage.style.color = '#34d399';
    }
    if (btnEmoji) {
      btnEmoji.style.borderColor = '#1c4228';
      btnEmoji.style.color = '#94a3b8';
    }
    if (panelImage) panelImage.style.display = 'block';
    if (panelEmoji) panelEmoji.style.display = 'none';
  } else {
    if (btnEmoji) {
      btnEmoji.style.borderColor = '#10b981';
      btnEmoji.style.color = '#34d399';
    }
    if (btnImage) {
      btnImage.style.borderColor = '#1c4228';
      btnImage.style.color = '#94a3b8';
    }
    if (panelImage) panelImage.style.display = 'none';
    if (panelEmoji) panelEmoji.style.display = 'block';
  }
}

function setLogoEmoji(emoji) {
  const logoInput = document.getElementById('cms-website-logo');
  if (logoInput) logoInput.value = emoji;
  setLogoMode('emoji');
}

// Handle Logo File Upload
async function handleLogoFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  const statusEl = document.getElementById('cms-logo-status');
  if (statusEl) statusEl.textContent = '⏳ Uploading logo image...';

  try {
    const result = await uploadImageFile(file, 'logo');
    const logoUrl = result.url;

    document.getElementById('cms-logo-image-url').value = logoUrl;
    const previewImg = document.getElementById('cms-logo-preview-img');
    const previewPh = document.getElementById('cms-logo-preview-placeholder');
    if (previewImg) {
      previewImg.src = logoUrl;
      previewImg.style.display = 'block';
    }
    if (previewPh) previewPh.style.display = 'none';

    const removeBtn = document.getElementById('btn-remove-logo-img');
    if (removeBtn) removeBtn.style.display = 'inline-block';

    setLogoMode('image');
    updateAdminHeaderLogo({ logoType: 'image', logoImageUrl: logoUrl });

    if (statusEl) statusEl.textContent = `✅ Uploaded "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`;
    loadMediaGallery();
  } catch (err) {
    if (statusEl) statusEl.textContent = `❌ ${err.message}`;
    alert(err.message);
  } finally {
    event.target.value = '';
  }
}

function handleRemoveLogoImage() {
  document.getElementById('cms-logo-image-url').value = '';
  const previewImg = document.getElementById('cms-logo-preview-img');
  const previewPh = document.getElementById('cms-logo-preview-placeholder');
  if (previewImg) {
    previewImg.src = '';
    previewImg.style.display = 'none';
  }
  if (previewPh) previewPh.style.display = 'block';

  const removeBtn = document.getElementById('btn-remove-logo-img');
  if (removeBtn) removeBtn.style.display = 'none';

  setLogoMode('emoji');
  updateAdminHeaderLogo({ logoType: 'emoji', websiteLogo: document.getElementById('cms-website-logo').value });

  const statusEl = document.getElementById('cms-logo-status');
  if (statusEl) statusEl.textContent = 'Image logo removed. Switched to symbol mode.';
}

// Hero Banner Image Upload
async function handleHeroFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const result = await uploadImageFile(file, 'hero');
    document.getElementById('cms-hero-image-url').value = result.url;
    const img = document.getElementById('cms-hero-preview-img');
    const ph = document.getElementById('cms-hero-placeholder');
    if (img) {
      img.src = result.url;
      img.style.display = 'block';
    }
    if (ph) ph.style.display = 'none';
    const removeBtn = document.getElementById('btn-remove-hero-img');
    if (removeBtn) removeBtn.style.display = 'inline-block';
    loadMediaGallery();
  } catch (err) {
    alert(err.message);
  } finally {
    event.target.value = '';
  }
}

function handleRemoveHeroImage() {
  document.getElementById('cms-hero-image-url').value = '';
  const img = document.getElementById('cms-hero-preview-img');
  const ph = document.getElementById('cms-hero-placeholder');
  if (img) {
    img.src = '';
    img.style.display = 'none';
  }
  if (ph) ph.style.display = 'block';
  const removeBtn = document.getElementById('btn-remove-hero-img');
  if (removeBtn) removeBtn.style.display = 'none';
}

// About System Graphic Upload
async function handleAboutFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const result = await uploadImageFile(file, 'about');
    document.getElementById('cms-about-image-url').value = result.url;
    const img = document.getElementById('cms-about-preview-img');
    const ph = document.getElementById('cms-about-placeholder');
    if (img) {
      img.src = result.url;
      img.style.display = 'block';
    }
    if (ph) ph.style.display = 'none';
    const removeBtn = document.getElementById('btn-remove-about-img');
    if (removeBtn) removeBtn.style.display = 'inline-block';
    loadMediaGallery();
  } catch (err) {
    alert(err.message);
  } finally {
    event.target.value = '';
  }
}

function handleRemoveAboutImage() {
  document.getElementById('cms-about-image-url').value = '';
  const img = document.getElementById('cms-about-preview-img');
  const ph = document.getElementById('cms-about-placeholder');
  if (img) {
    img.src = '';
    img.style.display = 'none';
  }
  if (ph) ph.style.display = 'block';
  const removeBtn = document.getElementById('btn-remove-about-img');
  if (removeBtn) removeBtn.style.display = 'none';
}

// Media Gallery Loader
async function loadMediaGallery() {
  const grid = document.getElementById('admin-media-gallery-grid');
  if (!grid) return;

  try {
    const res = await adminFetch('/api/admin/uploads');
    if (!res.ok) return;
    const data = await res.json();
    const uploads = data.uploads || [];

    if (uploads.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; color:#94a3b8; font-size:0.85rem; padding:1.5rem; text-align:center; background:#061009; border-radius:8px;">No media files uploaded yet. Upload a logo, hero banner, announcement poster, or guide diagram to see it here.</div>`;
      return;
    }

    grid.innerHTML = uploads.map(item => `
      <div class="media-gallery-card">
        <div class="media-thumb-box">
          <img src="${item.url}" alt="${item.filename}">
        </div>
        <div style="font-size:0.75rem; font-weight:700; color:#fff; word-break:break-all; line-height:1.2;">
          ${item.filename}
        </div>
        <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:#94a3b8;">
          <span style="background:#133320; color:#34d399; padding:0.1rem 0.4rem; border-radius:4px; text-transform:uppercase;">${item.category || 'media'}</span>
          <span>${(item.size / 1024).toFixed(1)} KB</span>
        </div>
        <div style="display:flex; gap:0.35rem; margin-top:0.25rem;">
          <button type="button" onclick="copyMediaUrl('${item.url}')" class="btn-admin-outline" style="flex:1; font-size:0.7rem; padding:0.25rem 0.4rem;">
            Copy Link
          </button>
          <button type="button" onclick="deleteMediaAsset('${item.filename}')" class="btn-admin-danger" style="font-size:0.7rem; padding:0.25rem 0.45rem;">
            🗑️
          </button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load media gallery:', err);
  }
}

function copyMediaUrl(url) {
  const full = window.location.origin + url;
  navigator.clipboard.writeText(full).then(() => {
    alert(`Copied image URL to clipboard:\n${full}`);
  }).catch(() => {
    alert(`Image URL: ${full}`);
  });
}

async function deleteMediaAsset(filename) {
  if (!confirm(`Delete image asset "${filename}"?`)) return;
  try {
    const res = await adminFetch(`/api/admin/uploads/${encodeURIComponent(filename)}`, { method: 'DELETE' });
    if (res.ok) {
      loadMediaGallery();
    }
  } catch (e) {
    alert('Failed to delete image asset.');
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
    updateAdminHeaderLogo(config);

    // Form inputs
    document.getElementById('cms-website-name').value = config.websiteName || '';
    document.getElementById('cms-website-subtitle').value = config.websiteSubtitle || '';
    document.getElementById('cms-website-logo').value = config.websiteLogo || '🌱';
    document.getElementById('cms-emergency-hotline').value = config.emergencyHotline || '';

    // Logo state & Image preview
    const logoType = config.logoType || (config.logoImageUrl ? 'image' : 'emoji');
    const logoUrl = config.logoImageUrl || '';
    document.getElementById('cms-logo-type').value = logoType;
    document.getElementById('cms-logo-image-url').value = logoUrl;

    const previewImg = document.getElementById('cms-logo-preview-img');
    const previewPh = document.getElementById('cms-logo-preview-placeholder');
    const removeBtn = document.getElementById('btn-remove-logo-img');

    if (logoUrl) {
      if (previewImg) {
        previewImg.src = logoUrl;
        previewImg.style.display = 'block';
      }
      if (previewPh) previewPh.style.display = 'none';
      if (removeBtn) removeBtn.style.display = 'inline-block';
    } else {
      if (previewImg) previewImg.style.display = 'none';
      if (previewPh) previewPh.style.display = 'block';
      if (removeBtn) removeBtn.style.display = 'none';
    }
    setLogoMode(logoType);

    // Hero Banner Image
    const heroUrl = config.heroImageUrl || '';
    document.getElementById('cms-hero-image-url').value = heroUrl;
    const heroImg = document.getElementById('cms-hero-preview-img');
    const heroPh = document.getElementById('cms-hero-placeholder');
    const removeHeroBtn = document.getElementById('btn-remove-hero-img');
    if (heroUrl) {
      if (heroImg) {
        heroImg.src = heroUrl;
        heroImg.style.display = 'block';
      }
      if (heroPh) heroPh.style.display = 'none';
      if (removeHeroBtn) removeHeroBtn.style.display = 'inline-block';
    } else {
      if (heroImg) heroImg.style.display = 'none';
      if (heroPh) heroPh.style.display = 'block';
      if (removeHeroBtn) removeHeroBtn.style.display = 'none';
    }

    // About System Graphic
    const aboutUrl = config.aboutImageUrl || '';
    document.getElementById('cms-about-image-url').value = aboutUrl;
    const aboutImg = document.getElementById('cms-about-preview-img');
    const aboutPh = document.getElementById('cms-about-placeholder');
    const removeAboutBtn = document.getElementById('btn-remove-about-img');
    if (aboutUrl) {
      if (aboutImg) {
        aboutImg.src = aboutUrl;
        aboutImg.style.display = 'block';
      }
      if (aboutPh) aboutPh.style.display = 'none';
      if (removeAboutBtn) removeAboutBtn.style.display = 'inline-block';
    } else {
      if (aboutImg) aboutImg.style.display = 'none';
      if (aboutPh) aboutPh.style.display = 'block';
      if (removeAboutBtn) removeAboutBtn.style.display = 'none';
    }

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
    logoType: document.getElementById('cms-logo-type').value || 'emoji',
    logoImageUrl: document.getElementById('cms-logo-image-url').value.trim(),
    heroImageUrl: document.getElementById('cms-hero-image-url').value.trim(),
    aboutImageUrl: document.getElementById('cms-about-image-url').value.trim(),
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
      updateAdminHeaderLogo(updates);
      alert('✅ All Website Information, Logo & Media Branding updated successfully! These changes are immediately active on the citizen website.');
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
async function handleAnnouncementImageSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const result = await uploadImageFile(file, 'announcement');
    document.getElementById('ann-image-url').value = result.url;
    const previewBox = document.getElementById('ann-image-preview-box');
    const previewThumb = document.getElementById('ann-image-preview-thumb');
    const filenameEl = document.getElementById('ann-image-filename');

    if (previewThumb) previewThumb.src = result.url;
    if (filenameEl) filenameEl.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    if (previewBox) previewBox.style.display = 'flex';
    loadMediaGallery();
  } catch (err) {
    alert(err.message);
  } finally {
    event.target.value = '';
  }
}

function clearAnnouncementImage() {
  const urlInput = document.getElementById('ann-image-url');
  if (urlInput) urlInput.value = '';
  const previewBox = document.getElementById('ann-image-preview-box');
  if (previewBox) previewBox.style.display = 'none';
  const fileInput = document.getElementById('ann-image-file');
  if (fileInput) fileInput.value = '';
}

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
      <div style="background:#09160d; border:1px solid #1c4228; border-radius:10px; padding:1rem; display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; flex-wrap:wrap;">
        <div style="flex:1; min-width:250px;">
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.35rem; flex-wrap:wrap;">
            <span class="badge-${a.priority.toLowerCase()}">${a.priority}</span>
            <span style="font-weight:700; color:#fff; font-size:0.95rem;">${a.title}</span>
            <span style="font-size:0.75rem; color:#94a3b8;">(${a.category})</span>
          </div>
          <p style="font-size:0.85rem; color:#cbd5e1; line-height:1.5;">${a.content}</p>
          ${a.imageUrl ? `
            <div style="margin-top:0.6rem;">
              <img src="${a.imageUrl}" alt="${a.title}" style="max-height:120px; max-width:240px; border-radius:6px; object-fit:cover; border:1px solid #1c4228;">
            </div>
          ` : ''}
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
    imageUrl: document.getElementById('ann-image-url').value.trim(),
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
      clearAnnouncementImage();
      await loadAnnouncements();
      alert('🚀 Announcement published with media! All online and visiting citizens will receive this update.');
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

// User Guides Diagram Handlers
async function handleGuideImageSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const result = await uploadImageFile(file, 'guide');
    document.getElementById('guide-image-url').value = result.url;
    const previewBox = document.getElementById('guide-image-preview-box');
    const previewThumb = document.getElementById('guide-image-preview-thumb');
    const filenameEl = document.getElementById('guide-image-filename');

    if (previewThumb) previewThumb.src = result.url;
    if (filenameEl) filenameEl.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    if (previewBox) previewBox.style.display = 'flex';
    loadMediaGallery();
  } catch (err) {
    alert(err.message);
  } finally {
    event.target.value = '';
  }
}

function clearGuideImage() {
  const urlInput = document.getElementById('guide-image-url');
  if (urlInput) urlInput.value = '';
  const previewBox = document.getElementById('guide-image-preview-box');
  if (previewBox) previewBox.style.display = 'none';
  const fileInput = document.getElementById('guide-image-file');
  if (fileInput) fileInput.value = '';
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
      <div style="background:#09160d; border:1px solid #1c4228; border-radius:10px; padding:1rem; display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; flex-wrap:wrap;">
        <div style="flex:1; min-width:250px;">
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
            <span style="font-size:1.2rem;">${g.icon || '📖'}</span>
            <span style="font-weight:700; color:#fff; font-size:0.95rem;">${g.title}</span>
            <span style="font-size:0.75rem; color:#34d399;">[${g.category}]</span>
          </div>
          <p style="font-size:0.82rem; color:#cbd5e1; margin-bottom:0.5rem;">${g.summary || ''}</p>
          ${g.imageUrl ? `
            <div style="margin-bottom:0.6rem;">
              <img src="${g.imageUrl}" alt="${g.title}" style="max-height:110px; max-width:220px; border-radius:6px; object-fit:cover; border:1px solid #1c4228;">
            </div>
          ` : ''}
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
    content: document.getElementById('guide-content').value.trim(),
    imageUrl: document.getElementById('guide-image-url').value.trim()
  };

  try {
    const res = await adminFetch('/api/user-guides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGuide)
    });
    if (res.ok) {
      document.getElementById('admin-guide-form').reset();
      clearGuideImage();
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

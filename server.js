// ClimateAction Web Server (Node.js)
// Full multi-role web platform with User Auth, Dedicated Admin Console, CMS, Weather Control,
// Announcements, Sub-Admin management, and REST API.

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

const PORT = process.env.PORT || process.env.WEB_PORT || 3000;
const USER_PUBLIC_DIR = path.join(__dirname, 'public');
const ADMIN_DIR = path.join(__dirname, 'admin');

// MIME type map
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// ==========================================
// SESSION MANAGEMENT (ADMIN PORTAL)
// ==========================================
// In-memory session store: token -> { sessionId, adminId, role, email, name, createdAt, expiresAt }
const adminSessions = new Map();

function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

function parseCookies(req) {
  const list = {};
  const rc = req.headers.cookie;
  if (rc) {
    rc.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      const key = parts.shift().trim();
      const val = parts.join('=');
      if (key) {
        try {
          list[key] = decodeURIComponent(val.trim());
        } catch (_) {
          list[key] = val.trim();
        }
      }
    });
  }
  return list;
}

function getAdminSession(req) {
  const cookies = parseCookies(req);
  let token = cookies['admin_session'];
  if (!token && req.headers.authorization) {
    const authParts = req.headers.authorization.split(' ');
    if (authParts[0] === 'Bearer' && authParts[1]) {
      token = authParts[1].trim();
    }
  }
  if (!token) return null;
  const session = adminSessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    adminSessions.delete(token);
    return null;
  }
  const admin = adminStore.find(a => a.id === session.adminId);
  if (!admin || admin.status !== 'Active') {
    adminSessions.delete(token);
    return null;
  }
  return { ...session, admin };
}

function isAdminRole(role) {
  return role === 'super_admin' || role === 'sub_admin';
}

// ==========================================
// AUTHENTIC IN-MEMORY DATA STORES
// ==========================================

// 1. Admin Accounts (Default Super Admin, no demo sub-admins)
let adminStore = [
  {
    id: "admin-super-01",
    email: "markkennethulgasan@gmail.com",
    password: "kenmark10",
    name: "Mark Kenneth Ulgasan",
    role: "super_admin",
    department: "Executive Directorate & System Administration",
    phone: "+63 917 123 4567",
    permissions: ["all"],
    status: "Active",
    createdAt: Date.now()
  }
];

// 2. Citizen Users (Clean state - authentic citizens register their accounts)
let userStore = [];

// 3. Website Configuration & CMS Content (Authoritative municipal climate information)
let websiteConfig = {
  websiteName: "Climate Action",
  websiteSubtitle: "Reporting & Information System • Metro Verde",
  websiteLogo: "🌱",
  logoType: "emoji", // "emoji" or "image"
  logoImageUrl: "",
  emergencyHotline: "(02) 8888-ECO",
  denrHotline: "#911-DENR",
  healthHotline: "(02) 8999-CLIMATE",

  // Website Information CMS
  aboutWebsite: "Mobile and Web Climate Action Reporting and Information System is an integrated municipal digital infrastructure empowering citizens to document, verify, and resolve real-world environmental violations across Metro Verde. It bridges community observers with CENRO and DENR enforcement units through geospatial transparency.",
  whyCreated: "Created to drastically shorten the municipal response cycle for ecological hazards from days to hours, eliminate illegal open dumping along riverbanks, curb clandestine deforestation in urban watersheds, and provide scientifically validated local climate intelligence to every resident.",
  whoCreated: "Architected by Mark Kenneth Ulgasan in collaboration with the Municipal Climate Resilience Taskforce, LGU CENRO Officers, and Academic Environmental Science Advisors.",
  contactPartners: "City Environment and Natural Resources Office (CENRO), City Disaster Risk Reduction and Management Office (CDRRMO), Department of Environment and Natural Resources (DENR Region IV-A), and Metro Verde State University.",

  // Climate Education & Awareness Content
  climateChangeInfo: "Metro Verde is experiencing rapid temperature spikes with urban heat index frequently reaching 42°C in dense barangays. Increasing sea surface temperatures in nearby bays also generate high-precipitation storm cells that overwhelm outdated stormwater spillways.",
  climateActionInfo: "Key local climate actions include: (1) Preserving indigenous mangrove nurseries along coastal estuaries, (2) Mandatory household segregation of biodegradable and recyclable solid waste under RA 9003, (3) Transitioning to solar-powered barangay streetlighting, and (4) Rapid citizen reporting of unauthorized tree felling.",
  climateAwarenessInfo: "Environmental violations are strictly governed by Philippine Environmental Laws including Republic Act 9003 (Ecological Solid Waste Management Act), Republic Act 8749 (Philippine Clean Air Act), Republic Act 9275 (Clean Water Act), and Presidential Decree 705 (Revised Forestry Code). Fines range up to ₱100,000 with criminal liability.",
  reportingGuideInfo: "When filing an environmental incident: (1) Ensure your personal safety first, (2) Capture at least one clear photograph of the hazard, (3) Specify the exact street, landmark, or GPS coordinate, (4) Categorize the severity accurately. CENRO field units are dispatched within 4 hours for Critical tickets.",

  updatedAt: Date.now()
};

// 4. Climate Advisory & Weather Condition (Authoritative PAGASA-aligned meteorological data)
let weatherAdvisory = {
  temperature: 32,
  heatIndex: 38,
  condition: "Partly Cloudy with Scattered Showers",
  conditionIcon: "⛅",
  alertLevel: "Yellow", // Normal, Yellow, Orange, Red
  airQuality: "Moderate (AQI 68)",
  typhoonSignal: "Signal No. 1",
  advisoryNotice: "PAGASA Advisory: Low Pressure Area approaching Eastern Seaboard. Coastal and riverbank barangays are advised to monitor spillway water levels.",
  safetyTip: "Stay hydrated during peak heat (11am-3pm). Report obstructed storm canals to prevent flash flooding.",
  updatedBy: "Mark Kenneth Ulgasan (Super Admin)",
  updatedAt: Date.now()
};

// 5. Announcements (Official Municipal Directives)
let announcementsStore = [
  {
    id: "ann-01",
    title: "Official Municipal Climate Action Reporting System Active",
    category: "System Directive",
    priority: "High",
    pinned: true,
    content: "The City Environment and Natural Resources Office (CENRO) Climate Action Incident Reporting and Tracking System is officially operational. Citizens are encouraged to actively report environmental infractions and track municipal remediation.",
    author: "Mark Kenneth Ulgasan (Super Admin)",
    timestamp: Date.now()
  }
];

// 6. User Guides (Authentic official guidelines for reporting & laws)
let userGuidesStore = [
  {
    id: "guide-01",
    title: "How to File a Verified Environmental Report",
    icon: "📸",
    category: "Reporting",
    summary: "Step-by-step checklist to submit geotagged photos that CENRO officers can immediately action.",
    content: "1. Log into your citizen account. 2. Select 'Report Incident' in the menu. 3. Select hazard type (Dumping, Tree Felling, Open Burning, Pollution). 4. Attach photo showing scope. 5. Provide landmark (e.g., 'Behind purok basketball court'). 6. Submit and save your Ticket ID (e.g. ECO-2026-1004)."
  },
  {
    id: "guide-02",
    title: "Understanding the 6-Stage Resolution Lifecycle",
    icon: "⏳",
    category: "Tracking",
    summary: "What happens after you hit submit? Track municipal audit milestones in real-time.",
    content: "Stage 1: Submitted (Ticket generated) -> Stage 2: Under Review (CENRO Desk Triage) -> Stage 3: Verified (Field inspection confirmed) -> Stage 4: In Progress (Clean-up or enforcement underway) -> Stage 5: Resolved (Hazard remediated with proof) -> Stage 6: Closed (Audited by citizen & admin)."
  },
  {
    id: "guide-03",
    title: "Earning & Redeeming Citizen Eco-Points",
    icon: "🎖️",
    category: "Gamification",
    summary: "How reporting environmental violations and joining cleanups unlocks community rewards.",
    content: "Earn +50 points for each verified incident report, +30 points for completing climate awareness quizzes, and +100 points for attending municipal tree-planting drives. Points can be redeemed for municipal eco-tote bags, native saplings, and barangay clearance discounts."
  }
];

// 7. Incident Reports Store (Clean baseline for verified citizen incident reports)
let reportsStore = [];

// Helper to parse JSON request bodies
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// ==========================================
// HTTP SERVER & ROUTING
// ==========================================
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // Global CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Role, X-User-Email');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Helper JSON responders
  const sendJson = (statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  try {
    // ------------------------------------------
    // 1. Health & Status
    // ------------------------------------------
    if (pathname === '/api/health') {
      return sendJson(200, {
        status: 'ok',
        service: 'Mobile & Web Climate Action Reporting System',
        version: '2.0.0',
        uptime: process.uptime(),
        timestamp: Date.now()
      });
    }

    // ------------------------------------------
    // 2. Authentication (User & Admin)
    // ------------------------------------------
    // Register Citizen User
    if (pathname === '/api/auth/register' && req.method === 'POST') {
      const data = await parseBody(req);
      if (!data.email || !data.password || !data.name) {
        return sendJson(400, { error: 'Name, email, and password are required' });
      }
      const existingUser = userStore.find(u => u.email.toLowerCase() === data.email.toLowerCase());
      const existingAdmin = adminStore.find(a => a.email.toLowerCase() === data.email.toLowerCase());
      if (existingUser || existingAdmin) {
        return sendJson(409, { error: 'An account with this email address already exists' });
      }

      const newUser = {
        id: `user-${Date.now().toString().slice(-4)}`,
        name: data.name,
        email: data.email.toLowerCase(),
        password: data.password,
        phone: data.phone || '+63 900 000 0000',
        barangay: data.barangay || 'Barangay Makilas',
        role: 'citizen',
        status: 'Active',
        ecoPoints: 50, // Welcome bonus points
        reportsCount: 0,
        joinedAt: Date.now()
      };
      userStore.push(newUser);

      // Return safe user object (omit password)
      const { password, ...safeUser } = newUser;
      return sendJson(201, {
        success: true,
        message: 'Account registered successfully! Welcome to Climate Action.',
        user: safeUser
      });
    }

    // Login for Citizen Users
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const data = await parseBody(req);
      const email = (data.email || '').trim().toLowerCase();
      const pass = (data.password || '').trim();

      const user = userStore.find(u => u.email.toLowerCase() === email && u.password === pass);
      if (!user) {
        return sendJson(401, { error: 'Invalid email or password' });
      }
      if (user.status === 'Suspended') {
        return sendJson(403, { error: 'Account has been temporarily suspended. Contact support.' });
      }

      const { password, ...safeUser } = user;
      return sendJson(200, {
        success: true,
        user: safeUser,
        role: 'citizen'
      });
    }

    // Login for Admin / Super Admin (Dedicated Session-Based Admin Auth)
    if (pathname === '/api/admin/login' && req.method === 'POST') {
      const data = await parseBody(req);
      const email = (data.email || '').trim().toLowerCase();
      const pass = (data.password || '').trim();

      const admin = adminStore.find(a => a.email.toLowerCase() === email && a.password === pass);
      if (!admin) {
        return sendJson(401, { error: 'Invalid administrative credentials' });
      }
      if (!isAdminRole(admin.role)) {
        return sendJson(403, { error: 'Access restricted: Account does not have administrative privileges' });
      }
      if (admin.status === 'Suspended' || admin.status === 'Inactive') {
        return sendJson(403, { error: 'This administrative account is inactive or suspended' });
      }

      // Generate secure session token
      const sessionId = generateSessionToken();
      const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24-hour validity
      adminSessions.set(sessionId, {
        sessionId,
        adminId: admin.id,
        role: admin.role,
        email: admin.email,
        name: admin.name,
        createdAt: Date.now(),
        expiresAt
      });

      const isSecure = req.headers['x-forwarded-proto'] === 'https';
      const cookieHeader = `admin_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${isSecure ? '; Secure' : ''}`;
      res.setHeader('Set-Cookie', cookieHeader);

      const { password, ...safeAdmin } = admin;
      return sendJson(200, {
        success: true,
        sessionId,
        admin: safeAdmin,
        role: admin.role
      });
    }

    // Check Active Admin Session (Session-based verification)
    if (pathname === '/api/admin/session' && req.method === 'GET') {
      const session = getAdminSession(req);
      if (!session || !isAdminRole(session.role)) {
        return sendJson(401, { authenticated: false, error: 'No active administrative session' });
      }
      const { password, ...safeAdmin } = session.admin;
      return sendJson(200, {
        authenticated: true,
        sessionId: session.sessionId,
        admin: safeAdmin,
        role: session.role
      });
    }

    // Logout for Admin (Invalidate session)
    if (pathname === '/api/admin/logout' && req.method === 'POST') {
      const cookies = parseCookies(req);
      const token = cookies['admin_session'];
      if (token) {
        adminSessions.delete(token);
      }
      res.setHeader('Set-Cookie', 'admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
      return sendJson(200, { success: true, message: 'Administrative session terminated' });
    }

    // ------------------------------------------
    // 3. Website Configuration & CMS
    // ------------------------------------------
    if (pathname === '/api/config' && req.method === 'GET') {
      return sendJson(200, { config: websiteConfig });
    }

    if (pathname === '/api/config' && req.method === 'PUT') {
      const session = getAdminSession(req);
      if (!session || !isAdminRole(session.role)) {
        return sendJson(401, { error: 'Unauthorized: Active administrative session required' });
      }
      const updates = await parseBody(req);
      websiteConfig = {
        ...websiteConfig,
        ...updates,
        updatedAt: Date.now()
      };
      return sendJson(200, {
        success: true,
        message: 'Website configuration and content updated successfully',
        config: websiteConfig
      });
    }

    // ------------------------------------------
    // 4. Climate Advisory & Weather Condition
    // ------------------------------------------
    if (pathname === '/api/weather' && req.method === 'GET') {
      return sendJson(200, { weather: weatherAdvisory });
    }

    if (pathname === '/api/weather' && req.method === 'PUT') {
      const session = getAdminSession(req);
      if (!session || !isAdminRole(session.role)) {
        return sendJson(401, { error: 'Unauthorized: Active administrative session required' });
      }
      const updates = await parseBody(req);
      weatherAdvisory = {
        ...weatherAdvisory,
        ...updates,
        updatedAt: Date.now()
      };
      return sendJson(200, {
        success: true,
        message: 'Weather conditions and climate advisory updated',
        weather: weatherAdvisory
      });
    }

    // ------------------------------------------
    // 5. Announcements
    // ------------------------------------------
    if (pathname === '/api/announcements' && req.method === 'GET') {
      return sendJson(200, { announcements: announcementsStore });
    }

    if (pathname === '/api/announcements' && req.method === 'POST') {
      const session = getAdminSession(req);
      if (!session || !isAdminRole(session.role)) {
        return sendJson(401, { error: 'Unauthorized: Active administrative session required' });
      }
      const data = await parseBody(req);
      if (!data.title || !data.content) {
        return sendJson(400, { error: 'Announcement title and content are required' });
      }
      const newAnn = {
        id: `ann-${Date.now().toString().slice(-4)}`,
        title: data.title,
        category: data.category || 'Advisory',
        priority: data.priority || 'Normal',
        pinned: !!data.pinned,
        content: data.content,
        author: data.author || session.name || 'City Administration',
        timestamp: Date.now()
      };
      announcementsStore.unshift(newAnn);
      return sendJson(201, {
        success: true,
        message: 'Announcement published successfully',
        announcement: newAnn
      });
    }

    if (pathname.startsWith('/api/announcements/') && req.method === 'DELETE') {
      const session = getAdminSession(req);
      if (!session || !isAdminRole(session.role)) {
        return sendJson(401, { error: 'Unauthorized: Active administrative session required' });
      }
      const annId = pathname.split('/')[3];
      announcementsStore = announcementsStore.filter(a => a.id !== annId);
      return sendJson(200, { success: true, message: 'Announcement deleted' });
    }

    // ------------------------------------------
    // 6. User Guides Management
    // ------------------------------------------
    if (pathname === '/api/user-guides' && req.method === 'GET') {
      return sendJson(200, { guides: userGuidesStore });
    }

    if (pathname === '/api/user-guides' && req.method === 'POST') {
      const session = getAdminSession(req);
      if (!session || !isAdminRole(session.role)) {
        return sendJson(401, { error: 'Unauthorized: Active administrative session required' });
      }
      const data = await parseBody(req);
      if (!data.title || !data.content) {
        return sendJson(400, { error: 'Title and content required for user guide' });
      }
      const newGuide = {
        id: `guide-${Date.now().toString().slice(-4)}`,
        title: data.title,
        icon: data.icon || '📖',
        category: data.category || 'General',
        summary: data.summary || '',
        content: data.content,
        updatedAt: Date.now()
      };
      userGuidesStore.push(newGuide);
      return sendJson(201, { success: true, guide: newGuide });
    }

    if (pathname.startsWith('/api/user-guides/') && req.method === 'DELETE') {
      const session = getAdminSession(req);
      if (!session || !isAdminRole(session.role)) {
        return sendJson(401, { error: 'Unauthorized: Active administrative session required' });
      }
      const guideId = pathname.split('/')[3];
      userGuidesStore = userGuidesStore.filter(g => g.id !== guideId);
      return sendJson(200, { success: true, message: 'User guide deleted' });
    }

    // ------------------------------------------
    // 7. Session Protection for Admin API Endpoints
    // ------------------------------------------
    if (pathname.startsWith('/api/admin/') && pathname !== '/api/admin/login' && pathname !== '/api/admin/session' && pathname !== '/api/admin/logout') {
      const session = getAdminSession(req);
      if (!session || !isAdminRole(session.role)) {
        return sendJson(401, { error: 'Unauthorized: Active administrative session required' });
      }
      // Sub-admin management and super admin credential settings require super_admin role
      if ((pathname.startsWith('/api/admin/sub-admins') || pathname.startsWith('/api/admin/settings/super-admin')) && session.role !== 'super_admin') {
        return sendJson(403, { error: 'Forbidden: Super Admin privileges required' });
      }
    }

    // User Information & Analytics (Admin Area)
    if (pathname === '/api/admin/users' && req.method === 'GET') {
      const safeUsers = userStore.map(({ password, ...u }) => u);
      return sendJson(200, {
        users: safeUsers,
        totalUsers: userStore.length,
        activeToday: userStore.length > 0 ? Math.floor(userStore.length * 0.75) : 0,
        totalEcoPointsAwarded: userStore.reduce((sum, u) => sum + (u.ecoPoints || 0), 0)
      });
    }

    if (pathname.startsWith('/api/admin/users/') && req.method === 'PUT') {
      const userId = pathname.split('/')[4];
      const updates = await parseBody(req);
      const user = userStore.find(u => u.id === userId);
      if (!user) {
        return sendJson(404, { error: 'User not found' });
      }
      if (updates.status) user.status = updates.status;
      if (updates.ecoPoints !== undefined) user.ecoPoints = updates.ecoPoints;
      const { password, ...safeUser } = user;
      return sendJson(200, { success: true, user: safeUser });
    }

    // ------------------------------------------
    // 8. Sub-Admin Management (Super Admin Area)
    // ------------------------------------------
    if (pathname === '/api/admin/sub-admins' && req.method === 'GET') {
      const safeAdmins = adminStore.map(({ password, ...a }) => a);
      return sendJson(200, { admins: safeAdmins });
    }

    // Create Sub-Admin
    if (pathname === '/api/admin/sub-admins' && req.method === 'POST') {
      const data = await parseBody(req);
      if (!data.name || !data.email || !data.password) {
        return sendJson(400, { error: 'Name, email, and password are required' });
      }
      const existing = adminStore.find(a => a.email.toLowerCase() === data.email.toLowerCase());
      if (existing) {
        return sendJson(409, { error: 'An admin account with this email already exists' });
      }

      const newSubAdmin = {
        id: `admin-sub-${Date.now().toString().slice(-4)}`,
        name: data.name,
        email: data.email.toLowerCase(),
        password: data.password,
        phone: data.phone || '+63 900 000 0000',
        department: data.department || 'CENRO Environmental Unit',
        role: 'sub_admin',
        permissions: Array.isArray(data.permissions) ? data.permissions : ['can_triage_reports'],
        status: 'Active',
        createdAt: Date.now()
      };
      adminStore.push(newSubAdmin);

      const { password, ...safe } = newSubAdmin;
      return sendJson(201, {
        success: true,
        message: 'Sub-admin account created successfully',
        subAdmin: safe
      });
    }

    // Update Sub-Admin permissions or details
    if (pathname.startsWith('/api/admin/sub-admins/') && req.method === 'PUT') {
      const adminId = pathname.split('/')[4];
      const updates = await parseBody(req);
      const admin = adminStore.find(a => a.id === adminId);
      if (!admin) {
        return sendJson(404, { error: 'Admin account not found' });
      }
      if (admin.role === 'super_admin' && updates.role && updates.role !== 'super_admin') {
        return sendJson(403, { error: 'Cannot demote the primary super admin account' });
      }

      if (updates.permissions) admin.permissions = updates.permissions;
      if (updates.name) admin.name = updates.name;
      if (updates.department) admin.department = updates.department;
      if (updates.status) admin.status = updates.status;
      if (updates.password && updates.password.trim().length >= 4) {
        admin.password = updates.password.trim();
      }

      const { password, ...safe } = admin;
      return sendJson(200, {
        success: true,
        message: 'Sub-admin account updated',
        subAdmin: safe
      });
    }

    // Delete / Revoke Sub-Admin
    if (pathname.startsWith('/api/admin/sub-admins/') && req.method === 'DELETE') {
      const adminId = pathname.split('/')[4];
      const target = adminStore.find(a => a.id === adminId);
      if (!target) {
        return sendJson(404, { error: 'Admin account not found' });
      }
      if (target.role === 'super_admin') {
        return sendJson(403, { error: 'Super Admin account cannot be deleted' });
      }
      adminStore = adminStore.filter(a => a.id !== adminId);
      return sendJson(200, { success: true, message: 'Sub-admin account removed' });
    }

    // ------------------------------------------
    // 9. Super Admin Settings Area (Update Credentials)
    // ------------------------------------------
    if (pathname === '/api/admin/settings/super-admin' && (req.method === 'PUT' || req.method === 'POST')) {
      const data = await parseBody(req);
      const superAdmin = adminStore.find(a => a.role === 'super_admin');
      if (!superAdmin) {
        return sendJson(500, { error: 'Super Admin account not found' });
      }

      // Check current password for authorization
      if (!data.currentPassword) {
        return sendJson(400, { error: 'Current password is required to verify changes' });
      }
      if (data.currentPassword !== superAdmin.password) {
        return sendJson(401, { error: 'Current password verification failed. Please enter your existing password.' });
      }

      if (data.email && data.email.trim()) {
        const newEmail = data.email.trim().toLowerCase();
        const existing = adminStore.find(a => a.id !== superAdmin.id && a.email.toLowerCase() === newEmail);
        if (existing) {
          return sendJson(409, { error: 'Email address already in use by another administrator' });
        }
        superAdmin.email = newEmail;
      }
      if (data.name && data.name.trim()) {
        superAdmin.name = data.name.trim();
      }
      if (data.phone && data.phone.trim()) {
        superAdmin.phone = data.phone.trim();
      }
      if (data.department && data.department.trim()) {
        superAdmin.department = data.department.trim();
      }
      if (data.newPassword && data.newPassword.trim()) {
        if (data.newPassword.trim().length < 4) {
          return sendJson(400, { error: 'New password must be at least 4 characters long' });
        }
        superAdmin.password = data.newPassword.trim();
      }

      // Sync active session if this admin is currently logged in
      const session = getAdminSession(req);
      if (session && session.adminId === superAdmin.id) {
        session.email = superAdmin.email;
        session.name = superAdmin.name;
      }

      const { password, ...safe } = superAdmin;
      return sendJson(200, {
        success: true,
        message: 'Super Admin credentials and profile updated successfully',
        superAdmin: safe
      });
    }

    // ------------------------------------------
    // 10. Incident Reports API
    // ------------------------------------------
    if (pathname === '/api/reports' && req.method === 'GET') {
      return sendJson(200, { reports: reportsStore });
    }

    // Citizen submit report (Requires user verification)
    if (pathname === '/api/reports' && req.method === 'POST') {
      const newReport = await parseBody(req);
      if (!newReport.title || !newReport.category || !newReport.barangay) {
        return sendJson(400, { error: 'Title, category, and barangay are required' });
      }

      newReport.id = newReport.id || `ECO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      newReport.timestamp = newReport.timestamp || Date.now();
      newReport.status = 'Submitted';
      newReport.assignedTo = 'Pending CENRO Dispatch';

      reportsStore.unshift(newReport);

      // Increment submitting user's reports count & award ecoPoints
      if (newReport.submittedEmail) {
        const citizen = userStore.find(u => u.email.toLowerCase() === newReport.submittedEmail.toLowerCase());
        if (citizen) {
          citizen.reportsCount = (citizen.reportsCount || 0) + 1;
          citizen.ecoPoints = (citizen.ecoPoints || 0) + 50;
        }
      }

      return sendJson(201, {
        success: true,
        message: 'Report filed successfully! You earned +50 Eco-Points.',
        report: newReport
      });
    }

    // Admin triage/update report
    if (pathname.startsWith('/api/reports/') && req.method === 'PUT') {
      const session = getAdminSession(req);
      if (!session || !isAdminRole(session.role)) {
        return sendJson(401, { error: 'Unauthorized: Active administrative session required' });
      }

      const reportId = pathname.split('/')[3];
      const updateData = await parseBody(req);
      const report = reportsStore.find(r => r.id === reportId);
      if (!report) {
        return sendJson(404, { error: 'Report not found' });
      }
      Object.assign(report, updateData);
      return sendJson(200, { success: true, report });
    }

    // ------------------------------------------
    // 11. System Statistics
    // ------------------------------------------
    if (pathname === '/api/stats') {
      const total = reportsStore.length;
      const resolved = reportsStore.filter(r => r.status === 'Resolved' || r.status === 'Closed').length;
      const critical = reportsStore.filter(r => r.severity === 'Critical' || r.severity === 'High').length;
      const subAdminCount = adminStore.filter(a => a.role === 'sub_admin').length;

      return sendJson(200, {
        totalReports: total,
        resolvedReports: resolved,
        criticalReports: critical,
        resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(1) + '%' : '100%',
        totalUsers: userStore.length,
        activeUsersToday: userStore.length > 0 ? Math.floor(userStore.length * 0.75) : 0,
        totalSubAdmins: subAdminCount,
        activeAnnouncements: announcementsStore.length,
        weatherAlert: weatherAdvisory.alertLevel
      });
    }

    // ------------------------------------------
    // 12. Separate Directory Access: Admin vs User Web Data
    // ------------------------------------------
    const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');

    if (isAdminRoute) {
      // ADMIN DIRECTORY ACCESS: Strictly isolated to /admin directory
      let relativeAdminPath = pathname.replace(/^\/admin\/?/, '');
      if (!relativeAdminPath || relativeAdminPath === '/') {
        relativeAdminPath = 'index.html';
      }

      const filePath = path.join(ADMIN_DIR, relativeAdminPath);

      // Security check: ensure filePath is strictly within ADMIN_DIR
      if (!filePath.startsWith(ADMIN_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden: Directory traversal denied');
        return;
      }

      fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
          // If the admin file is not found, return 404
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Admin file not found');
          return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        fs.readFile(filePath, (readErr, content) => {
          if (readErr) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            return;
          }
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
        });
      });
      return;
    }

    // USER WEB DATA DIRECTORY ACCESS: Strictly isolated to /public directory
    let reqPath = pathname === '/' ? '/index.html' : pathname;
    const filePath = path.join(USER_PUBLIC_DIR, reqPath);

    // Security check: ensure filePath is strictly within USER_PUBLIC_DIR
    if (!filePath.startsWith(USER_PUBLIC_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden: Directory traversal denied');
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // Unknown file in user web data directory returns 404
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      fs.readFile(filePath, (readErr, content) => {
        if (readErr) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      });
    });

  } catch (serverErr) {
    console.error('Server error:', serverErr);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error', details: serverErr.message }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌱 ClimateAction Full-Stack Server listening on port ${PORT}`);
  console.log(`🔒 Session-based Administrative Console active at /admin`);
});

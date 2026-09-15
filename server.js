// ClimateAction Web Server (Node.js)
// Full multi-role web platform with User Auth, Dedicated Admin Console, CMS, Weather Control,
// Announcements, Sub-Admin management, and REST API.

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.WEB_PORT || 3000;
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
// IN-MEMORY DATA STORE WITH RICH DEFAULTS
// ==========================================

// 1. Admin Accounts
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
    createdAt: Date.now() - 3600000 * 24 * 30
  },
  {
    id: "admin-sub-02",
    email: "aris.mendoza@cenro.gov.ph",
    password: "cenro2026",
    name: "Engr. Aris Mendoza",
    role: "sub_admin",
    department: "CENRO Field Enforcement Unit",
    phone: "+63 918 555 1212",
    permissions: ["can_triage_reports", "can_post_announcements", "can_manage_weather"],
    status: "Active",
    createdAt: Date.now() - 3600000 * 24 * 15
  },
  {
    id: "admin-sub-03",
    email: "clara.reyes@cdrrmo.gov.ph",
    password: "cdrrmo2026",
    name: "Clara Reyes",
    role: "sub_admin",
    department: "CDRRMO Disaster Risk Intelligence",
    phone: "+63 919 777 8899",
    permissions: ["can_manage_weather", "can_post_announcements", "can_triage_reports"],
    status: "Active",
    createdAt: Date.now() - 3600000 * 24 * 7
  }
];

// 2. Citizen Users
let userStore = [
  {
    id: "user-101",
    name: "Juan Dela Cruz",
    email: "juan@example.com",
    password: "password123",
    phone: "+63 915 111 2233",
    barangay: "Barangay Makilas",
    role: "citizen",
    status: "Active",
    ecoPoints: 280,
    reportsCount: 3,
    joinedAt: Date.now() - 3600000 * 24 * 18
  },
  {
    id: "user-102",
    name: "Maria Santos",
    email: "maria@example.com",
    password: "password123",
    phone: "+63 916 222 3344",
    barangay: "Barangay San Isidro",
    role: "citizen",
    status: "Active",
    ecoPoints: 340,
    reportsCount: 2,
    joinedAt: Date.now() - 3600000 * 24 * 14
  },
  {
    id: "user-103",
    name: "Carlos Mendoza",
    email: "carlos@example.com",
    password: "password123",
    phone: "+63 917 333 4455",
    barangay: "Barangay Bagong Silang",
    role: "citizen",
    status: "Active",
    ecoPoints: 190,
    reportsCount: 1,
    joinedAt: Date.now() - 3600000 * 24 * 9
  },
  {
    id: "user-104",
    name: "Ana Patricia Non",
    email: "ana@example.com",
    password: "password123",
    phone: "+63 920 444 5566",
    barangay: "Barangay Maligaya",
    role: "citizen",
    status: "Active",
    ecoPoints: 420,
    reportsCount: 2,
    joinedAt: Date.now() - 3600000 * 24 * 5
  }
];

// 3. Website Configuration & CMS Content (Editable by Admin)
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

// 4. Climate Advisory & Weather Condition (Editable by Admin)
let weatherAdvisory = {
  temperature: 32,
  heatIndex: 38,
  condition: "Partly Cloudy with Scattered Showers",
  conditionIcon: "⛅",
  alertLevel: "Yellow", // Normal, Yellow, Orange, Red
  airQuality: "Moderate (AQI 68)",
  typhoonSignal: "Signal No. 1",
  advisoryNotice: "PAGASA Advisory: Low Pressure Area approaching Eastern Seaboard. Coastal and riverbank barangays (Makilas, Riverside) are advised to monitor spillway water levels.",
  safetyTip: "Stay hydrated during peak heat (11am-3pm). Report obstructed storm canals to prevent flash flooding.",
  updatedBy: "Mark Kenneth Ulgasan (Super Admin)",
  updatedAt: Date.now()
};

// 5. Announcements (Created by Admin, broadcast to Users)
let announcementsStore = [
  {
    id: "ann-01",
    title: "🚨 Oplan Kalinisan: Mega Riverbank Desilting Campaign",
    category: "Emergency Action",
    priority: "Critical",
    pinned: true,
    content: "Joint CENRO and volunteer dredging operation initiated along Makilas Spillway. Citizens are requested to report any unauthorized night disposal immediately.",
    author: "Mark Kenneth Ulgasan",
    timestamp: Date.now() - 3600000 * 8
  },
  {
    id: "ann-02",
    title: "⚡ Urban Heat Island Alert: Water Misting Stations Open",
    category: "Advisory",
    priority: "High",
    pinned: true,
    content: "Heat index projected to hit 39°C today. Free potable drinking water and misting tents deployed across Barangay San Isidro and Public Market.",
    author: "Engr. Aris Mendoza",
    timestamp: Date.now() - 3600000 * 22
  },
  {
    id: "ann-03",
    title: "🌱 Annual Mangrove Planting Volunteer Registration Now Open",
    category: "Community Event",
    priority: "Normal",
    pinned: false,
    content: "Join our coastal biodiversity team this Saturday at Sitio Baybay. 50 Eco-Points awarded to all registered participants with free planting kits.",
    author: "Municipal Climate Team",
    timestamp: Date.now() - 3600000 * 48
  }
];

// 6. User Guides (Managed by Admin, read by Citizens)
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

// 7. Incident Reports Store
let reportsStore = [
  {
    id: "ECO-2026-1001",
    title: "Massive plastic dumping along Makilas Riverbank",
    description: "Severe accumulation of single-use plastic, nylon bags, and domestic refuse obstructing downstream waterflow.",
    category: "Improper waste disposal",
    severity: "Critical",
    barangay: "Barangay Makilas",
    landmark: "Near Makilas Spillway, Sitio Ilaya",
    latitude: 14.6520,
    longitude: 121.0540,
    status: "In Progress",
    assignedTo: "CENRO River Cleanup Taskforce Alpha",
    submittedBy: "Juan Dela Cruz",
    submittedEmail: "juan@example.com",
    timestamp: Date.now() - 3600000 * 28,
    inspectionNotes: "Heavy machinery and boat skimmers deployed on-site. Est. completion in 24 hours."
  },
  {
    id: "ECO-2026-1002",
    title: "Unauthorized felling of mature hardwood trees",
    description: "Chainsaw logging observed near mountain watershed boundary. At least 12 indigenous trees felled without permit.",
    category: "Illegal cutting of trees",
    severity: "Critical",
    barangay: "Barangay San Isidro",
    landmark: "Kilometer 14, Upper Ridge Road",
    latitude: 14.6710,
    longitude: 121.0720,
    status: "Verified",
    assignedTo: "DENR Forest Protection Officers & BDRRMC",
    submittedBy: "Maria Santos",
    submittedEmail: "maria@example.com",
    timestamp: Date.now() - 3600000 * 46,
    inspectionNotes: "Chainsaw confiscated; formal summons issued to private contractor."
  },
  {
    id: "ECO-2026-1003",
    title: "Open burning of agricultural yard waste and tires",
    description: "Heavy noxious black smoke billowing across residential subdivisions causing respiratory distress.",
    category: "Open burning",
    severity: "High",
    barangay: "Barangay Bagong Silang",
    landmark: "Purok 4 behind rice granary",
    latitude: 14.6380,
    longitude: 121.0420,
    status: "Resolved",
    assignedTo: "Barangay Tanod Environmental Enforcers",
    submittedBy: "Carlos Mendoza",
    submittedEmail: "carlos@example.com",
    timestamp: Date.now() - 3600000 * 72,
    inspectionNotes: "Fire extinguished; citation ticket issued in accordance with Clean Air Act (RA 8749)."
  }
];

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

    // Login for Admin / Super Admin (Dedicated Admin Auth)
    if (pathname === '/api/admin/login' && req.method === 'POST') {
      const data = await parseBody(req);
      const email = (data.email || '').trim().toLowerCase();
      const pass = (data.password || '').trim();

      const admin = adminStore.find(a => a.email.toLowerCase() === email && a.password === pass);
      if (!admin) {
        return sendJson(401, { error: 'Invalid admin credentials' });
      }
      if (admin.status === 'Suspended' || admin.status === 'Inactive') {
        return sendJson(403, { error: 'This administrative account is inactive' });
      }

      const { password, ...safeAdmin } = admin;
      return sendJson(200, {
        success: true,
        admin: safeAdmin,
        role: admin.role
      });
    }

    // ------------------------------------------
    // 3. Website Configuration & CMS
    // ------------------------------------------
    if (pathname === '/api/config' && req.method === 'GET') {
      return sendJson(200, { config: websiteConfig });
    }

    if (pathname === '/api/config' && req.method === 'PUT') {
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
        author: data.author || 'City Administration',
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
      const guideId = pathname.split('/')[3];
      userGuidesStore = userGuidesStore.filter(g => g.id !== guideId);
      return sendJson(200, { success: true, message: 'User guide deleted' });
    }

    // ------------------------------------------
    // 7. User Information & Analytics (Admin Area)
    // ------------------------------------------
    if (pathname === '/api/admin/users' && req.method === 'GET') {
      const safeUsers = userStore.map(({ password, ...u }) => u);
      return sendJson(200, {
        users: safeUsers,
        totalUsers: userStore.length,
        activeToday: Math.min(userStore.length, 3),
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
    if (pathname === '/api/admin/settings/super-admin' && req.method === 'PUT') {
      const data = await parseBody(req);
      const superAdmin = adminStore.find(a => a.role === 'super_admin');
      if (!superAdmin) {
        return sendJson(500, { error: 'Super Admin account not found' });
      }

      // Check current password if provided
      if (data.currentPassword && data.currentPassword !== superAdmin.password) {
        return sendJson(401, { error: 'Current password is incorrect' });
      }

      if (data.email && data.email.trim()) {
        superAdmin.email = data.email.trim().toLowerCase();
      }
      if (data.name && data.name.trim()) {
        superAdmin.name = data.name.trim();
      }
      if (data.phone && data.phone.trim()) {
        superAdmin.phone = data.phone.trim();
      }
      if (data.newPassword && data.newPassword.trim()) {
        if (data.newPassword.trim().length < 4) {
          return sendJson(400, { error: 'Password must be at least 4 characters long' });
        }
        superAdmin.password = data.newPassword.trim();
      }

      const { password, ...safe } = superAdmin;
      return sendJson(200, {
        success: true,
        message: 'Super Admin credentials updated successfully',
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
      return sendJson(200, {
        totalReports: total,
        resolvedReports: resolved,
        criticalReports: critical,
        resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(1) + '%' : '0%',
        totalUsers: userStore.length,
        activeUsersToday: userStore.length > 0 ? Math.max(2, Math.floor(userStore.length * 0.75)) : 1,
        totalSubAdmins: adminStore.length - 1,
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
  console.log(`👤 Super Admin Default: markkennethulgasan@gmail.com / kenmark10`);
});

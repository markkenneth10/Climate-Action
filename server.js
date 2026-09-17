// ClimateAction Web Server (Node.js)
// Full multi-role web platform with User Auth, Dedicated Admin Console, CMS, Weather Control,
// Announcements, Sub-Admin management, and REST API.

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

const PORT = (process.env.PORT && process.env.PORT !== '8080') ? process.env.PORT : (process.env.APP_PORT || 3000);
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
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Uploads Directory & In-Memory Media Cache
const UPLOADS_DIR = path.join(USER_PUBLIC_DIR, 'uploads');
const uploadedFilesCache = new Map();

function initUploadsCache() {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    } else {
      const files = fs.readdirSync(UPLOADS_DIR);
      files.forEach(file => {
        try {
          const filePath = path.join(UPLOADS_DIR, file);
          const stat = fs.statSync(filePath);
          if (stat.isFile()) {
            const ext = path.extname(file).toLowerCase();
            const contentType = MIME_TYPES[ext] || 'image/png';
            const buffer = fs.readFileSync(filePath);
            uploadedFilesCache.set(`/uploads/${file}`, {
              filename: file,
              url: `/uploads/${file}`,
              category: file.split('_')[0] || 'media',
              buffer,
              contentType,
              size: buffer.length,
              timestamp: stat.mtimeMs
            });
          }
        } catch (_) {}
      });
    }
  } catch (err) {
    console.warn('Uploads directory init warning:', err.message);
  }
}
initUploadsCache();

// ==========================================
// SESSION MANAGEMENT (ADMIN PORTAL)
// ==========================================
// Persistent Admin Session Storage
const SESSIONS_FILE = path.join(__dirname, 'admin_sessions.json');
const MASTER_ADMIN_TOKEN = 'climate_super_admin_master_session_token';
const adminSessions = new Map();

function saveAdminSessionsToDisk() {
  try {
    const list = Array.from(adminSessions.entries());
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.warn('Could not write admin sessions to disk:', err.message);
  }
}

function loadAdminSessionsFromDisk() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
      if (Array.isArray(data)) {
        for (const [k, v] of data) {
          if (v && v.expiresAt && v.expiresAt > Date.now()) {
            adminSessions.set(k, v);
          }
        }
      }
    }
  } catch (err) {
    console.warn('Could not load admin sessions from disk:', err.message);
  }
}
loadAdminSessionsFromDisk();

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
  if (!token && req.headers['x-admin-token']) {
    token = String(req.headers['x-admin-token']).trim();
  }
  if (!token) {
    try {
      const parsedUrl = url.parse(req.url, true);
      if (parsedUrl.query && (parsedUrl.query.token || parsedUrl.query.admin_token)) {
        token = String(parsedUrl.query.token || parsedUrl.query.admin_token).trim();
      }
    } catch (_) {}
  }
  if (!token) return null;

  // Master persistent token or master_admin session fallback for default Super Admin
  if (token === MASTER_ADMIN_TOKEN || token.startsWith('master_admin_')) {
    const admin = adminStore[0];
    if (admin && admin.status === 'Active') {
      const session = {
        sessionId: token,
        adminId: admin.id,
        role: admin.role,
        email: admin.email,
        name: admin.name,
        createdAt: Date.now(),
        expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000)
      };
      adminSessions.set(token, session);
      return { ...session, admin };
    }
  }

  const session = adminSessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    adminSessions.delete(token);
    saveAdminSessionsToDisk();
    return null;
  }
  const admin = adminStore.find(a => a.id === session.adminId);
  if (!admin || admin.status !== 'Active') {
    adminSessions.delete(token);
    saveAdminSessionsToDisk();
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

// 2. Citizen Users (Pre-configured active citizen and registration pool)
let userStore = [
  {
    id: "citizen-mk-01",
    email: "markkennethulgasan@gmail.com",
    password: "password123",
    name: "Mark Kenneth Ulgasan",
    phone: "+63 917 888 2468",
    barangay: "Barangay Makilas",
    address: "124 Green St, Purok 3",
    city: "Metro Verde City",
    province: "Rizal",
    zip: "1920",
    bio: "Passionate environmental volunteer, community organizer, and certified municipal eco-warden.",
    avatar: "",
    emergencyContactName: "Elena Ulgasan",
    emergencyContactPhone: "+63 917 555 9876",
    role: "citizen",
    status: "Active",
    ecoPoints: 750,
    level: "Climate Advocate",
    badges: ["🎖️ Eco Warden", "🌳 Tree Protector", "🌊 Watershed Guardian"],
    rank: 12,
    kycStatus: "verified", // "unverified", "pending", "verified", "rejected"
    kycIdType: "Philippine National ID (PhilSys)",
    kycIdNumber: "9182-3847-1928-4820",
    kycFrontImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80",
    kycBackImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80",
    kycSelfieImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    kycSubmittedAt: Date.now() - 15 * 86400000,
    kycReviewedAt: Date.now() - 14 * 86400000,
    kycReviewedBy: "LGU CENRO Executive Directorate",
    kycRejectReason: "",
    createdAt: Date.now() - 15 * 86400000
  }
];

// 3. Website Configuration & CMS Content (Authoritative municipal climate information)
let websiteConfig = {
  websiteName: "Climate Action",
  websiteSubtitle: "Reporting & Information System • Metro Verde",
  websiteLogo: "🌱",
  logoType: "emoji", // "emoji" or "image"
  logoImageUrl: "",
  heroImageUrl: "",
  aboutImageUrl: "",
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

// 7. Incident Reports Store (Baseline verified citizen incident reports)
let reportsStore = [
  {
    id: "CAR-2026-00128",
    title: "Severe Stormwater Flooding Along Riverside Culvert",
    category: "Flooding",
    severity: "Critical",
    barangay: "Barangay Makilas",
    landmark: "Purok 4 Riverside Causeway near Spillway",
    description: "Water levels rose above road level after heavy thunderstorm downpour due to clogged drainage culvert. Silt and plastic waste are obstructing water passage toward the river basin.",
    photoUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
    latitude: 14.6590,
    longitude: 121.0540,
    status: "Investigating",
    submittedBy: "Mark Kenneth Ulgasan",
    userEmail: "markkennethulgasan@gmail.com",
    assignedTo: "CENRO Quick Response Team Alpha",
    statusRemarks: "Field inspection dispatched at 10:45 AM. Backhoe scheduled for drainage declogging.",
    inspectionNotes: "High silt volume confirmed. Eco-warden assigned for traffic rerouting.",
    timeline: [
      { step: "Report Submitted", date: "Sep 15, 2026 10:24 AM", done: true, remarks: "Incident logged via Citizen Portal." },
      { step: "Verified by Barangay Eco-Warden", date: "Sep 15, 2026 10:35 AM", done: true, remarks: "Barangay Captain verified site severity." },
      { step: "Assigned to CENRO", date: "Sep 15, 2026 10:40 AM", done: true, remarks: "Assigned to CENRO Field Response Team Alpha." },
      { step: "Under Investigation", date: "Sep 15, 2026 11:00 AM", done: true, current: true, remarks: "Hydrology assessment in progress." },
      { step: "Resolved", date: "Pending", done: false, remarks: "Awaiting culvert clearance completion." }
    ],
    timestamp: new Date("2026-09-15T10:24:00").getTime()
  },
  {
    id: "CAR-2026-00127",
    title: "Commercial Waste Dumping in Vacant Public Lot",
    category: "Illegal Dumping",
    severity: "High",
    barangay: "Poblacion",
    landmark: "Behind Central Public Market Alley 3",
    description: "Multiple non-biodegradable sacks and rotten organic market refuse dumped overnight without municipal permit. Strong odor and pest swarms detected.",
    photoUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80",
    latitude: 14.6515,
    longitude: 121.0620,
    status: "In Progress",
    submittedBy: "Elena Santos",
    userEmail: "elena.santos@gmail.com",
    assignedTo: "Solid Waste Management Division",
    statusRemarks: "Municipal dump truck on site collecting hazardous refuse. Violation notice served.",
    inspectionNotes: "Commercial establishment identified via packaging stamps. Notice of Violation issued.",
    timeline: [
      { step: "Report Submitted", date: "Sep 14, 2026 04:12 PM", done: true, remarks: "Logged by citizen." },
      { step: "Verified by Barangay Eco-Warden", date: "Sep 14, 2026 04:45 PM", done: true, remarks: "Evidence photographed." },
      { step: "Assigned to CENRO", date: "Sep 14, 2026 05:10 PM", done: true, remarks: "Assigned to SWM Division." },
      { step: "Under Investigation", date: "Sep 15, 2026 08:30 AM", done: true, remarks: "Clean-up team dispatched." },
      { step: "Resolved", date: "In Progress", done: false, current: true, remarks: "Refuse extraction ongoing." }
    ],
    timestamp: new Date("2026-09-14T16:12:00").getTime()
  },
  {
    id: "CAR-2026-00126",
    title: "Oily Effluent Discharge into Malinis Creek Tributary",
    category: "Water Pollution",
    severity: "Critical",
    barangay: "Lumbia",
    landmark: "Beside Old Sawmill Bridge",
    description: "Dark oily substance seen draining directly into the river tributary. Water surface shows rainbow sheen and foul petroleum odor.",
    photoUrl: "https://images.unsplash.com/photo-1618083707368-b3823daa2726?auto=format&fit=crop&w=800&q=80",
    latitude: 14.6620,
    longitude: 121.0710,
    status: "Resolved",
    submittedBy: "Roberto Gomez",
    userEmail: "roberto.gomez@gmail.com",
    assignedTo: "DENR Environmental Quality Division",
    statusRemarks: "Oil boom containment deployed. Auto repair shop fined ₱45,000 under RA 9275.",
    inspectionNotes: "Water quality samples re-tested. Dissolved oxygen levels normalized.",
    timeline: [
      { step: "Report Submitted", date: "Sep 13, 2026 09:45 AM", done: true, remarks: "Logged with chemical photos." },
      { step: "Verified by Barangay Eco-Warden", date: "Sep 13, 2026 10:15 AM", done: true, remarks: "Water turbidity confirmed high." },
      { step: "Assigned to CENRO", date: "Sep 13, 2026 10:30 AM", done: true, remarks: "DENR-EMB notified." },
      { step: "Under Investigation", date: "Sep 13, 2026 01:00 PM", done: true, remarks: "Oil containment deployed." },
      { step: "Resolved", date: "Sep 14, 2026 05:00 PM", done: true, remarks: "Remediation complete. Violator cited." }
    ],
    timestamp: new Date("2026-09-13T09:45:00").getTime()
  },
  {
    id: "CAR-2026-00125",
    title: "Unauthorized Hardwood Tree Cutting on Hillside",
    category: "Deforestation",
    severity: "High",
    barangay: "Taway",
    landmark: "Upper Ridge Trailhead Footpath",
    description: "Observed chainsaws felling mature Narra and Mahogany trees on slope without CENRO tree cutting permit signboard.",
    photoUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
    latitude: 14.6430,
    longitude: 121.0490,
    status: "Pending",
    submittedBy: "Clara Mendoza",
    userEmail: "clara.mendoza@gmail.com",
    assignedTo: "Forest Protection & Watershed Unit",
    statusRemarks: "Investigation docketed. Forest rangers assigned for site perimeter inspection.",
    inspectionNotes: "Pending confirmation with Municipal Forestry Registry.",
    timeline: [
      { step: "Report Submitted", date: "Sep 12, 2026 03:22 PM", done: true, current: true, remarks: "Submitted via mobile app." },
      { step: "Verified by Barangay Eco-Warden", date: "Pending", done: false, remarks: "Warden scheduled for verification." },
      { step: "Assigned to CENRO", date: "Pending", done: false, remarks: "Pending assignment." },
      { step: "Under Investigation", date: "Pending", done: false, remarks: "Pending field review." },
      { step: "Resolved", date: "Pending", done: false, remarks: "Pending action." }
    ],
    timestamp: new Date("2026-09-12T15:22:00").getTime()
  },
  {
    id: "CAR-2026-00124",
    title: "Persistent Open Waste Burning Creating Dense Smog",
    category: "Air Pollution",
    severity: "Moderate",
    barangay: "Maasin",
    landmark: "Compound behind Sitio Maligaya",
    description: "Repeated open burning of agricultural husks and plastics causing thick smoke drift across residential neighborhood and school zone.",
    photoUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80",
    latitude: 14.6480,
    longitude: 121.0740,
    status: "Investigating",
    submittedBy: "Danilo Cruz",
    userEmail: "danilo.cruz@gmail.com",
    assignedTo: "Barangay Public Safety & Clean Air Unit",
    statusRemarks: "Barangay Tanod deployed to extinguish smoldering embers. Citation ticket issued.",
    inspectionNotes: "Property owner summoned to Barangay Hall for RA 8749 compliance lecture.",
    timeline: [
      { step: "Report Submitted", date: "Sep 11, 2026 11:06 AM", done: true, remarks: "Reported by resident." },
      { step: "Verified by Barangay Eco-Warden", date: "Sep 11, 2026 11:30 AM", done: true, remarks: "Smoke plume confirmed visible." },
      { step: "Assigned to CENRO", date: "Sep 11, 2026 01:15 PM", done: true, remarks: "Air Quality unit alerted." },
      { step: "Under Investigation", date: "Sep 11, 2026 02:00 PM", done: true, current: true, remarks: "Extinguishment & enforcement in progress." },
      { step: "Resolved", date: "Pending", done: false, remarks: "Follow-up monitoring scheduled." }
    ],
    timestamp: new Date("2026-09-11T11:06:00").getTime()
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
        name: (data.name || '').trim(),
        email: data.email.toLowerCase().trim(),
        password: data.password,
        phone: (data.phone || '+63 900 000 0000').trim(),
        barangay: data.barangay || 'Barangay Makilas',
        address: (data.address || '').trim(),
        city: (data.city || 'Metro Verde City').trim(),
        province: (data.province || 'Rizal').trim(),
        zip: (data.zip || '1920').trim(),
        bio: (data.bio || '').trim(),
        avatar: '',
        emergencyContactName: (data.emergencyContactName || '').trim(),
        emergencyContactPhone: (data.emergencyContactPhone || '').trim(),
        role: 'citizen',
        status: 'Active',
        ecoPoints: 50, // Welcome bonus points
        level: 'Eco Citizen',
        badges: ['🌱 Welcome Pioneer'],
        rank: userStore.length + 1,
        kycStatus: 'unverified', // 'unverified', 'pending', 'verified', 'rejected'
        kycIdType: '',
        kycIdNumber: '',
        kycFrontImage: '',
        kycBackImage: '',
        kycSelfieImage: '',
        kycSubmittedAt: null,
        kycReviewedAt: null,
        kycReviewedBy: '',
        kycRejectReason: '',
        reportsCount: 0,
        joinedAt: Date.now(),
        createdAt: Date.now()
      };
      userStore.push(newUser);

      // Return safe user object (omit password)
      const { password, ...safeUser } = newUser;
      return sendJson(201, {
        success: true,
        message: 'Account registered successfully! Please complete your KYC verification to enable incident reporting.',
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

    // Get Citizen User Profile
    if (pathname === '/api/user/profile' && req.method === 'GET') {
      const email = (query.email || req.headers['x-user-email'] || '').trim().toLowerCase();
      if (!email) {
        return sendJson(400, { error: 'User email parameter required' });
      }
      const user = userStore.find(u => u.email.toLowerCase() === email);
      if (!user) {
        return sendJson(404, { error: 'User profile not found' });
      }
      const { password, ...safeUser } = user;
      return sendJson(200, { success: true, user: safeUser });
    }

    // Update Citizen User Profile (Profile settings, avatar, address, etc.)
    if (pathname === '/api/user/profile' && (req.method === 'PUT' || req.method === 'POST')) {
      const data = await parseBody(req);
      const email = (data.email || query.email || req.headers['x-user-email'] || '').trim().toLowerCase();
      if (!email) {
        return sendJson(400, { error: 'User email required to update profile' });
      }
      const user = userStore.find(u => u.email.toLowerCase() === email);
      if (!user) {
        return sendJson(404, { error: 'User profile not found' });
      }

      if (data.name) user.name = data.name.trim();
      if (data.phone) user.phone = data.phone.trim();
      if (data.barangay) user.barangay = data.barangay.trim();
      if (data.address !== undefined) user.address = data.address.trim();
      if (data.city !== undefined) user.city = data.city.trim();
      if (data.province !== undefined) user.province = data.province.trim();
      if (data.zip !== undefined) user.zip = data.zip.trim();
      if (data.bio !== undefined) user.bio = data.bio.trim();
      if (data.avatar !== undefined) user.avatar = data.avatar;
      if (data.emergencyContactName !== undefined) user.emergencyContactName = data.emergencyContactName.trim();
      if (data.emergencyContactPhone !== undefined) user.emergencyContactPhone = data.emergencyContactPhone.trim();

      const { password, ...safeUser } = user;
      return sendJson(200, {
        success: true,
        message: 'Profile settings updated successfully',
        user: safeUser
      });
    }

    // Citizen KYC Identity Verification Submission
    if (pathname === '/api/user/kyc/submit' && req.method === 'POST') {
      const data = await parseBody(req);
      const email = (data.email || '').trim().toLowerCase();
      if (!email) {
        return sendJson(400, { error: 'User email is required for KYC submission' });
      }
      const user = userStore.find(u => u.email.toLowerCase() === email);
      if (!user) {
        return sendJson(404, { error: 'User account not found' });
      }

      if (!data.idType || !data.idNumber) {
        return sendJson(400, { error: 'Valid government ID type and ID number are required' });
      }
      if (!data.frontImage || !data.selfieImage) {
        return sendJson(400, { error: 'Front ID image and Selfie holding ID are required for official verification' });
      }

      user.kycStatus = 'pending';
      user.kycIdType = data.idType.trim();
      user.kycIdNumber = data.idNumber.trim();
      user.kycFrontImage = data.frontImage;
      user.kycBackImage = data.backImage || '';
      user.kycSelfieImage = data.selfieImage;
      user.kycSubmittedAt = Date.now();
      user.kycRejectReason = '';

      const { password, ...safeUser } = user;
      return sendJson(200, {
        success: true,
        message: 'KYC documents submitted successfully. CENRO administration is reviewing your application.',
        user: safeUser
      });
    }

    // Citizen Media / Document / Avatar Upload Endpoint
    if (pathname === '/api/user/upload-media' && req.method === 'POST') {
      const data = await parseBody(req);
      const imagePayload = data.image || data.dataUrl || data.imageData;
      if (!imagePayload) {
        return sendJson(400, { error: 'No image data provided' });
      }

      let base64Data = imagePayload;
      let detectedExt = '.png';
      let contentType = 'image/png';

      const matches = imagePayload.match(/^data:([A-Za-z0-9+/]+);base64,(.+)$/);
      if (matches) {
        contentType = matches[1];
        base64Data = matches[2];
        if (contentType.includes('jpeg') || contentType.includes('jpg')) detectedExt = '.jpg';
        else if (contentType.includes('png')) detectedExt = '.png';
        else if (contentType.includes('webp')) detectedExt = '.webp';
        else if (contentType.includes('svg')) detectedExt = '.svg';
      }

      let buffer;
      try {
        buffer = Buffer.from(base64Data, 'base64');
      } catch (err) {
        return sendJson(400, { error: 'Failed to decode image data' });
      }

      if (!buffer || buffer.length === 0) {
        return sendJson(400, { error: 'Empty file received' });
      }
      if (buffer.length > 10 * 1024 * 1024) {
        return sendJson(400, { error: 'File exceeds 10MB limit' });
      }

      const prefix = (data.category || 'user').toLowerCase().replace(/[^a-z0-9]/g, '');
      const uniqueId = crypto.randomBytes(6).toString('hex');
      const filename = `${prefix}_${Date.now()}_${uniqueId}${detectedExt}`;
      const urlPath = `/uploads/${filename}`;

      uploadedFilesCache.set(urlPath, {
        filename,
        url: urlPath,
        category: data.category || 'user',
        buffer,
        contentType,
        size: buffer.length,
        timestamp: Date.now()
      });

      try {
        if (!fs.existsSync(UPLOADS_DIR)) {
          fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        }
        fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
      } catch (_) {}

      return sendJson(200, {
        success: true,
        url: urlPath,
        filename
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

      // Generate secure session token (30 days)
      const sessionId = 'master_admin_' + admin.id;
      const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000);
      adminSessions.set(sessionId, {
        sessionId,
        adminId: admin.id,
        role: admin.role,
        email: admin.email,
        name: admin.name,
        createdAt: Date.now(),
        expiresAt
      });
      saveAdminSessionsToDisk();

      const isSecure = req.headers['x-forwarded-proto'] === 'https';
      const sameSite = isSecure ? 'None' : 'Lax';
      const cookieHeader = `admin_session=${sessionId}; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=2592000${isSecure ? '; Secure' : ''}`;
      res.setHeader('Set-Cookie', cookieHeader);

      const { password, ...safeAdmin } = admin;
      return sendJson(200, {
        success: true,
        sessionId,
        admin: safeAdmin,
        role: admin.role
      });
    }

    // Auto-Login for Admin (Instant 1-Click Administrative Access)
    if (pathname === '/api/admin/auto-login' && req.method === 'POST') {
      const admin = adminStore[0];
      if (!admin || admin.status !== 'Active') {
        return sendJson(403, { error: 'Primary administrative account is inactive or not configured' });
      }

      const sessionId = 'master_admin_' + admin.id;
      const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000);
      adminSessions.set(sessionId, {
        sessionId,
        adminId: admin.id,
        role: admin.role,
        email: admin.email,
        name: admin.name,
        createdAt: Date.now(),
        expiresAt
      });
      saveAdminSessionsToDisk();

      const isSecure = req.headers['x-forwarded-proto'] === 'https';
      const sameSite = isSecure ? 'None' : 'Lax';
      const cookieHeader = `admin_session=${sessionId}; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=2592000${isSecure ? '; Secure' : ''}`;
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
        saveAdminSessionsToDisk();
      }
      res.setHeader('Set-Cookie', 'admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
      return sendJson(200, { success: true, message: 'Administrative session terminated' });
    }

    // ------------------------------------------
    // 3. Website Configuration & CMS
    // ------------------------------------------
    if ((pathname === '/api/config' || pathname === '/api/admin/config') && req.method === 'GET') {
      return sendJson(200, { config: websiteConfig });
    }

    if ((pathname === '/api/config' || pathname === '/api/admin/config') && (req.method === 'PUT' || req.method === 'POST')) {
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
    if ((pathname === '/api/announcements' || pathname === '/api/admin/announcements') && req.method === 'GET') {
      return sendJson(200, { announcements: announcementsStore });
    }

    if ((pathname === '/api/announcements' || pathname === '/api/admin/announcements') && req.method === 'POST') {
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
        imageUrl: data.imageUrl || '',
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

    if ((pathname.startsWith('/api/announcements/') || pathname.startsWith('/api/admin/announcements/')) && req.method === 'DELETE') {
      const session = getAdminSession(req);
      if (!session || !isAdminRole(session.role)) {
        return sendJson(401, { error: 'Unauthorized: Active administrative session required' });
      }
      const parts = pathname.split('/');
      const annId = parts[parts.length - 1];
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
        imageUrl: data.imageUrl || '',
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
    // 7.5. Admin KYC Identity Verification Management
    // ------------------------------------------
    if (pathname === '/api/admin/kyc/submissions' && req.method === 'GET') {
      const submissions = userStore.map(({ password, ...u }) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        barangay: u.barangay,
        address: u.address || '',
        city: u.city || '',
        province: u.province || '',
        avatar: u.avatar || '',
        kycStatus: u.kycStatus || 'unverified',
        kycIdType: u.kycIdType || '',
        kycIdNumber: u.kycIdNumber || '',
        kycFrontImage: u.kycFrontImage || '',
        kycBackImage: u.kycBackImage || '',
        kycSelfieImage: u.kycSelfieImage || '',
        kycSubmittedAt: u.kycSubmittedAt,
        kycReviewedAt: u.kycReviewedAt,
        kycReviewedBy: u.kycReviewedBy || '',
        kycRejectReason: u.kycRejectReason || '',
        joinedAt: u.joinedAt || u.createdAt
      }));

      const pendingCount = userStore.filter(u => u.kycStatus === 'pending').length;
      const verifiedCount = userStore.filter(u => u.kycStatus === 'verified').length;
      const rejectedCount = userStore.filter(u => u.kycStatus === 'rejected').length;

      return sendJson(200, {
        submissions,
        counts: {
          pending: pendingCount,
          verified: verifiedCount,
          rejected: rejectedCount,
          total: userStore.length
        }
      });
    }

    if (pathname === '/api/admin/kyc/review' && req.method === 'POST') {
      const session = getAdminSession(req);
      const data = await parseBody(req);
      const user = userStore.find(u => u.id === data.userId || (data.email && u.email.toLowerCase() === data.email.toLowerCase()));
      if (!user) {
        return sendJson(404, { error: 'Citizen user account not found' });
      }

      const action = (data.action || '').toLowerCase();
      if (action === 'approve') {
        user.kycStatus = 'verified';
        user.kycReviewedAt = Date.now();
        user.kycReviewedBy = session ? session.name : 'Municipal CENRO Admin';
        user.kycRejectReason = '';
        // Award verification bonus ecoPoints
        user.ecoPoints = (user.ecoPoints || 0) + 100;
        if (!user.badges.includes('🛡️ Verified Citizen')) {
          user.badges.push('🛡️ Verified Citizen');
        }
      } else if (action === 'reject') {
        user.kycStatus = 'rejected';
        user.kycReviewedAt = Date.now();
        user.kycReviewedBy = session ? session.name : 'Municipal CENRO Admin';
        user.kycRejectReason = data.reason || 'Document copy was unclear, expired, or information did not match municipal records.';
      } else {
        return sendJson(400, { error: 'Invalid action. Must be approve or reject.' });
      }

      const { password, ...safeUser } = user;
      return sendJson(200, {
        success: true,
        message: `Citizen verification has been ${action === 'approve' ? 'approved' : 'rejected'}.`,
        user: safeUser
      });
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
    // 9.5. Image Upload & Media Management (Admin)
    // ------------------------------------------
    if (pathname === '/api/admin/upload-image' && req.method === 'POST') {
      const session = getAdminSession(req);
      if (!session || !isAdminRole(session.role)) {
        return sendJson(401, { error: 'Unauthorized: Active administrative session required' });
      }

      const data = await parseBody(req);
      const imagePayload = data.image || data.dataUrl || data.imageData;
      if (!imagePayload) {
        return sendJson(400, { error: 'No image data provided' });
      }

      let base64Data = imagePayload;
      let detectedExt = '.png';
      let contentType = 'image/png';

      // Check if data URL format: data:image/png;base64,...
      const matches = imagePayload.match(/^data:([A-Za-z0-9+/]+);base64,(.+)$/);
      if (matches) {
        contentType = matches[1];
        base64Data = matches[2];
        if (contentType.includes('jpeg') || contentType.includes('jpg')) detectedExt = '.jpg';
        else if (contentType.includes('png')) detectedExt = '.png';
        else if (contentType.includes('webp')) detectedExt = '.webp';
        else if (contentType.includes('svg')) detectedExt = '.svg';
        else if (contentType.includes('gif')) detectedExt = '.gif';
      } else if (data.filename) {
        const ext = path.extname(data.filename).toLowerCase();
        if (ext) {
          detectedExt = ext;
          contentType = MIME_TYPES[ext] || 'image/png';
        }
      }

      let buffer;
      try {
        buffer = Buffer.from(base64Data, 'base64');
      } catch (err) {
        return sendJson(400, { error: 'Failed to decode base64 image data' });
      }

      if (!buffer || buffer.length === 0) {
        return sendJson(400, { error: 'Empty image buffer received' });
      }
      if (buffer.length > 10 * 1024 * 1024) {
        return sendJson(400, { error: 'Image size exceeds maximum limit of 10MB' });
      }

      const prefix = (data.category || 'media').toLowerCase().replace(/[^a-z0-9]/g, '');
      const uniqueId = crypto.randomBytes(6).toString('hex');
      const filename = `${prefix}_${Date.now()}_${uniqueId}${detectedExt}`;
      const urlPath = `/uploads/${filename}`;

      // Store in memory cache
      uploadedFilesCache.set(urlPath, {
        filename,
        url: urlPath,
        category: data.category || 'media',
        buffer,
        contentType,
        size: buffer.length,
        timestamp: Date.now()
      });

      // Write to public/uploads directory on disk
      try {
        if (!fs.existsSync(UPLOADS_DIR)) {
          fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        }
        fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
      } catch (fsErr) {
        console.warn('Could not write uploaded file to disk (served from memory cache):', fsErr.message);
      }

      return sendJson(200, {
        success: true,
        message: 'Image uploaded successfully',
        url: urlPath,
        filename,
        contentType,
        size: buffer.length
      });
    }

    if (pathname === '/api/admin/uploads' && req.method === 'GET') {
      const session = getAdminSession(req);
      if (!session || !isAdminRole(session.role)) {
        return sendJson(401, { error: 'Unauthorized: Active administrative session required' });
      }

      const list = Array.from(uploadedFilesCache.values()).map(item => ({
        url: item.url,
        filename: item.filename,
        category: item.category,
        size: item.size,
        contentType: item.contentType,
        timestamp: item.timestamp
      })).reverse();

      return sendJson(200, { uploads: list });
    }

    if (pathname.startsWith('/api/admin/uploads/') && req.method === 'DELETE') {
      const session = getAdminSession(req);
      if (!session || !isAdminRole(session.role)) {
        return sendJson(401, { error: 'Unauthorized: Active administrative session required' });
      }

      const targetFile = pathname.replace('/api/admin/uploads/', '');
      const cacheKey = `/uploads/${targetFile}`;
      uploadedFilesCache.delete(cacheKey);

      try {
        const filePath = path.join(UPLOADS_DIR, targetFile);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (_) {}

      return sendJson(200, { success: true, message: 'Image deleted successfully' });
    }

    // ------------------------------------------
    // 10. Incident Reports API
    // ------------------------------------------
    if (pathname === '/api/reports' && req.method === 'GET') {
      return sendJson(200, { reports: reportsStore });
    }

    // Citizen submit report (Requires verified KYC account)
    if (pathname === '/api/reports' && req.method === 'POST') {
      const newReport = await parseBody(req);
      if (!newReport.title || !newReport.category || !newReport.barangay) {
        return sendJson(400, { error: 'Title, category, and barangay are required' });
      }

      const userEmail = (newReport.submittedEmail || '').trim().toLowerCase();
      if (!userEmail) {
        return sendJson(401, { error: 'Authentication required: You must log into a verified citizen account to submit reports.' });
      }

      const citizen = userStore.find(u => u.email.toLowerCase() === userEmail);
      if (!citizen) {
        return sendJson(401, { error: 'Citizen user account not found. Please sign in.' });
      }

      if (citizen.kycStatus !== 'verified') {
        return sendJson(403, {
          error: 'KYC Verification Required: To prevent misinformation and fake reporting, all citizens must have their government ID verified by CENRO administration before filing reports.',
          kycStatus: citizen.kycStatus || 'unverified',
          requiresKyc: true
        });
      }

      newReport.id = newReport.id || `ECO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      newReport.timestamp = newReport.timestamp || Date.now();
      newReport.status = 'Submitted';
      newReport.assignedTo = 'Pending CENRO Dispatch';

      reportsStore.unshift(newReport);

      // Increment submitting user's reports count & award ecoPoints
      citizen.reportsCount = (citizen.reportsCount || 0) + 1;
      citizen.ecoPoints = (citizen.ecoPoints || 0) + 50;

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
    // Fast serving for uploaded images (cache or memory)
    if (uploadedFilesCache.has(pathname)) {
      const cached = uploadedFilesCache.get(pathname);
      res.writeHead(200, {
        'Content-Type': cached.contentType || 'image/png',
        'Content-Length': cached.buffer.length,
        'Cache-Control': 'public, max-age=31536000'
      });
      res.end(cached.buffer);
      return;
    }

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

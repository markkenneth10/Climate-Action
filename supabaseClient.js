// Supabase Cloud Architecture Client for ClimateAction
// Manages Real-time PostgreSQL Database, Supabase Storage, and User Accounts Sync

const path = require('path');
const fs = require('fs');

const BUCKET_NAME = 'climate-uploads';
const CONFIG_FILE = path.join(__dirname, 'supabase_config.json');
const TMP_CONFIG_FILE = path.join('/tmp', 'supabase_config.json');
const ENV_FILE = path.join(__dirname, '.env');
const TMP_ENV_FILE = path.join('/tmp', '.env');

// Helper: Check if string is a PostgreSQL connection string (postgresql://...)
function isPostgresConnStr(str) {
  return typeof str === 'string' && (str.trim().startsWith('postgresql://') || str.trim().startsWith('postgres://'));
}

// Helper: Mask sensitive credentials for UI display
function maskString(str) {
  if (!str) return '';
  if (str.length <= 12) return '••••••••';
  return str.substring(0, 10) + '••••••••' + str.substring(str.length - 4);
}

// 1. Load config from process.env, .env, or supabase_config.json
function loadConfig() {
  const config = {
    supabaseUrl: (process.env.SUPABASE_URL || '').trim(),
    supabaseServiceKey: (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim(),
    supabaseAnonKey: (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '').trim()
  };

  // Check supabase_config.json (local or /tmp)
  const configPaths = [CONFIG_FILE, TMP_CONFIG_FILE];
  for (const cfgPath of configPaths) {
    if (fs.existsSync(cfgPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
        if (data.supabaseUrl && !config.supabaseUrl) config.supabaseUrl = data.supabaseUrl.trim();
        if (data.supabaseServiceKey && !config.supabaseServiceKey) config.supabaseServiceKey = data.supabaseServiceKey.trim();
        if (data.supabaseAnonKey && !config.supabaseAnonKey) config.supabaseAnonKey = data.supabaseAnonKey.trim();
        if (data.supabaseKey && !config.supabaseAnonKey && !config.supabaseServiceKey) {
          if (data.supabaseKey.length > 100 || data.isServiceRole) {
            config.supabaseServiceKey = data.supabaseKey.trim();
          } else {
            config.supabaseAnonKey = data.supabaseKey.trim();
          }
        }
      } catch (e) {
        console.warn('Could not read config file:', e.message);
      }
    }
  }

  // Check .env file (local or /tmp)
  const envPaths = [ENV_FILE, TMP_ENV_FILE];
  for (const ep of envPaths) {
    if (fs.existsSync(ep)) {
      try {
        const content = fs.readFileSync(ep, 'utf8');
        content.split('\n').forEach(line => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) return;
          const idx = trimmed.indexOf('=');
          if (idx > 0) {
            const key = trimmed.substring(0, idx).trim();
            let val = trimmed.substring(idx + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            if (val) {
              if (key === 'SUPABASE_URL' && !config.supabaseUrl) config.supabaseUrl = val;
              if (key === 'SUPABASE_SERVICE_ROLE_KEY' && !config.supabaseServiceKey) config.supabaseServiceKey = val;
              if ((key === 'SUPABASE_ANON_KEY' || key === 'SUPABASE_KEY') && !config.supabaseAnonKey) config.supabaseAnonKey = val;
              if (!process.env[key]) process.env[key] = val;
            }
          }
        });
      } catch (e) {
        console.warn('Could not parse env file:', e.message);
      }
    }
  }

  // Ensure process.env is synced
  if (config.supabaseUrl && !process.env.SUPABASE_URL) process.env.SUPABASE_URL = config.supabaseUrl;
  if (config.supabaseServiceKey && !process.env.SUPABASE_SERVICE_ROLE_KEY) process.env.SUPABASE_SERVICE_ROLE_KEY = config.supabaseServiceKey;
  if (config.supabaseAnonKey && !process.env.SUPABASE_ANON_KEY) process.env.SUPABASE_ANON_KEY = config.supabaseAnonKey;

  return config;
}

let supabaseClient = null;
let isConnected = false;
let isStorageConnected = false;
let isUsersTableReady = false;
let lastConnectionCheck = null;
let lastError = null;

// Initialize Supabase Client
function initSupabase() {
  const config = loadConfig();
  const supabaseUrl = config.supabaseUrl;

  // Choose the best valid API key (ignoring any postgresql:// connection strings)
  let supabaseKey = '';
  if (config.supabaseServiceKey && !isPostgresConnStr(config.supabaseServiceKey)) {
    supabaseKey = config.supabaseServiceKey;
  } else if (config.supabaseAnonKey && !isPostgresConnStr(config.supabaseAnonKey)) {
    supabaseKey = config.supabaseAnonKey;
  } else if (config.supabaseServiceKey) {
    supabaseKey = config.supabaseServiceKey;
  }

  if (!supabaseUrl || !supabaseKey) {
    supabaseClient = null;
    isConnected = false;
    isStorageConnected = false;
    lastError = 'SUPABASE_URL or SUPABASE_ANON_KEY / SERVICE_ROLE_KEY not configured.';
    return false;
  }

  try {
    const { createClient } = require('@supabase/supabase-js');
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    lastError = null;
    return true;
  } catch (err) {
    console.error('Failed to initialize @supabase/supabase-js:', err.message);
    lastError = err.message;
    supabaseClient = null;
    isConnected = false;
    isStorageConnected = false;
    return false;
  }
}

// Initial client boot
initSupabase();

// -------------------------------------------------------------
// STORAGE INITIALIZATION & BUCKET MANAGEMENT
// -------------------------------------------------------------
async function initStorageBucket() {
  if (!supabaseClient) return { ready: false, error: 'Supabase client not initialized' };

  try {
    const { data: buckets, error: listErr } = await supabaseClient.storage.listBuckets();
    if (listErr) {
      isStorageConnected = false;
      return { ready: false, error: listErr.message };
    }

    const bucketExists = buckets && buckets.some(b => b.name === BUCKET_NAME);
    if (!bucketExists) {
      // Try creating bucket
      const { data: created, error: createErr } = await supabaseClient.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 15 * 1024 * 1024 // 15MB limit
      });
      if (createErr) {
        // If error indicates policy or permission, bucket may need SQL creation
        isStorageConnected = false;
        return {
          ready: false,
          bucket: BUCKET_NAME,
          needsSql: true,
          error: createErr.message
        };
      }
    }

    isStorageConnected = true;
    return {
      ready: true,
      bucket: BUCKET_NAME,
      message: `Storage bucket '${BUCKET_NAME}' is active and ready for uploads!`
    };
  } catch (err) {
    isStorageConnected = false;
    return { ready: false, error: err.message };
  }
}

// Upload buffer directly to Supabase Storage
async function uploadFileToStorage({ buffer, filename, contentType = 'image/png', folder = 'media' }) {
  if (!supabaseClient) {
    return { success: false, error: 'Supabase is not connected' };
  }

  try {
    const cleanFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
    const cleanFilename = filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const storagePath = `${cleanFolder}/${cleanFilename}`;

    const { data, error } = await supabaseClient.storage
      .from(BUCKET_NAME)
      .upload(storagePath, buffer, {
        contentType,
        upsert: true
      });

    if (error) {
      console.warn('Supabase storage upload warning:', error.message);
      return { success: false, error: error.message };
    }

    // Get public accessible URL
    const { data: publicData } = supabaseClient.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    return {
      success: true,
      publicUrl: publicData ? publicData.publicUrl : null,
      path: storagePath,
      bucket: BUCKET_NAME,
      filename: cleanFilename
    };
  } catch (err) {
    console.error('Supabase storage upload error:', err.message);
    return { success: false, error: err.message };
  }
}

// Upload Base64 image directly to Supabase Storage
async function uploadBase64Image(base64Payload, folder = 'media', prefix = 'file') {
  if (!base64Payload) return { success: false, error: 'No image data provided' };

  let base64Data = base64Payload;
  let contentType = 'image/png';
  let ext = '.png';

  const matches = base64Payload.match(/^data:([A-Za-z0-9+/]+);base64,(.+)$/);
  if (matches) {
    contentType = matches[1];
    base64Data = matches[2];
    if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = '.jpg';
    else if (contentType.includes('png')) ext = '.png';
    else if (contentType.includes('webp')) ext = '.webp';
    else if (contentType.includes('svg')) ext = '.svg';
    else if (contentType.includes('gif')) ext = '.gif';
  }

  let buffer;
  try {
    buffer = Buffer.from(base64Data, 'base64');
  } catch (e) {
    return { success: false, error: 'Failed to decode base64 data' };
  }

  const crypto = require('crypto');
  const uniqueId = crypto.randomBytes(6).toString('hex');
  const filename = `${prefix}_${Date.now()}_${uniqueId}${ext}`;

  return await uploadFileToStorage({
    buffer,
    filename,
    contentType,
    folder
  });
}

// -------------------------------------------------------------
// CONNECTION TESTING & AUTO-CONNECT DIAGNOSTICS
// -------------------------------------------------------------
async function testConnection() {
  if (!supabaseClient) {
    const initialized = initSupabase();
    if (!initialized) {
      return {
        connected: false,
        error: lastError || 'Supabase credentials are not configured in environment or .env',
        url: process.env.SUPABASE_URL ? maskString(process.env.SUPABASE_URL) : null
      };
    }
  }

  const results = {
    connected: false,
    database: { connected: false, reportsCount: 0, configReady: false, usersTableReady: false },
    storage: { ready: false, bucket: BUCKET_NAME },
    accounts: { ready: false },
    url: process.env.SUPABASE_URL ? maskString(process.env.SUPABASE_URL) : null,
    message: ''
  };

  try {
    // 1. Test reports table
    const { data: reportsData, error: repErr } = await supabaseClient
      .from('reports')
      .select('id')
      .limit(5);

    // 2. Test website_config table
    const { data: configData, error: cfgErr } = await supabaseClient
      .from('website_config')
      .select('id')
      .limit(1);

    // 3. Test users table
    const { data: usersData, error: usrErr } = await supabaseClient
      .from('users')
      .select('id')
      .limit(1);

    if (repErr && cfgErr) {
      isConnected = false;
      lastError = repErr.message || cfgErr.message;
      return {
        connected: false,
        error: lastError,
        url: results.url
      };
    }

    isConnected = true;
    lastError = null;
    lastConnectionCheck = Date.now();
    results.connected = true;
    results.database.connected = true;
    results.database.reportsCount = reportsData ? reportsData.length : 0;
    results.database.configReady = !cfgErr;
    results.database.usersTableReady = !usrErr;
    isUsersTableReady = !usrErr;
    results.accounts.ready = !usrErr;

    // 4. Test storage bucket
    const storageTest = await initStorageBucket();
    results.storage = storageTest;

    results.message = 'Successfully auto-connected to Supabase Database & Cloud Services!';
    return results;
  } catch (err) {
    isConnected = false;
    lastError = err.message;
    return { connected: false, error: err.message, url: results.url };
  }
}

// Get Client Status for UI
function getStatus() {
  const config = loadConfig();
  const hasUrl = Boolean(config.supabaseUrl);
  const hasKey = Boolean(config.supabaseServiceKey || config.supabaseAnonKey);

  return {
    configured: hasUrl && hasKey,
    connected: isConnected,
    storageConnected: isStorageConnected,
    usersTableReady: isUsersTableReady,
    storageBucket: BUCKET_NAME,
    supabaseUrl: config.supabaseUrl ? maskString(config.supabaseUrl) : null,
    hasServiceRoleKey: Boolean(config.supabaseServiceKey),
    hasAnonKey: Boolean(config.supabaseAnonKey),
    lastError,
    lastConnectionCheck
  };
}

// Save Credentials to both supabase_config.json & .env (with safe /tmp fallback for read-only filesystems)
function saveCredentials(supabaseUrl, supabaseKey, isServiceRole = false) {
  try {
    const cleanUrl = (supabaseUrl || '').trim();
    const cleanKey = (supabaseKey || '').trim();

    // 1. Immediately update process.env & in-memory config so it takes effect instantly
    process.env.SUPABASE_URL = cleanUrl;
    if (isServiceRole || cleanKey.length > 100) {
      process.env.SUPABASE_SERVICE_ROLE_KEY = cleanKey;
      delete process.env.SUPABASE_ANON_KEY;
    } else {
      process.env.SUPABASE_ANON_KEY = cleanKey;
    }

    // 2. Safely attempt to persist to supabase_config.json (try root, fallback to /tmp)
    const configData = {
      supabaseUrl: cleanUrl,
      isServiceRole: Boolean(isServiceRole),
      updatedAt: new Date().toISOString()
    };
    if (isServiceRole || cleanKey.length > 100) {
      configData.supabaseServiceKey = cleanKey;
    } else {
      configData.supabaseAnonKey = cleanKey;
    }
    const jsonStr = JSON.stringify(configData, null, 2);

    try {
      fs.writeFileSync(CONFIG_FILE, jsonStr, 'utf8');
    } catch (_) {}
    try {
      fs.writeFileSync(TMP_CONFIG_FILE, jsonStr, 'utf8');
    } catch (_) {}

    // 3. Safely attempt to persist to .env (try root, fallback to /tmp)
    try {
      let envContent = '';
      if (fs.existsSync(ENV_FILE)) {
        try { envContent = fs.readFileSync(ENV_FILE, 'utf8'); } catch (_) {}
      } else if (fs.existsSync(TMP_ENV_FILE)) {
        try { envContent = fs.readFileSync(TMP_ENV_FILE, 'utf8'); } catch (_) {}
      }
      const lines = envContent.split('\n').filter(l => {
        const t = l.trim();
        return !t.startsWith('SUPABASE_URL=') &&
               !t.startsWith('SUPABASE_ANON_KEY=') &&
               !t.startsWith('SUPABASE_SERVICE_ROLE_KEY=');
      });

      lines.push(`SUPABASE_URL=${cleanUrl}`);
      if (isServiceRole || cleanKey.length > 100) {
        lines.push(`SUPABASE_SERVICE_ROLE_KEY=${cleanKey}`);
      } else {
        lines.push(`SUPABASE_ANON_KEY=${cleanKey}`);
      }
      const newEnvContent = lines.join('\n') + '\n';
      try {
        fs.writeFileSync(ENV_FILE, newEnvContent, 'utf8');
      } catch (_) {}
      try {
        fs.writeFileSync(TMP_ENV_FILE, newEnvContent, 'utf8');
      } catch (_) {}
    } catch (_) {}

    initSupabase();
    return { success: true };
  } catch (err) {
    // Even if filesystem encounters an error, in-memory config was updated
    try { initSupabase(); } catch (_) {}
    return { success: true, warning: 'Credentials active in memory (' + err.message + ')' };
  }
}

// -------------------------------------------------------------
// USER ACCOUNTS DATA OPERATIONS
// -------------------------------------------------------------
function mapUserToSupabaseRow(user) {
  if (!user || typeof user !== 'object') return user;
  return {
    id: String(user.id || `user-${Date.now()}`),
    name: user.name || 'Citizen User',
    email: (user.email || '').toLowerCase().trim(),
    password: user.password || null,
    phone: user.phone || null,
    role: user.role || 'citizen',
    barangay: user.barangay || 'Barangay Makilas',
    address: user.address || null,
    city: user.city || null,
    province: user.province || null,
    zip: user.zip || null,
    bio: user.bio || null,
    avatar: user.avatar || null,
    kyc_status: user.kycStatus || 'unverified',
    kyc_id_type: user.kycIdType || null,
    kyc_id_number: user.kycIdNumber || null,
    kyc_front_image: user.kycFrontImage || null,
    kyc_back_image: user.kycBackImage || null,
    kyc_selfie_image: user.kycSelfieImage || null,
    kyc_submitted_at: user.kycSubmittedAt ? Number(user.kycSubmittedAt) : null,
    kyc_reject_reason: user.kycRejectReason || null,
    eco_points: typeof user.ecoPoints === 'number' ? user.ecoPoints : (parseInt(user.ecoPoints, 10) || 50),
    reports_count: typeof user.reportsCount === 'number' ? user.reportsCount : (parseInt(user.reportsCount, 10) || 0),
    created_at: typeof user.createdAt === 'number' ? user.createdAt : Date.now(),
    updated_at: Date.now()
  };
}

function mapSupabaseRowToUser(row) {
  if (!row || typeof row !== 'object') return row;
  return {
    id: row.id,
    name: row.name,
    email: (row.email || '').toLowerCase().trim(),
    password: row.password || '',
    phone: row.phone || '',
    role: row.role || 'citizen',
    barangay: row.barangay || '',
    address: row.address || '',
    city: row.city || '',
    province: row.province || '',
    zip: row.zip || '',
    bio: row.bio || '',
    avatar: row.avatar || '',
    kycStatus: row.kyc_status || 'unverified',
    kycIdType: row.kyc_id_type || '',
    kycIdNumber: row.kyc_id_number || '',
    kycFrontImage: row.kyc_front_image || '',
    kycBackImage: row.kyc_back_image || '',
    kycSelfieImage: row.kyc_selfie_image || '',
    kycSubmittedAt: row.kyc_submitted_at ? Number(row.kyc_submitted_at) : null,
    kycRejectReason: row.kyc_reject_reason || '',
    ecoPoints: typeof row.eco_points === 'number' ? row.eco_points : 50,
    reportsCount: typeof row.reports_count === 'number' ? row.reports_count : 0,
    status: 'Active',
    createdAt: typeof row.created_at === 'number' ? row.created_at : Date.now()
  };
}

// Fetch all registered users from Supabase
async function fetchUsersFromSupabase() {
  if (!supabaseClient) return null;
  try {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST205' || error.code === '42P01') {
        isUsersTableReady = false;
      }
      return null;
    }
    isUsersTableReady = true;
    return (data || []).map(mapSupabaseRowToUser);
  } catch (err) {
    console.warn('Supabase fetchUsers warning:', err.message);
    return null;
  }
}

// Save or Upsert single user into Supabase
async function saveUserToSupabase(user) {
  if (!supabaseClient || !user || !user.email) return false;
  try {
    const row = mapUserToSupabaseRow(user);
    const { error } = await supabaseClient
      .from('users')
      .upsert(row, { onConflict: 'email' });

    if (error) {
      console.warn('Supabase saveUser warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase saveUser error:', err.message);
    return false;
  }
}

// Update single user in Supabase
async function updateUserInSupabase(emailOrId, updates) {
  if (!supabaseClient || !emailOrId) return false;
  try {
    const dbUpdates = { updated_at: Date.now() };
    const keyMap = {
      name: 'name',
      phone: 'phone',
      barangay: 'barangay',
      address: 'address',
      city: 'city',
      province: 'province',
      zip: 'zip',
      bio: 'bio',
      avatar: 'avatar',
      password: 'password',
      role: 'role',
      kycStatus: 'kyc_status',
      kycIdType: 'kyc_id_type',
      kycIdNumber: 'kyc_id_number',
      kycFrontImage: 'kyc_front_image',
      kycBackImage: 'kyc_back_image',
      kycSelfieImage: 'kyc_selfie_image',
      kycSubmittedAt: 'kyc_submitted_at',
      kycRejectReason: 'kyc_reject_reason',
      ecoPoints: 'eco_points',
      reportsCount: 'reports_count'
    };

    for (const [k, v] of Object.entries(updates)) {
      const target = keyMap[k] || k;
      dbUpdates[target] = v;
    }

    let query = supabaseClient.from('users').update(dbUpdates);
    if (String(emailOrId).includes('@')) {
      query = query.eq('email', String(emailOrId).toLowerCase().trim());
    } else {
      query = query.eq('id', emailOrId);
    }

    const { error } = await query;
    if (error) {
      console.warn('Supabase updateUser warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase updateUser error:', err.message);
    return false;
  }
}

// -------------------------------------------------------------
// WEBSITE CONFIG & CMS OPERATIONS
// -------------------------------------------------------------
async function fetchConfigFromSupabase() {
  if (!supabaseClient) return null;
  try {
    const { data, error } = await supabaseClient
      .from('website_config')
      .select('config')
      .eq('id', 1)
      .maybeSingle();

    if (error || !data) return null;
    return data.config;
  } catch (err) {
    console.warn('Supabase fetchConfig warning:', err.message);
    return null;
  }
}

async function syncConfigToSupabase(config) {
  if (!supabaseClient) return false;
  try {
    const { error } = await supabaseClient
      .from('website_config')
      .upsert({
        id: 1,
        config: config,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase syncConfig warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase syncConfig error:', err.message);
    return false;
  }
}

// -------------------------------------------------------------
// CITIZEN INCIDENT REPORTS OPERATIONS
// -------------------------------------------------------------
function mapReportToSupabaseRow(report) {
  if (!report || typeof report !== 'object') return report;
  return {
    id: report.id,
    title: report.title,
    category: report.category,
    severity: report.severity || 'Moderate',
    barangay: report.barangay,
    landmark: report.landmark || null,
    description: report.description,
    photo_url: report.photoUrl || report.photo_url || null,
    latitude: typeof report.latitude === 'number' ? report.latitude : (parseFloat(report.latitude) || 14.5995),
    longitude: typeof report.longitude === 'number' ? report.longitude : (parseFloat(report.longitude) || 120.9842),
    status: report.status || 'Submitted',
    submitted_by: report.submittedBy || report.submitted_by || 'Anonymous Citizen',
    user_email: report.userEmail || report.user_email || null,
    assigned_to: report.assignedTo || report.assigned_to || null,
    status_remarks: report.statusRemarks || report.status_remarks || null,
    inspection_notes: report.inspectionNotes || report.inspection_notes || null,
    timeline: report.timeline ? (typeof report.timeline === 'string' ? JSON.parse(report.timeline) : report.timeline) : null,
    timestamp: typeof report.timestamp === 'number' ? report.timestamp : Date.now()
  };
}

function mapSupabaseRowToReport(row) {
  if (!row || typeof row !== 'object') return row;
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    severity: row.severity,
    barangay: row.barangay,
    landmark: row.landmark,
    description: row.description,
    photoUrl: row.photo_url || row.photoUrl || null,
    latitude: row.latitude,
    longitude: row.longitude,
    status: row.status,
    submittedBy: row.submitted_by || row.submittedBy,
    userEmail: row.user_email || row.userEmail,
    assignedTo: row.assigned_to || row.assignedTo,
    statusRemarks: row.status_remarks || row.statusRemarks,
    inspectionNotes: row.inspection_notes || row.inspectionNotes,
    timeline: row.timeline,
    timestamp: typeof row.timestamp === 'string' ? parseInt(row.timestamp, 10) : (row.timestamp || Date.now())
  };
}

async function fetchReportsFromSupabase() {
  if (!supabaseClient) return null;
  try {
    const { data, error } = await supabaseClient
      .from('reports')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error || !data) return null;
    return data.map(mapSupabaseRowToReport);
  } catch (err) {
    console.warn('Supabase fetchReports warning:', err.message);
    return null;
  }
}

async function saveReportToSupabase(report) {
  if (!supabaseClient) return false;
  try {
    const row = mapReportToSupabaseRow(report);
    const { error } = await supabaseClient
      .from('reports')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase saveReport warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase saveReport error:', err.message);
    return false;
  }
}

async function updateReportInSupabase(id, updates) {
  if (!supabaseClient) return false;
  try {
    const dbUpdates = {};
    const keyMap = {
      title: 'title',
      category: 'category',
      severity: 'severity',
      barangay: 'barangay',
      landmark: 'landmark',
      description: 'description',
      photoUrl: 'photo_url',
      photo_url: 'photo_url',
      latitude: 'latitude',
      longitude: 'longitude',
      status: 'status',
      submittedBy: 'submitted_by',
      submitted_by: 'submitted_by',
      userEmail: 'user_email',
      user_email: 'user_email',
      assignedTo: 'assigned_to',
      assigned_to: 'assigned_to',
      statusRemarks: 'status_remarks',
      status_remarks: 'status_remarks',
      inspectionNotes: 'inspection_notes',
      inspection_notes: 'inspection_notes',
      timeline: 'timeline',
      timestamp: 'timestamp'
    };
    for (const [k, v] of Object.entries(updates)) {
      const targetKey = keyMap[k] || k;
      dbUpdates[targetKey] = v;
    }

    const { error } = await supabaseClient
      .from('reports')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.warn('Supabase updateReport warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase updateReport error:', err.message);
    return false;
  }
}

async function deleteReportInSupabase(id) {
  if (!supabaseClient) return false;
  try {
    const { error } = await supabaseClient
      .from('reports')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('Supabase deleteReport warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase deleteReport error:', err.message);
    return false;
  }
}

// -------------------------------------------------------------
// COMPREHENSIVE SUPABASE SQL SCHEMA SCRIPT
// -------------------------------------------------------------
const SQL_SCHEMA_SCRIPT = `-- ==========================================================
-- CLIMATE ACTION SYSTEM: SUPABASE DATABASE & STORAGE INITIALIZATION
-- Copy and paste this script into Supabase SQL Editor and click RUN
-- ==========================================================

-- 1. Storage Bucket Creation (Public bucket for Incident Photos, Avatars, KYC)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'climate-uploads',
  'climate-uploads',
  true,
  15728640,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies: Enable Public Read & Public Upload
DROP POLICY IF EXISTS "Public Read Climate Uploads" ON storage.objects;
CREATE POLICY "Public Read Climate Uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'climate-uploads');

DROP POLICY IF EXISTS "Public Insert Climate Uploads" ON storage.objects;
CREATE POLICY "Public Insert Climate Uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'climate-uploads');

DROP POLICY IF EXISTS "Public Update Climate Uploads" ON storage.objects;
CREATE POLICY "Public Update Climate Uploads" ON storage.objects
  FOR UPDATE USING (bucket_id = 'climate-uploads');

-- 2. Website Configuration Table (Branding, Logos, Weather & Alerts)
CREATE TABLE IF NOT EXISTS public.website_config (
  id INT PRIMARY KEY DEFAULT 1,
  config JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 3. Citizen Incident Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT DEFAULT 'Moderate',
  barangay TEXT NOT NULL,
  landmark TEXT,
  description TEXT NOT NULL,
  photo_url TEXT,
  latitude DOUBLE PRECISION DEFAULT 14.5995,
  longitude DOUBLE PRECISION DEFAULT 120.9842,
  status TEXT DEFAULT 'Submitted',
  submitted_by TEXT NOT NULL,
  user_email TEXT,
  assigned_to TEXT,
  status_remarks TEXT,
  inspection_notes TEXT,
  timeline JSONB,
  timestamp BIGINT NOT NULL
);

-- 4. Citizen Registered Accounts & KYC Data Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT,
  phone TEXT,
  role TEXT DEFAULT 'citizen',
  barangay TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  zip TEXT,
  bio TEXT,
  avatar TEXT,
  kyc_status TEXT DEFAULT 'unverified',
  kyc_id_type TEXT,
  kyc_id_number TEXT,
  kyc_front_image TEXT,
  kyc_back_image TEXT,
  kyc_selfie_image TEXT,
  kyc_submitted_at BIGINT,
  kyc_reject_reason TEXT,
  eco_points INT DEFAULT 50,
  reports_count INT DEFAULT 0,
  created_at BIGINT,
  updated_at BIGINT
);

-- 5. Row Level Security (RLS) Setup
ALTER TABLE public.website_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow public reads
CREATE POLICY "Public Read Website Config" ON public.website_config FOR SELECT USING (true);
CREATE POLICY "Public Read Reports" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Public Read Users" ON public.users FOR SELECT USING (true);

-- Allow public report creation and user registration
CREATE POLICY "Public Insert Reports" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Users" ON public.users FOR INSERT WITH CHECK (true);

-- Allow updates
CREATE POLICY "Public Update Website Config" ON public.website_config FOR UPDATE USING (true);
CREATE POLICY "Public Update Reports" ON public.reports FOR UPDATE USING (true);
CREATE POLICY "Public Update Users" ON public.users FOR UPDATE USING (true);

-- Full administrative access
CREATE POLICY "Service Role All Config" ON public.website_config FOR ALL USING (true);
CREATE POLICY "Service Role All Reports" ON public.reports FOR ALL USING (true);
CREATE POLICY "Service Role All Users" ON public.users FOR ALL USING (true);
`;

module.exports = {
  BUCKET_NAME,
  initSupabase,
  initStorageBucket,
  uploadFileToStorage,
  uploadBase64Image,
  testConnection,
  getStatus,
  saveCredentials,
  // User accounts
  fetchUsersFromSupabase,
  saveUserToSupabase,
  updateUserInSupabase,
  // Reports
  fetchReportsFromSupabase,
  saveReportToSupabase,
  updateReportInSupabase,
  deleteReportInSupabase,
  // Config
  fetchConfigFromSupabase,
  syncConfigToSupabase,
  SQL_SCHEMA_SCRIPT
};

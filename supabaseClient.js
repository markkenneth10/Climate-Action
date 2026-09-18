// Supabase Database Integration Client for ClimateAction
// Manages real-time PostgreSQL synchronization for Citizen Reports & Website Config

const path = require('path');
const fs = require('fs');

// Load environment variables from .env file if present
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
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
          if (val && !process.env[key]) {
            process.env[key] = val;
          }
        }
      });
    } catch (e) {
      console.warn('Could not parse .env file:', e.message);
    }
  }
}
loadEnv();

let supabaseClient = null;
let isConnected = false;
let lastConnectionCheck = null;
let lastError = null;

// Initialize Supabase Client
function initSupabase() {
  loadEnv();
  const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
  // Valid Supabase API key should not be a PostgreSQL connection string (postgresql://...)
  const isPostgresConnStr = (k) => typeof k === 'string' && k.trim().startsWith('postgresql://');
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const anonKey = (process.env.SUPABASE_ANON_KEY || '').trim();
  let supabaseKey = '';
  if (serviceKey && !isPostgresConnStr(serviceKey)) {
    supabaseKey = serviceKey;
  } else if (anonKey && !isPostgresConnStr(anonKey)) {
    supabaseKey = anonKey;
  } else if (serviceKey) {
    supabaseKey = serviceKey;
  }

  if (!supabaseUrl || !supabaseKey) {
    supabaseClient = null;
    isConnected = false;
    lastError = 'SUPABASE_URL or SUPABASE_ANON_KEY not configured.';
    return false;
  }

  try {
    const { createClient } = require('@supabase/supabase-js');
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    lastError = null;
    return true;
  } catch (err) {
    console.error('Failed to initialize @supabase/supabase-js:', err.message);
    lastError = err.message;
    supabaseClient = null;
    isConnected = false;
    return false;
  }
}

// Initial setup attempt
initSupabase();

// Test Connection
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

  try {
    // Attempt lightweight select from website_config or reports
    const { data, error } = await supabaseClient
      .from('website_config')
      .select('id')
      .limit(1);

    if (error) {
      // If table doesn't exist yet, test with another query or report schema status
      if (error.code === '42P01') {
        isConnected = true;
        lastError = 'Connected to Supabase project! Database tables need to be created using SQL Editor.';
        return {
          connected: true,
          schemaNeeded: true,
          message: lastError,
          url: maskString(process.env.SUPABASE_URL)
        };
      }
      isConnected = false;
      lastError = error.message;
      return { connected: false, error: error.message, code: error.code };
    }

    isConnected = true;
    lastError = null;
    lastConnectionCheck = Date.now();
    return {
      connected: true,
      schemaReady: true,
      message: 'Successfully connected to Supabase PostgreSQL database!',
      url: maskString(process.env.SUPABASE_URL)
    };
  } catch (err) {
    isConnected = false;
    lastError = err.message;
    return { connected: false, error: err.message };
  }
}

// Mask sensitive credentials for UI display
function maskString(str) {
  if (!str) return '';
  if (str.length <= 12) return '••••••••';
  return str.substring(0, 10) + '••••••••' + str.substring(str.length - 4);
}

// Get Client Status
function getStatus() {
  const hasUrl = Boolean(process.env.SUPABASE_URL);
  const hasKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);
  return {
    configured: hasUrl && hasKey,
    connected: isConnected,
    supabaseUrl: process.env.SUPABASE_URL ? maskString(process.env.SUPABASE_URL) : null,
    hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    hasAnonKey: Boolean(process.env.SUPABASE_ANON_KEY),
    lastError,
    lastConnectionCheck
  };
}

// Save Credentials to .env & reload
function saveCredentials(supabaseUrl, supabaseKey, isServiceRole = false) {
  try {
    const envPath = path.join(__dirname, '.env');
    let content = '';
    if (fs.existsSync(envPath)) {
      content = fs.readFileSync(envPath, 'utf8');
    }

    // Clean up existing keys
    const lines = content.split('\n').filter(l => {
      const trimmed = l.trim();
      return !trimmed.startsWith('SUPABASE_URL=') &&
             !trimmed.startsWith('SUPABASE_ANON_KEY=') &&
             !trimmed.startsWith('SUPABASE_SERVICE_ROLE_KEY=');
    });

    lines.push(`SUPABASE_URL=${supabaseUrl.trim()}`);
    if (isServiceRole) {
      lines.push(`SUPABASE_SERVICE_ROLE_KEY=${supabaseKey.trim()}`);
    } else {
      lines.push(`SUPABASE_ANON_KEY=${supabaseKey.trim()}`);
    }

    fs.writeFileSync(envPath, lines.join('\n') + '\n', 'utf8');
    
    // Update process.env directly
    process.env.SUPABASE_URL = supabaseUrl.trim();
    if (isServiceRole) {
      process.env.SUPABASE_SERVICE_ROLE_KEY = supabaseKey.trim();
    } else {
      process.env.SUPABASE_ANON_KEY = supabaseKey.trim();
    }

    initSupabase();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// -------------------------------------------------------------
// SUPABASE DATA OPERATIONS (with Graceful Fallback)
// -------------------------------------------------------------

// 1. Fetch Website Config
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
    console.warn('Supabase fetchConfig error:', err.message);
    return null;
  }
}

// 2. Sync Website Config
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

// Helper: Map in-memory JavaScript report (camelCase) to Supabase Postgres row (snake_case)
function mapReportToSupabaseRow(report) {
  if (!report || typeof report !== 'object') return report;
  const row = {
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
  return row;
}

// Helper: Map Supabase Postgres row (snake_case) to in-memory JavaScript report (camelCase)
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

// 3. Fetch Reports
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
    console.warn('Supabase fetchReports error:', err.message);
    return null;
  }
}

// 4. Save/Insert Report
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

// 5. Update Report
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

// 6. Delete Report
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

// SQL Schema for User Reference
const SQL_SCHEMA_SCRIPT = `-- ==========================================================
-- CLIMATE ACTION SYSTEM: SUPABASE DATABASE INITIALIZATION SCHEMA
-- Copy and paste this script into Supabase SQL Editor and click RUN
-- ==========================================================

-- 1. Website Configuration Table (Branding, Logos, Weather & Alerts)
CREATE TABLE IF NOT EXISTS public.website_config (
  id INT PRIMARY KEY DEFAULT 1,
  config JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 2. Citizen Incident Reports Table
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

-- 3. Row Level Security (RLS) Setup
ALTER TABLE public.website_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Allow public reads
CREATE POLICY "Public Read Website Config" ON public.website_config FOR SELECT USING (true);
CREATE POLICY "Public Read Reports" ON public.reports FOR SELECT USING (true);

-- Allow public report creation
CREATE POLICY "Public Insert Reports" ON public.reports FOR INSERT WITH CHECK (true);

-- Allow updates from server & authenticated administrators
CREATE POLICY "Service Role All Config" ON public.website_config FOR ALL USING (true);
CREATE POLICY "Service Role All Reports" ON public.reports FOR ALL USING (true);
`;

module.exports = {
  initSupabase,
  testConnection,
  getStatus,
  saveCredentials,
  fetchConfigFromSupabase,
  syncConfigToSupabase,
  fetchReportsFromSupabase,
  saveReportToSupabase,
  updateReportInSupabase,
  deleteReportInSupabase,
  SQL_SCHEMA_SCRIPT
};

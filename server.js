// ClimateAction Web Server (Node.js)
// Serves responsive Web Portal and REST API on port 3000

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.WEB_PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

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

// In-memory data store with default seed data
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
    timestamp: Date.now() - 3600000 * 28
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
    timestamp: Date.now() - 3600000 * 46
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
    timestamp: Date.now() - 3600000 * 72
  }
];

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // REST API Routes
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'Mobile & Web Climate Action Reporting System',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: Date.now()
    }));
    return;
  }

  if (pathname === '/api/reports' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ reports: reportsStore }));
    return;
  }

  if (pathname === '/api/reports' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const newReport = JSON.parse(body);
        newReport.id = newReport.id || `ECO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        newReport.timestamp = newReport.timestamp || Date.now();
        newReport.status = newReport.status || 'Submitted';
        reportsStore.unshift(newReport);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, report: newReport }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  if (pathname.startsWith('/api/reports/') && req.method === 'PUT') {
    const reportId = pathname.split('/')[3];
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const updateData = JSON.parse(body);
        const report = reportsStore.find(r => r.id === reportId);
        if (!report) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Report not found' }));
          return;
        }
        Object.assign(report, updateData);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, report }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  if (pathname === '/api/stats') {
    const total = reportsStore.length;
    const resolved = reportsStore.filter(r => r.status === 'Resolved' || r.status === 'Closed').length;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      totalReports: total,
      resolvedReports: resolved,
      resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(1) + '%' : '0%'
    }));
    return;
  }

  // Static File Serving
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

  // Security check: ensure filePath is within PUBLIC_DIR
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA routing
      filePath = path.join(PUBLIC_DIR, 'index.html');
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
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌱 ClimateAction Web Portal listening on port ${PORT}`);
});

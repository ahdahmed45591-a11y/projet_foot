const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.mp4': 'video/mp4'
};

function readDB() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    return { players: [], scouts: [], admins: [], detections: [], posts: [], messages: [] };
  }
}

function writeDB(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let reqPath = decodeURI(parsedUrl.pathname);

  // --- API REST NATIF FUTURPRO ---
  if (reqPath.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }

    const db = readDB();

    // 1. Inscription Joueur
    if (reqPath === '/api/joueur/register' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const newPlayer = JSON.parse(body);
          newPlayer.id = 'p_' + Date.now();
          newPlayer.status = 'actif';
          newPlayer.dateInscription = new Date().toISOString().split('T')[0];
          db.players.unshift(newPlayer);
          writeDB(db);
          res.writeHead(200);
          return res.end(JSON.stringify({ success: true, player: newPlayer }));
        } catch (e) {
          res.writeHead(400);
          return res.end(JSON.stringify({ error: 'Données invalides' }));
        }
      });
      return;
    }

    // 2. Inscription Recruteur
    if (reqPath === '/api/recruteur/register' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const newScout = JSON.parse(body);
          newScout.id = 's_' + Date.now();
          newScout.savedPlayers = [];
          newScout.status = 'verifie';
          db.scouts.unshift(newScout);
          writeDB(db);
          res.writeHead(200);
          return res.end(JSON.stringify({ success: true, scout: newScout }));
        } catch (e) {
          res.writeHead(400);
          return res.end(JSON.stringify({ error: 'Données invalides' }));
        }
      });
      return;
    }

    // 3. Sauvegarder / Retirer un joueur (Favoris Recruteur)
    if (reqPath === '/api/recruteur/save-player' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const { scoutId, playerId } = JSON.parse(body);
          const scout = db.scouts.find(s => s.id === scoutId) || db.scouts[0];
          if (scout) {
            if (!scout.savedPlayers) scout.savedPlayers = [];
            const idx = scout.savedPlayers.indexOf(playerId);
            if (idx > -1) {
              scout.savedPlayers.splice(idx, 1);
            } else {
              scout.savedPlayers.push(playerId);
            }
            writeDB(db);
            res.writeHead(200);
            return res.end(JSON.stringify({ success: true, savedPlayers: scout.savedPlayers }));
          }
          res.writeHead(404);
          return res.end(JSON.stringify({ error: 'Recruteur non trouvé' }));
        } catch (e) {
          res.writeHead(400);
          return res.end(JSON.stringify({ error: 'Erreur requête' }));
        }
      });
      return;
    }

    // 4. Données complètes DB (pour vues dynamiques)
    if (reqPath === '/api/data' && req.method === 'GET') {
      res.writeHead(200);
      return res.end(JSON.stringify(db));
    }

    // 5. Action Admin / Sous-Admin (validation, suppression, ajout détection)
    if (reqPath === '/api/admin/action' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const { action, targetId, payload } = JSON.parse(body);
          if (action === 'delete_player') {
            db.players = db.players.filter(p => p.id !== targetId);
          } else if (action === 'toggle_player_status') {
            const p = db.players.find(p => p.id === targetId);
            if (p) p.status = p.status === 'actif' ? 'suspendu' : 'actif';
          } else if (action === 'add_detection') {
            payload.id = 'det_' + Date.now();
            db.detections.unshift(payload);
          } else if (action === 'delete_detection') {
            db.detections = db.detections.filter(d => d.id !== targetId);
          }
          writeDB(db);
          res.writeHead(200);
          return res.end(JSON.stringify({ success: true, db }));
        } catch (e) {
          res.writeHead(400);
          return res.end(JSON.stringify({ error: 'Erreur action admin' }));
        }
      });
      return;
    }

    res.writeHead(404);
    return res.end(JSON.stringify({ error: 'Route API introuvable' }));
  }

  // --- ROUTAGE DES PAGES ---
  if (reqPath === '/') reqPath = '/index.html';
  if (reqPath === '/app' || reqPath === '/mobile') reqPath = '/mobile.html';
  if (reqPath === '/joueurs') reqPath = '/joueurs.html';
  if (reqPath === '/recruteurs') reqPath = '/recruteurs.html';
  if (reqPath === '/admin') reqPath = '/admin.html';
  if (reqPath === '/detections') reqPath = '/detections.html';
  if (reqPath === '/blog' || reqPath === '/actualites') reqPath = '/blog.html';
  if (reqPath === '/connexion') reqPath = '/connexion.html';

  const filePath = path.join(__dirname, reqPath);

  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end('Accès interdit');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Page non trouvée');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Support streaming vidéo MP4
    if (ext === '.mp4') {
      const range = req.headers.range;
      if (!range) {
        res.writeHead(200, {
          'Content-Type': 'video/mp4',
          'Content-Length': stats.size,
          'Accept-Ranges': 'bytes'
        });
        return fs.createReadStream(filePath).pipe(res);
      }
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunksize = (end - start) + 1;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4'
      });
      return fs.createReadStream(filePath, { start, end }).pipe(res);
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Serveur FuturPro actif sur http://localhost:${PORT}`);
});

import http from 'node:http';
import { URL } from 'node:url';
import dotenv from 'dotenv';
import { pool, initDb } from './db.js';
import { sendZeptoMail } from './email.js';

dotenv.config();

const PORT = process.env.PORT || 3001;

// Initialize database tables on server start
initDb().catch((err) => {
  console.error('Failed to initialize database tables:', err);
});

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
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

const server = http.createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  try {
    // 1. Health check
    if (req.method === 'GET' && pathname === '/api/health') {
      const result = await pool.query('SELECT NOW() as db_time');
      return sendJson(res, 200, { status: 'ok', db_time: result.rows[0].db_time });
    }

    // 2. Create or update proposal
    if (req.method === 'POST' && pathname === '/api/proposals') {
      const body = await parseJsonBody(req);
      const { id, creator_email, creator_name, partner_name, sender_name, question, config_json } = body;
      const proposalId = id || `love-${Date.now().toString(36)}`;

      const query = `
        INSERT INTO proposals (id, creator_email, creator_name, partner_name, sender_name, question, config_json)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          creator_email = COALESCE(EXCLUDED.creator_email, proposals.creator_email),
          creator_name = COALESCE(EXCLUDED.creator_name, proposals.creator_name),
          partner_name = EXCLUDED.partner_name,
          sender_name = EXCLUDED.sender_name,
          question = EXCLUDED.question,
          config_json = EXCLUDED.config_json
        RETURNING *;
      `;

      const result = await pool.query(query, [
        proposalId,
        creator_email || null,
        creator_name || null,
        partner_name || 'My Dearest',
        sender_name || 'Yours Truly',
        question || 'Will you be my girlfriend?',
        config_json || {}
      ]);

      return sendJson(res, 200, { success: true, proposal: result.rows[0] });
    }

    // 3. Get proposal by ID
    if (req.method === 'GET' && pathname.startsWith('/api/proposals/')) {
      const id = pathname.replace('/api/proposals/', '');
      const result = await pool.query('SELECT * FROM proposals WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return sendJson(res, 404, { error: 'Proposal not found' });
      }
      return sendJson(res, 200, result.rows[0]);
    }

    // 4. Record interaction event (analytics)
    if (req.method === 'POST' && pathname === '/api/events') {
      const body = await parseJsonBody(req);
      const { proposal_id, event_type, chapter, data_json } = body;
      const pid = proposal_id || 'default';

      const result = await pool.query(
        `INSERT INTO events (proposal_id, event_type, chapter, data_json)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [pid, event_type || 'interaction', chapter || 0, data_json || {}]
      );

      return sendJson(res, 200, { success: true, event: result.rows[0] });
    }

    // 5. Record final response ('yes' | 'no') and trigger ZeptoMail alert
    if (req.method === 'POST' && pathname === '/api/response') {
      const body = await parseJsonBody(req);
      const { proposal_id, answer, tease_attempts, notes } = body;
      const pid = proposal_id || 'default';

      const result = await pool.query(
        `INSERT INTO responses (proposal_id, answer, tease_attempts, notes)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [pid, answer, tease_attempts || 0, notes || null]
      );

      // Fetch proposal details to get creator's email if available
      try {
        const propQuery = await pool.query('SELECT * FROM proposals WHERE id = $1', [pid]);
        const proposal = propQuery.rows[0];

        if (proposal?.creator_email) {
          const isYes = answer === 'yes';
          const subject = isYes
            ? `💖 ${proposal.partner_name} SAID YES! Proposal Accepted!`
            : `A message regarding your proposal to ${proposal.partner_name}`;

          const htmlBody = `
            <div style="font-family: Arial, sans-serif; padding: 24px; background: #fff1f2; color: #333; border-radius: 12px;">
              <h1 style="color: ${isYes ? '#e11d48' : '#64748b'};">${isYes ? 'SHE SAID YES! 🎉🥰' : 'Proposal Response Received'}</h1>
              <p><strong>${proposal.partner_name}</strong> just completed your proposal story!</p>
              <p><strong>Answer:</strong> <span style="font-size: 18px; color: ${isYes ? '#e11d48' : '#64748b'}; font-weight: bold;">${answer.toUpperCase()}</span></p>
              <p><strong>Playful tease attempts:</strong> ${tease_attempts || 0}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              <hr style="border: 0; border-top: 1px solid #fecdd3; margin: 20px 0;" />
              <p style="font-size: 12px; color: #888;">Recorded via your Love Proposal Platform.</p>
            </div>
          `;

          sendZeptoMail({
            toEmail: proposal.creator_email,
            toName: proposal.creator_name || proposal.sender_name,
            subject,
            htmlBody
          }).catch(console.error);
        }
      } catch (emailErr) {
        console.error('Email alert trigger error:', emailErr);
      }

      return sendJson(res, 200, { success: true, response: result.rows[0] });
    }

    // 6. Analytics Dashboard
    if (req.method === 'GET' && pathname.startsWith('/api/dashboard/')) {
      const id = pathname.replace('/api/dashboard/', '');

      // Fetch proposal
      const propRes = await pool.query('SELECT * FROM proposals WHERE id = $1', [id]);
      const proposal = propRes.rows[0] || null;

      // Fetch latest response
      const respRes = await pool.query(
        'SELECT * FROM responses WHERE proposal_id = $1 ORDER BY created_at DESC LIMIT 1',
        [id]
      );
      const latestResponse = respRes.rows[0] || null;

      // Fetch total events count
      const countRes = await pool.query(
        'SELECT COUNT(*) as total_events FROM events WHERE proposal_id = $1',
        [id]
      );

      // Fetch event counts by type
      const typesRes = await pool.query(
        `SELECT event_type, COUNT(*) as count 
         FROM events 
         WHERE proposal_id = $1 
         GROUP BY event_type`,
        [id]
      );

      // Fetch latest 40 events
      const timelineRes = await pool.query(
        `SELECT * FROM events 
         WHERE proposal_id = $1 
         ORDER BY created_at DESC 
         LIMIT 40`,
        [id]
      );

      return sendJson(res, 200, {
        proposal,
        latestResponse,
        totalEvents: parseInt(countRes.rows[0]?.total_events || '0', 10),
        eventCounts: typesRes.rows,
        timeline: timelineRes.rows
      });
    }

    // Fallthrough 404
    sendJson(res, 404, { error: 'Endpoint not found' });
  } catch (err) {
    console.error('API Error:', err);
    sendJson(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

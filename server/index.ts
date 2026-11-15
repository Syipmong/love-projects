import http from 'node:http';
import { URL } from 'node:url';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import { pool, initDb } from './db.ts';
import { sendZeptoMail } from './email.ts';
import { hashPassword, verifyPassword, createSessionToken, validateSessionToken } from './auth.ts';
import type { DbUser, DbProposal, DbEvent, DbResponse, DashboardAnalytics } from './types.ts';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3001', 10);

// Initialize database tables on server start
initDb().catch((err: Error) => {
  console.error('Failed to initialize database tables:', err);
});

function sendJson(res: http.ServerResponse, statusCode: number, data: unknown): void {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody<T>(req: http.IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : ({} as T));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function getAuthUser(req: http.IncomingMessage): { userId: string; email: string } | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return validateSessionToken(token);
}

const server = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  try {
    // 1. Health check
    if (req.method === 'GET' && pathname === '/api/health') {
      const result = await pool.query('SELECT NOW() as db_time');
      return sendJson(res, 200, { status: 'ok', db_time: result.rows[0].db_time });
    }

    // 2. Auth: Register
    if (req.method === 'POST' && pathname === '/api/auth/register') {
      const body = await parseJsonBody<{ email?: string; password?: string; name?: string }>(req);
      const { email, password, name } = body;

      if (!email || !password) {
        return sendJson(res, 400, { error: 'Email and password are required' });
      }

      const cleanEmail = email.toLowerCase().trim();
      const existing = await pool.query<DbUser>('SELECT * FROM users WHERE email = $1', [cleanEmail]);
      if (existing.rows.length > 0) {
        return sendJson(res, 400, { error: 'An account with this email already exists' });
      }

      const userId = `usr_${crypto.randomBytes(12).toString('hex')}`;
      const pwHash = hashPassword(password);
      const userName = name?.trim() || cleanEmail.split('@')[0];

      const query = `
        INSERT INTO users (id, email, password_hash, name)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, name, created_at;
      `;
      const result = await pool.query(query, [userId, cleanEmail, pwHash, userName]);
      const user = result.rows[0];
      const token = createSessionToken(user.id, user.email);

      return sendJson(res, 200, { success: true, token, user });
    }

    // 3. Auth: Login
    if (req.method === 'POST' && pathname === '/api/auth/login') {
      const body = await parseJsonBody<{ email?: string; password?: string }>(req);
      const { email, password } = body;

      if (!email || !password) {
        return sendJson(res, 400, { error: 'Email and password are required' });
      }

      const cleanEmail = email.toLowerCase().trim();
      const result = await pool.query<DbUser>('SELECT * FROM users WHERE email = $1', [cleanEmail]);
      const user = result.rows[0];

      if (!user || !verifyPassword(password, user.password_hash)) {
        return sendJson(res, 401, { error: 'Invalid email or password' });
      }

      const token = createSessionToken(user.id, user.email);
      return sendJson(res, 200, {
        success: true,
        token,
        user: { id: user.id, email: user.email, name: user.name }
      });
    }

    // 4. Auth: Get Current User Profile
    if (req.method === 'GET' && pathname === '/api/auth/me') {
      const auth = getAuthUser(req);
      if (!auth) {
        return sendJson(res, 401, { error: 'Unauthorized' });
      }

      const result = await pool.query<DbUser>('SELECT id, email, name, created_at FROM users WHERE id = $1', [auth.userId]);
      if (result.rows.length === 0) {
        return sendJson(res, 404, { error: 'User not found' });
      }
      return sendJson(res, 200, result.rows[0]);
    }

    // 5. Create or Update Proposal (Generates Unique Shareable Slug)
    if (req.method === 'POST' && pathname === '/api/proposals') {
      const auth = getAuthUser(req);
      const body = await parseJsonBody<{
        partner_name: string;
        sender_name: string;
        question: string;
        config_json?: Record<string, unknown>;
        custom_slug?: string;
      }>(req);

      const partnerClean = body.partner_name?.trim() || 'My Favorite Person';
      const senderClean = body.sender_name?.trim() || 'Yours Truly';
      const questionClean = body.question?.trim() || 'Will you be my girlfriend?';

      // Generate a unique, romantic URL slug: e.g. "for-sophia-k9x3"
      const baseSlug = partnerClean.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'love';
      const uniqueSuffix = crypto.randomBytes(3).toString('hex');
      const slug = body.custom_slug?.trim() || `${baseSlug}-${uniqueSuffix}`;
      const proposalId = `prop_${crypto.randomBytes(12).toString('hex')}`;

      const userId = auth ? auth.userId : null;
      const creatorEmail = auth ? auth.email : null;

      const query = `
        INSERT INTO proposals (id, user_id, slug, creator_email, creator_name, partner_name, sender_name, question, config_json)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
      `;

      const result = await pool.query<DbProposal>(query, [
        proposalId,
        userId,
        slug,
        creatorEmail,
        senderClean,
        partnerClean,
        senderClean,
        questionClean,
        body.config_json || {}
      ]);

      const created = result.rows[0];

      // If user has email, send confirmation via ZeptoMail
      if (creatorEmail) {
        sendZeptoMail({
          toEmail: creatorEmail,
          toName: senderClean,
          subject: `💖 Your unique proposal for ${partnerClean} is live!`,
          htmlBody: `
            <div style="font-family: Arial, sans-serif; padding: 24px; background: #fff1f2; color: #333; border-radius: 12px;">
              <h2 style="color: #e11d48;">Your Romantic Proposal Is Ready! 💕</h2>
              <p>Hey ${senderClean}, your personalized proposal for <strong>${partnerClean}</strong> has been created and saved to PostgreSQL.</p>
              <p><strong>Your Unique Shareable Link:</strong></p>
              <p><a href="http://localhost:5174/?p=${slug}" style="display: inline-block; padding: 10px 20px; background: #e11d48; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">Open Proposal Story</a></p>
              <p>You can monitor her progress, teases, and final answer live on your Creator Dashboard!</p>
            </div>
          `
        }).catch(console.error);
      }

      return sendJson(res, 200, { success: true, proposal: created, shareUrl: `?p=${slug}` });
    }

    // 6. Fetch Proposal by Slug (For Partner Experience)
    if (req.method === 'GET' && pathname.startsWith('/api/proposals/slug/')) {
      const slug = pathname.replace('/api/proposals/slug/', '').trim();
      const result = await pool.query<DbProposal>('SELECT * FROM proposals WHERE slug = $1', [slug]);
      if (result.rows.length === 0) {
        return sendJson(res, 404, { error: 'Proposal not found' });
      }
      return sendJson(res, 200, result.rows[0]);
    }

    // 7. Fetch All Proposals for Authenticated User
    if (req.method === 'GET' && pathname === '/api/proposals/user/all') {
      const auth = getAuthUser(req);
      if (!auth) {
        return sendJson(res, 401, { error: 'Unauthorized' });
      }

      const query = `
        SELECT p.*,
          (SELECT answer FROM responses WHERE proposal_id = p.id ORDER BY created_at DESC LIMIT 1) as latest_answer,
          (SELECT COUNT(*) FROM events WHERE proposal_id = p.id) as interaction_count
        FROM proposals p
        WHERE p.user_id = $1
        ORDER BY p.created_at DESC;
      `;
      const result = await pool.query(query, [auth.userId]);
      return sendJson(res, 200, result.rows);
    }

    // 8. Record Telemetry Event
    if (req.method === 'POST' && pathname === '/api/events') {
      const body = await parseJsonBody<{
        proposal_id?: string;
        event_type: string;
        chapter: number;
        data_json?: Record<string, unknown>;
      }>(req);

      const pid = body.proposal_id || 'default';
      const result = await pool.query<DbEvent>(
        `INSERT INTO events (proposal_id, event_type, chapter, data_json)
         VALUES ($1, $2, $3, $4)
         RETURNING *;`,
        [pid, body.event_type || 'interaction', body.chapter || 0, body.data_json || {}]
      );

      return sendJson(res, 200, { success: true, event: result.rows[0] });
    }

    // 9. Record Final Response ('yes' | 'no') and Trigger ZeptoMail Alert
    if (req.method === 'POST' && pathname === '/api/response') {
      const body = await parseJsonBody<{
        proposal_id?: string;
        answer: 'yes' | 'no';
        tease_attempts?: number;
        notes?: string;
      }>(req);

      const pid = body.proposal_id || 'default';

      const result = await pool.query<DbResponse>(
        `INSERT INTO responses (proposal_id, answer, tease_attempts, notes)
         VALUES ($1, $2, $3, $4)
         RETURNING *;`,
        [pid, body.answer, body.tease_attempts || 0, body.notes || null]
      );

      // Fetch proposal details to send email to creator
      try {
        const propQuery = await pool.query<DbProposal>('SELECT * FROM proposals WHERE id = $1 OR slug = $1', [pid]);
        const proposal = propQuery.rows[0];

        if (proposal?.creator_email) {
          const isYes = body.answer === 'yes';
          const subject = isYes
            ? `💖 ${proposal.partner_name} SAID YES! Proposal Accepted!`
            : `A message regarding your proposal to ${proposal.partner_name}`;

          const htmlBody = `
            <div style="font-family: Arial, sans-serif; padding: 24px; background: #fff1f2; color: #333; border-radius: 12px;">
              <h1 style="color: ${isYes ? '#e11d48' : '#64748b'};">${isYes ? 'SHE SAID YES! 🎉🥰' : 'Proposal Response Received'}</h1>
              <p><strong>${proposal.partner_name}</strong> just completed your proposal story!</p>
              <p><strong>Answer:</strong> <span style="font-size: 18px; color: ${isYes ? '#e11d48' : '#64748b'}; font-weight: bold;">${body.answer.toUpperCase()}</span></p>
              <p><strong>Playful tease attempts on "NO":</strong> ${body.tease_attempts || 0}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              <hr style="border: 0; border-top: 1px solid #fecdd3; margin: 20px 0;" />
              <p style="font-size: 12px; color: #888;">Recorded live via your Love Proposal Platform.</p>
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

    // 10. Dashboard Analytics by Slug / ID
    if (req.method === 'GET' && pathname.startsWith('/api/dashboard/')) {
      const slugOrId = pathname.replace('/api/dashboard/', '').trim();

      // Fetch proposal by slug or ID
      const propRes = await pool.query<DbProposal>('SELECT * FROM proposals WHERE slug = $1 OR id = $1', [slugOrId]);
      const proposal = propRes.rows[0] || null;
      const pid = proposal ? proposal.id : slugOrId;

      // Fetch latest response
      const respRes = await pool.query<DbResponse>(
        'SELECT * FROM responses WHERE proposal_id = $1 ORDER BY created_at DESC LIMIT 1',
        [pid]
      );
      const latestResponse = respRes.rows[0] || null;

      // Fetch total events
      const countRes = await pool.query<{ total_events: string }>(
        'SELECT COUNT(*) as total_events FROM events WHERE proposal_id = $1',
        [pid]
      );

      // Event counts by type
      const typesRes = await pool.query<{ event_type: string; count: string }>(
        `SELECT event_type, COUNT(*) as count 
         FROM events 
         WHERE proposal_id = $1 
         GROUP BY event_type`,
        [pid]
      );

      // Latest 50 timeline events
      const timelineRes = await pool.query<DbEvent>(
        `SELECT * FROM events 
         WHERE proposal_id = $1 
         ORDER BY created_at DESC 
         LIMIT 50`,
        [pid]
      );

      const payload: DashboardAnalytics = {
        proposal,
        latestResponse,
        totalEvents: parseInt(countRes.rows[0]?.total_events || '0', 10),
        teaseAttempts: latestResponse?.tease_attempts || 0,
        eventCounts: typesRes.rows,
        timeline: timelineRes.rows
      };

      return sendJson(res, 200, payload);
    }

    // Fallthrough 404
    sendJson(res, 404, { error: 'Endpoint not found' });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('API Error:', err);
    sendJson(res, 500, { error: errorMsg });
  }
});

server.listen(PORT, () => {
  console.log(`Strict TypeScript Backend server running on http://localhost:${PORT}`);
});

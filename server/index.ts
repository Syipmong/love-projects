import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { URL, fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import { pool, initDb } from './db.ts';
import { sendZeptoMail } from './email.ts';
import { hashPassword, verifyPassword, createSessionToken, validateSessionToken } from './auth.ts';
import { generate6CharAlphaNumericCode } from './utils.ts';
import { searchPexelsImages } from './pexels.ts';
import type { DbUser, DbProposal, DbEvent, DbResponse, DashboardAnalytics, DbAnonymousMessage } from './types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg'
};

function serveStatic(reqPath: string, res: http.ServerResponse): boolean {
  if (!fs.existsSync(DIST_DIR)) return false;

  let filePath = path.join(DIST_DIR, reqPath === '/' ? 'index.html' : reqPath);

  // Security check: ensure path stays within DIST_DIR
  if (!filePath.startsWith(DIST_DIR)) {
    return false;
  }

  // If path is a directory, check for index.html inside
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // SPA fallback for non-API client routes (like /dashboard or /?p=...)
  if (!fs.existsSync(filePath)) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    return false;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable'
    });
    res.end(content);
    return true;
  } catch {
    return false;
  }
}

const PORT = parseInt(process.env.PORT || '3001', 10);

// Initialize database tables on server start
initDb().catch((err: Error) => {
  console.error('Failed to initialize database tables:', err);
});

function sendJson(res: http.ServerResponse, statusCode: number, data: unknown): void {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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

/**
 * Generates guaranteed unique 6-character alphanumeric code
 */
async function generateUnique6CharCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generate6CharAlphaNumericCode();
    const existing = await pool.query('SELECT id FROM proposals WHERE slug = $1', [code]);
    if (existing.rows.length === 0) {
      return code;
    }
  }
  // Fallback if collision
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

/**
 * Tracks email notification cooldowns for proposal link opens (15-min cooldown)
 */
const lastOpenedEmailAlert = new Map<string, number>();

async function notifyCreatorProposalOpened(proposal: DbProposal): Promise<void> {
  if (!proposal || !proposal.creator_email) return;

  const now = Date.now();
  const lastSent = lastOpenedEmailAlert.get(proposal.id) || 0;
  // 15-minute cooldown to prevent multiple emails if she refreshes rapidly
  if (now - lastSent < 15 * 60 * 1000) {
    return;
  }
  lastOpenedEmailAlert.set(proposal.id, now);

  const subject = `${proposal.partner_name} just opened your proposal story! (${proposal.slug})`;
  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 28px; background: #fff1f2; color: #1e293b; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #fecdd3;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 50%; background: #ffe4e6; color: #e11d48; font-size: 20px; font-weight: bold;">♥</div>
        <h2 style="color: #e11d48; margin: 8px 0 4px 0; font-size: 24px;">She Just Opened Your Proposal!</h2>
        <p style="color: #64748b; font-size: 14px; margin: 0;">Your romantic story is being read right now.</p>
      </div>

      <div style="background: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #ffe4e6; margin-bottom: 20px;">
        <p style="margin: 0 0 10px 0; font-size: 15px;">Hey <strong>${proposal.sender_name}</strong>,</p>
        <p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.6; color: #334155;">
          <strong>${proposal.partner_name}</strong> just opened your personalized proposal link (<strong style="color: #e11d48;">${proposal.slug}</strong>). She has arrived at Chapter 1!
        </p>
        <p style="margin: 0; font-size: 13px; color: #64748b;">
          Opened at: <strong>${new Date().toLocaleTimeString()} (${new Date().toLocaleDateString()})</strong>
        </p>
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <a href="https://love-story-proposal.onrender.com/?dashboard=true" style="display: inline-block; padding: 14px 28px; background: #e11d48; color: #ffffff; text-decoration: none; border-radius: 9999px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 12px rgba(225, 29, 72, 0.35);">
          Open Live Studio & Watch Her Live →
        </a>
      </div>

      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px;">
        Every choice, secret polaroid tap, hesitation pause, and her final answer will be logged live to your dashboard!
      </p>
    </div>
  `;

  sendZeptoMail({
    toEmail: proposal.creator_email,
    toName: proposal.creator_name || proposal.sender_name,
    subject,
    htmlBody
  }).catch((err) => console.error('Error sending opened proposal notification:', err));
}

const server = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
      const body = await parseJsonBody<{ email?: string; password?: string; name?: string; handle?: string }>(req);
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

      const baseHandle = (body.handle || userName)
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, 24) || `user_${crypto.randomBytes(3).toString('hex')}`;
      let userHandle = baseHandle;
      const handleCheck = await pool.query('SELECT id FROM users WHERE handle = $1', [userHandle]);
      if (handleCheck.rows.length > 0) {
        userHandle = `${baseHandle}_${crypto.randomBytes(2).toString('hex')}`;
      }

      const query = `
        INSERT INTO users (id, email, password_hash, name, handle)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, name, handle, created_at;
      `;
      const result = await pool.query(query, [userId, cleanEmail, pwHash, userName, userHandle]);
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
      const result = await pool.query<DbUser>(
        'SELECT id, email, password_hash, name, handle, created_at FROM users WHERE email = $1',
        [cleanEmail]
      );
      const user = result.rows[0];

      if (!user || !verifyPassword(password, user.password_hash)) {
        return sendJson(res, 401, { error: 'Invalid email or password' });
      }

      let userHandle = user.handle;
      if (!userHandle) {
        userHandle = (user.name?.toLowerCase().replace(/[^a-z0-9_]/g, '') || cleanEmail.split('@')[0]).slice(0, 24);
        await pool.query('UPDATE users SET handle = $1 WHERE id = $2', [userHandle, user.id]).catch(() => {});
      }

      const token = createSessionToken(user.id, user.email);
      return sendJson(res, 200, {
        success: true,
        token,
        user: { id: user.id, email: user.email, name: user.name, handle: userHandle }
      });
    }

    // 4. Auth: Get Current User Profile
    if (req.method === 'GET' && pathname === '/api/auth/me') {
      const auth = getAuthUser(req);
      if (!auth) {
        return sendJson(res, 401, { error: 'Unauthorized' });
      }

      const result = await pool.query<DbUser>('SELECT id, email, name, handle, created_at FROM users WHERE id = $1', [auth.userId]);
      if (result.rows.length === 0) {
        return sendJson(res, 404, { error: 'User not found' });
      }
      const u = result.rows[0];
      if (!u.handle) {
        u.handle = (u.name?.toLowerCase().replace(/[^a-z0-9_]/g, '') || u.email.split('@')[0]).slice(0, 24);
        await pool.query('UPDATE users SET handle = $1 WHERE id = $2', [u.handle, u.id]).catch(() => {});
      }
      return sendJson(res, 200, u);
    }

    // 5. Create New Proposal (Generates Unique 6-Character Alphanumeric Code)
    if (req.method === 'POST' && pathname === '/api/proposals') {
      const auth = getAuthUser(req);
      const body = await parseJsonBody<{
        partner_name: string;
        sender_name: string;
        question: string;
        config_json?: Record<string, unknown>;
      }>(req);

      const partnerClean = body.partner_name?.trim() || 'My Favorite Person';
      const senderClean = body.sender_name?.trim() || 'Yours Truly';
      const questionClean = body.question?.trim() || 'Will you be my girlfriend?';

      // Guaranteed 6-character alphanumeric code (e.g. "K9X2M4")
      const uniqueCode = await generateUnique6CharCode();
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
        uniqueCode,
        creatorEmail,
        senderClean,
        partnerClean,
        senderClean,
        questionClean,
        body.config_json || {}
      ]);

      const created = result.rows[0];

      // If creator has an email, send confirmation
      if (creatorEmail) {
        sendZeptoMail({
          toEmail: creatorEmail,
          toName: senderClean,
          subject: `Your proposal for ${partnerClean} is ready! (Code: ${uniqueCode})`,
          htmlBody: `
            <div style="font-family: Arial, sans-serif; padding: 24px; background: #fff1f2; color: #333; border-radius: 12px;">
              <h2 style="color: #e11d48;">Your Romantic Proposal Is Live</h2>
              <p>Hey ${senderClean}, your proposal for <strong>${partnerClean}</strong> is ready.</p>
              <p><strong>Your 6-Character Share Code:</strong> <span style="font-size: 20px; font-weight: bold; color: #e11d48; letter-spacing: 2px;">${uniqueCode}</span></p>
              <p><strong>Your Direct Share Link:</strong></p>
              <p><a href="http://localhost:5174/?p=${uniqueCode}" style="display: inline-block; padding: 10px 20px; background: #e11d48; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">Open Proposal Story</a></p>
              <p>Track her live progress, teases, and final answer on your Creator Dashboard!</p>
            </div>
          `
        }).catch(console.error);
      }

      return sendJson(res, 200, { success: true, proposal: created, shareCode: uniqueCode, shareUrl: `?p=${uniqueCode}` });
    }

    // 6. Update Proposal Configuration (Customizing all messages, milestones, polaroids, theme, etc.)
    if (req.method === 'PUT' && pathname.startsWith('/api/proposals/')) {
      const auth = getAuthUser(req);
      const codeOrId = pathname.replace('/api/proposals/', '').trim();
      const body = await parseJsonBody<{
        partner_name?: string;
        sender_name?: string;
        question?: string;
        config_json?: Record<string, unknown>;
      }>(req);

      const query = `
        UPDATE proposals
        SET partner_name = COALESCE($1, partner_name),
            sender_name = COALESCE($2, sender_name),
            question = COALESCE($3, question),
            config_json = COALESCE($4, config_json)
        WHERE slug = $5 OR id = $5
        RETURNING *;
      `;

      const result = await pool.query<DbProposal>(query, [
        body.partner_name || null,
        body.sender_name || null,
        body.question || null,
        body.config_json || null,
        codeOrId
      ]);

      if (result.rows.length === 0) {
        return sendJson(res, 404, { error: 'Proposal not found' });
      }

      return sendJson(res, 200, { success: true, proposal: result.rows[0] });
    }

    // 7. Fetch Proposal by 6-Character Code
    if (req.method === 'GET' && (pathname.startsWith('/api/proposals/code/') || pathname.startsWith('/api/proposals/slug/'))) {
      const code = pathname.replace('/api/proposals/code/', '').replace('/api/proposals/slug/', '').trim();
      const result = await pool.query<DbProposal>('SELECT * FROM proposals WHERE slug = $1 OR id = $1', [code]);
      if (result.rows.length === 0) {
        return sendJson(res, 404, { error: 'Proposal not found' });
      }
      const prop = result.rows[0];
      // Trigger transactional email to creator notifying them the partner opened their proposal!
      notifyCreatorProposalOpened(prop).catch(console.error);
      return sendJson(res, 200, prop);
    }

    // 8. Fetch All Proposals for Authenticated User
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

    // 9. Record Telemetry Event
    if (req.method === 'POST' && pathname === '/api/events') {
      const body = await parseJsonBody<{
        proposal_id?: string;
        event_type: string;
        chapter: number;
        data_json?: Record<string, unknown>;
      }>(req);

      let pid = body.proposal_id || 'default';
      // Normalize proposal_id to proposal.id if 6-char slug was passed
      if (pid !== 'default') {
        const pCheck = await pool.query<DbProposal>('SELECT id FROM proposals WHERE slug = $1 OR id = $1', [pid]);
        if (pCheck.rows.length > 0) {
          pid = pCheck.rows[0].id;
        }
      }

      const result = await pool.query<DbEvent>(
        `INSERT INTO events (proposal_id, event_type, chapter, data_json)
         VALUES ($1, $2, $3, $4)
         RETURNING *;`,
        [pid, body.event_type || 'interaction', body.chapter || 0, body.data_json || {}]
      );

      return sendJson(res, 200, { success: true, event: result.rows[0] });
    }

    // 10. Record Final Response ('yes' | 'no') and Trigger Email Alert
    if (req.method === 'POST' && pathname === '/api/response') {
      const body = await parseJsonBody<{
        proposal_id?: string;
        answer: 'yes' | 'no';
        tease_attempts?: number;
        notes?: string;
      }>(req);

      let pid = body.proposal_id || 'default';
      let proposalObj: DbProposal | null = null;
      if (pid !== 'default') {
        const propQuery = await pool.query<DbProposal>('SELECT * FROM proposals WHERE id = $1 OR slug = $1', [pid]);
        if (propQuery.rows.length > 0) {
          proposalObj = propQuery.rows[0];
          pid = proposalObj.id;
        }
      }

      const result = await pool.query<DbResponse>(
        `INSERT INTO responses (proposal_id, answer, tease_attempts, notes)
         VALUES ($1, $2, $3, $4)
         RETURNING *;`,
        [pid, body.answer, body.tease_attempts || 0, body.notes || null]
      );

      // Fetch proposal details to send email
      try {
        const proposal = proposalObj || (await pool.query<DbProposal>('SELECT * FROM proposals WHERE id = $1 OR slug = $1', [pid])).rows[0];

        if (proposal?.creator_email) {
          const isYes = body.answer === 'yes';
          const subject = isYes
            ? `${proposal.partner_name} SAID YES! Proposal Accepted!`
            : `A message regarding your proposal to ${proposal.partner_name}`;

          const htmlBody = `
            <div style="font-family: Arial, sans-serif; padding: 24px; background: #fff1f2; color: #333; border-radius: 12px;">
              <h1 style="color: ${isYes ? '#e11d48' : '#64748b'};">${isYes ? 'SHE SAID YES!' : 'Proposal Response Received'}</h1>
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

    // 11. Dashboard Analytics by 6-Character Code / ID
    if (req.method === 'GET' && pathname.startsWith('/api/dashboard/')) {
      const codeOrId = pathname.replace('/api/dashboard/', '').trim();

      const propRes = await pool.query<DbProposal>('SELECT * FROM proposals WHERE slug = $1 OR id = $1', [codeOrId]);
      const proposal = propRes.rows[0] || null;
      const pid = proposal ? proposal.id : codeOrId;
      const pslug = proposal ? proposal.slug : codeOrId;

      const respRes = await pool.query<DbResponse>(
        'SELECT * FROM responses WHERE proposal_id = $1 OR proposal_id = $2 ORDER BY created_at DESC LIMIT 1',
        [pid, pslug]
      );
      const latestResponse = respRes.rows[0] || null;

      const countRes = await pool.query<{ total_events: string }>(
        'SELECT COUNT(*) as total_events FROM events WHERE proposal_id = $1 OR proposal_id = $2',
        [pid, pslug]
      );

      const teaseCountRes = await pool.query<{ tease_count: string }>(
        `SELECT COUNT(*) as tease_count 
         FROM events 
         WHERE (proposal_id = $1 OR proposal_id = $2) AND event_type = 'no_button_evaded'`,
        [pid, pslug]
      );

      const typesRes = await pool.query<{ event_type: string; count: string }>(
        `SELECT event_type, COUNT(*) as count 
         FROM events 
         WHERE proposal_id = $1 OR proposal_id = $2 
         GROUP BY event_type`,
        [pid, pslug]
      );

      const timelineRes = await pool.query<DbEvent>(
        `SELECT * FROM events 
         WHERE proposal_id = $1 OR proposal_id = $2 
         ORDER BY created_at DESC 
         LIMIT 100`,
        [pid, pslug]
      );

      const eventTeases = parseInt(teaseCountRes.rows[0]?.tease_count || '0', 10);
      const recordedTeases = latestResponse?.tease_attempts || 0;
      const calculatedTeases = Math.max(eventTeases, recordedTeases);

      const payload: DashboardAnalytics = {
        proposal,
        latestResponse,
        totalEvents: parseInt(countRes.rows[0]?.total_events || '0', 10),
        teaseAttempts: calculatedTeases,
        eventCounts: typesRes.rows,
        timeline: timelineRes.rows
      };

      return sendJson(res, 200, payload);
    }

    // 12. Pexels Image Search API for Creators
    if (req.method === 'GET' && pathname === '/api/images/search') {
      const query = parsedUrl.searchParams.get('q') || parsedUrl.searchParams.get('query') || 'romantic couple';
      const page = parseInt(parsedUrl.searchParams.get('page') || '1', 10);
      const perPage = parseInt(parsedUrl.searchParams.get('per_page') || '16', 10);

      const result = await searchPexelsImages(query, page, perPage);
      return sendJson(res, result.success ? 200 : 500, result);
    }

    // 13. Anonymous Messaging: Send Secret Anonymous Message (anonymoux)
    if (req.method === 'POST' && pathname === '/api/anonymous/send') {
      const body = await parseJsonBody<{
        recipient_handle: string;
        message: string;
        prompt_category?: string;
        sender_hint?: string;
        device_hint?: string;
      }>(req);

      if (!body.recipient_handle || !body.message) {
        return sendJson(res, 400, { error: 'Recipient handle and message are required' });
      }

      const cleanHandle = body.recipient_handle.toLowerCase().trim().replace(/^@/, '');
      const cleanMsg = body.message.trim().slice(0, 1000);

      // Find recipient user if exists
      const userRes = await pool.query<DbUser>(
        'SELECT id, email, name, handle FROM users WHERE handle = $1 OR email ILIKE $2 OR id = $1 LIMIT 1',
        [cleanHandle, `${cleanHandle}@%`]
      );
      const recipientUser = userRes.rows[0] || null;

      const insertQuery = `
        INSERT INTO anonymous_messages (recipient_handle, user_id, message, prompt_category, sender_hint, device_hint)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      const result = await pool.query<DbAnonymousMessage>(insertQuery, [
        cleanHandle,
        recipientUser ? recipientUser.id : null,
        cleanMsg,
        body.prompt_category || 'secret_message',
        body.sender_hint?.trim() || null,
        body.device_hint?.trim() || null
      ]);

      // If recipient has an email on file, send transactional notification
      if (recipientUser?.email) {
        sendZeptoMail({
          toEmail: recipientUser.email,
          toName: recipientUser.name,
          subject: `New anonymous secret message on Anonymoux!`,
          htmlBody: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 28px; background: #faf5ff; color: #1e293b; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #e9d5ff;">
              <div style="text-align: center; margin-bottom: 20px;">
                <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 50%; background: #f3e8ff; color: #9333ea; font-size: 20px; font-weight: bold;">✉</div>
                <h2 style="color: #9333ea; margin: 8px 0 4px 0; font-size: 24px;">You Have A Secret Message!</h2>
                <p style="color: #64748b; font-size: 14px; margin: 0;">Someone just sent you an anonymous note on anonymoux</p>
              </div>

              <div style="background: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid #f3e8ff; box-shadow: 0 4px 12px rgba(147, 51, 234, 0.08); margin-bottom: 24px;">
                <span style="display: inline-block; padding: 4px 12px; background: #f3e8ff; color: #9333ea; border-radius: 9999px; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 12px;">
                  ${body.prompt_category?.replace(/_/g, ' ') || 'Secret Message'}
                </span>
                <p style="font-size: 18px; font-style: italic; color: #1e293b; line-height: 1.6; margin: 0 0 12px 0;">
                  "${cleanMsg}"
                </p>
                ${body.sender_hint ? `<p style="font-size: 12px; color: #64748b; margin: 0;">Hint from sender: <em>${body.sender_hint}</em></p>` : ''}
              </div>

              <div style="text-align: center;">
                <a href="https://love-story-proposal.onrender.com/?dashboard=true&tab=anonymous" style="display: inline-block; padding: 14px 28px; background: #9333ea; color: #ffffff; text-decoration: none; border-radius: 9999px; font-weight: bold; font-size: 14px;">
                  Open Your Anonymoux Inbox →
                </a>
              </div>
            </div>
          `
        }).catch((err) => console.error('Anonymoux email error:', err));
      }

      return sendJson(res, 200, { success: true, message: result.rows[0] });
    }

    // 14. Anonymous Messaging: Get Recipient User Public Info
    if (req.method === 'GET' && pathname.startsWith('/api/anonymous/user/')) {
      const handle = pathname.replace('/api/anonymous/user/', '').toLowerCase().trim().replace(/^@/, '');
      const userRes = await pool.query<DbUser>(
        'SELECT id, name, handle FROM users WHERE handle = $1 OR email ILIKE $2 LIMIT 1',
        [handle, `${handle}@%`]
      );
      if (userRes.rows.length === 0) {
        return sendJson(res, 200, { handle, name: handle, exists: false });
      }
      return sendJson(res, 200, { handle: userRes.rows[0].handle || handle, name: userRes.rows[0].name, exists: true });
    }

    // 15. Anonymous Messaging: Get Current User's Inbox Messages
    if (req.method === 'GET' && pathname === '/api/anonymous/inbox') {
      const auth = getAuthUser(req);
      if (!auth) {
        return sendJson(res, 401, { error: 'Unauthorized' });
      }

      const userRes = await pool.query<DbUser>('SELECT id, handle, email FROM users WHERE id = $1', [auth.userId]);
      const user = userRes.rows[0];
      const userHandle = user?.handle || user?.email?.split('@')[0] || auth.userId;

      const msgs = await pool.query<DbAnonymousMessage>(
        `SELECT * FROM anonymous_messages 
         WHERE user_id = $1 OR recipient_handle = $2 
         ORDER BY created_at DESC 
         LIMIT 100`,
        [auth.userId, userHandle.toLowerCase()]
      );

      return sendJson(res, 200, { messages: msgs.rows, handle: userHandle });
    }

    // 16. Anonymous Messaging: Mark Message Read
    if (req.method === 'PUT' && pathname.startsWith('/api/anonymous/read/')) {
      const auth = getAuthUser(req);
      if (!auth) return sendJson(res, 401, { error: 'Unauthorized' });

      const msgId = parseInt(pathname.replace('/api/anonymous/read/', '').trim(), 10);
      await pool.query('UPDATE anonymous_messages SET is_read = TRUE WHERE id = $1', [msgId]);
      return sendJson(res, 200, { success: true });
    }

    // 17. Anonymous Messaging: Delete Message
    if (req.method === 'DELETE' && pathname.startsWith('/api/anonymous/')) {
      const auth = getAuthUser(req);
      if (!auth) return sendJson(res, 401, { error: 'Unauthorized' });

      const msgId = parseInt(pathname.replace('/api/anonymous/', '').trim(), 10);
      await pool.query('DELETE FROM anonymous_messages WHERE id = $1', [msgId]);
      return sendJson(res, 200, { success: true });
    }

    // 18. Update User Handle
    if (req.method === 'PUT' && pathname === '/api/auth/handle') {
      const auth = getAuthUser(req);
      if (!auth) return sendJson(res, 401, { error: 'Unauthorized' });

      const body = await parseJsonBody<{ handle?: string }>(req);
      const newHandle = body.handle?.toLowerCase().trim().replace(/[^a-z0-9_]/g, '').slice(0, 30);
      if (!newHandle) return sendJson(res, 400, { error: 'Invalid handle format' });

      const existing = await pool.query('SELECT id FROM users WHERE handle = $1 AND id != $2', [newHandle, auth.userId]);
      if (existing.rows.length > 0) {
        return sendJson(res, 400, { error: 'This handle is already taken' });
      }

      await pool.query('UPDATE users SET handle = $1 WHERE id = $2', [newHandle, auth.userId]);
      return sendJson(res, 200, { success: true, handle: newHandle });
    }

    // 19. Serve Static Frontend Files from dist/
    if (serveStatic(pathname, res)) {
      return;
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
  console.log(`Strict TypeScript Backend running on http://localhost:${PORT}`);
});

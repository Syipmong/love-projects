export interface ProposalResponsePayload {
  proposal_id?: string;
  to?: string;
  from?: string;
  question?: string;
  answer: 'yes' | 'no';
  tease_attempts: number;
  timestamp?: string;
  notes?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  handle?: string;
}

export interface ProposalItem {
  id: string;
  slug: string;
  partner_name: string;
  sender_name: string;
  question: string;
  created_at: string;
  latest_answer?: 'yes' | 'no' | null;
  interaction_count?: string | number;
}

const API_BASE = '/api';
const AUTH_TOKEN_KEY = 'love_app_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

/**
 * Register account with unique permanent handle
 */
export async function registerUser(
  email: string,
  password: string,
  name?: string,
  handle?: string
): Promise<{ success: boolean; user?: AuthUser; token?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, handle })
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Registration failed' };
    setStoredToken(data.token);
    return { success: true, user: data.user, token: data.token };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return { success: false, error: msg };
  }
}

/**
 * Check if a username / handle is available in real time
 */
export async function checkHandleAvailability(handle: string): Promise<{ available: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/check-handle?handle=${encodeURIComponent(handle)}`);
    const data = await res.json();
    return data;
  } catch {
    return { available: false, error: 'Could not verify username' };
  }
}

/**
 * Login account
 */
export async function loginUser(email: string, password: string): Promise<{ success: boolean; user?: AuthUser; token?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Login failed' };
    setStoredToken(data.token);
    return { success: true, user: data.user, token: data.token };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return { success: false, error: msg };
  }
}

/**
 * Get current profile
 */
export async function getCurrentUserProfile(): Promise<AuthUser | null> {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      setStoredToken(null);
      return null;
    }
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Fetch all proposals created by authenticated user
 */
export async function getUserProposals(): Promise<ProposalItem[]> {
  const token = getStoredToken();
  if (!token) return [];
  try {
    const res = await fetch(`${API_BASE}/proposals/user/all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

/**
 * Create a new proposal with unique slug
 */
export async function createNewProposal(data: {
  partner_name: string;
  sender_name: string;
  question: string;
  custom_slug?: string;
  config_json?: Record<string, unknown>;
}): Promise<{ success: boolean; proposal?: ProposalItem; shareUrl?: string; error?: string }> {
  const token = getStoredToken();
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/proposals`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || 'Failed to create proposal' };
    return { success: true, proposal: result.proposal, shareUrl: result.shareUrl };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return { success: false, error: msg };
  }
}

/**
 * Fetch proposal by unique slug for partner view
 */
export async function getProposalBySlug(slug: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE}/proposals/slug/${slug}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Tracks every user interaction in real time
 */
export async function trackEvent(
  eventType: string,
  chapter: number,
  data?: Record<string, unknown>,
  proposalId: string = 'default'
) {
  try {
    await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proposal_id: proposalId,
        event_type: eventType,
        chapter,
        data_json: data || {}
      })
    });
  } catch (err) {
    console.debug('Telemetry sync error (cached locally):', err);
  }
}

/**
 * Records proposal response
 */
export async function recordProposalResponse(data: ProposalResponsePayload, proposalId: string = 'default') {
  try {
    const res = await fetch(`${API_BASE}/response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proposal_id: proposalId,
        answer: data.answer,
        tease_attempts: data.tease_attempts,
        notes: data.notes
      })
    });
    return res.ok;
  } catch (err) {
    console.debug('Response sync error:', err);
    return false;
  }
}

/**
 * Fetches dashboard analytics for a proposal
 */
export async function fetchDashboardData(proposalSlugOrId: string = 'default') {
  try {
    const res = await fetch(`${API_BASE}/dashboard/${proposalSlugOrId}`);
    if (!res.ok) throw new Error('Failed to fetch dashboard');
    return await res.json();
  } catch (err) {
    console.error('Dashboard fetch error:', err);
    return null;
  }
}

export interface CuratedPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  imageUrl: string;
  thumbnailUrl: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
  avgColor?: string;
}

export type PexelsPhoto = CuratedPhoto;

/**
 * Searches curated romantic photo library for creators to customize their story memories
 */
export async function searchCuratedPhotos(
  query: string,
  page = 1,
  perPage = 16
): Promise<{ success: boolean; photos: CuratedPhoto[]; total_results?: number; error?: string }> {
  try {
    const params = new URLSearchParams({
      q: query.trim() || 'romantic couple',
      page: page.toString(),
      per_page: perPage.toString()
    });

    const res = await fetch(`${API_BASE}/images/search?${params.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, photos: [], error: err.error || 'Failed to search photos' };
    }

    const data = await res.json();
    return data;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return { success: false, photos: [], error: msg };
  }
}

export const searchPexelsPhotos = searchCuratedPhotos;

export interface AnonymousMessage {
  id: number;
  recipient_handle: string;
  user_id?: string | null;
  message: string;
  prompt_category: string;
  sender_hint?: string | null;
  device_hint?: string | null;
  is_read: boolean;
  created_at: string;
}

/**
 * Send an anonymous secret message to a user handle (anonymoux)
 */
export async function sendAnonymousMessage(data: {
  recipient_handle: string;
  message: string;
  prompt_category?: string;
  sender_hint?: string;
}): Promise<{ success: boolean; message?: AnonymousMessage; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/anonymous/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || 'Failed to send message' };
    return { success: true, message: result.message };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return { success: false, error: msg };
  }
}

/**
 * Fetch public recipient profile info for an anonymous link
 */
export async function getAnonymousUserInfo(handle: string): Promise<{ handle: string; name: string; exists: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/anonymous/user/${encodeURIComponent(handle)}`);
    if (!res.ok) return { handle, name: handle, exists: false };
    return await res.json();
  } catch {
    return { handle, name: handle, exists: false };
  }
}

/**
 * Fetch received anonymous secret messages for authenticated user
 */
export async function fetchAnonymousInbox(): Promise<{ messages: AnonymousMessage[]; handle?: string }> {
  const token = getStoredToken();
  if (!token) return { messages: [] };
  try {
    const res = await fetch(`${API_BASE}/anonymous/inbox`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return { messages: [] };
    return await res.json();
  } catch {
    return { messages: [] };
  }
}

/**
 * Mark anonymous message as read
 */
export async function markAnonymousMessageRead(messageId: number): Promise<boolean> {
  const token = getStoredToken();
  if (!token) return false;
  try {
    const res = await fetch(`${API_BASE}/anonymous/read/${messageId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Delete anonymous message
 */
export async function deleteAnonymousMessage(messageId: number): Promise<boolean> {
  const token = getStoredToken();
  if (!token) return false;
  try {
    const res = await fetch(`${API_BASE}/anonymous/${messageId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Update creator's unique username handle
 */
export async function updateUserHandle(handle: string): Promise<{ success: boolean; handle?: string; error?: string }> {
  const token = getStoredToken();
  if (!token) return { success: false, error: 'Unauthorized' };
  try {
    const res = await fetch(`${API_BASE}/auth/handle`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ handle })
    });
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || 'Failed to update handle' };
    return { success: true, handle: result.handle };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return { success: false, error: msg };
  }
}

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
 * Register account
 */
export async function registerUser(email: string, password: string, name?: string): Promise<{ success: boolean; user?: AuthUser; token?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
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

export interface PexelsPhoto {
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

/**
 * Searches Pexels photos via backend proxy for creators to customize their story memories
 */
export async function searchPexelsPhotos(
  query: string,
  page = 1,
  perPage = 16
): Promise<{ success: boolean; photos: PexelsPhoto[]; total_results?: number; error?: string }> {
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

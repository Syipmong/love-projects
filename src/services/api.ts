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

export interface ProposalEventPayload {
  proposal_id?: string;
  event_type: string;
  chapter: number;
  data_json?: Record<string, unknown>;
}

const API_BASE = '/api';

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
 * Fetches dashboard analytics
 */
export async function fetchDashboardData(proposalId: string = 'default') {
  try {
    const res = await fetch(`${API_BASE}/dashboard/${proposalId}`);
    if (!res.ok) throw new Error('Failed to fetch dashboard');
    return await res.json();
  } catch (err) {
    console.error('Dashboard fetch error:', err);
    return null;
  }
}

/**
 * Creates or updates a proposal
 */
export async function saveProposal(data: {
  id?: string;
  creator_email?: string;
  creator_name?: string;
  partner_name: string;
  sender_name: string;
  question: string;
  config_json?: Record<string, unknown>;
}) {
  try {
    const res = await fetch(`${API_BASE}/proposals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (err) {
    console.error('Proposal save error:', err);
    return null;
  }
}

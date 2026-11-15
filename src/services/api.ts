export interface ProposalResponsePayload {
  to: string;
  from: string;
  question: string;
  answer: 'yes' | 'no';
  teaseAttempts: number;
  timestamp: string;
  note?: string;
}

const STORAGE_KEY = 'be_mine_proposal_responses';

/**
 * Records proposal response.
 * Currently stores locally, and seamlessly connects to a backend server if VITE_API_URL is configured.
 */
export async function recordProposalResponse(data: ProposalResponsePayload): Promise<boolean> {
  // Always save locally first for instant reliability
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    existing.push(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.debug('Local storage error', e);
  }

  // If backend API URL is configured (e.g. http://localhost:3001 or deployed backend)
  const apiUrl = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_API_URL;
  if (apiUrl) {
    try {
      const response = await fetch(`${apiUrl}/api/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.ok;
    } catch (err) {
      console.warn('Backend API sync deferred (offline or server not yet running):', err);
    }
  }

  return true;
}

export function getRecordedResponses(): ProposalResponsePayload[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

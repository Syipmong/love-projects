export interface DbUser {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  handle?: string;
  created_at: string;
}

export interface DbAnonymousMessage {
  id: number;
  recipient_handle: string;
  user_id: string | null;
  message: string;
  prompt_category: string;
  sender_hint: string | null;
  device_hint: string | null;
  is_read: boolean;
  created_at: string;
}

export interface DbProposal {
  id: string;
  user_id: string | null;
  slug: string;
  creator_email: string | null;
  creator_name: string | null;
  partner_name: string;
  sender_name: string;
  question: string;
  config_json: Record<string, unknown>;
  created_at: string;
}

export interface DbEvent {
  id: number;
  proposal_id: string;
  event_type: string;
  chapter: number;
  data_json: Record<string, unknown>;
  created_at: string;
}

export interface DbResponse {
  id: number;
  proposal_id: string;
  answer: 'yes' | 'no';
  tease_attempts: number;
  notes: string | null;
  created_at: string;
}

export interface DashboardAnalytics {
  proposal: DbProposal | null;
  latestResponse: DbResponse | null;
  totalEvents: number;
  teaseAttempts: number;
  eventCounts: { event_type: string; count: string }[];
  timeline: DbEvent[];
}


export interface StoryMilestone {
  id: string;
  tag: string;
  title: string;
  date?: string;
  story: string;
  icon: string;
}

export interface MemoryPolaroid {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  secretNote: string;
}

export interface RomanticQuizOption {
  text: string;
  response: string;
  icon: string;
}

export interface RomanticQuiz {
  prompt: string;
  options: RomanticQuizOption[];
}

export interface SecretDateSurprise {
  code: string;
  hint: string;
  title: string;
  location: string;
  details: string;
}

export type AppTheme = 'rose' | 'champagne' | 'lavender';

export interface ProposalConfig {
  partnerName: string;
  senderName: string;
  proposalQuestion: string;
  subheading?: string;
  startDate?: string;
  theme?: AppTheme;
  whatsappPhone?: string; // Optional phone number for instant WhatsApp notification
  introBadge: string;
  introTitle: string;
  introSubtitle: string;
  storyMilestones: StoryMilestone[];
  polaroids: MemoryPolaroid[];
  confessionParagraphs: string[];
  quiz?: RomanticQuiz;
  secretDateSurprise?: SecretDateSurprise;
  respectfulRejectionMessage?: string[];
  reasons: {
    id: string;
    title: string;
    description: string;
    icon: string;
  }[];
  dateCoupons: {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
  }[];
  letterTitle?: string;
  letterBody: string[];
}

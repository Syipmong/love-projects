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

export interface ProposalConfig {
  partnerName: string;
  senderName: string;
  proposalQuestion: string;
  subheading?: string;
  startDate?: string; // e.g. "2024-01-01" for the live love ticker
  introBadge: string;
  introTitle: string;
  introSubtitle: string;
  storyMilestones: StoryMilestone[];
  polaroids: MemoryPolaroid[];
  confessionParagraphs: string[];
  quiz?: RomanticQuiz;
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

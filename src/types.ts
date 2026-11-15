export interface StoryMilestone {
  id: string;
  tag: string;
  title: string;
  date?: string;
  story: string;
  emoji: string;
}

export interface MemoryPolaroid {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  secretNote: string;
}

export interface ProposalConfig {
  partnerName: string;
  senderName: string;
  proposalQuestion: string;
  subheading?: string;
  introBadge: string;
  introTitle: string;
  introSubtitle: string;
  storyMilestones: StoryMilestone[];
  polaroids: MemoryPolaroid[];
  confessionParagraphs: string[];
  reasons: {
    id: string;
    title: string;
    description: string;
    emoji: string;
  }[];
  dateCoupons: {
    id: string;
    title: string;
    description: string;
    emoji: string;
    color: string;
  }[];
  letterTitle?: string;
  letterBody: string[];
}

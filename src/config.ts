import { ProposalConfig } from './types';

export const DEFAULT_CONFIG: ProposalConfig = {
  partnerName: "My Dearest",
  senderName: "Yours Truly",
  proposalQuestion: "Will you be my girlfriend?",
  subheading: "Every moment with you feels like magic. I have a very important question...",
  letterTitle: "To the One Who Holds My Heart 💕",
  letterBody: [
    "From the moment you came into my life, you turned ordinary days into unforgettable memories.",
    "Your smile brings warmth on my coldest days, and your laughter is honestly my favorite sound in the world.",
    "I love the way we can talk for hours about everything and nothing, and how safe and happy I feel just being around you.",
    "I don't just want you for right now—I want to be the one who stands by you, cheers for your dreams, makes you laugh, and holds your hand through it all.",
    "Thank you for being you, and thank you for saying YES to us! 🥰"
  ],
  reasons: [
    {
      id: "1",
      title: "Your Radiance",
      description: "The way your eyes light up when you talk about things you love.",
      emoji: "✨"
    },
    {
      id: "2",
      title: "Your Kindness",
      description: "How genuinely sweet and caring you are to everyone around you.",
      emoji: "🌸"
    },
    {
      id: "3",
      title: "Your Laughter",
      description: "The infectious giggles that never fail to make my whole day better.",
      emoji: "🥰"
    },
    {
      id: "4",
      title: "Our Connection",
      description: "How effortless it is to be completely myself with you.",
      emoji: "💫"
    },
    {
      id: "5",
      title: "My Favorite Person",
      description: "Because out of 8 billion people, my heart chose you without hesitation.",
      emoji: "💖"
    }
  ],
  dateCoupons: [
    {
      id: "c1",
      title: "Late Night Food Run",
      description: "Valid for midnight ice-cream, tacos, or fries whenever cravings hit.",
      emoji: "🍦",
      color: "from-amber-400 to-orange-500"
    },
    {
      id: "c2",
      title: "Cozy Movie & Blanket Marathon",
      description: "Your choice of films, endless popcorn, cuddles, and no interruptions.",
      emoji: "🎬",
      color: "from-purple-400 to-pink-500"
    },
    {
      id: "c3",
      title: "Fancy Dinner Date",
      description: "Dressing up, beautiful candlelight, good food, and my undivided attention.",
      emoji: "🍷",
      color: "from-rose-400 to-red-500"
    },
    {
      id: "c4",
      title: "Full Princess Treatment Day",
      description: "Whatever you want, whenever you want—you are the queen today!",
      emoji: "👑",
      color: "from-pink-400 to-rose-500"
    }
  ]
};

// Playful and funny texts for the "No" button as it is clicked or chased
export const NO_BUTTON_TEXTS: string[] = [
  "No",
  "Are you sure? 🥺",
  "Really sure? 💔",
  "Think again! 🤔",
  "Look at the big YES button! 👉",
  "Don't break my heart! 😭",
  "I'll cook you your favorite food! 🥞",
  "What if I give you unlimited hugs? 🤗",
  "Is that your final answer? 👀",
  "You're clicking the wrong button! 🙈",
  "Even this button is running away! 🏃‍♀️💨",
  "Error 404: 'No' not available! 🚫",
  "Come on, just click YES! 🥰",
  "Resistance is futile! ✨",
  "I won't let you say no! 💖",
  "Okay you're definitely teasing me now! 😂"
];

// Cute reaction gifs or mood stages (reliable curated tenor/giphy animated sticker URLs)
export const CUTE_REACTIONS = {
  // Initial asking state
  asking: "https://media.tenor.com/efbquN29NjkAAAAi/bubu-dudu-love.gif", // Cute bear with heart
  // Escalating teasing states
  pleading1: "https://media.tenor.com/2s44f6fBf2kAAAAi/peach-cat.gif", // Cute cat pleading
  pleading2: "https://media.tenor.com/9vB44aL_jK4AAAAi/bubu-dudu-crying.gif", // Crying / sad bear
  pleading3: "https://media.tenor.com/5U5e1U3dMtwAAAAi/milk-and-mocha-bear-crying.gif", // Milk and mocha dramatic crying
  surprised: "https://media.tenor.com/tHq7vj5E6XwAAAAi/cute-bear.gif",
  // YES Celebration
  celebrating: "https://media.tenor.com/gUiu1zyxfzYAAAAi/bear-kiss-bear-kisses.gif", // Bubu Dudu happy kissing / hugging
  celebrating2: "https://media.tenor.com/U3qI4UqI4JMAAAAi/dance-bear.gif" // Happy dance
};


import { ProposalConfig } from './types';

export const DEFAULT_CONFIG: ProposalConfig = {
  partnerName: "My Favorite Person",
  senderName: "Yours Truly",
  proposalQuestion: "Will you be my girlfriend?",
  subheading: "Every chapter of our story has quietly led to this one question...",
  startDate: "2024-06-01",
  theme: "rose",
  whatsappPhone: "", // Enter phone with country code e.g. "1234567890"

  // Chapter 1: The Intro / Subtle Invitation
  introBadge: "A Special Space Just For You",
  introTitle: "Hey there, beautiful...",
  introSubtitle: "Before you ask what this is, take a slow breath. I built this quiet little corner on the web because ordinary words over a text message could never do justice to what you mean to me.",

  // Chapter 2: The Timeline of Our Story
  storyMilestones: [
    {
      id: "m1",
      tag: "The First Spark",
      title: "The Moment You Crossed My Path",
      date: "Day One",
      story: "I still remember the first time we connected. I didn't know it back then, but that was the exact moment my world began to tilt a little more toward joy.",
      icon: "compass"
    },
    {
      id: "m2",
      tag: "The Turning Point",
      title: "When Conversations Stretched Past Midnight",
      date: "Late Nights",
      story: "We would talk about everything and nothing—our favorite songs, silly jokes, random childhood memories. I found myself looking at my phone smiling, never wanting the night to end.",
      icon: "moon"
    },
    {
      id: "m3",
      tag: "The Realization",
      title: "When You Became My First Thought",
      date: "The Epiphany",
      story: "Whenever something funny happened, you were the first person I wanted to tell. Whenever I had a rough day, just the thought of your voice made everything softer. That's when I knew: you were becoming my favorite part of life.",
      icon: "message"
    },
    {
      id: "m4",
      tag: "The Present",
      title: "Standing Here Right Now",
      date: "Today",
      story: "Looking at how far we've come, I realize that every smile you've given me has built a home in my heart that no one else can occupy.",
      icon: "home"
    }
  ],

  // Chapter 3: Polaroids / The Little Things You Do
  polaroids: [
    {
      id: "p1",
      title: "That Unmatched Smile",
      caption: "The way your eyes crinkle when you genuinely laugh.",
      imageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80",
      secretNote: "Every time you smile, my heart skips a beat. You have no idea how much natural warmth you carry into every room."
    },
    {
      id: "p2",
      title: "Your Pure Heart",
      caption: "How deeply you care about the people around you.",
      imageUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80",
      secretNote: "Your gentleness and empathy inspire me to be a kinder, better person every single day."
    },
    {
      id: "p3",
      title: "Our Quiet Moments",
      caption: "When words aren't needed, and silence feels peaceful.",
      imageUrl: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=600&q=80",
      secretNote: "Even in the simplest moments, just having you near is all the comfort I could ever ask for."
    },
    {
      id: "p4",
      title: "Your Unapologetic Self",
      caption: "All your little quirks, goofy expressions, and unique vibes.",
      imageUrl: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=80",
      secretNote: "Never change a single thing about yourself. You are perfectly, beautifully you."
    }
  ],

  // Interactive Mini Quiz
  quiz: {
    prompt: "Quick question before we turn the next page: Do you know what my absolute favorite thing about you is?",
    options: [
      {
        text: "Your radiant smile",
        response: "Your smile is genuinely breathtaking, but there is even more to it...",
        icon: "sun"
      },
      {
        text: "The way you make me laugh",
        response: "Your humor is unmatched, but it goes deeper than that...",
        icon: "smile"
      },
      {
        text: "Literally everything about you",
        response: "Spot on. Your kindness, your quirks, your laughter, your heart—all of it.",
        icon: "heart"
      }
    ]
  },

  // Chapter 4: Heartfelt Confession
  confessionParagraphs: [
    "I've spent a lot of time thinking about what love truly means. I used to think it was just big dramatic movie moments. But then you walked into my life.",
    "Real love, I've learned from you, is wanting someone to be safe. It's caring about how their day went. It's admiring their strength, respecting their boundaries, and celebrating their smallest wins.",
    "You've shown me a kind of tenderness I didn't know I was missing. When I picture tomorrow, next week, or next year, it always has you in it.",
    "I don't just want to be someone who admires you from afar. I want to be the one who supports your dreams, holds your hand through life's storms, and makes sure you never doubt how deeply you are loved."
  ],

  // Secret Date Surprise Vault
  secretDateSurprise: {
    code: "yes",
    hint: "Enter 'yes' (or 'forever') to unlock",
    title: "A Golden Sunset & Stargazing Picnic",
    location: "A Beautiful Scenic Lookout",
    details: "Wear warm and cozy clothes. I will bring your favorite warm drinks, delicious food, soft blankets, and stargazing music."
  },

  // Respectful decline message if she genuinely chooses no
  respectfulRejectionMessage: [
    "I want you to know how deeply I appreciate your honesty.",
    "True love and genuine affection can never be pressured, and my respect for you and your heart comes before anything else.",
    "Thank you for walking through this story with me and for giving me your time.",
    "You are a truly wonderful, bright person in this world. Nothing changes the warmth, kindness, and support I will always have for you."
  ],

  // Reasons Why
  reasons: [
    {
      id: "1",
      title: "Your Warmth",
      description: "You make everyone around you feel valued, heard, and genuinely safe.",
      icon: "sun"
    },
    {
      id: "2",
      title: "Your Laughter",
      description: "It is honestly my favorite song in the whole world.",
      icon: "music"
    },
    {
      id: "3",
      title: "Your Strength",
      description: "The resilient, graceful way you navigate everything that comes your way.",
      icon: "shield"
    },
    {
      id: "4",
      title: "Our Banter",
      description: "We can switch from deep philosophical talks to silly jokes in two seconds.",
      icon: "banter"
    },
    {
      id: "5",
      title: "Simply You",
      description: "Out of eight billion people on earth, my heart chose you without hesitation.",
      icon: "heart"
    }
  ],

  // Date Coupons
  dateCoupons: [
    {
      id: "c1",
      title: "Midnight Food & Snack Run",
      description: "Valid for midnight ice-cream, tacos, fries, or whatever craving strikes.",
      icon: "utensils",
      color: "from-amber-400 to-orange-500"
    },
    {
      id: "c2",
      title: "Cozy Blanket & Movie Night",
      description: "Your movie picks, warm blankets, lots of snacks, and zero interruptions.",
      icon: "film",
      color: "from-purple-400 to-pink-500"
    },
    {
      id: "c3",
      title: "A Truly Fancy Dinner Date",
      description: "Dressing up, candlelight, delicious food, and admiring you across the table.",
      icon: "wine",
      color: "from-rose-400 to-red-500"
    },
    {
      id: "c4",
      title: "Full Royalty Treatment Day",
      description: "Whatever you feel like doing—your wish is my absolute command today.",
      icon: "crown",
      color: "from-pink-400 to-rose-500"
    }
  ],

  letterTitle: "To the One Who Holds My Heart",
  letterBody: [
    "From the moment you entered my life, you turned ordinary days into unforgettable memories.",
    "Your smile brings warmth on my coldest days, and your laughter is honestly my favorite sound in the world.",
    "I love the way we can talk for hours about everything and nothing, and how safe and happy I feel just being around you.",
    "I don't just want you for right now—I want to be the one who stands by you, cheers for your dreams, makes you laugh, and holds your hand through it all.",
    "Thank you for being you, and thank you for saying YES to us."
  ]
};

// Playful and funny texts for the "No" button as it is clicked or chased
export const NO_BUTTON_TEXTS: string[] = [
  "No",
  "Are you sure?",
  "Really sure?",
  "Think again...",
  "Look at the big YES button!",
  "Don't break my heart!",
  "I'll cook you your favorite food!",
  "What if I give you unlimited hugs?",
  "Is that your final answer?",
  "You're clicking the wrong button!",
  "Even this button is running away!",
  "Error 404: 'No' not available",
  "Come on, just click YES!",
  "Resistance is futile",
  "I won't let you say no",
  "Okay you are definitely teasing me now!"
];

// Cute reaction gifs
export const CUTE_REACTIONS = {
  asking: "https://media.tenor.com/efbquN29NjkAAAAi/bubu-dudu-love.gif",
  pleading1: "https://media.tenor.com/2s44f6fBf2kAAAAi/peach-cat.gif",
  pleading2: "https://media.tenor.com/9vB44aL_jK4AAAAi/bubu-dudu-crying.gif",
  pleading3: "https://media.tenor.com/5U5e1U3dMtwAAAAi/milk-and-mocha-bear-crying.gif",
  surprised: "https://media.tenor.com/tHq7vj5E6XwAAAAi/cute-bear.gif",
  celebrating: "https://media.tenor.com/gUiu1zyxfzYAAAAi/bear-kiss-bear-kisses.gif",
  celebrating2: "https://media.tenor.com/U3qI4UqI4JMAAAAi/dance-bear.gif"
};

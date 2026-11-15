import { ProposalConfig } from './types';

export const DEFAULT_CONFIG: ProposalConfig = {
  partnerName: "My Favorite Person",
  senderName: "Yours Truly",
  proposalQuestion: "Will you be my girlfriend?",
  subheading: "Every chapter of my story has been leading up to this moment...",
  
  // Chapter 1: The Intro / Mysterious Invitation
  introBadge: "A Special Space Just For You",
  introTitle: "Hey there, beautiful...",
  introSubtitle: "Before you ask what this is, take a deep breath. I built this quiet little corner on the internet because ordinary words over a text message could never do justice to what you mean to me.",

  // Chapter 2: The Timeline of Our Story
  storyMilestones: [
    {
      id: "m1",
      tag: "The First Spark",
      title: "The Moment You Crossed My Path",
      date: "Day One",
      story: "I still remember the first time we connected. I didn't know it back then, but that was the exact moment my world began to tilt a little more toward joy.",
      emoji: "✨"
    },
    {
      id: "m2",
      tag: "The Turning Point",
      title: "When Conversations Stretched Past Midnight",
      date: "Late Nights",
      story: "We'd talk about everything and nothing—our favorite songs, silly jokes, random childhood stories. I found myself looking at my phone smiling like an idiot, never wanting the night to end.",
      emoji: "🌙"
    },
    {
      id: "m3",
      tag: "The Realization",
      title: "When You Became My First Thought",
      date: "The Epiphany",
      story: "Whenever something funny happened, you were the first person I wanted to tell. Whenever I had a rough day, just the thought of your voice made everything softer. That's when I knew: you weren't just someone in my life, you were becoming my favorite part of it.",
      emoji: "💭"
    },
    {
      id: "m4",
      tag: "The Present",
      title: "Standing Here Right Now",
      date: "Today",
      story: "Looking at how far we've come, I realize that every little smile you've given me has built a home in my heart that no one else can occupy.",
      emoji: "🏡"
    }
  ],

  // Chapter 3: Polaroids / The Little Things You Do
  polaroids: [
    {
      id: "p1",
      title: "That Unmatched Smile",
      caption: "The way your eyes crinkle when you genuinely laugh.",
      imageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80",
      secretNote: "Every time you smile, my heart skips a beat. You have no idea how much warmth you carry."
    },
    {
      id: "p2",
      title: "Your Pure Heart",
      caption: "How deeply you care about the people around you.",
      imageUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80",
      secretNote: "Your gentleness and empathy inspire me to be a better person every single day."
    },
    {
      id: "p3",
      title: "Our Quiet Moments",
      caption: "When words aren't needed, and silence feels like home.",
      imageUrl: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=600&q=80",
      secretNote: "Even in the simplest moments, having you near is all the peace I could ever ask for."
    },
    {
      id: "p4",
      title: "Your Unapologetic Self",
      caption: "All your little quirks, goofy expressions, and unique vibes.",
      imageUrl: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=80",
      secretNote: "Never change a single thing about yourself. You are perfectly, beautifully you."
    }
  ],

  // Chapter 4: Heartfelt Confession
  confessionParagraphs: [
    "I've spent a lot of time thinking about what love truly means. I used to think it was just big dramatic movie moments. But then you came along.",
    "Real love, I've learned from you, is wanting someone to be safe. It's caring about how their day went. It's admiring their strength, respecting their boundaries, and celebrating their smallest wins.",
    "You've shown me a kind of tenderness I didn't know I was missing. When I picture tomorrow, next week, or next year, it always has you in it.",
    "I don't just want to be someone who admires you from the sidelines. I want to be the one who supports your dreams, holds your hand when life gets stormy, and makes sure you never doubt how deeply you are cherished."
  ],

  // Reasons Why
  reasons: [
    {
      id: "1",
      title: "Your Warmth",
      description: "You make everyone around you feel valued, heard, and safe.",
      emoji: "☀️"
    },
    {
      id: "2",
      title: "Your Laugh",
      description: "It is honestly my favorite song in the whole world.",
      emoji: "🎶"
    },
    {
      id: "3",
      title: "Your Strength",
      description: "The resilient, graceful way you navigate everything that comes your way.",
      emoji: "🌸"
    },
    {
      id: "4",
      title: "Our Banter",
      description: "We can switch from deep life philosophy to dumb memes in 2 seconds.",
      emoji: "💫"
    },
    {
      id: "5",
      title: "Simply You",
      description: "Out of everyone in this universe, you are my favorite human.",
      emoji: "💖"
    }
  ],

  // Date Coupons
  dateCoupons: [
    {
      id: "c1",
      title: "Midnight Food & Snack Raid",
      description: "Valid for midnight ice-cream, Boba, fries, or whatever craving hits.",
      emoji: "🍦",
      color: "from-amber-400 to-orange-500"
    },
    {
      id: "c2",
      title: "Cozy Blanket & Movie Night",
      description: "Your movie picks, warm blankets, lots of snacks, and zero interruptions.",
      emoji: "🎬",
      color: "from-purple-400 to-pink-500"
    },
    {
      id: "c3",
      title: "A Truly Fancy Dinner Date",
      description: "Dressing up to the nines, candlelight, good food, and admiring you across the table.",
      emoji: "🍷",
      color: "from-rose-400 to-red-500"
    },
    {
      id: "c4",
      title: "Full Princess Treatment Day",
      description: "Whatever you feel like doing—your wish is my absolute command today.",
      emoji: "👑",
      color: "from-pink-400 to-rose-500"
    }
  ],

  letterTitle: "To the One Who Holds My Heart 💕",
  letterBody: [
    "From the moment you entered my life, you turned ordinary days into unforgettable memories.",
    "Your smile brings warmth on my coldest days, and your laughter is honestly my favorite sound in the world.",
    "I love the way we can talk for hours about everything and nothing, and how safe and happy I feel just being around you.",
    "I don't just want you for right now—I want to be the one who stands by you, cheers for your dreams, makes you laugh, and holds your hand through it all.",
    "Thank you for being you, and thank you for saying YES to us! 🥰"
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

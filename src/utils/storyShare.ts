/**
 * Story Card & Native Social Sharing Engine for Anonymoux
 * Emulates the viral UX of anonymous apps like NGL and Sendit
 * Strict TypeScript implementation
 */

export interface StoryCardOptions {
  handle: string;
  prompt?: string;
  subtext?: string;
}

export interface StoryReplyOptions {
  handle: string;
  message: string;
  senderHint?: string;
}

/**
 * Draws rounded rectangle helper for HTML5 Canvas
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Wraps text into lines for canvas rendering
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Generates a 1080x1920 Instagram Story Graphic for sharing an anonymous prompt (like NGL)
 */
export async function generatePromptStoryCard({
  handle,
  prompt = 'send me anonymous secret messages!',
  subtext = 'anonymoux.aetechlabs.com'
}: StoryCardOptions): Promise<{ dataUrl: string; blob: Blob | null }> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return { dataUrl: '', blob: null };
  }

  // 1. Rich vibrant background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
  bgGrad.addColorStop(0, '#4c1d95'); // Deep Purple
  bgGrad.addColorStop(0.35, '#831843'); // Pink / Wine
  bgGrad.addColorStop(0.7, '#be123c'); // Rose
  bgGrad.addColorStop(1, '#0f172a'); // Slate Dark
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1080, 1920);

  // 2. Ambient decorative circles
  ctx.save();
  ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
  ctx.beginPath();
  ctx.arc(200, 400, 320, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(168, 85, 247, 0.18)';
  ctx.beginPath();
  ctx.arc(880, 1300, 360, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3. Central Story Sticker Card (White glossy card)
  const cardX = 90;
  const cardY = 560;
  const cardW = 900;
  const cardH = 680;
  const radius = 56;

  // Card shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 24;

  ctx.fillStyle = '#ffffff';
  roundRect(ctx, cardX, cardY, cardW, cardH, radius);
  ctx.fill();
  ctx.restore();

  // 4. Sticker Top Pill (Header)
  const pillW = 440;
  const pillH = 72;
  const pillX = cardX + (cardW - pillW) / 2;
  const pillY = cardY + 60;

  ctx.fillStyle = '#f1f5f9';
  roundRect(ctx, pillX, pillY, pillW, pillH, 36);
  ctx.fill();

  // Header Text
  ctx.fillStyle = '#64748b';
  ctx.font = '600 30px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`@${handle.replace('@', '')}`, pillX + pillW / 2, pillY + pillH / 2);

  // 5. Main Prompt Question
  ctx.fillStyle = '#0f172a';
  ctx.font = '800 54px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const promptLines = wrapText(ctx, prompt, cardW - 120);
  const startY = cardY + 280 - ((promptLines.length - 1) * 36);

  promptLines.forEach((line, idx) => {
    ctx.fillText(line, cardX + cardW / 2, startY + idx * 74);
  });

  // 6. Sticker Bottom Bar
  const bottomBarY = cardY + cardH - 120;
  ctx.fillStyle = '#f8fafc';
  roundRect(ctx, cardX + 50, bottomBarY, cardW - 100, 80, 24);
  ctx.fill();

  ctx.fillStyle = '#9333ea';
  ctx.font = '700 30px "Outfit", sans-serif';
  ctx.fillText(subtext, cardX + cardW / 2, bottomBarY + 40);

  // 7. Visual "Paste Link Here" Sticker Guide at bottom of story
  const linkPillY = 1440;
  const linkPillW = 600;
  const linkPillH = 100;
  const linkPillX = (1080 - linkPillW) / 2;

  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 3;
  roundRect(ctx, linkPillX, linkPillY, linkPillW, linkPillH, 50);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 34px "Outfit", sans-serif';
  ctx.fillText('Tap Sticker To Send', 540, linkPillY + 50);
  ctx.restore();

  // Export
  const dataUrl = canvas.toDataURL('image/png');
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/png')
  );

  return { dataUrl, blob };
}

/**
 * Generates an Instagram Story Card for replying to a received anonymous secret message
 */
export async function generateReplyStoryCard({
  handle,
  message,
  senderHint
}: StoryReplyOptions): Promise<{ dataUrl: string; blob: Blob | null }> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return { dataUrl: '', blob: null };
  }

  // 1. Dark Neon / Violet Story Background
  const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
  bgGrad.addColorStop(0, '#1e1b4b'); // Deep Indigo
  bgGrad.addColorStop(0.5, '#4c1d95'); // Rich Purple
  bgGrad.addColorStop(1, '#09090b'); // Obsidian
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1080, 1920);

  // 2. Ambient glow
  ctx.save();
  ctx.fillStyle = 'rgba(192, 132, 252, 0.12)';
  ctx.beginPath();
  ctx.arc(540, 700, 480, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3. Central Message Card
  const cardX = 90;
  const cardY = 480;
  const cardW = 900;
  const cardH = senderHint ? 740 : 660;
  const radius = 52;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 20;

  ctx.fillStyle = '#ffffff';
  roundRect(ctx, cardX, cardY, cardW, cardH, radius);
  ctx.fill();
  ctx.restore();

  // 4. Header Badge
  const badgeW = 460;
  const badgeH = 68;
  const badgeX = cardX + (cardW - badgeW) / 2;
  const badgeY = cardY + 54;

  ctx.fillStyle = '#f3e8ff';
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 34);
  ctx.fill();

  ctx.fillStyle = '#7e22ce';
  ctx.font = '800 28px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ANONYMOUS MESSAGE', badgeX + badgeW / 2, badgeY + badgeH / 2);

  // 5. Secret Message Quote
  ctx.fillStyle = '#1e1b4b';
  ctx.font = '700 46px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const messageLines = wrapText(ctx, `"${message}"`, cardW - 140);
  const startY = cardY + 240;

  messageLines.forEach((line, idx) => {
    ctx.fillText(line, cardX + cardW / 2, startY + idx * 64);
  });

  // 6. Sender hint (if present)
  if (senderHint) {
    const hintY = startY + messageLines.length * 64 + 40;
    ctx.fillStyle = '#f8fafc';
    roundRect(ctx, cardX + 60, hintY - 30, cardW - 120, 64, 18);
    ctx.fill();

    ctx.fillStyle = '#64748b';
    ctx.font = '500 26px "Outfit", sans-serif';
    ctx.fillText(`Hint: "${senderHint}"`, cardX + cardW / 2, hintY);
  }

  // 7. Footer attribution on card
  const footY = cardY + cardH - 64;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 24px "Outfit", sans-serif';
  ctx.fillText(`anonymoux.aetechlabs.com/u/${handle.replace('@', '')}`, cardX + cardW / 2, footY);

  // 8. Story Call to action for viewers
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 38px "Outfit", sans-serif';
  ctx.fillText('Send me one too! Link in bio / sticker', 540, 1420);

  // Export
  const dataUrl = canvas.toDataURL('image/png');
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/png')
  );

  return { dataUrl, blob };
}

/**
 * Downloads a data URL as an image file directly
 */
export function downloadStoryImage(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Native App Share Trigger (emulating NGL/Sendit)
 * Priority order:
 * 1. Web Share API with file attachment (if supported on mobile)
 * 2. Web Share API with title, text, url
 * 3. Deep-link fallback or clipboard
 */
export async function shareStoryNative({
  title,
  text,
  url,
  blob,
  filename = 'anonymoux-story.png'
}: {
  title: string;
  text: string;
  url: string;
  blob?: Blob | null;
  filename?: string;
}): Promise<{ shared: boolean; method: 'web-share-file' | 'web-share-url' | 'fallback' }> {
  // Always copy link to clipboard silently so it's ready for stickers
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    // Ignore clipboard failure on unfocused documents
  }

  // Check Web Share API with Files
  if (navigator.share && blob && navigator.canShare) {
    try {
      const file = new File([blob], filename, { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title,
          text,
          url
        });
        return { shared: true, method: 'web-share-file' };
      }
    } catch {
      // User cancelled or file sharing unsupported
    }
  }

  // Fallback to Web Share API with URL
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url
      });
      return { shared: true, method: 'web-share-url' };
    } catch {
      // User cancelled
    }
  }

  return { shared: false, method: 'fallback' };
}

/**
 * Opens Instagram Story Camera with fallback
 */
export function openInstagramStoryCamera() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = 'instagram://story-camera';
    setTimeout(() => {
      window.open('https://www.instagram.com', '_blank');
    }, 1200);
  } else {
    window.open('https://www.instagram.com', '_blank');
  }
}

/**
 * Opens Snapchat with fallback
 */
export function openSnapchatCamera() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = 'snapchat://';
    setTimeout(() => {
      window.open('https://www.snapchat.com', '_blank');
    }, 1200);
  } else {
    window.open('https://www.snapchat.com', '_blank');
  }
}

/**
 * Opens WhatsApp share with text
 */
export function openWhatsAppShare(text: string, url: string) {
  const fullText = encodeURIComponent(`${text}\n${url}`);
  window.open(`https://api.whatsapp.com/send?text=${fullText}`, '_blank');
}

/**
 * Opens X (Twitter) compose with text
 */
export function openTwitterShare(text: string, url: string) {
  const fullText = encodeURIComponent(`${text}\n${url}`);
  window.open(`https://twitter.com/intent/tweet?text=${fullText}`, '_blank');
}

/**
 * Opens Facebook share dialog
 */
export function openFacebookShare(url: string) {
  const encoded = encodeURIComponent(url);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encoded}`, '_blank');
}

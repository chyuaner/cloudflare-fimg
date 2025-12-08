// -----------------------------------------------------------------------------
// Helper functions
// -----------------------------------------------------------------------------

export const parseSize = (sizeStr: string) => {
  if (sizeStr.includes('x')) {
    const [w, h] = sizeStr.split('x').map(Number);
    return { width: w, height: h };
  }
  const s = Number(sizeStr);
  return { width: s, height: s };
};

export const parseColor = (colorStr: string) => {
  // Support "ff0000" -> "#ff0000", "000" -> "#000"
  // Also support "ff0000,128" -> "#ff000080"

  const [hexPart, alphaPart] = colorStr.split(',');
  let color = hexPart.startsWith('#') ? hexPart : '#' + hexPart;

  if (alphaPart) {
      // Normalize to 6 digits if 3 digits
      if (color.length === 4) { // #RGB
          const r = color[1];
          const g = color[2];
          const b = color[3];
          color = `#${r}${r}${g}${g}${b}${b}`;
      }

      const a = Math.max(0, Math.min(255, Number(alphaPart)));
      const alphaHex = Math.round(a).toString(16).padStart(2, '0');
      color += alphaHex;
  }

  return color;
};

// -----------------------------------------------------------------------------
// Emoji / Emote Parsers
// -----------------------------------------------------------------------------

// Regex for Discord emotes: <:name:id>
const DISCORD_EMOTE_REGEX = /<:(\w+):(\d+)>/g;

export const parseTextToElements = (
  /** 可能為 undefined，若無則視為空字串 */ text: string | undefined,
  /** fontSize 也允許 undefined，若無則使用 100 作為 fallback */ fontSizeVal: number | undefined
) => {

  const safeText = typeof text === 'string' ? text : '';
  const safeFontSize = typeof fontSizeVal === 'number' && !isNaN(fontSizeVal)
    ? fontSizeVal
    : 100; // 預設 100px

  const elements: any[] = [];
  let lastIndex = 0;

  const matches = Array.from(safeText.matchAll(DISCORD_EMOTE_REGEX));

  for (const match of matches) {
    const matchIndex = match.index!;
    const matchString = match[0];
    const emoteId = match[2]; // Capturing group 2 is ID

    // Text before match
    if (matchIndex > lastIndex) {
      elements.push({
        type: 'span',
        props: { children: safeText.substring(lastIndex, matchIndex) }
      });
    }

    // specific discord emote element
    elements.push({
        type: 'img',
        props: {
            src: `https://cdn.discordapp.com/emojis/${emoteId}.png`,
            width: fontSizeVal,
            height: fontSizeVal,
            style: {
                margin: '0 2px',
                verticalAlign: 'middle',
                objectFit: 'contain'
            }
        }
    });

    lastIndex = matchIndex + matchString.length;
  }

  // Process failing text after the last match
  if (lastIndex < safeText.length) {
    elements.push({
      type: 'span',
      props: { children: safeText.substring(lastIndex) }
    });
  }

  return elements;
};


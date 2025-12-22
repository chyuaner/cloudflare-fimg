import React from "react";

// -----------------------------------------------------------------------------
// Emoji / Emote Parsers
// -----------------------------------------------------------------------------

// Regex for Discord emotes: <:name:id> or <a:name:id>
const DISCORD_EMOTE_REGEX = /<(a?):(\w+):(\d+)>/g;

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
    const isAnimated = match[1] === 'a';
    const emoteId = match[3]; // Capturing group 3 is ID

    // Text before match
    if (matchIndex > lastIndex) {
      elements.push(
        <span key={`text-${lastIndex}`}>
          {safeText.substring(lastIndex, matchIndex)}
        </span>
      );
    }

    // specific discord emote element
    const ext = isAnimated ? 'gif' : 'png';
    elements.push(
        <img
            key={`emote-${matchIndex}`}
            src={`https://cdn.discordapp.com/emojis/${emoteId}.${ext}`}
            width={safeFontSize}
            height={safeFontSize}
            style={{
                margin: '0 2px',
                verticalAlign: 'middle',
                objectFit: 'contain',
                width: `${safeFontSize}px`,
                height: `${safeFontSize}px`,
            }}
        />
    );

    lastIndex = matchIndex + matchString.length;
  }

  // Process failing text after the last match
  if (lastIndex < safeText.length) {
    elements.push(
      <span key={`text-${lastIndex}`}>
        {safeText.substring(lastIndex)}
      </span>
    );
  }

  return elements;
};


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



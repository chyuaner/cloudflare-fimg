import { Hono } from 'hono';
import { ImageResponse } from '@cf-wasm/og';

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
// Router 設定（接受已建立好的 app，回傳同一個 app）
// -----------------------------------------------------------------------------
export const applyRoutes = (app: Hono<any>) => {

  // ---------- 動態圖片 ----------
  app.get('/:size/:bgColor?/:fgColor?', async (c) => {
    const sizeParam = c.req.param('size'); // "300", "300.png", "300x200", "300x200.png"
    const bgParam = c.req.param('bgColor');
    const fgParam = c.req.param('fgColor');

    // Check for .png extension in the *last* provided parameter to override type
    let forcePng = false;
    let rawSize = sizeParam;
    let rawBg = bgParam;
    let rawFg = fgParam;

    // Logic to detect .png at the end of the URL path
    // Since specific params might be undefined, we check the path or the last defined param.
    // Actually, Hono's routing might handle extensions if we are careful, but let's parse manualy.

    // If sizeParam has .png, and others are undefined
    if (rawSize && rawSize.endsWith('.png')) {
        forcePng = true;
        rawSize = rawSize.replace('.png', '');
    } else if (rawBg && rawBg.endsWith('.png') && !rawFg) {
        forcePng = true;
        rawBg = rawBg.replace('.png', '');
    } else if (rawFg && rawFg.endsWith('.png')) {
        forcePng = true;
        rawFg = rawFg.replace('.png', '');
    }

    const { width, height } = parseSize(rawSize);

    // Defaults
    const bgColor = rawBg ? parseColor(rawBg) : '#cccccc'; // Default grey

    const fgColor = rawFg ? parseColor(rawFg) : '#969696'; // Default darker grey

    const query = c.req.query();
    const text = query.text || `${width}x${height}`;
    const fontName = query.font || 'noto'; // Default to noto
    const retina = query.retina === '1';

    // Load font
    const loader = c.get('assetLoader');
    let fontData: ArrayBuffer | null = null;
    try {
        // Map short names to files
        const fontFile = fontName === 'lobster' ? 'Lobster-Regular.ttf' : 'NotoSansTC-Medium.ttf';
        fontData = await loader.loadFont(fontFile);
    } catch (e) {
        console.error("Font load error:", e);
        // Fallback or error?
        // For now, let's try to load a default fallback if the specific one failed, or just fail.
        // If Noto fails, we might be in trouble if we don't have it.
    }

    if (!fontData) {
        return c.text("Font not found", 500);
    }

    // Generate Image
    // Using React-like element structure (JSX via generic object or h function if we import it,
    // but standard object structure works for Satori/OG)

    const element = {
        type: 'div',
        props: {
            style: {
                display: 'flex',
                width: '100%',
                height: '100%',
                backgroundColor: bgColor,
                color: fgColor,
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: Math.min(width, height) / 5 + 'px', // Simple scaling
                fontFamily: fontName,
            },
            children: text,
        },
    };

    // Determine format
    const format = forcePng ? 'png' : 'svg'; // User wants SVG default

    const imageResponse = new ImageResponse(
        element as any,
        {
            width: retina ? width * 2 : width,
            height: retina ? height * 2 : height,
            fonts: [
                {
                    name: fontName,
                    data: fontData,
                    weight: 400,
                    style: 'normal',
                },
            ],
            format: format as any, // Cast if type definitions are incomplete
        }
    );

    // If SVG, headers might need adjustment? ImageResponse handles Content-Type.
    return imageResponse;
    });

  return app;
};

import { AssetLoader } from "./loaders/AssetLoader";

// --- 內建字型簡稱 對應表 ---
const fontFileMap = {
  noto: 'NotoSansTC-Medium.ttf',
  lobster: 'Lobster-Regular.ttf',
  // 可以持續擴充
} as const;

/**
 * 根據字型名稱列表（如 ['noto', 'lobster', 'CustomFont.ttf']），
 * 若名稱在 fontFileMap 中，使用對應檔名；
 * 否則將該名稱直接視為 .ttf 檔名載入。
 * 回傳 ImageResponse 所需的 fonts 格式。
 */
export async function loadFonts(
  assetLoader: AssetLoader,
  fontNames: string[] // 改為 string[]，不限於 key，允許自訂名稱
): Promise<Array<{ name: string; data: ArrayBuffer; weight: 400; style: 'normal' }>> {
  const fonts: Array<{ name: string; data: ArrayBuffer; weight: 400; style: 'normal' }> = [];

  for (const name of fontNames) {
    // 判斷是否為內建簡稱
    const isKnownFont = name in fontFileMap;

    // 如果是內建簡稱，用 mapping；否則當作直接檔名
    const fontFile = isKnownFont ? fontFileMap[name as keyof typeof fontFileMap] : name;

    // 使用 fontNames 中的值作為 `name`，但若為自訂檔名可選擇去掉 .ttf 副檔名
    const displayName = isKnownFont ? name : name.replace(/\.\w+$/, ''); // 去掉副檔名作為 name

    try {
      const data = await assetLoader.loadFont(fontFile);
      if (data) {
        fonts.push({
          name: displayName,
          data,
          weight: 400,
          style: 'normal',
        });
      } else {
        console.error(`Loaded font data is null: ${fontFile}`);
      }
    } catch (e) {
      console.error(`Font load error (${fontFile}):`, e);
    }
  }

  return fonts;
}

/**
 * 網址參數拆分器
 *
 * 若網址帶入 http://localhost:8787/350x200/bg/8/4/ff0000,128/4/ph/ff0000,128/000,255/?text=Hello+World&font=noto
 *
 * 將會回傳
 * ```
 * {
 *   "canvas": "350x200",
 *   "bg": {
 *     "parts": [
 *       "8",
 *       "4",
 *       "ff0000,128",
 *       "4"
 *     ],
 *     "padding": "8",
 *     "shadow": "4",
 *     "bgcolor": "ff0000,128",
 *     "radius": "4"
 *   },
 *   "content": {
 *     "type": "ph",
 *     "parts": [
 *       "ff0000,128",
 *       "000,255"
 *     ],
 *     "bgcolor": "ff0000,128",
 *     "fgcolor": "000,255"
 *   },
 *   "query": {
 *     "text": "Hello+World",
 *     "font": "noto"
 *   }
 * }
 * ```
 *
 *
 * 兼容兩種語法
 *   1. 完整寫法：/bg/.../ph/...   (原本支援的)
 *   2. 簡寫：/<canvas>/<phContent>/<phContent>... (fakeimg.pl 常見簡寫)
 *      例如：/200x100/ff0000,128/000,255/ -> canvas=200x100, ph=[ff0000,128, 000,255]
 *
 * 任何段落皆可省略，回傳值保留以下欄位：
 *   - canvas: string | null          // 無則為 null (前端可自行視為 "auto")
 *   - bg:    { parts: string[] }      // 可能為 []、[color]、[color,alpha]、[color,bgColor]…
 *   - content:{ type:string|null, parts:string[] }
 *   - query:  Record<string,string>
 */
export function splitUrl(
  urlStr: string,
  contentKeys: string[] = ['ph', 'code', 'img']
) {
  // ---------- 文字分割 ----------
  // 先把 path 與 query 分開（不使用 URL 物件）
  const [rawPath, rawQuery = ''] = urlStr.split('?', 2);
  // 確保有前導 '/'（外部只會傳入 "/300x200/…" 之類的字串）
  const pathnameRaw = rawPath.startsWith('/') ? rawPath : '/' + rawPath;

  // ------------------------------------------------------------
  // ① 正規化：把 "ph.png"、"code.jpg"、"img.svg" 這類寫法
  //    轉成 "ph/.png"、"code/.jpg"、"img/.svg"
  // ------------------------------------------------------------
  const EXT_REG = /\.(png|svg|jpg|jpeg|gif|html)$/i;   // 已在檔案底部宣告，保留
  const normalizedPath = pathnameRaw.replace(
    new RegExp(`/(ph|code|img)(${EXT_REG.source})$`, 'i'),
    (_, key, ext) => `/${key}/${ext}`   // 變成 "/ph/.png" 之類
  );

  // 後面的流程全部改用 normalizedPath
    const pathname = normalizedPath;   // 仍保留前導 '/'，方便後續 split
    const segs = pathname.split('/').filter(Boolean);

  // ---------- 解析 query ----------
  const query = Object.fromEntries(
    rawQuery
      .split('&')
      .filter(Boolean)
      .map(pair => {
        const [k, v = ''] = pair.split('=', 2);
        return [decodeURIComponent(k), decodeURIComponent(v)];
      })
  );
  // ---------- 先找 canvas ----------
  const first = segs[0];
  const isCanvas = !(first === '' || first === 'bg' || contentKeys.includes(first));
  const canvas = isCanvas ? first.replace(EXT_REG, '') : null;

  // ---------- 預設空區塊 ----------
  const blockKeys = ['bg', ...contentKeys];          // 必須先列出 bg
  const blocks: Record<string, { parts: string[] }> = {};
  blockKeys.forEach(k => (blocks[k] = { parts: [] }));

  // ---------- 先用 "/bg/"、"/ph/"… 的正式寫法切割 ----------
  const path = pathname;                        // 保留前導 '/'

  for (const key of blockKeys) {
    const idx = path.indexOf(`/${key}/`);
    if (idx === -1) continue;                      // 沒有此區塊
    const start = idx + key.length + 2;
    const nextIdx = blockKeys
      .map(k2 => path.indexOf(`/${k2}/`, start))
      .filter(i => i !== -1)
      .sort((a, b) => a - b)[0] ?? path.length;
    const raw = path.slice(start, nextIdx);
    // 先 split 成段落，然後把每段可能的副檔名移除
    const parts = raw
      ? raw
          .split('/')
          .filter(Boolean)
          .map(p => p.replace(EXT_REG, ''))   // 去除 .png/.svg 等
          // ------------------------------------------------------------
          // 只保留真正屬於當前 block 的內容
          // 若去除副檔名後恰好是任一 contentKey 或 "bg"，視為非 bg 資料
          .filter(p => !(p === 'bg' || contentKeys.includes(p)))
          // ------------------------------------------------------------
      : [];
    blocks[key] = { parts };
  }

  // ---------- 若「主內容」仍是空，嘗試用「簡寫」方式取得 ----------
  // 簡寫格式：/200x100/ff0000,128/000,255/ -> canvas=200x100, ph=[ff0000,128, 000,255]
  // 只在以下情況下才嘗試：沒有 /ph/ 等明確 contentKey，且 canvas 已確定
  const hasExplicitContent = contentKeys.some(key => blocks[key].parts.length > 0);
  if (!hasExplicitContent && canvas !== null) {
    // 從第二段開始，所有不是 'bg' 關鍵字的段落都視為 ph 內容
    const contentParts: string[] = [];
    for (let i = 1; i < segs.length; i++) {
      let seg = segs[i];
      // 若最後一段帶有副檔名，先去除
      seg = seg.replace(EXT_REG, '');

      // 如果遇到明確的關鍵字（bg, ph, code, img），停止
      if (seg === 'bg' || contentKeys.includes(seg)) {
        break;
      }
      contentParts.push(seg);
    }
    // 如果有收集到內容，設置為 ph
    if (contentParts.length > 0) {
      blocks.ph.parts = contentParts;
    }
  }

  // ---------- 主內容 ----------
  const contentKey = contentKeys.find(k => blocks[k].parts.length > 0) || null;
  const contentParts = contentKey ? blocks[contentKey].parts : [];

  // 處理 named keys for content (ph)
  let contentObj: any = { type: contentKey, parts: contentParts };
  if (contentKey === 'ph') {
    contentObj = {
      ...contentObj,
      bgcolor: contentParts[0],
      fgcolor: contentParts[1],
    };
  }

  // 處理 named keys for bg
  // [bg-padding]/[bg-shadow]/[bg-bgcolor]/[bg-radius]
  const bgParts = blocks.bg.parts;
  const bgObj = {
      parts: bgParts,
      padding: bgParts[0],
      shadow: bgParts[1],
      radius: bgParts[2],
      bgcolor: bgParts[3],
  };

  return { canvas, bg: bgObj, content: contentObj, query };
}

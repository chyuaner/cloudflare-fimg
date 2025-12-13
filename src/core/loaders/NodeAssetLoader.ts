import type { AssetLoader } from '../assetLoader';

export class NodeAssetLoader implements AssetLoader {
  async loadFont(name: string): Promise<ArrayBuffer> {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const filePath = path.join(process.cwd(), 'public', 'font', name);
    const buffer = await fs.readFile(filePath);
    return buffer.buffer as ArrayBuffer;
  }

  async loadImage(relativePath: string): Promise<ArrayBuffer> {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const filePath = path.join(process.cwd(), 'public', relativePath);
    const buffer = await fs.readFile(filePath);
    return buffer.buffer as ArrayBuffer;
  }

  async loadText(relativePath: string): Promise<string> {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const filePath = path.join(process.cwd(), 'public', relativePath);
    return fs.readFile(filePath, 'utf-8');
  }
}

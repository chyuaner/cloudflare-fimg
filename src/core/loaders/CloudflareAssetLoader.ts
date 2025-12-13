import type { AssetLoader } from './AssetLoader';

export class CloudflareAssetLoader implements AssetLoader {
  private assetsFetcher: Fetcher | null;

  constructor(assetsFetcher: Fetcher | null = null) {
    this.assetsFetcher = assetsFetcher;
  }

  async loadFont(name: string): Promise<ArrayBuffer> {
    if (this.assetsFetcher) {
        const response = await this.assetsFetcher.fetch(`http://assets/font/${name}`);
        if (!response.ok) {
            throw new Error(`Failed to load font ${name}: ${response.statusText}`);
        }
        return response.arrayBuffer();
    }
    throw new Error("CloudflareAssetLoader requires a Fetcher binding for assets or logic to fetch from URL");
  }

  async loadImage(path: string): Promise<ArrayBuffer> {
    if (this.assetsFetcher) {
      const response = await this.assetsFetcher.fetch(`http://assets/${path}`);
      if (!response.ok) {
          throw new Error(`Failed to load image ${path}: ${response.statusText}`);
      }
      return response.arrayBuffer();
    }
    throw new Error("CloudflareAssetLoader requires a Fetcher binding for assets");
  }

  async loadText(path: string): Promise<string> {
    if (this.assetsFetcher) {
      const response = await this.assetsFetcher.fetch(`http://assets/${path}`);
      if (!response.ok) {
          throw new Error(`Failed to load text ${path}: ${response.statusText}`);
      }
      return response.text();
    }
    throw new Error("CloudflareAssetLoader requires a Fetcher binding for assets");
  }
}

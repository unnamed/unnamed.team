/*!
 * File-system cache module
 */
import fs from 'fs';
import path from 'path';

const pathOf = (key: string) => path.join(process.cwd(), 'cache', `${key}.json`);

export default class Cache<T> {

  private readonly _path: string;
  public readonly lifetime: number;

  constructor(
    private fetch: () => Promise<T>,
    key: string,
    lifetime: number = 0
  ) {
    this._path = pathOf(key);
    this.lifetime = lifetime;
  }

  /**
   * Obtains the stored value or revalidates if
   * cache expired
   */
  async get(): Promise<T> {
    let cache = null;

    // if cache file exists and its lifetime
    // did not expire, use it
    if (fs.existsSync(this._path)) {
      cache = JSON.parse(fs.readFileSync(this._path, { encoding: 'utf8' }));
      if (cache.lastFetch + this.lifetime > Date.now()) {
        return cache.data;
      }
    }

    // cache expired, fetch again
    try {
      const data = await this.fetch();
      await this.set(data);
      return data;
    } catch (e) {
      if (cache && cache.data) {
        console.error("Failed to fetch data", e);
        return cache.data;
      }
      throw e;
    }
  }

  /**
   * Sets the stored value
   */
  async set(data: T): Promise<void> {
    const dir = path.parse(this._path).dir;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    fs.writeFileSync(this._path, JSON.stringify({
      lastFetch: Date.now(),
      data
    }));
  }

}
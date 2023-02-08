/*!
 * File-system cache module
 */
import fs from 'fs';
import path from 'path';

const pathOf = key => path.join(process.cwd(), 'cache', `${key}.json`);

/**
 * @template T
 */
export default class Cache {

  constructor(
    fetch,
    key,
    lifetime = 0
  ) {
    this._fetch = fetch;
    this._path = pathOf(key);
    this.lifetime = lifetime;
  }

  /**
   * Obtains the stored value or revalidates if
   * cache expired
   *
   * @returns {Promise<T>}
   */
  async get() {
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
      const data = await this._fetch();
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
   *
   * @param {T} data The stored value
   * @returns {Promise<void>}
   */
  async set(data) {
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
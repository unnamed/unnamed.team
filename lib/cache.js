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
    let cache;

    // if cache file exists and its lifetime
    // did not expire, use it
    if (fs.existsSync(this._path)
      && (cache = fs.readFileSync(this._path)).lastFetch + this.lifetime > Date.now()) {
      return cache.data;
    }

    // cache expired, fetch again
    const data = await this._fetch();
    await this.set(data);
    return data;
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
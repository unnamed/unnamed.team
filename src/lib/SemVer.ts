/*! Parse semver versions */

// major.minor.patch
// major.minor.patch-SNAPSHOT
class SemVer {
  constructor(
    public readonly major: number,
    public readonly minor: number,
    public readonly patch: number,
    public readonly snapshot: boolean
  ) {}

  isNewerThan(other: SemVer): boolean {
    if (this.major > other.major) return true;
    if (this.major < other.major) return false;
    if (this.minor > other.minor) return true;
    if (this.minor < other.minor) return false;
    if (this.patch > other.patch) return true;
    if (this.patch < other.patch) return false;
    if (other.snapshot == this.snapshot) return false;
    return other.snapshot;
  }

  toString(): string {
    return `${this.major}.${this.minor}.${this.patch}${this.snapshot ? '-SNAPSHOT' : ''}`;
  }

  static parse(str: string): SemVer {
    const snapshot = str.endsWith('-SNAPSHOT');
    const [ major, minor, patch ] = str.split('-')[0].split('.').map(parseInt);
    return new SemVer(major, minor, patch, snapshot);
  }
}

export default SemVer;
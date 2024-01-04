import SemVer from "@/lib/SemVer";

interface Versions {
  latest: string;
  release: string | null;
}

const versionCache = new Map<string, Versions>();

export async function fetchVersioning(groupId: string, artifactId: string): Promise<Versions> {

  const key = `${groupId}:${artifactId}`;
  let versions = versionCache.get(key);

  if (versions) {
    return versions;
  }

  const repositories = [
    { name: 'Maven Central Releases', url: 'https://repo1.maven.org/maven2' },
    { name: 'Maven Central Snapshots (S01)', url: 'https://s01.oss.sonatype.org/content/repositories/snapshots' },
    { name: 'Unnamed Public', url: 'https://repo.unnamed.team/repository/unnamed-public' }
  ];

  // location in folder format, for example: team/unnamed/creative-api
  const location = `${groupId.replace(/\./g, '/')}/${artifactId}`;

  let latestRelease: SemVer | null = null;
  let latestReleaseOrSnapshot: SemVer | null = null;

  console.log(`looking for ${location}`);
  for (const repository of repositories) {
    // maven metadata location, for example: https://repo.unnamed.team/repository/unnamed-public/team/unnamed/creative-api/maven-metadata.xml
    const mavenMetadataLocation = `${repository.url}/${location}/maven-metadata.xml`;
    let res;
    try {
      const response = await fetch(mavenMetadataLocation);
      const xml = await response.text();

      const latest = xml.match(/(?<=<latest>)[^<]+(?=<\/latest>)/g)?.[0] ?? null;
      const release = xml.match(/(?<=<release>)[^<]+(?=<\/release>)/g)?.[0] ?? null;

      if (latest === null) {
        console.log(`looked at ${mavenMetadataLocation}: not found`);
        continue;
      }

      const latestSemVer = SemVer.parse(latest);
      const releaseSemVer = release ? SemVer.parse(release) : null;

      if (latestSemVer.snapshot) {
        if (latestReleaseOrSnapshot === null || latestSemVer.isNewerThan(latestReleaseOrSnapshot)) {
          latestReleaseOrSnapshot = latestSemVer;
        }
      } else if (latestRelease == null || latestSemVer.isNewerThan(latestRelease)) {
        latestRelease = latestSemVer;
      }

      if (releaseSemVer !== null && (latestRelease === null || releaseSemVer.isNewerThan(latestRelease))) {
        latestRelease = releaseSemVer;
      }
      if (latestReleaseOrSnapshot == null || releaseSemVer?.isNewerThan(latestReleaseOrSnapshot)) {
        latestReleaseOrSnapshot = releaseSemVer;
      }
      res = 'ok';
    } catch (e) {
      res = e;
    }
    console.log(`looked at ${mavenMetadataLocation}:`, res);
  }

  if (latestReleaseOrSnapshot !== null) {
    // if any version found, return it
    versions = { latest: latestReleaseOrSnapshot.toString(), release: latestRelease?.toString() ?? null };
    versionCache.set(key, versions);
    return versions;
  }

  throw new Error(`Failed to fetch versioning for ${groupId}:${artifactId}: Not found in any repository`);
}
const BASE_URL = process.env.nexusUrl!;
const DEFAULT_REPOSITORY = process.env.mavenDefaultRepository!;

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

  {
    // try looking in Maven Central first
    const query = `g:${groupId}+AND+a:${artifactId}`;
    const url = `https://search.maven.org/solrsearch/select?q=${query}&rows=1&wt=json`;
    const response = (await (await fetch(url)).json()).response;
    if (response.numFound > 0) {
      const doc = response.docs[0];
      versions = {
        latest: doc.latestVersion,
        release: doc.latestVersion
      };
      versionCache.set(key, versions);
      return versions;
    }
  }

  const location = `${groupId.replace(/\./g, '/')}/${artifactId}`;
  const url = `${BASE_URL}/repository/${DEFAULT_REPOSITORY}/${location}/maven-metadata.xml`;

  const response = await fetch(url);
  const xml = await response.text();

  try {
    const latest = xml.match(/(?<=<latest>)[^<]+(?=<\/latest>)/g)![0];
    const releaseMatches = xml.match(/(?<=<release>)[^<]+(?=<\/release>)/g);

    versions = {
      latest,
      release: releaseMatches ? releaseMatches[0] : null
    };
    versionCache.set(key, versions);
    return versions;
  } catch (e) {
    throw new Error(`Failed to parse versioning for ${groupId}:${artifactId}: ${e} : XML: ${xml}`);
  }
}
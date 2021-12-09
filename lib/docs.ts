const API_BASE_PATH = 'https://api.github.com';
const ORGANIZATION_NAME = 'unnamed';
const DOCUMENTATION_FOLDER = 'docs';

const ENDPOINTS = {
  repositories: () =>
    `${API_BASE_PATH}/orgs/${ORGANIZATION_NAME}/repos`,
  contents: (repository: string, path: string) =>
    `${API_BASE_PATH}/repos/${ORGANIZATION_NAME}/${repository}/contents/${path}`
};

function fetchAuthorized(url: string): Promise<Response> {
  return fetch(url, {
    /*headers: {
      'Authorization': `token ghp_ññññññññññññññññññññññññññññññññññññ`
    }*/
  });
}

/**
 * Represents a documentation entry, it may
 * be a directory (may contain more entries
 * inside) or a file
 */
export interface DocumentationEntry {

  /**
   * The type of this entry, it may be a directory
   * or a file
   */
  type: 'dir' | 'file';

  /**
   * The URL to download this entry, only defined
   * if type is 'file'
   */
  downloadUrl: string | null;

  /**
   * The children documentation entries stored using
   * its filenames as keys, only defined if type is 'dir'
   */
  children: ChildrenEntries | null;

}

export type ChildrenEntries = { [name: string]: DocumentationEntry };

/**
 * Represents a Git repository that has documentation
 */
export interface DocumentedRepository {

  /**
   * The simple repository name, e.g. 'uracle'
   */
  name: string;

  /**
   * The documentation entries at 'docs' folder
   * using its filename as key
   */
  entries: ChildrenEntries;

}

async function fetchContents(name: string, path: string): Promise<any[] | undefined> {
  const contentsResponse = await fetchAuthorized(ENDPOINTS.contents(name, path));
  const contentsJson: any = await contentsResponse.json();

  if (contentsJson.message !== undefined) {
    if (contentsJson.message === 'Not Found') {
      // no documentation in this repository
      return undefined;
    } else if (contentsJson.message.startsWith('API rate limit')) {
      // we are being rate-limited
      // TODO: Authenticate so we have a higher rate limit
      console.log('Rate limit!');
      return undefined;
    }
  } else {
    return contentsJson;
  }
}

async function fetchDocumentationTree(name: string, contents: any[]): Promise<ChildrenEntries> {
  const entries: ChildrenEntries = {};
  for (const content of contents) {
    const entryName = content.name;
    const {type} = content;
    let children = null;

    if (type === 'dir') {
      const rawChildren = (await fetchContents(name, content.path)) as any[];
      children = await fetchDocumentationTree(name, rawChildren);
    }

    // add entry
    entries[entryName] = {
      type,
      children,
      downloadUrl: content.download_url
    };
  }
  return entries;
}

export async function fetchRepository(name: string): Promise<DocumentedRepository | null> {
  // fetch repository contents inside "docs"
  const contentsJson: any = await fetchContents(name, DOCUMENTATION_FOLDER);

  if (!contentsJson) {
    // this repo doesn't have documentation
    return null;
  }

  // create documentation tree
  const entries = await fetchDocumentationTree(name, contentsJson);
  return { name, entries };
}

export async function fetchRepositories(): Promise<DocumentedRepository[]> {
  // fetch organization repositories
  const repositoriesResponse = await fetchAuthorized(ENDPOINTS.repositories());
  const repositoriesJson: any[] = (await repositoriesResponse.json()) as any[];

  const repositories: DocumentedRepository[] = [];

  // add repositories that have a "docs" folder
  // to "repositories" array
  for (const repository of repositoriesJson) {
    const result = await fetchRepository(repository.name);

    if (result === null) {
      // this repo doesn't have documentation
      continue;
    }

    repositories.push(result);
  }

  return repositories;
}
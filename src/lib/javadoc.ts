#!/usr/bin/env node
/*!
 */
import path from "path";
import fs from "fs";
import { finished } from "stream/promises";
import { Readable } from "stream";
import decompress from "decompress";

const JAVADOC_CACHE_FOLDER = path.join(process.cwd(), 'cache', 'javadoc');
const JAVADOC_JAR_CACHE_FOLDER = path.join(JAVADOC_CACHE_FOLDER, 'jar');
const JAVADOC_STATIC_CACHE_FOLDER = path.join(process.cwd(), 'public', 'javadoc');

interface Artifact {
  group: string;
  artifact: string;
  version: string;
}

async function findAllArtifacts(group: string): Promise<Artifact[]> {
  const url = "https://search.maven.org/solrsearch/select?q=g:" + group + "&wt=json&core=gav";
  const response = await fetch(url);
  const json = await response.json();
  // {
  //   response: {
  //     docs: [
  //       { a: 'creative-server', ... },
  //       { a: 'creative-api', ... }
  //     ],
  //     ...
  //   },
  //   ...
  // }
  return json.response.docs.map((d: any) => ({
    group: d.g,
    artifact: d.a,
    version: d.v
  }));
}

async function downloadAndExtractJavadoc(artifact: Artifact): Promise<void> {
  const file = path.join(JAVADOC_JAR_CACHE_FOLDER, `${artifact.artifact}-${artifact.version}-javadoc.jar`);

  if (fs.existsSync(file)) {
    // no need to download, as it is already downloaded
    return;
  }

  // https://search.maven.org/remotecontent?filepath=com/jolira/guice/3.0.0/guice-3.0.0-javadoc.jar
  const url = `https://search.maven.org/remotecontent?filepath=${artifact.group.replace(/\./g, '/')}/${artifact.artifact}/${artifact.version}/${artifact.artifact}-${artifact.version}-javadoc.jar`;
  const response = await fetch(url);

  await finished(Readable.fromWeb(response.body as any).pipe(fs.createWriteStream(file, { flags: 'wx' })));

  const extractTo = path.join(JAVADOC_STATIC_CACHE_FOLDER, artifact.artifact, artifact.version);

  if (fs.existsSync(extractTo)) {
    // inconsistency, delete the folder, create a new one
    fs.rmSync(extractTo, { recursive: true });
  }

  fs.mkdirSync(extractTo, { recursive: true });

  // now extract the javadoc
  const files = await decompress(file, extractTo);
  for (const file of files) {
    console.log(`[INFO] Extracted one new file: ${file.path} (${artifact.artifact}:${artifact.version})`);
  }
}

export async function load(p: string[]) {
  if (p.length === 0) {
    throw new Error("Path cannot be empty");
  }

  const filePath = path.join(JAVADOC_STATIC_CACHE_FOLDER, ...p);
  if (!fs.existsSync(filePath)) {
    throw new Error("File not found");
  }
  return fs.readFileSync(filePath, { encoding: 'utf8' });
}

export async function walkStaticFolder(consumer: (path: string) => Promise<any>) {
  async function walkDir(dir: string) {
    const files = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      if (file.isDirectory()) {
        await walkDir(filePath);
      } else {
        await consumer(filePath.substring(JAVADOC_STATIC_CACHE_FOLDER.length));
      }
    }
  }
  await walkDir(JAVADOC_STATIC_CACHE_FOLDER);
}

export async function downloadAll() {
  // create /cache/javadoc/jar if it doesn't exist
  if (!fs.existsSync(JAVADOC_JAR_CACHE_FOLDER)) {
    fs.mkdirSync(JAVADOC_JAR_CACHE_FOLDER, { recursive: true });
  }

  // download artifacts like /cache/javadoc/jar/xxxxxxxx-1.0.0-javadoc.jar
  // extract them at /cache/javadoc/static/xxxxxxxx/1.0.0/...
  for (const artifact of await findAllArtifacts('team.unnamed')) {
    await downloadAndExtractJavadoc(artifact);
  }
}
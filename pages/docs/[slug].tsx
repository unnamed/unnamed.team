import { GetStaticPropsContext, NextPageContext } from "next";
import {
  DocumentationEntry,
  DocumentedRepository,
  fetchRepository,
  fetchRepositories,
  ChildrenEntries
} from "../../lib/docs";
import { useRouter } from "next/router";

const GITHUB_REPO_NAME_PATTERN = /^[A-z0-9\-._]{1,100}$/g;

export default function Documentation(repository: DocumentedRepository) {
  const router = useRouter();

  return (
    <div>
      <h1>{repository.name}</h1>
      {JSON.stringify(repository.entries, undefined, 4)}
    </div>
  );
}

export async function getStaticProps(ctx: GetStaticPropsContext) {
  const name = (ctx.params as any).slug;

  if (!GITHUB_REPO_NAME_PATTERN.test(name)) {
    return { props: { name, entries: {} } };
  }
  return { props: (await fetchRepository(name)) || { name, entries: {} } };
}

export async function getStaticPaths() {
  return {
    paths: (await fetchRepositories()).map(repository => ({
      params: {
        slug: repository.name
      }
    })),
    fallback: false
  };
}
import { NextPageContext } from "next";
import { DocumentationEntry, DocumentedRepository, fetchRepository } from "../../lib/docs";

const GITHUB_REPO_NAME_PATTERN = /^[A-z0-9\-._]{100}$/g;

export default function Documentation(repository: DocumentedRepository) {
  function convert(entries: Map<string, DocumentationEntry>) {
    return (
      <ul>
        {Array.from(entries).map(([name, entry]) => (
          <li>
            <h4>{name}</h4>
            { entry.children ? convert(entry.children) : <></> }
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div>
      <h1>{repository.name}</h1>
      {convert(repository.entries)}
    </div>
  );
}

Documentation.getInitialProps = async function(ctx: NextPageContext) {
  const name = ctx.query.project as string;
  if (!GITHUB_REPO_NAME_PATTERN.test(name)) {
    return { name, entries: new Map() };
  }
  return (await fetchRepository(name)) || { name, entries: new Map() };
}
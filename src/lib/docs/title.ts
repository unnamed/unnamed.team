import { capitalize } from "@/lib/string";

const TITLES: {
    [ filename: string ]: string;
} = {
  'readme.md': 'Read Me',
  'getting-started.md': 'Getting Started'
};

export function getPageTitle(filename: string, html: string) {
  for (const tag of [ 'h1', 'h2' ]) {
    const open = `<${tag}>`;
    const close = `</${tag}>`;
    const start = html.indexOf(open) + open.length;
    const end = html.indexOf(close, start);

    if (start !== -1 && end !== -1) {
      // Found an user-provided title for
      // this section, use this
      return html.substring(start, end);
    }
  }

  return TITLES[filename] ?? capitalize(filename);
}

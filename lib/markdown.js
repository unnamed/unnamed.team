import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';

const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeHighlight)
  .use(rehypeStringify);

export async function markdownToHtml(markdown) {
  return String(await processor.process(markdown));
}
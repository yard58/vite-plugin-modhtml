// packages/vite-plugin-y58-include/src/index.ts
import type { Plugin, IndexHtmlTransformContext, ResolvedConfig } from 'vite';
import { parse, parseFragment, serialize } from 'parse5';
import fs from 'fs';
import path from 'path';

/**
 * Vite plugin to inline <y58-include src="…"> tags recursively.
 * The src path is resolved relative to the including file's directory.
 */
export default function y58IncludePlugin(): Plugin {
  let rootDir = process.cwd();

  return {
    name: 'vite-plugin-y58-include',

    // Capture the project root
    configResolved(config: ResolvedConfig) {
      rootDir = config.root;
    },

    transformIndexHtml: {
      enforce: 'pre' as const,
      transform(html: string, ctx: IndexHtmlTransformContext): string {
        // In dev, leave <y58-include> for the runtime component
        if (ctx.server) return html;

        // Parse the full document
        const document = parse(html);

        // Recursive inliner
        // Recursive inliner with cycle detection
const inlineNodes = (parent: any, baseDir: string, visited: string[] = []) => {
  const children = parent.childNodes || [];
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    if (node.tagName === 'y58-include') {
      const srcAttr = node.attrs.find((a: any) => a.name === 'src');
      if (srcAttr) {
        const srcPath = path.resolve(baseDir, srcAttr.value);
        if (visited.includes(srcPath)) {
          // Circular include detected
          const cycle = visited.concat(srcPath)
            .map(p => path.relative(rootDir, p)).join(' -> ');
          throw new Error(
            `[vite-plugin-y58-include] Circular include detected: ${cycle}`
          );
        }
        let fileContents: string;
        try {
          fileContents = fs.readFileSync(srcPath, 'utf8');
        } catch (err) {
          console.error(`y58-include: could not read '${srcAttr.value}'`, err);
          children.splice(i, 1);
          i--;
          continue;
        }
        // Parse fragment and inline recursively
        const frag = parseFragment(fileContents);
        const fragBaseDir = path.dirname(srcPath);
        inlineNodes(frag, fragBaseDir, visited.concat(srcPath));

        // Replace <y58-include> with fragment nodes
        children.splice(i, 1, ...frag.childNodes);
        i += frag.childNodes.length - 1;
        continue;
      }
    }
    if (node.childNodes) {
      inlineNodes(node, baseDir, visited);
    }
  }
};

        // Determine baseDir from the HTML file's path
        // Determine the base directory of the HTML being transformed
const relHtmlPath = ctx.path.replace(/^\/+/, '');
const htmlFile = path.resolve(rootDir, relHtmlPath);
const htmlBaseDir = path.dirname(htmlFile);
inlineNodes(document, htmlBaseDir);

        // Serialize back to HTML
        return serialize(document);
      }
    }
  };
}

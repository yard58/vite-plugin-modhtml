import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite';
import type { PluginContext as RollupPluginContext } from 'rollup';
import { parse, parseFragment, serialize } from 'parse5';
import fs from 'fs';
import path from 'path';


interface TransformIndexHtmlContext {
    path: string;
    filename: string;
    server?: ViteDevServer;
    bundle?: import('rollup').OutputBundle
    chunk?: import('rollup').OutputChunk
}


export default function modhtml(): Plugin {
    let config: ResolvedConfig;
    let rollupCtx: RollupPluginContext;
    const inlinedFiles = new Set<string>();

    return {
        name: 'vite-plugin-modhtml',
        enforce: 'pre',

        configResolved(resolvedConfig: ResolvedConfig) {
            config = resolvedConfig;
        },

        buildStart(this: RollupPluginContext) {
            rollupCtx = this;
        },

        transformIndexHtml(html: string, ctx: TransformIndexHtmlContext): string {
            inlinedFiles.clear();
            const document = parse(html);

            // Recursive inliner
            const inlineNodes = (parent: any, siteBaseDir: string, baseDir: string, visited: string[] = []) => {
                const children = parent.childNodes || [];
                for (let i = 0; i < children.length; i++) {
                    const node = children[i];
                    if (node.tagName === 'modhtml-include') {
                        const srcAttr = node.attrs.find((a: any) => a.name === 'src');
                        if (srcAttr) {
                            let relSrc = srcAttr.value;
                            let relBaseDir = baseDir;
                            if (relSrc[0] === '/') {
                                relSrc = relSrc.replace(/^\/+/, '');
                                relBaseDir = siteBaseDir;
                            }
                            const srcPath = path.resolve(relBaseDir, relSrc);

                            // Add (Windows-friendly) dependency for HMR
                            inlinedFiles.add(path.normalize(srcPath).replace(/\\/g, '/'));

                            if (visited.includes(srcPath)) {
                                // Circular include detected
                                const cycle = visited.concat(srcPath)
                                    .map(p => path.relative(config.root, p)).join(' -> ');
                                throw new Error(
                                    `[vite-plugin-modhtml] Circular include detected: ${cycle}`
                                );
                            }
                            let fileContents: string;
                            try {
                                fileContents = fs.readFileSync(srcPath, 'utf8');
                            } catch (err) {
                                console.error(`modhtml-include: Can't read '${srcAttr.value}'`, err);
                                children.splice(i, 1);
                                i--;
                                continue;
                            }
                            // Parse fragment and inline its own includes
                            const frag = parseFragment(fileContents);
                            const fragBaseDir = path.dirname(srcPath);
                            inlineNodes(frag, siteBaseDir, fragBaseDir, visited.concat(srcPath));

                            // Replace the <modhtml-include> node with the fragment's children
                            children.splice(i, 1, ...frag.childNodes);
                            i += frag.childNodes.length - 1;
                            continue;
                        }
                    }
                    // Recurse into other nodes
                    if (node.childNodes) {
                        inlineNodes(node, siteBaseDir, baseDir, visited);
                    }
                }
            };

            const relHtmlPath = ctx.path.replace(/^\/+/, '');
            const htmlFile = path.resolve(config.root, relHtmlPath);
            const htmlBaseDir = path.dirname(htmlFile);
            inlineNodes(document, htmlBaseDir, htmlBaseDir);

            // Serialize back to HTML
            return serialize(document);
        },

        handleHotUpdate(ctx) {
            if (inlinedFiles.has(ctx.file)) {
                ctx.server.ws.send({
                    type: 'full-reload',
                    path: '*'
                });
            }

        }
    };
}

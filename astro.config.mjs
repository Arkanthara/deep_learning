import { defineConfig } from 'astro/config';
import {unified} from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// The workflow overrides these for forks and custom domains.
export default defineConfig({
  site: process.env.SITE_URL || 'https://arkanthara.github.io',
  base: process.env.BASE_PATH || '/deep_learning',
  output: 'static',
  markdown: { processor: unified({remarkPlugins: [remarkMath], rehypePlugins: [[rehypeKatex, {throwOnError: true, strict: 'error'}]]}), shikiConfig: {theme: 'github-dark'} },
  trailingSlash: 'always',
  build: { format: 'directory' },
});

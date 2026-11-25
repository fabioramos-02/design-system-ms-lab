import remarkGfm from 'remark-gfm';

export default {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.js'],
  addons: [
    // remark-gfm: tabelas em markdown nas páginas de docs (sem ele, aparecem com os "|").
    { name: '@storybook/addon-docs', options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } } },
  ],
  framework: { name: '@storybook/html-vite', options: {} },
  // As POCs e a apresentação são HTML estático e usam os mesmos tokens, CSS e JS do lab.
  staticDirs: ['../public', { from: '../shared', to: '/shared' }, { from: '../tokens', to: '/tokens' }],
};

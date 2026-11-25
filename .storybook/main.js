export default {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.js'],
  addons: ['@storybook/addon-docs'],
  framework: { name: '@storybook/html-vite', options: {} },
  // As POCs e a apresentação são HTML estático e usam os mesmos tokens, CSS e JS do lab.
  staticDirs: ['../public', { from: '../shared', to: '/shared' }, { from: '../tokens', to: '/tokens' }],
};

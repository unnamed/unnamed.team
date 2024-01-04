module.exports = {
  reactStrictMode: true,
  images: {
    domains: [ 'avatars.githubusercontent.com' ],
  },
  env: {
    // our GitHub organization slug
    // https://github.com/unnamed/
    githubSlug: 'unnamed',
  },
  async redirects() {
    return require('./redirects.json');
  },
};

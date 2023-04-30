module.exports = {
  reactStrictMode: true,
  images: {
    domains: [ 'avatars.githubusercontent.com' ],
  },
  env: {
    // our GitHub organization slug
    // https://github.com/unnamed/
    githubSlug: 'unnamed',

    // our Nexus repository url
    nexusUrl: 'https://repo.unnamed.team',
    // the default maven repository
    mavenDefaultRepository: 'unnamed-public'
  },
  async redirects() {
    return require('./redirects.json');
  },
};

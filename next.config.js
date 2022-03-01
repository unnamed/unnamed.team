module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
  env: {
    discordInvite: 'https://discord.gg/QebDnyWGtz'
  },
  async redirects() {
    return [
      {
        source: '/donate',
        destination: 'https://paypal.me/yushu7u7',
        permanent: true,
        basePath: false
      },
      {
        source: '/emojis',
        destination: '/project/glyph',
        permanent: true
      }
    ];
  }
};

module.exports = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/donate',
        destination: 'https://paypal.me/yushu7u7',
        permanent: true,
        basePath: false
      },
    ];
  }
};

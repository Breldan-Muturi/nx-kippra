//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  images: {
    // domains: ['s3.amazonaws.com'],
    remotePatterns: [
      {
        hostname: 'd1muf25xaso8hp.cloudfront.net',
      },
      {
        hostname: 'kippra.or.ke',
      },
      {
        hostname: 'utfs.io',
      },
      {
        hostname: 's3.amazonaws.com',
        port: '',
        protocol: 'https',
        pathname: '**',
      },
      {
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  output: 'standalone',
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);

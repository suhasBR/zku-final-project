/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      if (!isServer) {
          // config.plugins.push(
          //     new webpack.ProvidePlugin({
          //         global: "global"
          //     })
          // )

          config.resolve.fallback = {
              fs: false,
              stream: false,
              crypto: false,
              os: false,
              readline: false,
              ejs: false,
              assert: require.resolve("assert"),
              path: false
          }

          return config
      }

      return config
  },
  env:{
      devAccKey:'0x37e4ed4c671ba1b97901c1398ade4cb20d78313701dc0d87fb437454ea4a1516',
      eps:'dkjdqbfyvtmwwnhl'
  }
}

module.exports = nextConfig



/** @type {import('next').NextConfig} */
module.exports = {
  typescript: {
    ignoreBuildErrors: true,
  },
    webpack: (config) => {
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        // Transform all direct `react-native` imports to `react-native-web`
        'react-native$': 'react-native-web',
      }
      config.experiments = { ...config.experiments, topLevelAwait: true };
      config.resolve.extensions = [
        '.web.js',
        '.web.ts',
        '.web.tsx',
        ...config.resolve.extensions,
      ]
      return config
    },
    images: {
      domains: ['lucky-quit-bucket.s3.us-west-1.amazonaws.com','lucky-quit-bucket.s3.amazonaws.com'],
    },
    babel: {
      presets: ['next/babel'],
      plugins: ['react-native-web', { commonjs: true }],
    },
  }
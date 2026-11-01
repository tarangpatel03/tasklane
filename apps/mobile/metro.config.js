const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const repoRoot = path.resolve(__dirname, '../..');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * Yarn hoists dependencies to the repo root and links `@task-app/shared` from `packages/`,
 * so Metro has to watch and resolve from there as well.
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [path.join(repoRoot, 'node_modules'), path.join(repoRoot, 'packages/shared')],
  resolver: {
    nodeModulesPaths: [path.join(__dirname, 'node_modules'), path.join(repoRoot, 'node_modules')],
    // The admin app needs React ^19.3.1 while React Native pins 19.3.0, so Yarn nests a second React
    // under some packages. Two copies break hooks, so every `react` import resolves to the root one.
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === 'react' || moduleName.startsWith('react/')) {
        return context.resolveRequest(
          { ...context, originModulePath: path.join(repoRoot, 'package.json') },
          moduleName,
          platform,
        );
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

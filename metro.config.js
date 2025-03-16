const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */

// Get the default Metro configuration
const defaultConfig = getDefaultConfig(__dirname);

// Add 'html' to the list of asset extensions
defaultConfig.resolver.assetExts.push('html');

// Merge the default configuration with your custom configuration
const config = mergeConfig(defaultConfig, {});

// Wrap the configuration with Reanimated's Metro config
module.exports = wrapWithReanimatedMetroConfig(config);
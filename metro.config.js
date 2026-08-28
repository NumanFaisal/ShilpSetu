const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  /.*\/node_modules\/.*\/build\/.*/,
  /.*\/android\/app\/build\/.*/,
  /.*\/android\/\.cxx\/.*/,
];

module.exports = withNativeWind(config, { input: './global.css' });

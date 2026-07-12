// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

const testFilePatterns = [
  /.*\.(test|spec)\.[jt]sx?$/,
  /.*[\\/]__tests__[\\/].*/,
  /.*[\\/]__mocks__[\\/].*/,
];

const existingBlockList =
  config.resolver.blockList == null
    ? []
    : Array.isArray(config.resolver.blockList)
      ? config.resolver.blockList
      : [config.resolver.blockList];

config.resolver.blockList = new RegExp(
  [...existingBlockList, ...testFilePatterns]
    .map((pattern) => `(${pattern.source})`)
    .join("|"),
);

module.exports = config;

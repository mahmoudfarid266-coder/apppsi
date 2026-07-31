module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Must be last. Reanimated 4 routes through react-native-worklets.
    plugins: ['react-native-worklets/plugin'],
  };
};

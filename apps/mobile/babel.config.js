module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // Reanimated 4 moved its Babel plugin into react-native-worklets; it must stay last.
  plugins: ['react-native-worklets/plugin'],
};

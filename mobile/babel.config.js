module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./",
            "socket.io-client": "socket.io-client/dist/socket.io.js",
            "engine.io-client": "engine.io-client/dist/engine.io.js"
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};

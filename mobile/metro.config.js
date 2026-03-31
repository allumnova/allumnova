const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Nuclear Fix for socket.io-client on Windows
config.resolver.resolverMainFields = ["main", "browser", "module"];
config.resolver.extraNodeModules = {
  "socket.io-client": path.resolve(__dirname, "node_modules/socket.io-client/dist/socket.io.js"),
  "engine.io-client": path.resolve(__dirname, "node_modules/engine.io-client/dist/engine.io.js"),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.includes("socket.io-client") || moduleName.includes("engine.io-client")) {
    const isEngine = moduleName.includes("engine.io-client");
    const target = isEngine ? "engine.io-client" : "socket.io-client";
    return {
      filePath: path.resolve(__dirname, `node_modules/${target}/dist/${isEngine ? "engine.io.js" : "socket.io.js"}`),
      type: "sourceFile",
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });

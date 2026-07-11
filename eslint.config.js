// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", ".expo/*"],
  },
  {
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: [
      "**/*.test.ts",
      "**/*.test.tsx",
      "test-utils/**/*.ts",
      "test-utils/**/*.tsx",
    ],
    rules: {
      "react-hooks/refs": "off",
      "@typescript-eslint/no-require-imports": "off",
      "react/display-name": "off",
    },
  },
]);

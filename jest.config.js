/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/test-utils/jest.setup.ts"],
  collectCoverageFrom: [
    "api/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "utils/**/*.{ts,tsx}",
    "app/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/*Styles.ts",
    "!**/schema.d.ts",
  ],
  coverageDirectory: "<rootDir>/coverage",
};

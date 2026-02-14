const nextJest = require("next/jest");

const createJestConfig = nextJest({
    dir: "./",
});

const customJestConfig = {
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
    testMatch: ["<rootDir>/src/tests/**/*.spec.(ts|tsx)"],
    moduleDirectories: ["node_modules", "<rootDir>/src"],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
        "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    },
    clearMocks: true,
    restoreMocks: true,
    collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts"],
};

module.exports = createJestConfig(customJestConfig);

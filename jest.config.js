/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/main.ts",
    "!src/presentation/http/routes/**/*.ts",
    "!src/presentation/http/swagger.ts",
    "!src/contexts/**/infra/**/*.ts"
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};

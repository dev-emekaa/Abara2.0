import nextJest from "next/jest.js";
import type { Config } from "jest";

const createJestConfig = nextJest({ dir: "./" });

/**
 * Two projects:
 *  - unit:        jsdom, for components/hooks/stores + pure libs (Phase 2 & 4)
 *  - integration: node, for full-flow tests that hit the test database (Phase 4)
 *
 * Run all: `pnpm test`. Targeted: `pnpm test:unit` / `pnpm test:integration`.
 */
const baseConfig: Config = {
  moduleNameMapper: {
    "^server-only$": "<rootDir>/tests/stubs/server-only.ts",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

const buildConfig = async (): Promise<Config> => {
  const unit = await createJestConfig({
    ...baseConfig,
    displayName: "unit",
    testEnvironment: "jest-environment-jsdom",
    setupFilesAfterEnv: ["<rootDir>/tests/setup.unit.ts"],
    testMatch: ["<rootDir>/tests/unit/**/*.test.{ts,tsx}"],
  })();

  const integration = await createJestConfig({
    ...baseConfig,
    displayName: "integration",
    testEnvironment: "node",
    setupFilesAfterEnv: ["<rootDir>/tests/setup.integration.ts"],
    testMatch: ["<rootDir>/tests/integration/**/*.test.ts"],
  })();

  return { projects: [unit, integration] };
};

export default buildConfig;

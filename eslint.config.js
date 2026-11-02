import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

const featureEntry = {
  group: ["@/features/*/*"],
  message: "Import a feature through its public entry: '@/features/<name>'.",
};

export default defineConfig([
  globalIgnores([
    "dist",
    "coverage",
    "playwright-report",
    "test-results",
    "src/routeTree.gen.ts",
    "public/mockServiceWorker.js",
  ]),

  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      reactHooks.configs.flat["recommended-latest"],
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      // One style for object types across the codebase.
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      // react-hook-form's `onSubmit={form.handleSubmit(async ...)}` is the intended pattern.
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Numbers in template literals are fine (`Page ${page}`).
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNumber: true },
      ],
      // `void promise` marks fire-and-forget calls explicitly.
      "@typescript-eslint/no-confusing-void-expression": "off",
      "no-restricted-imports": ["error", { patterns: [featureEntry] }],
    },
  },

  // Architecture boundaries. Dependencies flow one way:
  //   routes / app  →  features  →  shared (components, config, hooks, lib)
  {
    files: ["src/components/**", "src/config/**", "src/hooks/**", "src/lib/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/features/*",
                "@/features/*/*",
                "@/routes/*",
                "@/app/*",
              ],
              message:
                "Shared code must not depend on features, routes or app/. Move it into a feature, or pass it in as props.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/features/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            featureEntry,
            {
              group: ["@/routes/*", "@/app/*"],
              message: "Features must not import from routes/ or app/.",
            },
          ],
        },
      ],
    },
  },
  {
    // The mock backend stands in for a real server, so it must not reach into the frontend.
    files: ["src/mocks/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/features/*",
                "@/components/*",
                "@/routes/*",
                "@/app/*",
              ],
              message:
                "Mocks emulate the backend: keep them independent of the UI.",
            },
          ],
        },
      ],
    },
  },
  {
    // Route files export `Route` alongside components by design, and TanStack
    // Router uses thrown `redirect()` / `notFound()` objects for control flow.
    files: ["src/routes/**", "src/components/ui/**"],
    rules: {
      "react-refresh/only-export-components": "off",
      "@typescript-eslint/only-throw-error": "off",
    },
  },
  {
    // Ambient declarations augment existing interfaces, which requires `interface`.
    files: ["**/*.d.ts"],
    rules: { "@typescript-eslint/consistent-type-definitions": "off" },
  },
  {
    files: ["**/*.test.{ts,tsx}", "e2e/**", "*.config.ts"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-floating-promises": "off",
    },
  },
  {
    files: ["*.js"],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["public/**/*.js"],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.browser, sourceType: "script" },
  },
]);

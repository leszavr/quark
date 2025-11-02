import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    languageOptions: {
      globals: {
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        setTimeout: "readonly",
        MouseEvent: "readonly",
        HTMLDivElement: "readonly",
        MediaQueryList: "readonly",
        KeyboardEvent: "readonly",
        HTMLElement: "readonly",
        HTMLButtonElement: "readonly",
      }
    }
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/.next/**/*",
      "**/out/**",
      "**/public/**",
      "**/*.js"
    ],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      "no-undef": "error",
      "no-console": "warn",
      "semi": ["error", "always"],
      "quotes": ["error", "double"],
    },
  },
];
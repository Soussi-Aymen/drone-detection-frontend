/**
 * @type {import("eslint").Linter.Config}
 *
 * This configuration is optimized for a modern frontend application (browser-based, ES Modules).
 * It includes support for React/JSX and enforces best practices for hooks.
 */
module.exports = {
  // Specifies the execution environment. We need 'browser' for the DOM/global browser APIs.
  env: {
    browser: true,
    es2022: true, // Enables global variables and parsing features for ES2022
  },
  // We'll use recommended rules from ESLint and React/Hooks plugins
  extends: [
    'eslint:recommended',
    'plugin:react/recommended', // Recommended rules for React
    'plugin:react-hooks/recommended', // Recommended rules for React Hooks
  ],
  // Explicitly list the plugins used in the `extends` section
  plugins: [
    'react',
    'react-hooks',
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module', // Use ES Modules for frontend (e.g., imports/exports)
    ecmaFeatures: {
      jsx: true, // Enable JSX parsing
    },
  },
  // Settings applied to plugins
  settings: {
    react: {
      version: 'detect', // ESLint will automatically detect the installed React version
    },
  },
  // Defines rules to enforce or override
  rules: {
    // --- General Code Quality & Style ---
    'indent': ['error', 2, { 'SwitchCase': 1 }], // Enforce 2-space indentation
    'quotes': ['error', 'single'], // Enforce single quotes
    'semi': ['error', 'always'], // Require semicolons
    // Allow unused variables to start with an underscore (e.g., _event)
    'no-unused-vars': ['warn', { 'varsIgnorePattern': '^_', 'argsIgnorePattern': '^_', 'caughtErrorsIgnorePattern': '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }], // Disallow console.log, but allow others

    // --- React Specific Rules Overrides ---
    'react/prop-types': 'off', // Turn off PropType validation (modern apps often use TypeScript)
    // The next two rules are off because they are obsolete in React 17+ (new JSX transform)
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
    'react/display-name': 'off', // Can be noisy with forwardRef/memo

    // --- React Hooks Rules (from plugin:react-hooks) ---
    'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
    'react-hooks/exhaustive-deps': 'warn', // Checks effect dependencies (crucial!)
  },
};
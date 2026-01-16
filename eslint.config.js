const js = require ('@eslint/js');
const tsParser = require ('@typescript-eslint/parser');
const tsPlugin = require ('@typescript-eslint/eslint-plugin');
const reactPlugin = require ('eslint-plugin-react');
const reactHooksPlugin = require ('eslint-plugin-react-hooks');

module.exports = [
  {
    ignores: ['dist/**', 'node_modules/**', 'android/**', 'ios/**'],
  },
  {
    files: ['eslint.config.js', 'metro.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {jsx: true},
      },
    },
    settings: {
      react: {version: 'detect'},
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      semi: ['warn', 'always'],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {jsx: true},
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
    },
  },
];

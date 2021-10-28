module.exports = {
  env: {
    browser: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/prettier',
    'eslint:recommended',
    '@vue/typescript/recommended',
    '@vue/prettier/@typescript-eslint'
  ],
  parserOptions: {
    parser: "@typescript-eslint/parser"
  },
  rules: {
    'vue/no-multiple-template-root': 0,
  }
};
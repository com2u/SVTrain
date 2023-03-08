module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'airbnb',
  ],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'max-len': 'off',
    'import/extensions': 'off',
    semi: ['error', 'never'],
  },
}

// eslint-disable-next-line no-undef
module.exports = {
  root: true,
  env: {
    node: true,
    es2020: true,
  },
  extends: ['athom/homey-app'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  },
  rules: {
    //eqeqeq: 'off', // Allow == without strict checking
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        ts: 'never',
        js: 'never',
      },
    ],
  },
};

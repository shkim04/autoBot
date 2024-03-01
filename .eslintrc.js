module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
    'jest/globals': true,
  },
  globals: {
    CustomException: true,
    describe: true,
    it: true,
    before: true,
    after: true,
  },
  ignorePatterns: ['dist/', 'node_modules/', 'docs/', 'seeds/', 'etcs/', 'src/lib/', 'src/video-templates/'],
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    'linebreak-style': ['warn', 'unix'],
    'no-extra-semi': 'warn',
    'no-unused-vars': ['warn'],
    'no-console': 0,
    'no-misleading-character-class': ['warn'],
    'no-async-promise-executor': ['warn'],
    'no-useless-catch': ['warn'],
    'no-prototype-builtins': ['off'],
    'no-constant-condition': ['warn'],
    'prefer-template': 'warn',
    'restrict-template-expressions': 0,
    curly: ['warn', 'all'],
    indent: 0, // handled by prettier
    'object-curly-spacing': ['warn', 'always'],
    'array-bracket-spacing': ['warn', 'never'],
    'computed-property-spacing': ['warn', 'never'],
    'object-curly-newline': ['warn', { consistent: true }],
    'space-in-parens': ['warn', 'never'],
    quotes: ['warn', 'single', { allowTemplateLiterals: true, avoidEscape: true }],
    'prefer-const': 'warn',
    'space-before-blocks': 'warn',
    'keyword-spacing': 'warn',
    'brace-style': 'warn',
    'no-multi-spaces': 'warn',
    'consistent-return': 'off', // 'warn'
    'comma-dangle': [
      'warn',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'ignore',
        exports: 'ignore',
        functions: 'ignore',
      },
    ],
    'prettier/prettier': 'error',
    'jest/valid-expect': [
      'error',
      {
        maxArgs: 2,
      },
    ],
  },
  plugins: ['jest', 'prettier'],
  overrides: [
    {
      files: ['*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: ['./tsconfig.json'], // Specify it only for TypeScript files
      },
      plugins: ['@typescript-eslint', 'import'],
      extends: [
        // 'airbnb-base',
        // 'airbnb-typescript/base',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:eslint-comments/recommended',
      ],
      /**
       * Typescript Rules
       * https://github.com/bradzacher/eslint-plugin-typescript
       * Enable your own typescript rules.
       */
      rules: {
        // Prevent TypeScript-specific constructs from being erroneously flagged as unused
        // '@typescript-eslint/no-unused-vars'         : 'error',
        // Require PascalCased class and interface names
        // '@typescript-eslint/class-name-casing'      : 'error',
        // Require a specific member delimiter style for interfaces and type literals
        // Default Semicolon style
        '@typescript-eslint/member-delimiter-style': 'error',
        // Require a consistent member declaration order
        // '@typescript-eslint/member-ordering'        : 'error',
        // Require consistent spacing around type annotations
        '@typescript-eslint/type-annotation-spacing': 'error',
        'max-len': ['warn', { code: 200 }],
        '@typescript-eslint/explicit-function-return-type': 'off',
        'import/prefer-default-export': 'off',
        '@typescript-eslint/no-use-before-define': [
          'error',
          { functions: false, classes: true, variables: true, typedefs: true },
        ],
        '@typescript-eslint/no-unused-vars': ['off', { args: 'all' }], // warn
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/await-thenable': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-floating-promises': 'warn',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/member-ordering': 'off',
        '@typescript-eslint/no-misused-promises': [
          'error',
          {
            checksVoidReturn: false,
          },
        ],
        'no-param-reassign': 'warn',
        '@typescript-eslint/unbound-method': 'off',
        'no-await-in-loop': 'off', // 'warn'
        // Forbid cyclical dependencies between modules
        // https://github.com/import-js/eslint-plugin-import/blob/d81f48a2506182738409805f5272eff4d77c9348/docs/rules/no-cycle.md
        'import/no-cycle': ['error', { maxDepth: Infinity }],
        '@typescript-eslint/restrict-template-expressions': [
          'warn',
          {
            allowAny: true, // maybe disable this?
            allowBoolean: true,
            allowNullish: true,
            allowNumber: true,
            allowRegExp: true,
          },
        ],
      },
    },
  ],
};

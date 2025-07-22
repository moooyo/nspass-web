import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: ['./tsconfig.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      }
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // TypeScript 相关规则
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      // 限制 console 使用
      'no-console': 'warn',
      // 其他代码质量规则
      'eqeqeq': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
  // 为配置文件添加例外规则
  {
    files: ['vite.config.ts', 'eslint.config.mjs', 'postcss.config.mjs'],
    languageOptions: {
      globals: {
        ...globals.node, // 添加 Node.js 全局变量
        __dirname: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      'no-console': 'off', // 配置文件允许使用 console
      'no-undef': 'off', // 关闭 undefined 检查，因为我们使用 TypeScript
    },
  },
]

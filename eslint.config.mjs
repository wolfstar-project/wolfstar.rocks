import { createConfigForNuxt } from '@nuxt/eslint-config/flat';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import { configs } from 'eslint-plugin-pnpm';

export default createConfigForNuxt(
	{
		ignores: ['node_modules/', 'dist/', '.nuxt/', '.output/', 'public/', '*.d.ts']
	},
	{
		rules: {
			'no-unused-vars': 'off',
			'@typescript-eslint/prefer-literal-enum-member': 'off'
		}
	},
	{
		files: ['**/*.vue'],
		rules: {
			'vue/block-order': [
				'error',
				{
					order: ['template', 'script', 'style']
				}
			],
			'vue/html-self-closing': [
				'warn',
				{
					html: {
						void: 'always',
						normal: 'never'
					}
				}
			],
			'vue/max-attributes-per-line': [
				'error',
				{
					singleline: { max: 10 },
					multiline: { max: 1 }
				}
			],
			'vue/no-multiple-template-root': 'off',
			'vue/singleline-html-element-content-newline': 'off'
		}
	},
	...configs.recommended,
	eslintPluginPrettierRecommended
);

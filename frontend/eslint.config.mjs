import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
	...nextVitals,
	...nextTs,
	// Override default ignores of eslint-config-next.
	globalIgnores([
		// Default ignores of eslint-config-next:
		".next/**",
		"out/**",
		"build/**",
		"next-env.d.ts",
	]),
	{
		rules: {
			// Allows using the 'any' type
			"@typescript-eslint/no-explicit-any": "off",
			// Allows passing 'any' to functions
			"@typescript-eslint/no-unsafe-argument": "off",
			// Allows assigning 'any' to variables
			"@typescript-eslint/no-unsafe-assignment": "off",
			// Allows accessing properties on 'any'
			"@typescript-eslint/no-unsafe-member-access": "off",
			// Allows returning 'any' from functions
			"@typescript-eslint/no-unsafe-return": "off",
		},
	},
]);

export default eslintConfig;

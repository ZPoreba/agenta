import path from "node:path"
import {fileURLToPath} from "node:url"

import {FlatCompat} from "@eslint/eslintrc"
import eslint from "@eslint/js"
import eslintPluginPrettier from "eslint-plugin-prettier/recommended"
import tseslint from "typescript-eslint"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: eslint.configs.recommended,
    allConfig: eslint.configs.all,
})

const tsEslintConfig = tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    tseslint.configs.stylistic,
)

const config = [
    ...compat.extends("next/core-web-vitals"),
    ...compat.extends("plugin:@lexical/recommended"),
    ...tsEslintConfig,
    {
        rules: {
            "react/no-unescaped-entities": 0,
            "react/display-name": 0,
            "@next/next/no-sync-scripts": 0,
            "react/no-children-prop": 0,
            "react-hooks/exhaustive-deps": "off",
            "import/no-anonymous-default-export": "off",
            "no-useless-escape": "off",
            "no-prototype-builtins": "off",
            "no-useless-catch": "off",
            "@next/next/no-html-link-for-pages": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-empty-object-type": "off",
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    vars: "all",
                    args: "none",
                    caughtErrors: "none",
                    ignoreRestSiblings: true,
                    destructuredArrayIgnorePattern: "none",
                },
            ],
            "import/order": [
                "error",
                {
                    alphabetize: {
                        order: "asc",
                        caseInsensitive: true,
                    },
                    "newlines-between": "always",
                    groups: ["builtin", "external", "parent", "sibling", "index"],
                    pathGroupsExcludedImportTypes: ["react"],
                    pathGroups: [
                        {
                            pattern: "react",
                            group: "builtin",
                            position: "before",
                        },
                        {
                            pattern: "./__generated__/**",
                            group: "parent",
                            position: "before",
                        },
                        {
                            pattern: "@/oss/**",
                            group: "parent",
                            position: "before",
                        },
                    ],
                },
            ],
            "prettier/prettier": [
                "error",
                {
                    printWidth: 100,
                    tabWidth: 4,
                    useTabs: false,
                    semi: false,
                    bracketSpacing: false,
                },
            ],
        },
    },
    eslintPluginPrettier,
]

export default config

const js = require("@eslint/js")
const tseslint = require("@typescript-eslint/eslint-plugin")
const tsparser = require("@typescript-eslint/parser")
const importPlugin = require("eslint-plugin-import")
const prettier = require("eslint-plugin-prettier")
const sonarjs = require("eslint-plugin-sonarjs")
const jsdoc = require("eslint-plugin-jsdoc")

module.exports = [
    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                project: "./tsconfig-eslint.json",
            },
            globals: {
                console: "readonly",
                setTimeout: "readonly",
                setInterval: "readonly",
                clearTimeout: "readonly",
                clearInterval: "readonly",
                Promise: "readonly",
                Object: "readonly",
                Array: "readonly",
                String: "readonly",
                Number: "readonly",
                Boolean: "readonly",
                Map: "readonly",
                Set: "readonly",
                JSON: "readonly",
                Error: "readonly",
                Date: "readonly",
                document: "readonly",
                window: "readonly",
                chrome: "readonly",
                MutationObserver: "readonly",
                Node: "readonly",
                HTMLElement: "readonly",
                Element: "readonly",
                NodeList: "readonly",
                Event: "readonly",
                MessageEvent: "readonly",
                XMLHttpRequest: "readonly",
                Headers: "readonly",
                Request: "readonly",
                Response: "readonly",
                fetch: "readonly",
                FormData: "readonly",
                DEBUG: "readonly",
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
            import: importPlugin,
            prettier,
            sonarjs,
            jsdoc,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...tseslint.configs["recommended"].rules,
            ...sonarjs.configs.recommended.rules,
            ...jsdoc.configs.recommended.rules,
            "prettier/prettier": "error",
            "sonarjs/todo-tag": "warn",
            "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
            "no-underscore-dangle": "off",
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/explicit-function-return-type": "error",
            "no-plusplus": "off",
            "import/prefer-default-export": "off",
            "import/newline-after-import": "error",
            "import/order": ["error", { "newlines-between": "always" }],
            "no-return-await": "off",
            "no-await-in-loop": "off",
            "no-console": ["error", { allow: ["debug", "warn", "error"] }],
            "@typescript-eslint/no-use-before-define": "warn",
            "@typescript-eslint/return-await": ["error", "in-try-catch"],
            "jsdoc/require-param-type": 0,
            "jsdoc/require-returns-type": 0,
            "jsdoc/require-jsdoc": [
                "error",
                {
                    contexts: ["TSInterfaceDeclaration", "TSTypeAliasDeclaration", "TSEnumDeclaration"],
                    require: {
                        ArrowFunctionExpression: true,
                        ClassDeclaration: true,
                        ClassExpression: true,
                        FunctionDeclaration: true,
                        FunctionExpression: true,
                        MethodDefinition: true,
                    },
                },
            ],
            semi: ["error", "never"],
        },
        settings: {
            "import/parsers": {
                "@typescript-eslint/parser": [".ts"],
            },
            "import/resolver": {
                typescript: {
                    alwaysTryTypes: true,
                    project: "./",
                },
            },
        },
    },
    {
        files: ["**/*.test.ts", "test/*.ts", "test/**/*.ts"],
        rules: {
            "sonarjs/no-duplicate-string": "off",
        },
    },
]

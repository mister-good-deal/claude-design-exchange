/*
 * Portable Tatami @stylistic formatter — for Claude Design.
 *
 * Reproduces the Tatami app's EXACT @stylistic dialect (semicolons, semi-style, arrow-parens: as-needed, 4-space
 * indent, double quotes, padding-line rules…) so a DS export lands byte-clean with no formatter round-trips. The
 * @stylistic block below is copied VERBATIM from the app's eslint.config.mjs. It is FORMATTER-ONLY (no type-aware
 * rules), so it runs standalone on your `ui/` folder without the app's TS project graph.
 *
 *   npm install
 *   npx eslint "ui/**\/*.{ts,tsx}" --fix   # auto-normalize
 *   npx eslint "ui/**\/*.{ts,tsx}"         # must print 0 — hand-fix any non-auto-fixable residual (see README)
 */
import stylistic from "@stylistic/eslint-plugin";
import tsEslint from "typescript-eslint";
import globals from "globals";

export default [
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            parser: tsEslint.parser,
            parserOptions: { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true } },
            globals: { ...globals.node, ...globals.browser }
        },
        plugins: { "@stylistic": stylistic },
        rules: {
            ...stylistic.configs.all.rules,
            "@stylistic/quote-props": ["error", "consistent-as-needed"],
            "@stylistic/array-element-newline": ["error", "consistent"],
            "@stylistic/object-curly-spacing": ["error", "always", { objectsInObjects: false }],
            "@stylistic/brace-style": ["error", "1tbs", { allowSingleLine: true }],
            "@stylistic/lines-between-class-members": [
                "error",
                { enforce: [{ blankLine: "always", prev: "method", next: "method" }] },
                { exceptAfterSingleLine: true }
            ],
            "@stylistic/object-property-newline": ["error", { allowAllPropertiesOnSameLine: true }],
            "@stylistic/padded-blocks": ["error", "never", { allowSingleLineBlocks: true }],
            "@stylistic/lines-around-comment": [
                "error",
                { beforeBlockComment: true, allowBlockStart: true, allowObjectStart: true, allowArrayStart: true, allowClassStart: true }
            ],
            "@stylistic/function-call-argument-newline": ["error", "consistent"],
            "@stylistic/multiline-ternary": ["error", "always-multiline"],
            "@stylistic/arrow-parens": ["error", "as-needed"],
            "@stylistic/function-paren-newline": ["error", "consistent"],
            "@stylistic/eol-last": ["error", "always"],
            "@stylistic/no-tabs": "error",
            "@stylistic/no-trailing-spaces": "error",
            "@stylistic/no-extra-semi": "error",
            "@stylistic/no-multiple-empty-lines": ["error", { max: 1, maxEOF: 1, maxBOF: 0 }],
            "@stylistic/nonblock-statement-body-position": "error",
            "@stylistic/space-before-function-paren": ["error", "never"],
            "@stylistic/newline-per-chained-call": ["error", { ignoreChainWithDepth: 8 }],
            "@stylistic/padding-line-between-statements": [
                "error",
                { blankLine: "always", prev: "*", next: ["return", "try", "throw", "for", "while", "do", "class"] },
                { blankLine: "always", prev: ["const", "let"], next: "*" },
                { blankLine: "any", prev: ["const", "let"], next: ["const", "let"] },
                { blankLine: "always", prev: ["export", "import"], next: "*" },
                { blankLine: "any", prev: ["export", "import"], next: ["export", "import"] },
                { blankLine: "always", prev: ["if"], next: "*" },
                { blankLine: "any", prev: ["if"], next: ["if"] }
            ],
            "@stylistic/curly-newline": ["error", { multiline: true, consistent: true }],
            "@stylistic/quotes": ["error", "double"],
            "@stylistic/semi": ["error", "always"],
            "@stylistic/indent": ["error", 4, { SwitchCase: 1 }],
            "@stylistic/indent-binary-ops": ["error", 4],
            "@stylistic/operator-linebreak": [
                "error",
                "after",
                { overrides: { "|": "before", "&": "before", "?": "before", ":": "before" } }
            ]
        }
    },
    { ignores: ["**/node_modules/**", "**/dist/**", "**/build/**"] }
];

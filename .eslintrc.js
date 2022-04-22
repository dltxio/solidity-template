module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "tsconfig.json",
        sourceType: "module"
    },
    plugins: ["@typescript-eslint/eslint-plugin"],
    extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended"
    ],
    rules: {
        "@typescript-eslint/ban-ts-comment": "off"
    },
    root: true,
    env: {
        node: true
    },
    ignorePatterns: [".eslintrc.js"]
};

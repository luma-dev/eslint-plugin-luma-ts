# @luma-dev/eslint-plugin-luma-ts

[![codecov](https://codecov.io/github/luma-dev/eslint-plugin-luma-ts/graph/badge.svg?token=sfW27O2rND)](https://codecov.io/github/luma-dev/eslint-plugin-luma-ts)

ESLint plugin for TypeScript with custom linting rules.

## Installation

```bash
npm install --save-dev @luma-dev/eslint-plugin-luma-ts
```

## Usage

Add to your ESLint configuration:

```javascript
export default [
  {
    plugins: {
      "luma-ts": require("@luma-dev/eslint-plugin-luma-ts"),
    },
    rules: {
      "luma-ts/require-satisfies-in-tls": "error",
    },
  },
];
```

Or use the recommended configuration:

```javascript
export default [require("@luma-dev/eslint-plugin-luma-ts").configs.recommended];
```

## Rules

### `require-satisfies-in-tls`

Requires satisfies in Template-Literal-Strings.

Template literal expressions must use the `satisfies` operator with allowed types.

**Valid:**

```typescript
`Hello ${name satisfies string}`;
`Count: ${count satisfies number}`;
`BigInt: ${value satisfies bigint}`;
```

**Invalid:**

```typescript
`Hello ${name}`; // Missing satisfies
`Count: ${count}`; // Missing satisfies
```

**Options:**

- `types`: Array of allowed type names (default: `['string', 'number', 'bigint']`)

**Example configuration:**

```javascript
{
  'luma-ts/require-satisfies-in-tls': ['error', { types: ['string', 'CustomType'] }]
}
```

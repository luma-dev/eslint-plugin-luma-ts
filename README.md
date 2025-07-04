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
      "luma-ts/no-as-unknown-as": "error",
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

### `no-as-unknown-as`

Disallows the `as unknown as T` form of type casting and suggests using parse or type-guard functions instead.

This rule helps maintain type safety by preventing dangerous double type assertions that bypass TypeScript's type checking.

**Valid:**

```typescript
// Using type guards
function isString(value: unknown): value is string {
  return typeof value === "string";
}
if (isString(value)) {
  console.log(value); // value is safely typed as string
}

// Using parse functions
function parseUser(data: unknown): User {
  // validate and parse data
  return parsedUser;
}
const user = parseUser(data);

// Single type assertion (still allowed, though not recommended)
const value = data as string;
```

**Invalid:**

```typescript
const value = data as unknown as string; // Double assertion bypasses type safety
const user = response as unknown as User; // Dangerous pattern
const items = data as unknown as string[]; // Should use proper validation
```

This rule has no configuration options.

**Example configuration:**

```javascript
{
  'luma-ts/no-as-unknown-as': 'error'
}
```

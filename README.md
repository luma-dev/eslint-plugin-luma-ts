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
      "luma-ts/no-explicit-return-is": "error",
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

### `no-explicit-return-is`

Disallows explicit type predicate return types in function declarations and encourages TypeScript inference or alternative patterns.

This rule helps maintain cleaner code by preventing explicit type predicate declarations in return types. Type predicates can still be used through type annotations on variables or with the `satisfies` operator.

**Valid:**

```typescript
// Let TypeScript infer the return type
const f = (a: string) => a === "b";

// Using satisfies operator
const f = ((a: string) => a === "b") satisfies (a: string) => a is "b";

// Type annotation on variable declaration
const f: (a: string) => a is "b" = (a: string) => a === "b";

// Regular boolean return type
function isString(value: unknown): boolean {
  return typeof value === "string";
}
```

**Invalid:**

```typescript
// Explicit type predicate in arrow function
const f = (a: string): a is "b" => a === "b";

// Explicit type predicate in function declaration
function isString(value: unknown): value is string {
  return typeof value === "string";
}

// Explicit type predicate in function expression
const isNumber = function (value: unknown): value is number {
  return typeof value === "number";
};
```

This rule has no configuration options.

**Example configuration:**

```javascript
{
  'luma-ts/no-explicit-return-is': 'error'
}
```

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
      "luma-ts/prefer-immutable": "error",
      "luma-ts/no-date": "error",
      "luma-ts/no-string": "error",
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

### `prefer-immutable`

Encourages the use of immutable patterns by recommending `readonly` modifiers and immutable array/object types.

This rule helps maintain immutability in TypeScript code by suggesting the use of `readonly` for properties and recommending `ReadonlyArray<T>` or `readonly T[]` over mutable array types.

**Valid:**

```typescript
// Using readonly for object properties
interface User {
  readonly id: string;
  readonly name: string;
}

// Using ReadonlyArray
function processItems(items: ReadonlyArray<string>) {
  // items cannot be mutated
}

// Using readonly array syntax
function processNumbers(numbers: readonly number[]) {
  // numbers cannot be mutated
}

// Const assertions for literal values
const config = {
  host: "localhost",
  port: 3000,
} as const;
```

**Invalid:**

```typescript
// Mutable object properties
interface User {
  id: string; // Should be readonly
  name: string; // Should be readonly
}

// Mutable array parameters
function processItems(items: string[]) {
  // Should use readonly array type
}
```

This rule has no configuration options.

**Example configuration:**

```javascript
{
  'luma-ts/prefer-immutable': 'error'
}
```

### `no-date`

Disallows the usage of the legacy `Date` object and suggests using the modern Temporal API instead.

This rule helps maintain better date/time handling by encouraging the adoption of the Temporal API, which provides improved precision, time zone support, and a more intuitive API.

**Valid:**

```typescript
// Using Temporal API
const now = Temporal.Now.instant();
const plainNow = Temporal.Now.plainDateTime();
const date = Temporal.Instant.from("2023-12-25T00:00:00Z");
const timestamp = Temporal.Instant.fromEpochMilliseconds(1234567890);

// Getting current time
const currentTime = Temporal.Now.instant().epochMilliseconds;

// Type annotations
let birthday: Temporal.PlainDate;
function formatDate(date: Temporal.ZonedDateTime): string {}
```

**Invalid:**

```typescript
// Constructor usage
const now = new Date();
const date = new Date("2023-12-25");
const timestamp = new Date(1234567890);

// Static methods
const currentTime = Date.now();
const parsed = Date.parse("2023-12-25");

// Type annotations
let birthday: Date;
function formatDate(date: Date): string {}

// instanceof checks
if (value instanceof Date) {
}
```

This rule provides automatic fixes for common Date usage patterns, such as:

- `new Date()` → `Temporal.Now.plainDateTime()` or `Temporal.Now.instant()`
- `Date.now()` → `Temporal.Now.instant().epochMilliseconds`
- `Date.parse()` → `Temporal.Instant.from()`

This rule has no configuration options.

**Example configuration:**

```javascript
{
  'luma-ts/no-date': 'error'
}
```

### `no-string`

Disallows `String()` and `new String()` for type conversion and suggests using `.toString()` or template literals instead.

`String()` hides the conversion intent and can silently convert `null`/`undefined` to `"null"`/`"undefined"`. Using `.toString()` makes the conversion explicit and fails loudly on `null`/`undefined`, encouraging proper handling.

**Valid:**

```typescript
// Use .toString()
const s = value.toString();
const n = (42).toString();

// Use template literals
const s = `${value}`;

// String static methods are fine
const ch = String.fromCharCode(65);
const raw = String.raw`hello\nworld`;
```

**Invalid:**

```typescript
const s = String(value);
const n = String(42);
const wrapped = new String(value);
```

This rule has no configuration options.

**Example configuration:**

```javascript
{
  'luma-ts/no-string': 'error'
}
```

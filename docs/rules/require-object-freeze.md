# require-object-freeze

Require new objects and arrays (`{}`, `[]`, `Object.fromEntries(...)`, `Array.from(...)`, etc.) to be wrapped with `Object.freeze`.

## Rule Details

`readonly` and `as const` are type-only and erased at runtime. `Object.freeze` makes the object / array immutable at runtime too.

Checked expressions:

- Object literals: `{}`, `{ a: 1 }`, `{ ...a }`
- Array literals: `[]`, `[1, 2]`, `[...a]`
- `Object.fromEntries(...)`, `Object.assign(...)`, `Object.create(...)`, `Object.groupBy(...)`
- `Object.keys(...)`, `Object.values(...)`, `Object.entries(...)`
- `Array.from(...)`, `Array.of(...)`

Instance methods that return new arrays (`xs.map(...)`, `xs.filter(...)`, `s.split(...)`, etc.) are not checked, since the receiver type is unknown without type information.

Allowed positions:

- First argument of `Object.freeze(...)`
- Target (first argument) of an `Object.assign(...)` that is itself in an allowed position: `Object.freeze(Object.assign({}, a))`. Outside of freeze, only the `Object.assign` call is reported, not its target.
- Consumed without being exposed:
  - Spread sources: `{ ...{ a: 1 } }`, `[...[1, 2]]`, `f(...[a, b])`
  - `Object.assign(t, { a: 1 })` sources
  - Destructuring sources: `const [a, b] = [1, 2]`, `[a, b] = [b, a]`, `const { a } = { a: 1 }`
  - `for (const x of [1, 2])`
- Direct call / `new` arguments and literals nested in them, with `allowCallArguments: true`

These wrappers are transparent when finding the position:

- `as T`, `<T>x`, `satisfies T`, `x!`
- Branches of `c ? a : b`, both sides of `a ?? b` / `a || b` / `a && b`
- Last expression of `(a, b)`

`Object.freeze` is shallow, so nested object / array literals must be frozen individually.

Each report has a suggestion (not an autofix, since freezing changes runtime behavior) that wraps the expression with `Object.freeze(...)`. The suggestion wraps the whole TS wrapper chain so that `as const` stays on the literal: `Object.freeze([1, 2] as const)`.

## Options

- `allowCallArguments` (`boolean`, default `false`): allow object / array literals passed directly as call / `new` arguments, including literals nested inside them via properties or array elements. Values returned from callbacks are still reported.

## Examples

### Incorrect

```typescript
const a = { b: 1 };
const c = [1, 2] as const;
const d = Object.fromEntries(entries);
const e = Object.assign({}, a);
const f = Object.freeze({ g: [1] }); // nested literal is not frozen
const h = Array.from(xs);
const i = Object.keys(a);
const j = () => ({ k: 1 });
fetch(url, { method: "POST" }); // without allowCallArguments
```

### Correct

```typescript
const a = Object.freeze({ b: 1 });
const c = Object.freeze([1, 2] as const);
const d = Object.freeze(Object.fromEntries(entries));
const e = Object.freeze(Object.assign({}, a));
const f = Object.freeze({ g: Object.freeze([1]) });
const h = Object.freeze(Array.from(xs));
const i = Object.freeze(Object.keys(a));
const j = () => Object.freeze({ k: 1 });
const [l, m] = [1, 2];
for (const n of [1, 2]) {
}

// with allowCallArguments: true
fetch(url, { method: "POST", headers: { a: "b" } });
```

## When Not To Use It

- Code that relies on mutating objects / arrays (builders, caches, framework APIs that mutate passed values)
- JSX props (`style={{ ... }}`) and library config objects with many literals (e.g. XState `{} as T` placeholders), unless you disable the rule for those files
- Hot paths where the cost of `Object.freeze` matters

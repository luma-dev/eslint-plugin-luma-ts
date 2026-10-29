# no-type-assertion-allow-xstate

Disallow type assertions, except `as const` and XState's `{} as T` type placeholders.

Not included in `recommended`. Enable it explicitly.

## Rule Details

Based on [`@typescript-eslint/consistent-type-assertions`](https://typescript-eslint.io/rules/consistent-type-assertions/) with `assertionStyle: "never"`.

XState declares machine types with an empty object literal asserted to the type (`{} as T`). This rule allows that pattern only when all of the following hold.

The key positions (non-computed keys):

- Value of `types`, `schema`, or `tsTypes`: `createMachine({ types: {} as T })`
- Value of any key directly inside a `types` or `schema` object: `setup({ types: { context: {} as T } })`

The config object that owns the `types` / `schema` / `tsTypes` key is passed directly as an argument of an allowed callee (`callees` option): `name(config)` or `obj.name(config)`. Default callees: `setup`, `createMachine`, `createStore`. This check is skipped with `allowOutsideCall: true`.

Everything else is reported:

- Any other `as T` / `<T>x` assertion
- Angle-bracket form even in the XState positions (`<T>{}`)
- Non-empty object or non-object expressions (`{ a: 1 } as T`, `ctx as T`)
- Chained assertions (`{} as unknown as T`)
- Config declared outside the call (`const config = { types: {} as T }`) by default
- Config wrapped by another call (`setup(wrap({ types: {} as T }))`)
- Computed member callee (`xstate["createMachine"](...)`)

## Examples

### Incorrect

```typescript
const a = b as string;
const c = <string>d;
setup({ types: { context: ctx as Ctx } });
setup({ types: { context: {} as unknown as Ctx } });
const e = { foo: {} as Foo };

// Not passed directly to an allowed callee (default options)
const config = { types: { context: {} as Ctx } };
foo({ types: {} as T });
```

### Correct

```typescript
const a = [1, 2] as const;

// XState v5
setup({}).createMachine({ types: {} as { context: Ctx } });
xstate.createMachine({ types: { context: {} as Ctx } });
setup({ types: { context: {} as Ctx, events: {} as Ev, input: {} as In } });
createMachine({ types: {} as { context: Ctx; events: Ev } });

// XState v4
createMachine({
  schema: { context: {} as Ctx, events: {} as Ev },
  tsTypes: {} as import("./machine.typegen").Typegen0,
});
```

## Options

```typescript
type Options = {
  // Function names whose direct object argument may contain the placeholder.
  // Replaces (does not merge with) the default list.
  callees?: string[]; // default: ["setup", "createMachine", "createStore"]
  // Skip the callee check and allow the placeholder in any object literal.
  allowOutsideCall?: boolean; // default: false
};
```

```javascript
{
  'luma-ts/no-type-assertion-allow-xstate': [
    'error',
    { callees: ['setup', 'createMachine', 'myCreateMachine'] },
  ],
}
```

## When Not To Use It

If the project does not use XState, use `@typescript-eslint/consistent-type-assertions` with `assertionStyle: "never"` instead.

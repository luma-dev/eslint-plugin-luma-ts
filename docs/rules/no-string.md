# no-string

Disallow `String()` and `new String()` for type conversion. Use `.toString()` or template literals instead.

## Rule Details

This rule bans calling `String(value)` as a type conversion function and `new String(value)` for creating string wrapper objects.

`String()` hides the conversion intent and can silently convert `null`/`undefined` to `"null"`/`"undefined"`. Using `.toString()` makes the conversion explicit and fails loudly on `null`/`undefined`, encouraging proper handling.

The rule flags:

- `String(x)` function calls
- `new String(x)` constructor calls

The rule does NOT flag:

- `String.fromCharCode()`, `String.fromCodePoint()`, `String.raw` (static methods/tagged templates)
- `String.prototype` access
- `string` type annotations

## Examples

### Incorrect

```typescript
const s = String(value);
const n = String(42);
const b = String(true);
const wrapped = new String(value);
```

### Correct

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

## When Not To Use It

If your codebase relies on `String()` for safe conversion of `null`/`undefined` values and you prefer that behavior over explicit null checks.

## Further Reading

- [MDN: String()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/String)
- [MDN: Object.prototype.toString()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString)

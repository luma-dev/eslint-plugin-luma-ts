# no-if-without-else

Disallow `if` without `else` unless the `if` branch always ends with `return` or `throw`.

## Rule Details

An `if` without `else` hides the "otherwise" case. This rule requires either an explicit `else` branch or an early exit (guard clause).

An `if` branch counts as an exit when it is:

- `return` or `throw`
- A block whose last statement is an exit
- An `if` / `else` where both branches are exits

`break` and `continue` do not count. In an `else if` chain, the last `if` must also have an `else` or exit.

## Examples

### Incorrect

```typescript
if (a) {
  f();
}

if (a) {
  f();
} else if (b) {
  g();
}

function h() {
  if (a) {
    if (b) return;
  }
}

for (;;) {
  if (a) break;
}
```

### Correct

```typescript
if (a) {
  f();
} else {
  g();
}

function h() {
  if (a) return;
  if (b) {
    f();
    return;
  }
  if (c) throw new Error();
  if (d) {
    if (e) return 1;
    else return 2;
  }
  g();
}
```

## When Not To Use It

If you prefer side-effect-only `if` statements (`if (debug) log(...)`) without an `else`.

# no-ts-private

Disallow TypeScript `private` modifier. Use ECMAScript `#` private fields instead.

## Rule Details

TypeScript's `private` keyword is a compile-time-only modifier — it is completely erased after transpilation, so the field is publicly accessible at runtime. ECMAScript `#` private fields are enforced at runtime by the engine.

The rule flags:

- `private` on class properties (`PropertyDefinition`)
- `private` on class methods, getters, and setters (`MethodDefinition`)
- `private` parameter properties (`constructor(private x: number)`)

The rule does NOT flag:

- `private constructor()` — `#constructor` is not valid syntax, and private constructors are a legitimate TypeScript pattern (singletons, factory methods)
- `protected` modifier — it has no ECMAScript equivalent

## Examples

### Incorrect

```typescript
class Foo {
  private bar = 1;
  private baz() {}
  private get qux() {
    return 1;
  }
  constructor(private x: number) {}
}
```

### Correct

```typescript
class Foo {
  #bar = 1;
  #baz() {}
  get #qux() {
    return 1;
  }
  readonly #x: number;
  constructor(x: number) {
    this.#x = x;
  }
}

// private constructor is allowed
class Singleton {
  private constructor() {}
}
```

## When Not To Use It

If your project targets environments that do not support ECMAScript private fields, or if you rely on `private` for declaration merging or decorator interop.

## Further Reading

- [MDN: Private class features](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties)
- [TypeScript: private vs #](https://www.typescriptlang.org/docs/handbook/2/classes.html#private)

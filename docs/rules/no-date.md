# no-date

Disallow usage of Date in runtime code and suggest using Temporal API instead.

## Rule Details

This rule aims to prevent the usage of the legacy `Date` object and encourages the adoption of the modern Temporal API, which provides better date/time handling with improved precision, time zone support, and a more intuitive API.

The rule flags the following Date usages:

- `new Date()` constructor calls
- Static Date methods like `Date.now()`, `Date.parse()`, `Date.UTC()`
- Date instance methods
- Date type annotations in TypeScript
- `instanceof Date` checks
- Using Date as a value (e.g., passing to functions)

## Examples

### ❌ Incorrect

```typescript
// Constructor usage
const now = new Date();
const date = new Date("2023-12-25");
const timestamp = new Date(1234567890);
const specificDate = new Date(2023, 11, 25);

// Static methods
const currentTime = Date.now();
const parsed = Date.parse("2023-12-25");
const utc = Date.UTC(2023, 11, 25);

// Instance methods
const time = date.getTime();
const year = date.getFullYear();
const iso = date.toISOString();

// Type annotations
let birthday: Date;
function formatDate(date: Date): string {}
interface User {
  createdAt: Date;
}

// instanceof checks
if (value instanceof Date) {
}

// Date as value
const DateConstructor = Date;
```

### ✅ Correct

```typescript
// Using Temporal API
const now = Temporal.Now.instant();
const plainNow = Temporal.Now.plainDateTime();
const date = Temporal.Instant.from("2023-12-25T00:00:00Z");
const timestamp = Temporal.Instant.fromEpochMilliseconds(1234567890);
const specificDate = Temporal.PlainDateTime.from({
  year: 2023,
  month: 12, // Note: Temporal months are 1-based (1-12)
  day: 25,
});

// Getting current time
const currentTime = Temporal.Now.instant().epochMilliseconds;

// Parsing dates
const parsed = Temporal.Instant.from("2023-12-25T00:00:00Z");

// Getting date components
const year = plainNow.year;
const iso = instant.toString();

// Type annotations
let birthday: Temporal.PlainDate;
function formatDate(date: Temporal.ZonedDateTime): string {}
interface User {
  createdAt: Temporal.Instant;
}

// Type checking (Temporal doesn't use instanceof)
if (Temporal.Instant.prototype.isPrototypeOf(value)) {
}
```

## Auto-fixes

This rule provides automatic fixes for common Date usage patterns:

### Constructor replacements:

- `new Date()` → `Temporal.Now.plainDateTime()` or `Temporal.Now.instant()`
- `new Date("2023-12-25")` → `Temporal.Instant.from("2023-12-25")`
- `new Date(1234567890)` → `Temporal.Instant.fromEpochMilliseconds(1234567890)`
- `new Date(2023, 11, 25)` → `Temporal.PlainDateTime.from({year: 2023, month: 12, day: 25})`

### Static method replacements:

- `Date.now()` → `Temporal.Now.instant().epochMilliseconds`
- `Date.parse("...")` → `Temporal.Instant.from("...")`

### Type replacements:

- `Date` → `Temporal.Instant`, `Temporal.PlainDateTime`, or `Temporal.ZonedDateTime`

## Important Notes

1. **Month differences**: JavaScript Date uses 0-based months (0-11), while Temporal uses 1-based months (1-12). The auto-fix handles this by adding 1 to the month value.

2. **Day of week differences**: Date's `getDay()` returns 0-6 (Sunday-Saturday), while Temporal's `dayOfWeek` returns 1-7 (Monday-Sunday). Use `dayOfWeek % 7` for compatibility.

3. **Time zones**: Temporal provides better time zone handling. Choose the appropriate Temporal type:

   - `Temporal.Instant` - A point in time (like a timestamp)
   - `Temporal.PlainDateTime` - Date and time without time zone
   - `Temporal.ZonedDateTime` - Date and time with time zone

4. **No direct instanceof**: Temporal objects don't use `instanceof`. Use prototype checks or duck typing instead.

## When Not To Use It

If your project needs to maintain compatibility with environments that don't support the Temporal API, or if you're working with legacy code that extensively uses Date, you may want to disable this rule.

## Further Reading

- [Temporal API Documentation](https://tc39.es/proposal-temporal/docs/)
- [MDN Date Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [Temporal Cookbook](https://tc39.es/proposal-temporal/docs/cookbook.html)

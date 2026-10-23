# Intl Currency Helper

A lightweight, high-powered, **zero-dependency** JavaScript library for formatting numbers to currency strings using the native `Intl.NumberFormat` API. Compatible with **Node.js** (ESM + CJS) and **React**.

## Features

- 🚀 **Shorthand functions** — `formatMXN()`, `formatUSD()`, `formatEUR()` out of the box
- 🏭 **Dynamic factory** — `createFormat('ARS', 'es-AR')` for any currency
- ⚙️ **Global config** — Set defaults once, use everywhere
- 🧩 **All Intl.NumberFormat v3 options** — `currencyDisplay`, `currencySign`, `signDisplay`, `roundingMode`, `trailingZeroDisplay`...
- 📏 **Range formatting** — `formatRange(100, 200, opts)`
- 🔧 **Parts access** — `formatParts()` for granular control
- 🔄 **Parse** — `parseCurrency('$1,234.56')` back to number
- ⚛️ **React hook** — `useCurrencyFormat` via `intl-currency-helper/react`
- 🛡️ **Flexible validation** — `validationMode: 'throw' | 'zero' | 'passthrough'`
- 📦 **Dual ESM/CJS** — works with `import` and `require`
- 📘 **TypeScript** — full types included

## Installation

```bash
npm install intl-currency-helper
```

## Usage

### 🚀 Shorthand Functions

```js
import { formatMXN, formatUSD, formatEUR } from 'intl-currency-helper'

formatMXN(1234.56) // "$1,234.56"
formatUSD(1234.56) // "$1,234.56"
formatEUR(1234.56) // "1.234,56 €"
```

### 🏭 Dynamic Shorthand Factory

```js
import { createFormat } from 'intl-currency-helper'

const formatARS = createFormat('ARS', 'es-AR')
formatARS(1500) // "$1.500,00"

const formatGBP = createFormat('GBP', 'en-GB')
formatGBP(50, { minimumFractionDigits: 0 }) // "£50"
```

### ⚙️ Global Configuration

```js
import { configure, formatCurrency } from 'intl-currency-helper'

configure({ currency: 'CLP', locale: 'es-CL' })
formatCurrency(5000) // "$5.000"
```

### 🧩 Advanced Intl Options

```js
// Accounting (parentheses for negatives)
formatCurrency(-500, { currencySign: 'accounting' }) // "($500.00)"

// Force + sign on positive
formatCurrency(100, { signDisplay: 'always' }) // "+$100.00"

// Strip trailing zeros for integers
formatCurrency(100, { trailingZeroDisplay: 'stripIfInteger' }) // "$100"

// Control rounding
formatCurrency(1.009, { roundingMode: 'floor' }) // "$1.00"

// Show currency name instead of symbol
formatCurrency(100, { currencyDisplay: 'name' }) // "100.00 Mexican pesos"
```

### 📏 Range Formatting

```js
import { formatRange } from 'intl-currency-helper'

formatRange(100, 200, { currency: 'USD', locale: 'en-US' })
// "$100.00 – $200.00"
```

### 🔧 Format Parts

```js
import { formatParts } from 'intl-currency-helper'

formatParts(100, { currency: 'USD', locale: 'en-US' })
// [
//   { type: 'currency', value: '$' },
//   { type: 'integer', value: '100' },
//   { type: 'decimal', value: '.' },
//   { type: 'fraction', value: '00' },
// ]
```

### 🔄 Parse Currency

```js
import { parseCurrency } from 'intl-currency-helper'

parseCurrency('$1,234.56', { locale: 'en-US' })      // 1234.56
parseCurrency('1.234,56 €', { locale: 'es-ES' })     // 1234.56
parseCurrency('($500)', { locale: 'en-US' })          // -500
parseCurrency('$100.00 USD', { currency: 'USD' })     // 100
```

### 🛡️ Flexible Validation

```js
formatCurrency('invalid')                    // throws Error
formatCurrency('invalid', { validationMode: 'zero' })        // "$0.00"
formatCurrency('N/A', { validationMode: 'passthrough' })     // "N/A"
```

### ⚛️ React Hook

```js
import { useCurrencyFormat } from 'intl-currency-helper/react'

function Price({ value }) {
  const formatted = useCurrencyFormat(value, { currency: 'USD', locale: 'en-US' })
  return <span>{formatted}</span>
}
```

### 📊 Currency Metadata

```js
import { CURRENCY_DATA } from 'intl-currency-helper'

CURRENCY_DATA.JPY // { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP', fractionDigits: 0 }
CURRENCY_DATA.MXN // { code: 'MXN', symbol: '$', name: 'Mexican Peso', locale: 'es-MX', fractionDigits: 2 }
```

## API

### Core
| Function | Description |
|---|---|
| `formatCurrency(amount, options?)` | Format a number to currency string |
| `formatRange(a, b, options?)` | Format a range as currency strings |
| `formatParts(amount, options?)` | Get raw `Intl.NumberFormatPart[]` |
| `parseCurrency(str, options?)` | Parse a formatted currency string back to number |
| `configure(options)` | Set global defaults |
| `getGlobalConfig()` | Get current global config |
| `createFormat(currency, locale?)` | Create a custom shorthand function |

### Shorthands
| Function | Default |
|---|---|
| `formatMXN(amount, options?)` | MXN / es-MX |
| `formatUSD(amount, options?)` | USD / en-US |
| `formatEUR(amount, options?)` | EUR / es-ES |

### Options
All native `Intl.NumberFormat` options are supported, plus:

| Option | Type | Default | Description |
|---|---|---|---|
| `locale` | `string` | `'es-MX'` | BCP 47 language tag |
| `currency` | `string` | `'MXN'` | ISO 4217 currency code |
| `code` | `boolean` | `false` | Append ISO code at end |
| `validationMode` | `'throw' \| 'zero' \| 'passthrough'` | `'throw'` | Behavior on invalid input |

### Constants
| Export | Description |
|---|---|
| `CURRENCIES` | Map of 37 ISO currency codes |
| `LOCALES` | Map of 36 BCP 47 locale tags |
| `CURRENCY_DATA` | Metadata (symbol, name, fraction digits) for 37 currencies |

## License

MIT

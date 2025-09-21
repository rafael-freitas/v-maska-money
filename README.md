# maska-money

A small Vue directive to keep the caret (cursor) synchronized with formatting when using `v-maska` for monetary inputs. This directive ensures that the cursor position remains logical when users type, delete, or edit formatted money values.

## Installation

```bash
npm i maska-money
```

## Usage

### Method 1: As a Plugin

```ts
import { createApp } from "vue";
import MaskaMoney from "maska-money";
import { maska } from "maska";

const app = createApp(App);
app.use(MaskaMoney); // Registers directive as "maska-money"
app.use(maska); // Don't forget to include v-maska
app.mount("#app");
```

### Method 2: Direct Directive Import

```ts
import { createApp } from "vue";
import { MaskaMoneyCaretDirective } from "maska-money";
import { maska } from "maska";

const app = createApp(App);
app.directive("maska-money", MaskaMoneyCaretDirective);
app.use(maska);
app.mount("#app");
```

### In Your Vue Template

```vue
<template>
  <div>
    <!-- Basic usage with v-maska -->
    <input
      v-maska="'#.##0,00'"
      v-maska-money
      v-model="amount"
      placeholder="0,00"
    />

    <!-- With currency symbol -->
    <input
      v-maska="'R$ #.##0,00'"
      v-maska-money
      v-model="price"
      placeholder="R$ 0,00"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";

const amount = ref("");
const price = ref("");
const value = ref("");
</script>
```

### With Element Plus Input (el-input)

```vue
<template>
  <div>
    <!-- Basic usage with v-maska -->
    <el-input
      :model-value="
        Intl.NumberFormat('pt-BR', {
          currency: 'BRL',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(Number(price))
      "
      v-maska-money
      v-maska="options"
      placeholder="0,00"
      @maska="(e) => (price = Number(e.detail.unmasked.replace(',', '.') || 0))"
    >
      <template #prefix>
        <span>R$</span>
      </template>
    </el-input>
  </div>
</template>

<script setup>
import { ref } from "vue";

const amount = ref("");
const price = ref("");
const value = ref("");
</script>
```

## How It Works

The `v-maska-money` directive listens to keyboard events and `maska` formatting events to intelligently position the cursor. It:

- **Maintains cursor position** when typing digits
- **Handles deletions** (Backspace/Delete) logically
- **Supports text selection** and replacement
- **Works with any v-maska pattern** for monetary values

## Requirements

- Vue 3.2.0 or higher
- v-maska library (for formatting)

## License

MIT

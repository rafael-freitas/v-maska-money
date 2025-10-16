// v-money-maska.ts — apenas caret helper p/ usar junto com v-maska
import { nextTick, type DirectiveBinding } from "vue";

// ————————————— helpers —————————————

// conta dígitos (0–9) em str[0..end)
function countDigitsLeft(str: string, end: number) {
  let n = 0;
  for (let i = 0; i < end && i < str.length; i++) {
    if (/\d/.test(str[i])) n++;
  }
  return n;
}

// encontra a posição do caret na string formatada após "idx" dígitos
// (retorna posição LOGO DEPOIS do dígito idx-ésimo)
function cursorPosForDigitIndex(formatted: string, idx: number) {
  if (idx <= 0) return 0;
  let count = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) {
      count++;
      if (count === idx) return i + 1;
    }
  }
  // se idx passa do total de dígitos, vai pro fim
  return formatted.length;
}

// classifica ação a partir do keydown
function classifyAction(e: KeyboardEvent, hadSelection: boolean) {
  const k = e.key;
  if (k === "Backspace") return "backspace" as const;
  if (k === "Delete") return "delete" as const;
  if (/^\d$/.test(k))
    return hadSelection ? ("insert-replace" as const) : ("insert" as const);
  // teclas funcionais → não ajustamos caret
  const functional = [
    "Tab",
    "Escape",
    "Enter",
    "Home",
    "End",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
  ];
  if (functional.includes(k) || e.ctrlKey || e.metaKey) return "noop" as const;
  return "other" as const;
}

type CaretState = {
  beforeValue: string;
  start: number;
  end: number;
  action:
    | "insert"
    | "insert-replace"
    | "backspace"
    | "delete"
    | "noop"
    | "other";
};

// ———————————— diretiva ————————————
export const MaskaMoneyCaretDirective = {
  async mounted(el: HTMLElement, _binding: DirectiveBinding) {
    await nextTick();
    const input: HTMLInputElement | null = el.matches("input")
      ? (el as HTMLInputElement)
      : el.querySelector("input");
    if (!input) return;

    // estado por elemento
    const state: CaretState = {
      beforeValue: input.value ?? "",
      start: input.selectionStart ?? 0,
      end: input.selectionEnd ?? 0,
      action: "noop",
    };

    const onKeyDown = (e: KeyboardEvent) => {
      state.beforeValue = input.value ?? "";
      state.start = input.selectionStart ?? 0;
      state.end = input.selectionEnd ?? state.start;
      state.action = classifyAction(e, state.end > state.start);
      // não prevenimos nada — v-maska decide. só observamos.
    };

    const onMaska = (ev: Event) => {
      // só ajusta quando realmente há formatação/entrada relevante
      if (state.action === "noop") return;

      const oldVal = state.beforeValue;
      const newVal = input.value ?? "";

      // nº de dígitos à esquerda do caret antes da edição
      const oldDigitsLeft = countDigitsLeft(oldVal, state.start);

      // nº de dígitos removidos pela seleção (se houver)
      const removedDigitsInSelection = countDigitsLeft(
        oldVal.slice(state.start, state.end),
        oldVal.slice(state.start, state.end).length
      );

      // decide o alvo (quantos dígitos devem ficar à esquerda do caret após editar)
      let targetDigitIndex = oldDigitsLeft;

      switch (state.action) {
        case "insert":
          // Se campo estava vazio, posiciona caret no final após formatação
          if (oldVal.trim() === "" || oldVal === "0" || oldVal === "0,00") {
            targetDigitIndex = countDigitsLeft(newVal, newVal.length); // vai para o final
          } else {
            targetDigitIndex = oldDigitsLeft + 1;
          }
          break;
        case "insert-replace":
          // remove os dígitos da seleção e adiciona o novo dígito
          targetDigitIndex = oldDigitsLeft - removedDigitsInSelection + 1;
          if (targetDigitIndex < 0) targetDigitIndex = 0;
          break;
        case "backspace":
          if (state.end > state.start) {
            // backspace com seleção: tira os dígitos selecionados
            targetDigitIndex = oldDigitsLeft - removedDigitsInSelection;
          } else {
            // backspace simples: anda 1 "dígito lógico" para trás
            targetDigitIndex = oldDigitsLeft - 1;
          }
          if (targetDigitIndex < 0) targetDigitIndex = 0;
          break;
        case "delete":
          if (state.end > state.start) {
            // delete com seleção
            targetDigitIndex = oldDigitsLeft - removedDigitsInSelection;
            if (targetDigitIndex < 0) targetDigitIndex = 0;
          } else {
            // delete simples: caret não recua (remove à direita)
            // mantém oldDigitsLeft
          }
          break;
        default:
          // other: não forçamos ajuste
          return;
      }

      // mapeia "quantos dígitos à esquerda" para posição na string formatada nova
      const newCursor = cursorPosForDigitIndex(newVal, targetDigitIndex);

      // aplica caret
      input.setSelectionRange(newCursor, newCursor);

      // zera a ação — próxima digitação recalcula
      state.action = "noop";
    };

    input.addEventListener("keydown", onKeyDown);
    input.addEventListener("maska", onMaska as EventListener);
    (el as any)._mm_onKeyDown = onKeyDown;
    (el as any)._mm_onMaska = onMaska;
  },

  unmounted(el: HTMLElement) {
    const input: HTMLInputElement | null = el.matches("input")
      ? (el as HTMLInputElement)
      : el.querySelector("input");
    if (!input) return;
    const onKeyDown = (el as any)._mm_onKeyDown as (e: KeyboardEvent) => void;
    const onMaska = (el as any)._mm_onMaska as (e: Event) => void;
    if (onKeyDown) input.removeEventListener("keydown", onKeyDown);
    if (onMaska) input.removeEventListener("maska", onMaska as EventListener);
    delete (el as any)._mm_onKeyDown;
    delete (el as any)._mm_onMaska;
  },
};

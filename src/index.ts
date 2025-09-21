import type { App } from "vue";
import { MaskaMoneyCaretDirective } from "./caret-directive";

// Export the directive for direct usage
export { MaskaMoneyCaretDirective };

/** Registrar como plugin opcional */
export default {
  install(app: App) {
    app.directive("money-maska", MaskaMoneyCaretDirective);
  },
};

/*
 * Public API Surface de @caribeng/ui (entry point primario: núcleo + tema)
 */
export {
  CB_COLOR_PRESETS,
  CB_CONFIG,
  CB_DEFAULT_CONFIG,
  type CaribeNgConfig,
  type CbColorPreset,
  type CbPrimaryScale,
  type CbRequiredIndicator,
  type CbTheme,
  type CbThemePreference,
} from './lib/caribeng.config';
export { CbThemeService } from './lib/theme.service';
export {
  CbConfirmationService,
  type CbConfirmation,
  type CbConfirmationRequest,
  type CbConfirmSeverity,
} from './lib/confirmation.service';
export { provideCaribeNG } from './lib/provide-caribeng';
export { cbRunCommand, cbVisibleItems, type CbMenuCommandEvent } from './lib/menu-item';
export { type CbSize, type CbSeverity } from './lib/types';
export { cbFieldState, type CbFieldIndicator, type CbFieldState } from './lib/field-state';
export { cbOverlayFocus, type CbOverlayFocusOptions } from './lib/overlay-focus';
export {
  CB_LOCALE_EN,
  CB_LOCALE_ES,
  CB_LOCALES,
  cbFormat,
  type CbLocaleCode,
  type CbTranslation,
} from './lib/locale';
export { CbLocaleService, injectCbTranslation } from './lib/locale.service';

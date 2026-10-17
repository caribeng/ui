/*
 * Public API Surface de @caribeng/ui (entry point primario: núcleo + tema)
 */
export {
  CB_CONFIG,
  CB_DEFAULT_CONFIG,
  type CaribeNgConfig,
  type CbTheme,
  type CbThemePreference,
} from './lib/caribeng.config';
export { CbThemeService } from './lib/theme.service';
export { provideCaribeNG } from './lib/provide-caribeng';
export { type CbSize, type CbSeverity } from './lib/types';

import { SEVERITY_VALUES, drop, iconName, numeric, styleClass, unsupported, values } from './rules';
import type { AttrRule, ComponentMapping, ElementRewrite } from './types';

// =============================================================================
// ProgressBar
// `<p-progressbar [value]="60" [showValue]="true" mode="indeterminate" />`
// → `<cb-progressbar [value]="60" showValue />`
// =============================================================================

const progressbarRules: Record<string, AttrRule> = {
  value: numeric(),
  mode: (binding, el) => {
    if (binding.kind === 'static' && binding.value === 'indeterminate') {
      el.todos.push(`${binding.source} — usa [value]="null" para modo indeterminado en cb-progressbar.`);
    }
    // 'determinate' → drop silently
  },
  unit: drop(),
  color: unsupported('usa la variable CSS --cb-progressbar-fill-bg para personalizar el color.'),
  styleClass: styleClass(),
};

export const progressbar: ComponentMapping = {
  name: 'progressbar',
  entry: '@caribeng/ui/progressbar',
  symbol: 'CbProgressBar',
  modules: {
    'primeng/progressbar': { ProgressBarModule: 'CbProgressBar', ProgressBar: 'CbProgressBar' },
  },
  elements: [
    {
      tag: 'p-progressbar',
      to: 'cb-progressbar',
      selfClosing: true,
      rules: progressbarRules,
      same: ['showValue', 'severity', 'ariaLabel'],
    },
  ],
};

// =============================================================================
// ProgressSpinner
// `<p-progressspinner [style]="{width:'40px'}" strokeWidth="6" />`
// → `<cb-spinner />`
//
// cb-spinner tiene sus propios inputs size/strokeWidth/severity.
// =============================================================================

const spinnerRules: Record<string, AttrRule> = {
  strokeWidth: numeric(),
  fill: unsupported('cb-spinner no expone el color de fondo; usa la variable CSS --cb-spinner-track.'),
  animationDuration: unsupported('cb-spinner no expone la duración de la animación; usa la variable CSS --cb-spinner-duration.'),
  styleClass: styleClass(),
  style: unsupported('usa [size] para el tamaño; las demás propiedades se controlan con CSS.'),
};

export const progressspinner: ComponentMapping = {
  name: 'progressspinner',
  entry: '@caribeng/ui/spinner',
  symbol: 'CbSpinner',
  modules: {
    'primeng/progressspinner': { ProgressSpinnerModule: 'CbSpinner', ProgressSpinner: 'CbSpinner' },
  },
  elements: [
    {
      tag: 'p-progressspinner',
      to: 'cb-spinner',
      selfClosing: true,
      rules: spinnerRules,
      same: ['size', 'severity', 'ariaLabel'],
    },
  ],
};

// =============================================================================
// Skeleton
// `<p-skeleton width="100%" height="4rem" borderRadius="8px" shape="rectangle" />`
// → `<cb-skeleton width="100%" height="4rem" />`
// =============================================================================

const SKELETON_SHAPE: Readonly<Record<string, string>> = {
  rectangle: 'rect',
  circle: 'circle',
};

const skeletonRules: Record<string, AttrRule> = {
  shape: values('shape', SKELETON_SHAPE),
  borderRadius: unsupported('usa la variable CSS --cb-skeleton-radius o aplica border-radius directamente.'),
  animation: values('animation', { wave: 'wave', pulse: 'pulse', none: 'none', shimmer: 'wave' }),
  styleClass: styleClass(),
  style: unsupported('usa los inputs width/height o aplica estilos directamente al host.'),
};

export const skeleton: ComponentMapping = {
  name: 'skeleton',
  entry: '@caribeng/ui/skeleton',
  symbol: 'CbSkeleton',
  modules: {
    'primeng/skeleton': { SkeletonModule: 'CbSkeleton', Skeleton: 'CbSkeleton' },
  },
  elements: [
    {
      tag: 'p-skeleton',
      to: 'cb-skeleton',
      selfClosing: true,
      rules: skeletonRules,
      same: ['width', 'height'],
    },
  ],
};

// =============================================================================
// ScrollTop
// `<p-scrolltop [threshold]="200" />`
// → `<cb-scroll-top [threshold]="200" />`
//
// Nota: el selector CaribeNG es `cb-scroll-top` (con guión).
// =============================================================================

const scrolltopRules: Record<string, AttrRule> = {
  target: values('target', { window: 'window', parent: 'parent' }),
  behavior: values('behavior', { smooth: 'smooth', auto: 'auto' }),
  icon: iconName(),
  styleClass: styleClass(),
};

export const scrolltop: ComponentMapping = {
  name: 'scrolltop',
  entry: '@caribeng/ui/scrolltop',
  symbol: 'CbScrollTop',
  modules: {
    'primeng/scrolltop': { ScrollTopModule: 'CbScrollTop', ScrollTop: 'CbScrollTop' },
  },
  elements: [
    {
      tag: 'p-scrolltop',
      to: 'cb-scroll-top',
      selfClosing: true,
      rules: scrolltopRules,
      same: ['threshold', 'ariaLabel'],
    },
  ],
};

import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import type { CbSize } from '@caribeng/ui';
import { CbAccordion, CbAccordionPanel } from '@caribeng/ui/accordion';
import { CbButton } from '@caribeng/ui/button';
import { CbIcon } from '@caribeng/ui/icon';
import { CbIconField, CbInputIcon, type CbIconFieldPosition } from '@caribeng/ui/iconfield';
import { CbInput } from '@caribeng/ui/input';
import { CbMenu, type CbMenuItem } from '@caribeng/ui/menu';
import { CbPopover } from '@caribeng/ui/popover';
import { CbRadio, CbRadioGroup } from '@caribeng/ui/radio';
import { CbScrollTop, type CbScrollTopTarget } from '@caribeng/ui/scrolltop';
import { CbSplitter, CbSplitterPanel, type CbSplitterLayout } from '@caribeng/ui/splitter';
import { CbStep, CbStepper } from '@caribeng/ui/stepper';
import { CbTab, CbTabs } from '@caribeng/ui/tabs';
import { CbToast, CbToastService, type CbToastPosition } from '@caribeng/ui/toast';
import { I18nService } from '../services/i18n.service';

/*
 * Envoltorios para el playground (`DocApi.demo`) de componentes que no se ven
 * solos. Aceptan los mismos inputs que el componente y se los pasan tal cual.
 */

/** Popover: necesita un botón que lo abra con `toggle($event)`. */
@Component({
  selector: 'doc-pg-popover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbButton, CbPopover],
  template: `
    <cb-button (click)="op.toggle($event)">{{ i18n.t('Abrir popover', 'Open popover') }}</cb-button>
    <cb-popover #op [dismissable]="dismissable()" [ariaLabel]="ariaLabel()">
      <div style="max-width: 16rem"><ng-content /></div>
    </cb-popover>
  `,
})
export class DocPgPopover {
  protected readonly i18n = inject(I18nService);
  readonly dismissable = input(true);
  readonly ariaLabel = input('');
}

/**
 * Toast: botones que lanzan avisos. Tiene su propio `CbToastService` para no
 * duplicar los avisos con el `<cb-toast>` de los ejemplos de la página.
 */
@Component({
  selector: 'doc-pg-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbButton, CbToast],
  providers: [CbToastService],
  template: `
    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem">
      <cb-button severity="success" (click)="toast.success(i18n.t('Pago realizado', 'Payment sent'), i18n.t('Transferencia de $ 250.000 enviada.', 'Transfer of $250,000 sent.'))">Success</cb-button>
      <cb-button severity="info" (click)="toast.info(i18n.t('Nuevo mensaje', 'New message'), i18n.t('Tienes un extracto disponible.', 'A statement is available.'))">Info</cb-button>
      <cb-button severity="warning" (click)="toast.warn(i18n.t('Sesión por expirar', 'Session expiring'), i18n.t('Se cerrará en 2 minutos.', 'It will close in 2 minutes.'))">Warn</cb-button>
      <cb-button severity="danger" (click)="toast.error(i18n.t('Pago rechazado', 'Payment declined'), i18n.t('Fondos insuficientes.', 'Insufficient funds.'))">Error</cb-button>
    </div>
    <cb-toast [position]="position()" />
  `,
})
export class DocPgToast {
  protected readonly i18n = inject(I18nService);
  protected readonly toast = inject(CbToastService);
  readonly position = input<CbToastPosition>('top-right');
}

/** ScrollTop: un contenedor con scroll para probarlo con `target="parent"`. */
@Component({
  selector: 'doc-pg-scroll-top',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbScrollTop],
  template: `
    <div
      style="position: relative; width: 100%; height: 12rem; overflow: auto; padding: 1rem; border: 1px solid var(--cb-color-border); border-radius: var(--cb-radius-md)"
    >
      <p style="margin-top: 0">
        <strong>{{ i18n.t('Desplázate hacia abajo', 'Scroll down') }}</strong>
      </p>
      @for (n of paragraphs; track n) {
        <p>{{ i18n.t('Movimiento', 'Transaction') }} {{ n }} · {{ i18n.t('Compra en comercio', 'Store purchase') }} · $ {{ n * 12500 }}</p>
      }
      <cb-scroll-top [target]="target()" [threshold]="threshold()" [behavior]="behavior()" [icon]="icon()" [ariaLabel]="ariaLabel()" />
    </div>
  `,
})
export class DocPgScrollTop {
  protected readonly i18n = inject(I18nService);
  protected readonly paragraphs = Array.from({ length: 14 }, (_, i) => i + 1);
  readonly target = input<CbScrollTopTarget>('parent');
  readonly threshold = input(60);
  readonly behavior = input<ScrollBehavior>('smooth');
  readonly icon = input('chevron-up');
  readonly ariaLabel = input<string | undefined>(undefined);
}

/** Menu: es un popup, se abre con `toggle($event)` desde un botón. */
@Component({
  selector: 'doc-pg-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbButton, CbMenu],
  template: `
    <cb-button (click)="menu.toggle($event)">{{ i18n.t('Abrir menú', 'Open menu') }}</cb-button>
    <cb-menu #menu [items]="items()" [ariaLabel]="ariaLabel()" />
  `,
})
export class DocPgMenu {
  protected readonly i18n = inject(I18nService);
  readonly items = input<readonly CbMenuItem[]>([]);
  readonly ariaLabel = input<string | undefined>(undefined);
}

/*
 * Los siguientes padres registran a sus hijos por inyección o `contentChildren`,
 * así que los hijos van declarados en la plantilla (no se pueden crear aparte).
 * `DocApi.codeContent` muestra ese marcado en el código generado.
 */

@Component({
  selector: 'doc-pg-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbAccordion, CbAccordionPanel],
  template: `
    <cb-accordion style="width: 100%" [multiple]="multiple()">
      <cb-accordion-panel header="What is CaribeNG?">Accessible Angular components built on signals.</cb-accordion-panel>
      <cb-accordion-panel header="Does it support dark mode?">Yes, every component uses CSS tokens for both themes.</cb-accordion-panel>
      <cb-accordion-panel header="Is it accessible?">It follows WCAG 2.2 AA with full keyboard support.</cb-accordion-panel>
    </cb-accordion>
  `,
})
export class DocPgAccordion {
  readonly multiple = input(false);
}

@Component({
  selector: 'doc-pg-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbTabs, CbTab],
  template: `
    <cb-tabs style="width: 100%">
      <cb-tab label="Overview"><p style="margin: 0">Balance and recent activity.</p></cb-tab>
      <cb-tab label="Activity"><p style="margin: 0">Transfers and payments of the month.</p></cb-tab>
      <cb-tab label="Settings"><p style="margin: 0">Alerts and limits.</p></cb-tab>
    </cb-tabs>
  `,
})
export class DocPgTabs {}

@Component({
  selector: 'doc-pg-stepper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbStepper, CbStep],
  template: `
    <cb-stepper style="width: 100%" [showNav]="showNav()">
      <cb-step label="Account"><p style="margin: 0">Choose the source account.</p></cb-step>
      <cb-step label="Amount"><p style="margin: 0">Enter the amount to transfer.</p></cb-step>
      <cb-step label="Confirm"><p style="margin: 0">Review and confirm the transfer.</p></cb-step>
    </cb-stepper>
  `,
})
export class DocPgStepper {
  readonly showNav = input(true);
}

@Component({
  selector: 'doc-pg-splitter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbSplitter, CbSplitterPanel],
  template: `
    <cb-splitter style="width: 100%; height: 180px" [layout]="layout()" [gutterSize]="gutterSize()" [step]="step()">
      <cb-splitter-panel [size]="35" [minSize]="15"><div style="padding: 1rem">Left panel</div></cb-splitter-panel>
      <cb-splitter-panel [size]="65" [minSize]="20"><div style="padding: 1rem">Right panel</div></cb-splitter-panel>
    </cb-splitter>
  `,
})
export class DocPgSplitter {
  readonly layout = input<CbSplitterLayout>('horizontal');
  readonly gutterSize = input(8);
  readonly step = input(5);
}

@Component({
  selector: 'doc-pg-radio-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbRadioGroup, CbRadio],
  template: `
    <cb-radio-group
      [ariaLabel]="ariaLabel()"
      [size]="size()"
      [orientation]="orientation()"
      [disabled]="disabled()"
      [invalid]="invalid()"
    >
      <cb-radio value="free" label="Free" />
      <cb-radio value="pro" label="Pro" />
      <cb-radio value="team" label="Team" />
    </cb-radio-group>
  `,
})
export class DocPgRadioGroup {
  /** Se acepta para que el playground pueda pasarlo; el grupo genera su propio nombre. */
  readonly name = input<string | undefined>(undefined);
  readonly ariaLabel = input('Plan');
  readonly size = input<CbSize>('md');
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  readonly disabled = input(false);
  readonly invalid = input(false);
}

/** IconField: el icono va dentro de `<cb-input-icon>`. */
@Component({
  selector: 'doc-pg-icon-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbIconField, CbInputIcon, CbIcon, CbInput],
  template: `
    <cb-icon-field [iconPosition]="iconPosition()">
      <cb-input-icon><cb-icon name="search" [size]="15" /></cb-input-icon>
      <cb-input placeholder="Search…" />
    </cb-icon-field>
  `,
})
export class DocPgIconField {
  readonly iconPosition = input<CbIconFieldPosition>('left');
}

/** Radio: necesita un `<cb-radio-group>` padre. */
@Component({
  selector: 'doc-pg-radio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbRadioGroup, CbRadio],
  template: `
    <cb-radio-group ariaLabel="Plan">
      <cb-radio [value]="value() ?? 'pro'" [label]="label()" [ariaLabel]="ariaLabel()" [disabled]="disabled()" />
    </cb-radio-group>
  `,
})
export class DocPgRadio {
  readonly value = input<unknown>('pro');
  /** Se acepta para que el playground pueda pasarlo; el radio genera su propio id. */
  readonly inputId = input<string | undefined>(undefined);
  readonly label = input('');
  readonly ariaLabel = input('');
  readonly disabled = input(false);
}

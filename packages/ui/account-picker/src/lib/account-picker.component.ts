import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { OverlayModule, type ConnectedPosition } from '@angular/cdk/overlay';
import { cbFieldState, cbFormat, injectCbTranslation, type CbRequiredIndicator, type CbSize } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';
import { accountLabel, accountPath, resolveAccounts, searchAccounts, type CbAccount, type CbResolvedAccount } from './account-model';

let nextUid = 0;

/**
 * Selector de cuenta contable de CaribeNG: busca en el plan de cuentas (PUC) por
 * código o por nombre y muestra la ruta de cada cuenta («1 Activo › 11 Disponible»).
 *
 * - Por defecto solo deja elegir cuentas de movimiento (las que no tienen hijas);
 *   las cuentas mayores aparecen como contexto, sin poder elegirse.
 * - Escribir el código completo y salir del campo la elige; Enter elige la resaltada.
 * - Funciona con Angular Forms (`formControlName`) o con `[(value)]`; el valor es el código.
 *
 * @example
 * ```html
 * <cb-account-picker label="Cuenta" [accounts]="puc" formControlName="cuenta" />
 * ```
 */
@Component({
  selector: 'cb-account-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [OverlayModule, CbIcon],
  host: { class: 'cb-account-picker-host' },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CbAccountPicker), multi: true }],
  template: `
    @if (label()) {
      <label class="cb-ap__label" [attr.for]="inputId()">
        {{ label() }}
        @if (fieldState.indicator(); as mark) {
          <span [class]="'cb-ap__required cb-ap__required--' + mark.kind" [attr.aria-hidden]="mark.kind === 'optional' ? null : 'true'">{{ mark.text }}</span>
        }
      </label>
    }
    <div
      #trigger
      class="cb-ap"
      [class]="'cb-ap--' + size()"
      [class.cb-is-open]="open()"
      [class.cb-is-invalid]="fieldState.invalid()"
      [class.cb-is-disabled]="isDisabled()"
    >
      <cb-icon class="cb-ap__icon" name="search" [size]="16" aria-hidden="true" />
      <input
        #field
        class="cb-ap__field"
        type="text"
        role="combobox"
        autocomplete="off"
        aria-autocomplete="list"
        [id]="inputId()"
        [attr.aria-expanded]="open()"
        [attr.aria-controls]="uid + '-list'"
        [attr.aria-activedescendant]="open() && active() >= 0 ? uid + '-opt-' + active() : null"
        [attr.aria-invalid]="fieldState.invalid() ? 'true' : null"
        [attr.aria-describedby]="describedBy()"
        [attr.aria-required]="fieldState.required() || null"
        [value]="query()"
        [placeholder]="placeholder() ?? t().accountPickerPlaceholder"
        [disabled]="isDisabled()"
        (input)="onInput($event)"
        (focus)="onFocus($event)"
        (blur)="onBlur()"
        (keydown)="onKeydown($event)"
      />
      @if (value() && !isDisabled()) {
        <button type="button" class="cb-ap__clear" tabindex="-1" [attr.aria-label]="t().clear" (mousedown)="$event.preventDefault()" (click)="clear()">
          <cb-icon name="x" [size]="14" aria-hidden="true" />
        </button>
      }
    </div>
    @if (showPath() && selected(); as acc) {
      @if (acc.ancestors.length) {
        <p class="cb-ap__path">{{ path(acc) }}</p>
      }
    }

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="trigger"
      [cdkConnectedOverlayOpen]="open()"
      [cdkConnectedOverlayWidth]="width()"
      [cdkConnectedOverlayPositions]="positions"
      (overlayOutsideClick)="open.set(false)"
      (detach)="open.set(false)"
    >
      <ul class="cb-ap__list" role="listbox" [id]="uid + '-list'" [attr.aria-label]="label() || t().accountPickerPlaceholder">
        @for (acc of results(); track acc.code; let i = $index) {
          <li
            class="cb-ap__option"
            role="option"
            [id]="uid + '-opt-' + i"
            [class.cb-ap__option--active]="i === active()"
            [class.cb-ap__option--group]="!selectable(acc)"
            [class.cb-ap__option--selected]="acc.code === value()"
            [style.padding-inline-start]="'calc(0.6rem + ' + indent(acc) + ' * 0.75rem)'"
            [attr.aria-selected]="acc.code === value()"
            [attr.aria-disabled]="!selectable(acc) || null"
            (mousedown)="$event.preventDefault()"
            (mouseenter)="active.set(i)"
            (click)="choose(acc)"
          >
            <span class="cb-ap__code">{{ acc.code }}</span>
            <span class="cb-ap__name">{{ acc.name }}</span>
            @if (showPath() && isSearching() && acc.ancestors.length) {
              <span class="cb-ap__opt-path">{{ path(acc) }}</span>
            }
          </li>
        } @empty {
          <li class="cb-ap__option cb-ap__option--empty" role="option" aria-disabled="true">{{ t().noResults }}</li>
        }
      </ul>
    </ng-template>

    @if (fieldState.invalid() && error()) {
      <p class="cb-ap__message cb-ap__message--error" [id]="inputId() + '-error'" role="alert">{{ error() }}</p>
    } @else if (hint()) {
      <p class="cb-ap__message" [id]="inputId() + '-hint'">{{ hint() }}</p>
    }
    <span class="cb-ap__sr" role="status">{{ open() ? fmt(t().accountPickerResults, results().length) : '' }}</span>
  `,
  styleUrl: './account-picker.component.css',
})
export class CbAccountPicker implements ControlValueAccessor {
  protected readonly t = injectCbTranslation();
  protected readonly fmt = cbFormat;
  protected readonly uid = `cb-account-picker-${++nextUid}`;

  /** Código de la cuenta elegida. */
  readonly value = model<string | null>(null);
  /** Plan de cuentas (lista plana; la jerarquía se deduce de `parent` o del código). */
  readonly accounts = input<readonly CbAccount[]>([]);
  /** Deja elegir también cuentas mayores (con hijas). */
  readonly allowParents = input<boolean, unknown>(false, { transform: booleanAttribute });
  /** Muestra la ruta de la cuenta bajo el campo y en los resultados. */
  readonly showPath = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly label = input<string>('');
  readonly hint = input<string>('');
  readonly error = input<string>('');
  readonly placeholder = input<string | undefined>(undefined);
  readonly size = input<CbSize>('md');
  readonly invalid = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly required = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly requiredIndicator = input<CbRequiredIndicator | undefined>(undefined);
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly inputId = input<string>(`cb-account-picker-input-${nextUid}`);
  /** Máximo de resultados en la lista. */
  readonly limit = input<number>(50);

  /** La cuenta elegida (o `null` al limpiar). */
  readonly accountChange = output<CbAccount | null>();

  protected readonly fieldState = cbFieldState({
    invalid: () => this.invalid(),
    required: () => this.required(),
    requiredIndicator: () => this.requiredIndicator(),
  });

  protected readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
  ];

  protected readonly open = signal(false);
  /** Texto que se está buscando (`null`: el campo muestra la cuenta elegida). */
  private readonly search = signal<string | null>(null);
  protected readonly active = signal(-1);
  protected readonly width = signal(0);
  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  private readonly trigger = viewChild.required<ElementRef<HTMLElement>>('trigger');
  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

  protected readonly resolved = computed(() => resolveAccounts(this.accounts()));
  private readonly byCode = computed(() => new Map(this.resolved().map((a) => [a.code, a])));
  protected readonly selected = computed(() => {
    const code = this.value();
    return code ? (this.byCode().get(code) ?? null) : null;
  });
  protected readonly query = computed(() => {
    const search = this.search();
    if (search !== null) return search;
    const acc = this.selected();
    return acc ? accountLabel(acc) : (this.value() ?? '');
  });
  protected readonly results = computed(() => searchAccounts(this.resolved(), this.search() ?? '', this.limit()));

  protected readonly isSearching = computed(() => !!this.search());
  protected readonly describedBy = computed(() => {
    if (this.fieldState.invalid() && this.error()) return `${this.inputId()}-error`;
    return this.hint() ? `${this.inputId()}-hint` : null;
  });

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  // --- ControlValueAccessor ----------------------------------------------------------------
  writeValue(value: string | null): void {
    this.value.set(value ?? null);
    this.search.set(null);
  }
  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.cvaDisabled.set(disabled);
  }

  // --- Plantilla ---------------------------------------------------------------------------
  protected path(acc: CbResolvedAccount): string {
    return accountPath(acc);
  }

  protected indent(acc: CbResolvedAccount): number {
    // Sin búsqueda se ve el árbol con sangría; al buscar, plano.
    return this.search() ? 0 : acc.level - 1;
  }

  protected selectable(acc: CbResolvedAccount): boolean {
    return !acc.disabled && (acc.postable || this.allowParents());
  }

  protected onFocus(event: FocusEvent): void {
    (event.target as HTMLInputElement).select();
  }

  protected onInput(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
    this.openList();
    this.active.set(this.results().findIndex((a) => this.selectable(a)));
  }

  protected onBlur(): void {
    const search = this.search();
    if (search !== null) {
      const q = search.trim();
      if (!q) this.setValue(null);
      else {
        // El código exacto (o la etiqueta completa) elige la cuenta; si no, se vuelve a la anterior.
        const exact = this.resolved().find((a) => (a.code === q || accountLabel(a).toLowerCase() === q.toLowerCase()) && this.selectable(a));
        if (exact) this.setValue(exact.code);
      }
    }
    this.search.set(null);
    this.open.set(false);
    this.onTouched();
  }

  protected onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        if (!this.open()) {
          this.openList();
          const current = this.results().findIndex((a) => a.code === this.value());
          this.active.set(current >= 0 ? current : this.results().findIndex((a) => this.selectable(a)));
          return;
        }
        this.move(event.key === 'ArrowDown' ? 1 : -1);
        break;
      }
      case 'Enter': {
        const acc = this.results()[this.active()];
        if (this.open() && acc && this.selectable(acc)) {
          event.preventDefault();
          this.choose(acc);
        }
        break;
      }
      case 'Escape':
        if (this.open()) {
          event.preventDefault();
          this.open.set(false);
          this.search.set(null);
        }
        break;
      case 'Tab': {
        // Tab con la lista abierta y una búsqueda elige la resaltada (como en un comprobante).
        const acc = this.results()[this.active()];
        if (this.open() && this.search()?.trim() && acc && this.selectable(acc)) this.choose(acc, false);
        break;
      }
    }
  }

  protected choose(acc: CbResolvedAccount, refocus = true): void {
    if (!this.selectable(acc)) return;
    this.setValue(acc.code);
    this.search.set(null);
    this.open.set(false);
    if (refocus) queueMicrotask(() => this.field().nativeElement.focus());
  }

  /** Quita la cuenta elegida. */
  clear(): void {
    this.setValue(null);
    this.search.set(null);
    this.field().nativeElement.focus();
  }

  private openList(): void {
    this.width.set(this.trigger().nativeElement.offsetWidth);
    this.open.set(true);
  }

  private move(step: number): void {
    const list = this.results();
    if (!list.length) return;
    let i = this.active();
    for (let n = 0; n < list.length; n++) {
      i = (i + step + list.length) % list.length;
      if (this.selectable(list[i])) break;
    }
    this.active.set(i);
    this.trigger().nativeElement.ownerDocument.getElementById(`${this.uid}-opt-${i}`)?.scrollIntoView?.({ block: 'nearest' });
  }

  private setValue(code: string | null): void {
    if (code === this.value()) return;
    this.value.set(code);
    this.onChange(code);
    this.accountChange.emit(code ? (this.byCode().get(code) ?? null) : null);
  }
}

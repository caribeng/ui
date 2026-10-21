import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  Injector,
  TemplateRef,
  ViewEncapsulation,
  afterNextRender,
  computed,
  contentChild,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { AbstractControl, FormArray } from '@angular/forms';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';
import { CbButton } from '@caribeng/ui/button';
import { CbIcon } from '@caribeng/ui/icon';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- como en Angular Forms, el control llega sin tipar.
export interface CbRepeaterItemContext<T extends AbstractControl = any> {
  /** Control del elemento (normalmente un FormGroup). */
  $implicit: T;
  index: number;
  /** Nombre del elemento ("Beneficiario 2"). */
  label: string;
}

/** Plantilla de cada elemento: `<ng-template cbRepeaterItem let-grupo let-i="index">`. */
@Directive({
  selector: 'ng-template[cbRepeaterItem]',
  standalone: true,
})
export class CbRepeaterItem {
  readonly template = inject<TemplateRef<CbRepeaterItemContext>>(TemplateRef);

  static ngTemplateContextGuard(_dir: CbRepeaterItem, ctx: unknown): ctx is CbRepeaterItemContext {
    return true;
  }
}

/**
 * Repeater de CaribeNG: lista repetible de campos sobre un `FormArray`
 * ("Agregar beneficiario"). Cada elemento es un grupo nombrado con su botón de
 * quitar; respeta `min` y `max`, mueve el foco al agregar y quitar, y anuncia
 * los cambios al lector de pantalla.
 *
 * @example
 * ```html
 * <cb-repeater [formArray]="beneficiarios" [createItem]="nuevoBeneficiario" itemLabel="Beneficiario" [max]="5">
 *   <ng-template cbRepeaterItem let-grupo>
 *     <ng-container [formGroup]="grupo">
 *       <cb-input label="Nombre" formControlName="nombre" />
 *     </ng-container>
 *   </ng-template>
 * </cb-repeater>
 * ```
 */
@Component({
  selector: 'cb-repeater',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [NgTemplateOutlet, CbButton, CbIcon],
  host: { class: 'cb-repeater' },
  template: `
    @for (control of controls(); track control; let i = $index) {
      <div class="cb-repeater__item" role="group" [attr.aria-label]="labelFor(i)" [attr.data-index]="i">
        <div class="cb-repeater__head">
          <span class="cb-repeater__title">{{ labelFor(i) }}</span>
          <cb-button
            class="cb-repeater__remove"
            variant="text"
            severity="secondary"
            size="sm"
            [disabled]="controls().length <= min() || disabled()"
            [ariaLabel]="fmt(t().removeItem, labelFor(i))"
            (click)="remove(i)"
          >
            <cb-icon name="trash" [size]="15" aria-hidden="true" />
          </cb-button>
        </div>
        @if (itemTemplate(); as tpl) {
          <div class="cb-repeater__body">
            <ng-container [ngTemplateOutlet]="tpl.template" [ngTemplateOutletContext]="{ $implicit: control, index: i, label: labelFor(i) }" />
          </div>
        }
      </div>
    }
    <cb-button
      class="cb-repeater__add"
      variant="outlined"
      size="sm"
      [disabled]="!canAdd()"
      (click)="add()"
    >
      <cb-icon name="plus" [size]="15" aria-hidden="true" />
      {{ addText() }}
    </cb-button>
    <span class="cb-repeater__sr" aria-live="polite">{{ announcement() }}</span>
  `,
  styleUrl: './repeater.component.css',
})
export class CbRepeater {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  /** Rellena `{0}`, `{1}`… de un texto traducido. */
  protected readonly fmt = cbFormat;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  protected readonly itemTemplate = contentChild(CbRepeaterItem);

  /** FormArray con un control por elemento. */
  readonly formArray = input.required<FormArray>();
  /** Crea el control de un elemento nuevo (p. ej. `() => fb.group({ nombre: [''] })`). */
  readonly createItem = input.required<() => AbstractControl>();
  /** Nombre de cada elemento ("Beneficiario" → "Beneficiario 1", "Beneficiario 2"…). Por defecto, "Elemento" del idioma activo. */
  readonly itemLabel = input<string | undefined>(undefined);
  /** Texto del botón de agregar. Por defecto, "Agregar beneficiario". */
  readonly addLabel = input<string | undefined>(undefined);
  /** Mínimo de elementos (no se puede quitar por debajo). */
  readonly min = input<number>(0);
  /** Máximo de elementos (el botón de agregar se deshabilita). */
  readonly max = input<number>(Number.POSITIVE_INFINITY);
  readonly disabled = input<boolean>(false);

  readonly itemAdd = output<number>();
  readonly itemRemove = output<number>();

  /** Controles del FormArray (se actualiza también si el FormArray cambia desde fuera). */
  protected readonly controls = signal<readonly AbstractControl[]>([]);
  protected readonly announcement = signal('');
  protected readonly canAdd = computed(() => !this.disabled() && this.controls().length < this.max());
  protected readonly addText = computed(() => {
    const label = this.itemLabel();
    return this.addLabel() ?? (label ? `${this.t().add} ${label.toLocaleLowerCase()}` : this.t().add);
  });

  constructor() {
    effect((onCleanup) => {
      const array = this.formArray();
      const sync = () => this.controls.set([...array.controls]);
      sync();
      const sub = array.valueChanges.subscribe(sync);
      onCleanup(() => sub.unsubscribe());
    });
  }

  protected labelFor(index: number): string {
    const label = this.itemLabel();
    return label ? `${label} ${index + 1}` : cbFormat(this.t().chartItem, index + 1);
  }

  /** Agrega un elemento al final y lleva el foco a su primer campo. */
  add(): void {
    if (!this.canAdd()) return;
    const array = this.formArray();
    array.push(this.createItem()());
    array.markAsDirty();
    const index = array.length - 1;
    this.controls.set([...array.controls]);
    this.announcement.set(cbFormat(this.t().itemAdded, this.labelFor(index)));
    this.itemAdd.emit(index);
    this.focusAfterRender(() => {
      const item = this.host.nativeElement.querySelector(`.cb-repeater__item[data-index="${index}"]`);
      return item?.querySelector<HTMLElement>('.cb-repeater__body :is(input, select, textarea, button, [tabindex]:not([tabindex="-1"]))') ?? null;
    });
  }

  /** Quita un elemento y deja el foco en el anterior (o en el botón de agregar). */
  remove(index: number): void {
    const array = this.formArray();
    if (array.length <= this.min() || this.disabled()) return;
    const label = this.labelFor(index);
    array.removeAt(index);
    array.markAsDirty();
    this.controls.set([...array.controls]);
    this.announcement.set(cbFormat(this.t().itemRemoved, label));
    this.itemRemove.emit(index);
    // El foco pasa al botón de quitar del elemento anterior (o del nuevo primero); si no queda ninguno, a "Agregar".
    this.focusAfterRender(() => {
      const next = array.length ? Math.max(0, index - 1) : -1;
      const item = next >= 0 ? this.host.nativeElement.querySelector(`.cb-repeater__item[data-index="${next}"]`) : null;
      const remove = item?.querySelector<HTMLElement>('.cb-repeater__remove button:not(:disabled)');
      return remove ?? this.host.nativeElement.querySelector<HTMLElement>('.cb-repeater__add button');
    });
  }

  private focusAfterRender(find: () => HTMLElement | null): void {
    afterNextRender(() => find()?.focus(), { injector: this.injector });
  }
}

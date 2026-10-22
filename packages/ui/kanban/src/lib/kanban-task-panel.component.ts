import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';
import { CbDatepicker } from '@caribeng/ui/datepicker';
import { CbIcon } from '@caribeng/ui/icon';
import { CbMultiSelect } from '@caribeng/ui/multiselect';
import { CbSelect } from '@caribeng/ui/select';
import type { CbKanbanColumn } from './kanban.component';
import {
  formatSize,
  initials,
  newId,
  toDate,
  toIsoDay,
  type CbKanbanAttachment,
  type CbKanbanPerson,
  type CbKanbanPriority,
  type CbKanbanTaskPatch,
} from './kanban-task';

let nextUid = 0;

/**
 * Detalle de una tarea del Kanban: título, columna, responsables, prioridad,
 * fechas de inicio y fin, descripción y adjuntos. Cada cambio se aplica al
 * momento (`patch`); el Kanban lo muestra dentro de un panel lateral.
 */
@Component({
  selector: 'cb-kanban-task-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbDatepicker, CbIcon, CbMultiSelect, CbSelect],
  host: { class: 'cb-kanban-task-panel' },
  template: `
    <textarea
      class="cb-ktp__title"
      rows="2"
      [value]="title()"
      [disabled]="!editable()"
      [attr.aria-label]="t().kanbanCardTitle"
      [placeholder]="t().kanbanCardTitle"
      (keydown.enter)="$event.preventDefault(); $any($event.target).blur()"
      (blur)="commitTitle($any($event.target))"
    ></textarea>

    <div class="cb-ktp__fields">
      <span class="cb-ktp__label" [id]="uid + '-column'">{{ t().kanbanStatus }}</span>
      <cb-select
        [options]="columns()"
        optionLabel="title"
        optionValue="id"
        size="sm"
        [value]="columnId()"
        [disabled]="!editable()"
        [ariaLabelledBy]="uid + '-column'"
        (valueChange)="onColumn($event)"
      />

      <span class="cb-ktp__label" [id]="uid + '-assignees'">{{ t().kanbanAssignees }}</span>
      <div class="cb-ktp__assignees">
        <cb-multiselect
          [options]="people()"
          optionLabel="name"
          optionValue="id"
          size="sm"
          filter
          [maxSelectedLabels]="2"
          [placeholder]="t().kanbanNoAssignees"
          [value]="assigneeIds()"
          [disabled]="!editable()"
          [ariaLabelledBy]="uid + '-assignees'"
          (valueChange)="patch.emit({ assignees: $any($event) })"
        />
        @if (assigned().length) {
          <ul class="cb-ktp__people" [attr.aria-label]="t().kanbanAssignees">
            @for (person of assigned(); track person.id) {
              <li class="cb-ktp__person">
                <span class="cb-ktp__avatar" aria-hidden="true">
                  @if (person.image) {
                    <img [src]="person.image" alt="" />
                  } @else {
                    {{ initialsOf(person.name) }}
                  }
                </span>
                <span class="cb-ktp__person-name">{{ person.name }}</span>
                @if (editable()) {
                  <button type="button" class="cb-ktp__icon-btn" [attr.aria-label]="fmt(t().kanbanUnassign, person.name)" (click)="unassign(person.id)">
                    <cb-icon name="x" [size]="14" aria-hidden="true" />
                  </button>
                }
              </li>
            }
          </ul>
        }
      </div>

      <span class="cb-ktp__label" [id]="uid + '-priority'">{{ t().kanbanPriority }}</span>
      <cb-select
        [options]="priorities()"
        optionLabel="label"
        optionValue="id"
        size="sm"
        showClear
        [placeholder]="t().kanbanNoPriority"
        [value]="priorityId()"
        [disabled]="!editable()"
        [ariaLabelledBy]="uid + '-priority'"
        (valueChange)="patch.emit({ priority: $any($event) ?? null })"
      />

      <label class="cb-ktp__label" [for]="uid + '-start'">{{ t().kanbanStartDate }}</label>
      <cb-datepicker
        [inputId]="uid + '-start'"
        size="sm"
        [value]="start()"
        [maxDate]="end()"
        [disabled]="!editable()"
        (valueChange)="patch.emit({ startDate: iso($event) })"
      />

      <label class="cb-ktp__label" [for]="uid + '-end'">{{ t().kanbanEndDate }}</label>
      <cb-datepicker
        [inputId]="uid + '-end'"
        size="sm"
        [value]="end()"
        [minDate]="start()"
        [disabled]="!editable()"
        (valueChange)="patch.emit({ endDate: iso($event) })"
      />
    </div>

    <section class="cb-ktp__section">
      <label class="cb-ktp__heading" [for]="uid + '-description'">{{ t().kanbanDescription }}</label>
      <textarea
        class="cb-ktp__textarea"
        rows="5"
        [id]="uid + '-description'"
        [value]="description()"
        [disabled]="!editable()"
        [placeholder]="t().kanbanDescriptionPlaceholder"
        (blur)="commitDescription($any($event.target).value)"
      ></textarea>
    </section>

    <section class="cb-ktp__section" [attr.aria-labelledby]="uid + '-attachments'">
      <h3 class="cb-ktp__heading" [id]="uid + '-attachments'">
        {{ t().kanbanAttachments }}
        @if (attachments().length) {
          <span class="cb-ktp__badge">{{ attachments().length }}</span>
        }
      </h3>
      @if (attachments().length) {
        <ul class="cb-ktp__files">
          @for (file of attachments(); track file.id) {
            <li class="cb-ktp__file">
              <cb-icon name="file" [size]="18" aria-hidden="true" />
              <span class="cb-ktp__file-info">
                @if (file.url) {
                  <a class="cb-ktp__file-name" [href]="file.url" target="_blank" rel="noopener" [attr.download]="file.file ? file.name : null">{{ file.name }}</a>
                } @else {
                  <span class="cb-ktp__file-name">{{ file.name }}</span>
                }
                @if (file.size !== undefined) {
                  <span class="cb-ktp__file-size">{{ size(file.size) }}</span>
                }
              </span>
              @if (editable()) {
                <button type="button" class="cb-ktp__icon-btn" [attr.aria-label]="fmt(t().kanbanRemoveAttachment, file.name)" (click)="removeAttachment(file)">
                  <cb-icon name="x" [size]="14" aria-hidden="true" />
                </button>
              }
            </li>
          }
        </ul>
      }
      @if (editable()) {
        <div
          class="cb-ktp__drop"
          [class.cb-ktp__drop--over]="dragOver()"
          (dragover)="onDragOver($event)"
          (dragleave)="dragOver.set(false)"
          (drop)="onDrop($event)"
        >
          <button type="button" class="cb-ktp__btn" (click)="fileInput.click()">
            <cb-icon name="upload" [size]="16" aria-hidden="true" />
            {{ t().kanbanAttach }}
          </button>
          <span class="cb-ktp__hint">{{ t().kanbanDropFiles }}</span>
          <input #fileInput type="file" multiple hidden [attr.accept]="accept() || null" (change)="addFiles(fileInput.files); fileInput.value = ''" />
        </div>
      }
    </section>

    @if (editable()) {
      <footer class="cb-ktp__footer">
        @if (confirming()) {
          <p class="cb-ktp__confirm-text">{{ fmt(t().kanbanConfirmDelete, title()) }}</p>
          <button type="button" class="cb-ktp__btn" data-confirm-cancel (click)="confirming.set(false)">{{ t().cancel }}</button>
          <button type="button" class="cb-ktp__btn cb-ktp__btn--danger" (click)="remove.emit()">{{ t().kanbanDelete }}</button>
        } @else {
          <button type="button" class="cb-ktp__btn cb-ktp__btn--danger-ghost" (click)="requestRemove()">
            <cb-icon name="trash" [size]="16" aria-hidden="true" />
            {{ t().kanbanDelete }}
          </button>
        }
      </footer>
    }
  `,
  styleUrl: './kanban-task-panel.component.css',
})
export class CbKanbanTaskPanel {
  protected readonly t = injectCbTranslation();
  protected readonly fmt = cbFormat;
  protected readonly uid = `cb-ktp-${++nextUid}`;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  /** La tarea que se edita. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- la tarea es del tipo del consumidor.
  readonly task = input.required<any>();
  /** Propiedad con el título. */
  readonly itemLabel = input<string>('title');
  /** Columnas del tablero (para moverla). */
  readonly columns = input<readonly CbKanbanColumn[]>([]);
  /** Columna en la que está. */
  readonly columnId = input<string>('');
  readonly people = input<readonly CbKanbanPerson[]>([]);
  readonly priorities = input<readonly CbKanbanPriority[]>([]);
  readonly editable = input(true, { transform: booleanAttribute });
  /** Tipos de archivo admitidos (atributo `accept`). */
  readonly accept = input<string>('');
  /** Pide confirmación antes de eliminar. */
  readonly confirmDelete = input(true, { transform: booleanAttribute });

  /** Campos cambiados. */
  readonly patch = output<CbKanbanTaskPatch>();
  /** Mover a otra columna (id). */
  readonly move = output<string>();
  /** Eliminar la tarea (ya confirmado). */
  readonly remove = output<void>();

  protected readonly dragOver = signal(false);
  protected readonly confirming = signal(false);

  protected readonly title = computed(() => String(this.field(this.itemLabel()) ?? ''));
  protected readonly description = computed(() => String(this.field('description') ?? ''));
  protected readonly assigneeIds = computed(() => (this.field('assignees') as string[] | undefined) ?? []);
  protected readonly assigned = computed(() => {
    const ids = this.assigneeIds();
    return this.people().filter((p) => ids.includes(p.id));
  });
  protected readonly priorityId = computed(() => (this.field('priority') as string | null | undefined) ?? null);
  protected readonly start = computed(() => toDate(this.field('startDate')));
  protected readonly end = computed(() => toDate(this.field('endDate')));
  protected readonly attachments = computed(() => (this.field('attachments') as readonly CbKanbanAttachment[] | undefined) ?? []);

  private field(name: string): unknown {
    const task = this.task();
    return task && typeof task === 'object' ? (task as Record<string, unknown>)[name] : undefined;
  }

  protected initialsOf = initials;
  protected iso = (date: Date | null) => toIsoDay(date);
  protected size = (bytes: number) => formatSize(bytes, this.t().intlLocale);

  protected commitTitle(field: HTMLTextAreaElement): void {
    const title = field.value.trim();
    if (!title) {
      field.value = this.title();
      return;
    }
    if (title !== this.title()) this.patch.emit({ [this.itemLabel()]: title });
  }

  protected commitDescription(value: string): void {
    if (value !== this.description()) this.patch.emit({ description: value });
  }

  protected onColumn(id: unknown): void {
    if (typeof id === 'string' && id && id !== this.columnId()) this.move.emit(id);
  }

  protected unassign(id: string): void {
    this.patch.emit({ assignees: this.assigneeIds().filter((a) => a !== id) });
  }

  // --- Adjuntos ---------------------------------------------------------------------
  protected onDragOver(event: DragEvent): void {
    if (!event.dataTransfer?.types.includes('Files')) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    this.dragOver.set(true);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    this.addFiles(event.dataTransfer?.files ?? null);
  }

  /** Añade archivos como adjuntos (con `file` para subirlos y una `url` local para verlos). */
  addFiles(list: FileList | readonly File[] | null): void {
    const files = list ? Array.from(list) : [];
    if (!files.length) return;
    const added: CbKanbanAttachment[] = files.map((file) => ({
      id: newId(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : undefined,
      file,
    }));
    this.patch.emit({ attachments: [...this.attachments(), ...added] });
  }

  protected removeAttachment(file: CbKanbanAttachment): void {
    // La URL local de un archivo recién añadido se libera al quitarlo.
    if (file.file && file.url?.startsWith('blob:')) URL.revokeObjectURL(file.url);
    this.patch.emit({ attachments: this.attachments().filter((a) => a.id !== file.id) });
  }

  protected requestRemove(): void {
    if (!this.confirmDelete()) return this.remove.emit();
    this.confirming.set(true);
    afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>('[data-confirm-cancel]')?.focus(), { injector: this.injector });
  }
}

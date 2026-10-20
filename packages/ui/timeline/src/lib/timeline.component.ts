import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  ViewEncapsulation,
  contentChild,
  inject,
  input,
} from '@angular/core';
import { injectCbTranslation } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';

export interface CbTimelineEvent {
  title: string;
  /** Fecha o momento, tal como se muestra (p. ej. "Hoy, 10:30"). */
  date?: string;
  /** Fecha legible por máquina para `<time datetime>` (p. ej. "2026-10-20T10:30"). */
  datetime?: string;
  description?: string;
  /** Icono dentro del marcador (nombre del set de iconos). */
  icon?: string;
  /** Color del marcador (cualquier color CSS). */
  color?: string;
}

export type CbTimelineAlign = 'left' | 'right' | 'alternate';

/** Contexto de las plantillas `let-event let-index="index"`. */
export interface CbTimelineContext {
  $implicit: CbTimelineEvent;
  index: number;
}

/** Plantilla del contenido de cada evento. */
@Directive({ selector: 'ng-template[cbTimelineContent]' })
export class CbTimelineContentTemplate {
  readonly template = inject<TemplateRef<CbTimelineContext>>(TemplateRef);

  static ngTemplateContextGuard(_dir: CbTimelineContentTemplate, ctx: unknown): ctx is CbTimelineContext {
    return true;
  }
}

/** Plantilla del lado opuesto al contenido (p. ej. la fecha). */
@Directive({ selector: 'ng-template[cbTimelineOpposite]' })
export class CbTimelineOppositeTemplate {
  readonly template = inject<TemplateRef<CbTimelineContext>>(TemplateRef);

  static ngTemplateContextGuard(_dir: CbTimelineOppositeTemplate, ctx: unknown): ctx is CbTimelineContext {
    return true;
  }
}

/** Plantilla del marcador de cada evento. */
@Directive({ selector: 'ng-template[cbTimelineMarker]' })
export class CbTimelineMarkerTemplate {
  readonly template = inject<TemplateRef<CbTimelineContext>>(TemplateRef);

  static ngTemplateContextGuard(_dir: CbTimelineMarkerTemplate, ctx: unknown): ctx is CbTimelineContext {
    return true;
  }
}

/**
 * Línea de tiempo de CaribeNG: eventos en vertical u horizontal, alineados a
 * un lado o alternados, con plantillas para el contenido, el lado opuesto y
 * el marcador.
 *
 * @example
 * ```html
 * <cb-timeline [value]="eventos" align="alternate" />
 *
 * <cb-timeline [value]="eventos">
 *   <ng-template cbTimelineContent let-evento>{{ evento.title }}</ng-template>
 * </cb-timeline>
 * ```
 */
@Component({
  selector: 'cb-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [NgTemplateOutlet, CbIcon],
  host: { class: 'cb-timeline-host' },
  template: `
    <ol
      class="cb-timeline"
      [class]="'cb-timeline cb-timeline--' + orientation() + ' cb-timeline--' + align()"
      [attr.aria-label]="ariaLabel() ?? t().timeline"
    >
      @for (event of value(); track $index; let i = $index; let last = $last) {
        <li class="cb-timeline__event" [class.cb-timeline__event--alt]="align() === 'alternate' && i % 2 === 1">
          <div class="cb-timeline__opposite">
            @if (oppositeTemplate(); as tpl) {
              <ng-container *ngTemplateOutlet="tpl.template; context: { $implicit: event, index: i }" />
            }
          </div>
          <div class="cb-timeline__separator" aria-hidden="true">
            @if (markerTemplate(); as tpl) {
              <ng-container *ngTemplateOutlet="tpl.template; context: { $implicit: event, index: i }" />
            } @else {
              <span
                class="cb-timeline__marker"
                [class.cb-timeline__marker--icon]="!!event.icon"
                [style.--cb-timeline-color]="event.color || null"
              >
                @if (event.icon) {
                  <cb-icon [name]="event.icon" [size]="14" />
                }
              </span>
            }
            @if (!last) {
              <span class="cb-timeline__connector"></span>
            }
          </div>
          <div class="cb-timeline__content">
            @if (contentTemplate(); as tpl) {
              <ng-container *ngTemplateOutlet="tpl.template; context: { $implicit: event, index: i }" />
            } @else {
              @if (event.date) {
                <time class="cb-timeline__date" [attr.datetime]="event.datetime || null">{{ event.date }}</time>
              }
              <strong class="cb-timeline__title">{{ event.title }}</strong>
              @if (event.description) {
                <p class="cb-timeline__description">{{ event.description }}</p>
              }
            }
          </div>
        </li>
      }
    </ol>
  `,
  styleUrl: './timeline.component.css',
})
export class CbTimeline {
  protected readonly t = injectCbTranslation();

  /** Eventos, en orden. */
  readonly value = input<readonly CbTimelineEvent[]>([]);
  /** Disposición: vertical (por defecto) u horizontal. */
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  /** Lado del contenido respecto a la línea: izquierda, derecha o alternado. */
  readonly align = input<CbTimelineAlign>('left');
  /** Nombre accesible de la lista. Por defecto, el del idioma activo. */
  readonly ariaLabel = input<string | undefined>(undefined);

  protected readonly contentTemplate = contentChild(CbTimelineContentTemplate);
  protected readonly oppositeTemplate = contentChild(CbTimelineOppositeTemplate);
  protected readonly markerTemplate = contentChild(CbTimelineMarkerTemplate);
}

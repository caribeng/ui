import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Overlay, type ConnectedPosition, type OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { cbFormat, cbRelativeTime, injectCbTranslation } from '@caribeng/ui';
import { CbAvatar } from '@caribeng/ui/avatar';
import { CbIcon, CbIconRegistry } from '@caribeng/ui/icon';
import { bellOff, checkCheck } from '@caribeng/ui/icons';
import {
  badgeText,
  groupNotifications,
  initialsOf,
  toTime,
  type CbNotification,
  type CbNotificationAction,
  type CbNotificationActionEvent,
  type CbNotificationFilter,
  type CbNotificationGroupKey,
} from './notification-model';

const SEVERITY_ICON: Record<NonNullable<CbNotification['severity']>, string> = {
  info: 'info',
  success: 'circle-check',
  warning: 'triangle-alert',
  danger: 'circle-x',
};

let nextUid = 0;

/**
 * Centro de notificaciones de CaribeNG: campana con el número de avisos sin leer que abre un
 * panel con la lista agrupada por fecha (Hoy, Ayer, Anteriores), filtro Todas / No leídas,
 * marcar como leída (una o todas), eliminar y acciones propias en cada aviso. Con `inline` el
 * panel se pinta en la página, sin campana.
 *
 * @example
 * ```html
 * <cb-notification-center [(notifications)]="avisos" (itemClick)="abrir($event)" />
 * ```
 */
@Component({
  selector: 'cb-notification-center',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [NgTemplateOutlet, CbAvatar, CbIcon],
  host: { class: 'cb-notification-center', '[class.cb-notification-center--inline]': 'inline()' },
  template: `
    @if (inline()) {
      <ng-container [ngTemplateOutlet]="panelTpl" />
    } @else {
      <button
        #bell
        type="button"
        class="cb-nc__bell"
        [attr.aria-label]="bellLabel()"
        aria-haspopup="dialog"
        [attr.aria-expanded]="open()"
        [attr.aria-controls]="open() ? panelId : null"
        (click)="toggle()"
      >
        <cb-icon name="bell" [size]="20" aria-hidden="true" />
        @if (unread()) {
          <span class="cb-nc__badge" aria-hidden="true">{{ badge() }}</span>
        }
      </button>
    }

    <div class="cb-nc__sr" aria-live="polite">{{ announcement() }}</div>

    <ng-template #panelTpl>
      <div
        class="cb-nc__panel"
        [id]="panelId"
        [attr.role]="inline() ? 'region' : 'dialog'"
        [attr.aria-labelledby]="panelId + '-title'"
        [style.width]="inline() ? null : panelWidth()"
        (keydown)="onPanelKeydown($event)"
        (focusin)="focusInside = true"
        (focusout)="onPanelFocusOut($event)"
      >
        <div class="cb-nc__header">
          <span class="cb-nc__title" role="heading" [attr.aria-level]="headingLevel()" [id]="panelId + '-title'" tabindex="-1">
            {{ heading() ?? t().notificationsTitle }}
          </span>
          <button type="button" class="cb-nc__link" [disabled]="!unread()" (click)="markAllRead()">
            <cb-icon name="check-check" [size]="16" aria-hidden="true" />
            {{ t().notificationsMarkAllRead }}
          </button>
        </div>

        <div class="cb-nc__filter" role="group" [attr.aria-label]="t().notificationsShow">
          <button type="button" class="cb-nc__filter-btn" [attr.aria-pressed]="filter() === 'all'" (click)="filter.set('all')">
            {{ t().notificationsAll }}
          </button>
          <button type="button" class="cb-nc__filter-btn" [attr.aria-pressed]="filter() === 'unread'" (click)="filter.set('unread')">
            {{ t().notificationsUnread }}
            @if (unread()) {
              <span class="cb-nc__count">{{ unread() }}</span>
            }
          </button>
        </div>

        <div class="cb-nc__body" [style.max-height]="maxHeight()">
          @for (g of groups(); track g.key) {
            @if (groupByDate()) {
              <span class="cb-nc__group" role="heading" [attr.aria-level]="headingLevel() + 1" [id]="panelId + '-' + g.key">{{ groupLabel(g.key) }}</span>
            }
            <ul class="cb-nc__list" [attr.aria-labelledby]="groupByDate() ? panelId + '-' + g.key : panelId + '-title'">
              @for (n of g.items; track n.id) {
                <li class="cb-nc__item" [class.cb-nc__item--unread]="!n.read" [attr.data-id]="n.id">
                  <span class="cb-nc__media" aria-hidden="true">
                    @if (n.person; as p) {
                      <cb-avatar [image]="p.image ?? ''" [label]="initials(p.name)" [size]="36" />
                    } @else {
                      <span class="cb-nc__icon" [attr.data-severity]="n.severity || 'info'">
                        <cb-icon [name]="iconOf(n)" [size]="18" />
                      </span>
                    }
                  </span>
                  <div class="cb-nc__content">
                    <button type="button" class="cb-nc__main" [attr.aria-describedby]="itemId(n) + '-time'" (click)="select(n)">
                      @if (!n.read) {
                        <span class="cb-nc__sr">{{ t().notificationsUnreadItem }}: </span>
                      }
                      <span class="cb-nc__item-title">{{ n.title }}</span>
                      @if (n.text) {
                        <span class="cb-nc__text">{{ n.text }}</span>
                      }
                    </button>
                    <time class="cb-nc__time" [id]="itemId(n) + '-time'" [attr.datetime]="iso(n.date)" [attr.title]="full(n.date)">{{ rel(n.date) }}</time>
                    @if (n.actions?.length) {
                      <div class="cb-nc__actions">
                        @for (a of n.actions; track a.id) {
                          <button type="button" class="cb-nc__action" [class.cb-nc__action--primary]="a.severity === 'primary'" (click)="runAction(n, a)">
                            {{ a.label }}
                          </button>
                        }
                      </div>
                    }
                  </div>
                  @if (!n.read) {
                    <span class="cb-nc__dot" aria-hidden="true"></span>
                  }
                  <div class="cb-nc__tools">
                    <button
                      type="button"
                      class="cb-nc__tool"
                      [attr.aria-label]="fmt(n.read ? t().notificationsMarkUnread : t().notificationsMarkRead, n.title)"
                      [attr.title]="n.read ? t().notificationsMarkUnreadShort : t().notificationsMarkReadShort"
                      (click)="setRead(n, !n.read)"
                    >
                      <cb-icon [name]="n.read ? 'mail' : 'check'" [size]="15" aria-hidden="true" />
                    </button>
                    @if (removable()) {
                      <button type="button" class="cb-nc__tool" [attr.aria-label]="fmt(t().removeItem, n.title)" [attr.title]="t().remove" (click)="remove(n)">
                        <cb-icon name="x" [size]="15" aria-hidden="true" />
                      </button>
                    }
                  </div>
                </li>
              }
            </ul>
          } @empty {
            <div class="cb-nc__empty">
              <cb-icon name="bell-off" [size]="28" aria-hidden="true" />
              <p>{{ filter() === 'unread' && notifications().length ? t().notificationsAllRead : (emptyMessage() ?? t().notificationsEmpty) }}</p>
            </div>
          }
        </div>

        @if (showViewAll()) {
          <div class="cb-nc__footer">
            <button type="button" class="cb-nc__link" (click)="onViewAll()">{{ t().notificationsViewAll }}</button>
          </div>
        }
      </div>
    </ng-template>
  `,
  styleUrl: './notification-center.component.css',
})
export class CbNotificationCenter {
  protected readonly t = injectCbTranslation();
  protected readonly fmt = cbFormat;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  protected readonly panelId = `cb-nc-${++nextUid}`;

  /** Avisos (el panel los ordena del más reciente al más antiguo). Se actualiza al leer o eliminar. */
  readonly notifications = model<readonly CbNotification[]>([]);
  /** Todas o solo las no leídas. */
  readonly filter = model<CbNotificationFilter>('all');
  /** Panel abierto (sin `inline`). */
  readonly open = model(false);
  /** Pinta el panel en la página, sin campana ni ventana flotante. */
  readonly inline = input(false, { transform: booleanAttribute });
  /** Agrupa por fecha: Hoy, Ayer y Anteriores. */
  readonly groupByDate = input(true, { transform: booleanAttribute });
  /** Muestra el botón de eliminar en cada aviso. */
  readonly removable = input(true, { transform: booleanAttribute });
  /** Cierra el panel al elegir un aviso. */
  readonly closeOnSelect = input(true, { transform: booleanAttribute });
  /**
   * Anuncia a los lectores de pantalla los avisos nuevos sin leer. Si la misma lista se muestra en
   * dos centros (la campana y una página), desactívalo en uno para no oírlo dos veces.
   */
  readonly announceNew = input(true, { transform: booleanAttribute });
  /** Muestra el pie con "Ver todas" (`viewAll`). */
  readonly showViewAll = input(false, { transform: booleanAttribute });
  /** A partir de este número, la campana muestra "99+". */
  readonly max = input(99, { transform: numberAttribute });
  /** Título del panel (por defecto, "Notificaciones"). No es `title` para no dar un tooltip al componente. */
  readonly heading = input<string | undefined>(undefined);
  /** Nivel del título (los grupos usan el siguiente). */
  readonly headingLevel = input(2, { transform: numberAttribute });
  readonly emptyMessage = input<string | undefined>(undefined);
  readonly panelWidth = input<string>('24rem');
  /** Alto máximo de la lista (con scroll). */
  readonly maxHeight = input<string>('26rem');

  /** Aviso elegido (ya marcado como leído). */
  readonly itemClick = output<CbNotification>();
  readonly actionClick = output<CbNotificationActionEvent>();
  /** Un aviso pasó a leído (`read: true`) o a no leído. */
  readonly readChange = output<CbNotification>();
  readonly markAll = output<void>();
  readonly itemRemove = output<CbNotification>();
  readonly viewAll = output<void>();

  protected readonly unread = computed(() => this.notifications().filter((n) => !n.read).length);
  protected readonly badge = computed(() => badgeText(this.unread(), this.max()));
  protected readonly bellLabel = computed(() => {
    const t = this.t();
    return this.unread() ? cbFormat(t.notificationsBellUnread, this.unread()) : t.notificationsTitle;
  });
  private readonly now = signal(Date.now());
  protected readonly groups = computed(() => groupNotifications(this.notifications(), this.filter(), this.groupByDate(), this.now()));
  protected readonly announcement = signal('');

  private readonly panelTpl = viewChild.required<TemplateRef<unknown>>('panelTpl');
  private readonly bell = viewChild<ElementRef<HTMLButtonElement>>('bell');
  private overlayRef: OverlayRef | null = null;
  /** El foco está (o estaba, si su elemento desapareció) dentro del panel. */
  protected focusInside = false;
  private readonly positions: ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 8 },
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -8 },
  ];

  constructor() {
    const registry = inject(CbIconRegistry);
    for (const [name, body] of Object.entries({ 'check-check': checkCheck, 'bell-off': bellOff })) {
      if (!registry.has(name)) registry.register({ [name]: body });
    }

    // Abrir y cerrar el panel flotante cuando cambia `open` (también desde fuera).
    effect(() => {
      const open = this.open() && !this.inline();
      untracked(() => (open ? this.attach() : this.detach()));
    });
    // Foco: al título del panel al abrir. Al cerrar, si el foco se quedó en ninguna parte (estaba
    // en el panel, que ya no existe), vuelve a la campana; no se usa "el elemento enfocado antes"
    // porque Safari no enfoca un botón al pulsarlo.
    let wasOpen = false;
    effect(() => {
      const open = this.open() && !this.inline();
      if (open === wasOpen) return;
      wasOpen = open;
      afterNextRender(
        () => {
          if (open) {
            this.overlayRef?.overlayElement.querySelector<HTMLElement>('.cb-nc__title')?.focus();
          } else {
            const active = this.host.nativeElement.ownerDocument.activeElement;
            if (!active || active === active.ownerDocument.body) this.bell()?.nativeElement.focus();
          }
        },
        { injector: this.injector },
      );
    });

    // Anuncia los avisos nuevos sin leer (no los que ya estaban al empezar).
    let known: Set<string> | null = null;
    effect(() => {
      const list = this.notifications();
      const ids = new Set(list.map((n) => n.id));
      if (known) {
        const fresh = list.filter((n) => !n.read && !known!.has(n.id));
        if (fresh.length && untracked(this.announceNew)) {
          untracked(() =>
            this.announce(fresh.length === 1 ? cbFormat(this.t().notificationsNew, fresh[0].title) : cbFormat(this.t().notificationsNewMany, fresh.length)),
          );
        }
      }
      known = ids;
      // Si la app quitó el aviso que tenía el foco (p. ej. tras una acción), el foco vuelve al título.
      afterNextRender(
        () => {
          const active = this.host.nativeElement.ownerDocument.activeElement;
          if (this.focusInside && (!active || active === active.ownerDocument.body)) {
            this.panelRoot()?.querySelector<HTMLElement>(`#${this.panelId}-title`)?.focus();
          }
        },
        { injector: this.injector },
      );
    });

    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const timer = setInterval(() => this.now.set(Date.now()), 60_000);
      destroyRef.onDestroy(() => clearInterval(timer));
    });
    destroyRef.onDestroy(() => this.detach());
  }

  // --- API pública ---

  toggle(): void {
    this.open.update((o) => !o);
  }

  show(): void {
    this.open.set(true);
  }

  hide(): void {
    this.open.set(false);
  }

  // --- Plantilla ---

  protected initials(name: string): string {
    return initialsOf(name);
  }

  protected iconOf(n: CbNotification): string {
    return n.icon || SEVERITY_ICON[n.severity ?? 'info'];
  }

  protected groupLabel(key: CbNotificationGroupKey): string {
    const t = this.t();
    return key === 'today' ? t.notificationsToday : key === 'yesterday' ? t.notificationsYesterday : t.notificationsEarlier;
  }

  protected itemId(n: CbNotification): string {
    return `${this.panelId}-${n.id.replace(/[^\w-]/g, '_')}`;
  }

  protected iso(date: Date | string): string {
    const time = toTime(date);
    return time ? new Date(time).toISOString() : '';
  }

  protected full(date: Date | string): string {
    const time = toTime(date);
    return time ? new Intl.DateTimeFormat(this.t().intlLocale, { dateStyle: 'full', timeStyle: 'short' }).format(time) : '';
  }

  protected rel(date: Date | string): string {
    const time = toTime(date);
    return time ? cbRelativeTime(time, this.now(), this.t().intlLocale, this.t().notificationsJustNow) : '';
  }

  // --- Acciones ---

  protected select(n: CbNotification): void {
    const item = n.read ? n : this.patch(n, { read: true });
    if (!n.read) this.readChange.emit(item);
    this.itemClick.emit(item);
    if (this.closeOnSelect() && !this.inline()) this.hide();
  }

  protected runAction(n: CbNotification, action: CbNotificationAction): void {
    const item = n.read ? n : this.patch(n, { read: true });
    if (!n.read) this.readChange.emit(item);
    this.actionClick.emit({ notification: item, action });
  }

  protected setRead(n: CbNotification, read: boolean): void {
    const item = this.patch(n, { read });
    this.readChange.emit(item);
    this.announce(read ? this.t().notificationsMarkedRead : this.t().notificationsMarkedUnread);
    // Con el filtro "No leídas", el aviso desaparece: el foco pasa al siguiente.
    if (read && this.filter() === 'unread') this.focusAfterRemoval(n);
  }

  protected markAllRead(): void {
    if (!this.unread()) return;
    this.notifications.update((list) => list.map((n) => (n.read ? n : { ...n, read: true })));
    this.markAll.emit();
    this.announce(this.t().notificationsMarkedAllRead);
    this.focusLater(`#${this.panelId}-title`);
  }

  protected remove(n: CbNotification): void {
    this.focusAfterRemoval(n);
    this.notifications.update((list) => list.filter((x) => x.id !== n.id));
    this.itemRemove.emit(n);
    this.announce(this.t().notificationsRemoved);
  }

  protected onViewAll(): void {
    this.viewAll.emit();
    if (!this.inline()) this.hide();
  }

  /** Escape cierra; Tab fuera del panel lo cierra y devuelve el foco a la campana. */
  protected onPanelKeydown(event: KeyboardEvent): void {
    if (this.inline()) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.hide();
    } else if (event.key === 'Tab') {
      const panel = event.currentTarget as HTMLElement;
      const focusables = Array.from(panel.querySelectorAll<HTMLElement>('button:not(:disabled), [href], [tabindex="0"]'));
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = panel.ownerDocument.activeElement;
      if ((!event.shiftKey && active === last) || (event.shiftKey && (active === first || active === panel.querySelector('.cb-nc__title')))) {
        event.preventDefault();
        this.hide();
      }
    }
  }

  /** Sale el foco hacia otro elemento de la página (no cuando su elemento desaparece). */
  protected onPanelFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && !(event.currentTarget as HTMLElement).contains(next)) this.focusInside = false;
  }

  // --- Internos ---

  private patch(n: CbNotification, change: Partial<CbNotification>): CbNotification {
    const item = { ...n, ...change };
    this.notifications.update((list) => list.map((x) => (x.id === n.id ? item : x)));
    return item;
  }

  /** Antes de quitar un aviso de la vista: foco al siguiente (o al anterior, o al título). */
  private focusAfterRemoval(n: CbNotification): void {
    const root = this.panelRoot();
    const items = Array.from(root?.querySelectorAll<HTMLElement>('.cb-nc__item') ?? []);
    const i = items.findIndex((el) => el.dataset['id'] === n.id);
    const nextId = (items[i + 1] ?? items[i - 1])?.dataset['id'];
    afterNextRender(
      () => {
        const root = this.panelRoot();
        const next = Array.from(root?.querySelectorAll<HTMLElement>('.cb-nc__item') ?? []).find((el) => el.dataset['id'] === nextId);
        (next?.querySelector<HTMLElement>('.cb-nc__main') ?? root?.querySelector<HTMLElement>(`#${this.panelId}-title`))?.focus();
      },
      { injector: this.injector },
    );
  }

  private panelRoot(): HTMLElement | null {
    return this.inline() ? this.host.nativeElement : (this.overlayRef?.overlayElement ?? null);
  }

  private attach(): void {
    const origin = this.bell()?.nativeElement;
    if (this.overlayRef || !origin) return;
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().flexibleConnectedTo(origin).withPositions(this.positions).withPush(true).withViewportMargin(8),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      panelClass: 'cb-nc-overlay',
      maxWidth: 'calc(100vw - 16px)',
    });
    this.overlayRef.attach(new TemplatePortal(this.panelTpl(), this.vcr));
    this.overlayRef.backdropClick().subscribe(() => this.hide());
  }

  private detach(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.focusInside = false;
  }

  /** Un espacio duro alterno hace que el mismo texto cuente como cambio y se vuelva a anunciar. */
  private announce(text: string): void {
    this.announceFlip = !this.announceFlip;
    this.announcement.set(this.announceFlip ? text : `${text} `);
  }
  private announceFlip = false;

  private focusLater(selector: string): void {
    afterNextRender(() => this.panelRoot()?.querySelector<HTMLElement>(selector)?.focus(), { injector: this.injector });
  }
}

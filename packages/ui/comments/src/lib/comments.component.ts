import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';
import { CbAvatar } from '@caribeng/ui/avatar';
import { CbEditor, cbHtmlToText, cbSanitizeHtml, type CbEditorMention, type CbEditorMentionSource, type CbEditorTool } from '@caribeng/ui/editor';
import { CbIcon, CbIconRegistry } from '@caribeng/ui/icon';
import { messageSquare, reply } from '@caribeng/ui/icons';
import {
  buildFeed,
  initialsOf,
  mentionIds,
  newCommentId,
  relativeTime,
  removeComment,
  toTime,
  toggleReaction,
  type CbActivity,
  type CbComment,
  type CbCommentEvent,
  type CbCommentPerson,
  type CbCommentReaction,
  type CbCommentReactionEvent,
  type CbCommentsFilter,
  type CbFeedItem,
} from './comments-model';

/** Lucide `smile-plus` (no está en el catálogo). */
const SMILE_PLUS =
  '<path d="M22 11v1a10 10 0 1 1-9-10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" x2="9.01" y1="9" y2="9" /><line x1="15" x2="15.01" y1="9" y2="9" /><path d="M16 5h6" /><path d="M19 2v6" />';

/** Barra del editor por defecto: lo justo para un comentario. */
export const CB_COMMENTS_TOOLBAR: readonly CbEditorTool[] = ['bold', 'italic', 'strike', '|', 'bulletList', 'orderedList', '|', 'link', 'code'];

let nextUid = 0;

/** Dónde se está escribiendo: comentario nuevo, respuesta a un hilo o edición. */
type Draft = 'new' | { reply: string } | { edit: string };

/**
 * Hilo de comentarios y actividad de CaribeNG: comentarios con formato y @menciones
 * (sobre `cb-editor`), respuestas de un nivel, reacciones con emoji, edición y borrado de los
 * propios y, mezclado por fecha, el historial de cambios (`activity`).
 *
 * @example
 * ```html
 * <cb-comments [(comments)]="comentarios" [activity]="historial" [currentUser]="yo" [people]="equipo" />
 * ```
 */
@Component({
  selector: 'cb-comments',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [NgTemplateOutlet, CbAvatar, CbEditor, CbIcon],
  host: { class: 'cb-comments' },
  template: `
    <section class="cb-comments__box" [attr.aria-label]="ariaLabel() || t().commentsFeed">
      @if (showFilter()) {
        <div class="cb-comments__filter" role="group" [attr.aria-label]="t().commentsShow">
          @for (f of filters; track f) {
            <button type="button" class="cb-comments__filter-btn" [attr.aria-pressed]="filter() === f" (click)="filter.set(f)">
              {{ filterLabel(f) }}
            </button>
          }
        </div>
      }

      @if (order() === 'newest') {
        <ng-container [ngTemplateOutlet]="composerTpl" />
      }

      @if (feed().length) {
        <ol class="cb-comments__feed">
          @for (item of feed(); track itemKey(item)) {
            @if (item.kind === 'activity') {
              <li class="cb-comments__activity">
                <cb-icon class="cb-comments__activity-icon" [name]="item.activity.icon || 'clock'" [size]="14" aria-hidden="true" />
                <span class="cb-comments__activity-text">
                  @if (item.activity.author; as who) {
                    <strong>{{ who.name }}</strong>
                  }
                  {{ item.activity.text }}
                </span>
                <time class="cb-comments__time" [attr.datetime]="iso(item.activity.date)" [attr.title]="full(item.activity.date)">{{ rel(item.activity.date) }}</time>
              </li>
            } @else {
              <li class="cb-comments__thread">
                <ng-container [ngTemplateOutlet]="commentTpl" [ngTemplateOutletContext]="{ $implicit: item.comment, root: true }" />
                @if (item.replies.length) {
                  <ol class="cb-comments__replies" [attr.aria-label]="fmt(t().commentsRepliesTo, item.comment.author.name)">
                    @for (r of item.replies; track r.id) {
                      <li><ng-container [ngTemplateOutlet]="commentTpl" [ngTemplateOutletContext]="{ $implicit: r, root: false, parent: item.comment }" /></li>
                    }
                  </ol>
                }
                @if (isReplying(item.comment.id)) {
                  <div class="cb-comments__reply-composer">
                    <ng-container [ngTemplateOutlet]="editorTpl" [ngTemplateOutletContext]="{ $implicit: { reply: item.comment.id } }" />
                  </div>
                }
              </li>
            }
          }
        </ol>
      } @else {
        <p class="cb-comments__empty">{{ emptyMessage() ?? t().commentsEmpty }}</p>
      }

      @if (order() === 'oldest') {
        <ng-container [ngTemplateOutlet]="composerTpl" />
      }

      <div class="cb-comments__sr" aria-live="polite">{{ announcement() }}</div>
    </section>

    <!-- Comentario (raíz o respuesta). -->
    <ng-template #commentTpl let-c let-root="root" let-parent="parent">
      <article class="cb-comment" [class.cb-comment--deleted]="c.deleted" [id]="domId(c.id)" tabindex="-1" [attr.aria-labelledby]="domId(c.id) + '-h'">
        <cb-avatar class="cb-comment__avatar" [image]="c.author.image ?? ''" [label]="initials(c.author.name)" [size]="root ? 32 : 26" aria-hidden="true" />
        <div class="cb-comment__main">
          <div class="cb-comment__head" [id]="domId(c.id) + '-h'">
            @if (!c.deleted) {
              <span class="cb-comment__author">{{ c.author.name }}</span>
            }
            <time class="cb-comments__time" [attr.datetime]="iso(c.date)" [attr.title]="full(c.date)">{{ rel(c.date) }}</time>
            @if (c.edited && !c.deleted) {
              <span class="cb-comment__edited">({{ t().commentsEdited }})</span>
            }
          </div>

          @if (c.deleted) {
            <p class="cb-comment__deleted">{{ t().commentsDeleted }}</p>
          } @else if (isEditing(c.id)) {
            <ng-container [ngTemplateOutlet]="editorTpl" [ngTemplateOutletContext]="{ $implicit: { edit: c.id } }" />
          } @else {
            <div class="cb-comment__body" [innerHTML]="safe(c.html)"></div>

            @if (c.reactions?.length || canAct()) {
              <div class="cb-comment__footer">
                @for (r of c.reactions ?? []; track r.emoji) {
                  <button
                    type="button"
                    class="cb-comment__reaction"
                    [attr.aria-pressed]="mine(r)"
                    [attr.aria-label]="reactionLabel(r)"
                    [attr.title]="reactionLabel(r)"
                    [disabled]="!canAct()"
                    (click)="react(c, r.emoji)"
                  >
                    <span aria-hidden="true">{{ r.emoji }}</span>
                    <span aria-hidden="true">{{ r.by.length }}</span>
                  </button>
                }
                @if (canAct()) {
                  @if (reactions().length) {
                    <span class="cb-comment__picker-wrap">
                      <button
                        type="button"
                        class="cb-comment__action cb-comment__action--icon"
                        [id]="domId(c.id) + '-react'"
                        [attr.aria-label]="t().commentsAddReaction"
                        [attr.title]="t().commentsAddReaction"
                        [attr.aria-expanded]="picker() === c.id"
                        (click)="togglePicker(c.id)"
                      >
                        <cb-icon name="cb-smile-plus" [size]="15" aria-hidden="true" />
                      </button>
                      @if (picker() === c.id) {
                        <span
                          class="cb-comment__picker"
                          role="group"
                          [attr.aria-label]="t().commentsReactions"
                          (keydown.escape)="closePicker(c.id, $event)"
                          (focusout)="onPickerFocusOut(c.id, $event)"
                        >
                          @for (e of reactions(); track e) {
                            <button type="button" class="cb-comment__emoji" [attr.aria-pressed]="mineEmoji(c, e)" (click)="react(c, e, true)">{{ e }}</button>
                          }
                        </span>
                      }
                    </span>
                  }
                  @if (replies()) {
                    <button type="button" class="cb-comment__action" [id]="domId(c.id) + '-reply'" (click)="startReply(root ? c : parent)">
                      <cb-icon name="reply" [size]="14" aria-hidden="true" />
                      {{ t().commentsReply }}
                    </button>
                  }
                  @if (canManage(c)) {
                    <button type="button" class="cb-comment__action" [id]="domId(c.id) + '-edit'" (click)="startEdit(c)">
                      <cb-icon name="pencil" [size]="14" aria-hidden="true" />
                      {{ t().commentsEdit }}
                    </button>
                    <button type="button" class="cb-comment__action" [id]="domId(c.id) + '-delete'" [attr.aria-expanded]="confirming() === c.id" (click)="askDelete(c.id)">
                      <cb-icon name="trash" [size]="14" aria-hidden="true" />
                      {{ t().commentsDelete }}
                    </button>
                  }
                }
              </div>
            }

            @if (confirming() === c.id) {
              <div class="cb-comment__confirm" role="group" [attr.aria-label]="t().commentsDeleteConfirm" (keydown.escape)="cancelDelete(c.id)">
                <span>{{ t().commentsDeleteConfirm }}</span>
                <button type="button" class="cb-comments__btn cb-comments__btn--danger" [id]="domId(c.id) + '-confirm'" (click)="confirmDelete(c)">
                  {{ t().commentsDelete }}
                </button>
                <button type="button" class="cb-comments__btn" (click)="cancelDelete(c.id)">{{ t().cancel }}</button>
              </div>
            }
          }
        </div>
      </article>
    </ng-template>

    <!-- Caja para escribir: comentario nuevo, respuesta o edición. -->
    <ng-template #editorTpl let-d>
      <div class="cb-comments__editor" [attr.data-draft]="draftKey(d)" (keydown)="onEditorKeydown($event, d)">
        <cb-editor
          [value]="draftOf(d)"
          (valueChange)="setDraft(d, $event)"
          [toolbar]="toolbar()"
          [mentions]="mentionSource()"
          [placeholder]="placeholderOf(d)"
          [ariaLabel]="editorLabel(d)"
          [height]="editorHeight()"
          maxHeight="16rem"
          [wordCount]="false"
          [images]="false"
          [slashCommands]="false"
          [bubbleMenu]="false"
          fontsHref=""
        />
        <div class="cb-comments__editor-bar">
          <span class="cb-comments__hint">{{ t().commentsShortcut }}</span>
          @if (d !== 'new') {
            <button type="button" class="cb-comments__btn" (click)="cancelDraft(d)">{{ t().cancel }}</button>
          }
          <button type="button" class="cb-comments__btn cb-comments__btn--primary" [disabled]="isEmpty(draftOf(d))" (click)="submit(d)">
            {{ isEdit(d) ? t().save : d === 'new' ? t().commentsSend : t().commentsReply }}
          </button>
        </div>
      </div>
    </ng-template>

    <ng-template #composerTpl>
      @if (canAct() && composer()) {
        <div class="cb-comments__composer">
          <cb-avatar class="cb-comment__avatar" [image]="currentUser()!.image ?? ''" [label]="initials(currentUser()!.name)" [size]="32" aria-hidden="true" />
          <ng-container [ngTemplateOutlet]="editorTpl" [ngTemplateOutletContext]="{ $implicit: 'new' }" />
        </div>
      }
    </ng-template>
  `,
  styleUrl: './comments.component.css',
})
export class CbComments {
  protected readonly t = injectCbTranslation();
  protected readonly fmt = cbFormat;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly uid = `cb-comments-${++nextUid}`;

  /** Comentarios (raíces y respuestas, en una lista plana). Se actualiza al publicar, editar, borrar o reaccionar. */
  readonly comments = model<readonly CbComment[]>([]);
  /** Historial de cambios, que se intercala por fecha con los comentarios. */
  readonly activity = input<readonly CbActivity[]>([]);
  /** Quién escribe. Sin él, el hilo es de solo lectura. */
  readonly currentUser = input<CbCommentPerson | null>(null);
  /** Personas que se pueden mencionar con `@` y cuyos nombres aparecen en las reacciones. */
  readonly people = input<readonly CbCommentPerson[]>([]);
  /** Fuente propia de menciones (lista o función, también asíncrona); sustituye a `people` para `@`. */
  readonly mentions = input<CbEditorMentionSource | null>(null);
  /** Qué se muestra: todo, solo comentarios o solo actividad. */
  readonly filter = model<CbCommentsFilter>('all');
  /** Orden del hilo. Con `oldest` la caja para comentar va al final; con `newest`, arriba. */
  readonly order = input<'oldest' | 'newest'>('oldest');
  /** Emojis para reaccionar (vacío para quitar las reacciones). */
  readonly reactions = input<readonly string[]>(['👍', '❤️', '🎉', '😄', '👀', '🙏']);
  /** Permite responder a un comentario. */
  readonly replies = input(true, { transform: booleanAttribute });
  /** Permite editar y eliminar los comentarios propios. */
  readonly editable = input(true, { transform: booleanAttribute });
  /** Muestra la caja para comentar (con `false` solo se responde, edita y reacciona). */
  readonly composer = input(true, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Herramientas del editor. */
  readonly toolbar = input<readonly CbEditorTool[]>(CB_COMMENTS_TOOLBAR);
  /** Alto del área de escritura (crece hasta 16rem). */
  readonly editorHeight = input<string>('4.5rem');
  readonly placeholder = input<string | undefined>(undefined);
  readonly emptyMessage = input<string | undefined>(undefined);
  /** Nombre del hilo para lectores de pantalla (por defecto, "Comentarios y actividad"). */
  readonly ariaLabel = input<string>('');

  /** Comentario publicado (raíz o respuesta). */
  readonly commentAdd = output<CbCommentEvent>();
  readonly commentEdit = output<CbCommentEvent>();
  readonly commentDelete = output<CbComment>();
  readonly reactionToggle = output<CbCommentReactionEvent>();

  protected readonly filters: readonly CbCommentsFilter[] = ['all', 'comments', 'activity'];

  protected readonly feed = computed(() => buildFeed(this.comments(), this.activity(), this.filter(), this.order()));
  protected readonly showFilter = computed(() => this.activity().length > 0);
  protected readonly canAct = computed(() => !!this.currentUser() && !this.readonly());
  protected readonly mentionSource = computed<CbEditorMentionSource | null>(() => {
    const own = this.mentions();
    if (own) return own;
    const me = this.currentUser()?.id;
    const list: CbEditorMention[] = this.people()
      .filter((p) => p.id !== me)
      .map((p) => ({ id: p.id, label: p.name, description: p.description }));
    return list.length ? list : null;
  });
  private readonly names = computed(() => new Map(this.people().map((p) => [p.id, p.name])));

  /** Borradores abiertos, por clave (`new`, `reply:<id>`, `edit:<id>`). */
  private readonly drafts = signal<Record<string, string>>({});
  /** Hilo al que se está respondiendo y comentario en edición. */
  private readonly replyTo = signal<string | null>(null);
  private readonly editing = signal<string | null>(null);
  protected readonly picker = signal<string | null>(null);
  protected readonly confirming = signal<string | null>(null);
  protected readonly announcement = signal('');
  /** Hora de referencia de las fechas relativas (se refresca cada minuto). */
  private readonly now = signal(Date.now());
  private readonly safeCache = new Map<string, SafeHtml>();

  constructor() {
    const registry = inject(CbIconRegistry);
    for (const [name, body] of Object.entries({ 'cb-smile-plus': SMILE_PLUS, reply, 'message-square': messageSquare })) {
      if (!registry.has(name)) registry.register({ [name]: body });
    }
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const timer = setInterval(() => this.now.set(Date.now()), 60_000);
      destroyRef.onDestroy(() => clearInterval(timer));
    });
  }

  // --- Plantilla ---

  protected itemKey(item: CbFeedItem): string {
    return item.kind === 'comment' ? `c:${item.comment.id}` : `a:${item.activity.id}`;
  }

  protected domId(id: string): string {
    return `${this.uid}-${id.replace(/[^\w-]/g, '_')}`;
  }

  protected filterLabel(f: CbCommentsFilter): string {
    const t = this.t();
    return f === 'all' ? t.commentsAll : f === 'comments' ? t.commentsOnly : t.commentsActivity;
  }

  protected initials(name: string): string {
    return initialsOf(name);
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
    return time ? relativeTime(time, this.now(), this.t().intlLocale, this.t().commentsJustNow) : '';
  }

  /** HTML del comentario, saneado (lista blanca del editor) y marcado como seguro una sola vez. */
  protected safe(html: string): SafeHtml {
    const me = this.currentUser()?.id;
    const key = `${me ?? ''}\u0000${html}`;
    let value = this.safeCache.get(key);
    if (!value) {
      let clean = cbSanitizeHtml(html);
      // Las menciones a quien lee se resaltan.
      if (me) clean = clean.split(`data-mention="${me}"`).join(`data-mention="${me}" data-self=""`);
      value = this.sanitizer.bypassSecurityTrustHtml(clean);
      if (this.safeCache.size > 500) this.safeCache.clear();
      this.safeCache.set(key, value);
    }
    return value;
  }

  protected mine(r: CbCommentReaction): boolean {
    const me = this.currentUser()?.id;
    return !!me && r.by.includes(me);
  }

  protected mineEmoji(c: CbComment, emoji: string): boolean {
    const r = c.reactions?.find((x) => x.emoji === emoji);
    return !!r && this.mine(r);
  }

  /** "👍, 2: Ana López y tú". */
  protected reactionLabel(r: CbCommentReaction): string {
    const me = this.currentUser()?.id;
    const who = r.by.map((id) => (id === me ? this.t().commentsYou : (this.names().get(id) ?? id)));
    const list = new Intl.ListFormat(this.t().intlLocale, { type: 'conjunction' }).format(who);
    return cbFormat(this.t().commentsReactionLabel, r.emoji, r.by.length, list);
  }

  protected canManage(c: CbComment): boolean {
    return this.editable() && c.author.id === this.currentUser()?.id;
  }

  protected isReplying(id: string): boolean {
    return this.replyTo() === id;
  }

  protected isEditing(id: string): boolean {
    return this.editing() === id;
  }

  protected isEdit(d: Draft): d is { edit: string } {
    return typeof d === 'object' && 'edit' in d;
  }

  protected draftKey(d: Draft): string {
    return d === 'new' ? 'new' : 'reply' in d ? `reply:${d.reply}` : `edit:${d.edit}`;
  }

  protected draftOf(d: Draft): string {
    return this.drafts()[this.draftKey(d)] ?? '';
  }

  protected setDraft(d: Draft, html: string): void {
    const key = this.draftKey(d);
    this.drafts.update((all) => ({ ...all, [key]: html }));
  }

  protected isEmpty(html: string): boolean {
    return !cbHtmlToText(html).trim();
  }

  protected placeholderOf(d: Draft): string {
    if (d === 'new') return this.placeholder() ?? this.t().commentsWrite;
    return 'reply' in d ? this.t().commentsWriteReply : '';
  }

  protected editorLabel(d: Draft): string {
    if (d === 'new') return this.t().commentsNew;
    if ('reply' in d) return cbFormat(this.t().commentsReplyTo, this.find(d.reply)?.author.name ?? '');
    return this.t().commentsEditing;
  }

  // --- Acciones ---

  /** Ctrl / ⌘ + Enter envía; Escape cancela la respuesta o la edición (salvo que lo use el editor). */
  protected onEditorKeydown(event: KeyboardEvent, d: Draft): void {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      this.submit(d);
    } else if (event.key === 'Escape' && d !== 'new' && !event.defaultPrevented) {
      event.preventDefault();
      this.cancelDraft(d);
    }
  }

  protected submit(d: Draft): void {
    const html = cbSanitizeHtml(this.draftOf(d));
    const me = this.currentUser();
    if (!me || this.isEmpty(html)) return;
    const now = new Date().toISOString();
    if (this.isEdit(d)) {
      const old = this.find(d.edit);
      if (!old) return;
      const comment: CbComment = { ...old, html, edited: now };
      this.comments.update((list) => list.map((c) => (c.id === old.id ? comment : c)));
      this.commentEdit.emit({ comment, mentions: mentionIds(html) });
      this.editing.set(null);
      this.announce(this.t().commentsSaved);
      this.focusLater(`#${this.domId(old.id)}`);
    } else {
      const parentId = d === 'new' ? undefined : d.reply;
      const comment: CbComment = { id: newCommentId(), author: me, html, date: now, ...(parentId ? { parentId } : {}) };
      this.comments.update((list) => [...list, comment]);
      this.commentAdd.emit({ comment, mentions: mentionIds(html) });
      this.announce(this.t().commentsPosted);
      if (parentId) {
        this.replyTo.set(null);
        this.focusLater(`#${this.domId(comment.id)}`);
      }
    }
    this.clearDraft(d);
  }

  protected cancelDraft(d: Draft): void {
    this.clearDraft(d);
    if (this.isEdit(d)) {
      this.editing.set(null);
      this.focusLater(`#${this.domId(d.edit)}-edit`);
    } else if (d !== 'new') {
      this.replyTo.set(null);
      this.focusLater(`#${this.domId(d.reply)}-reply`);
    }
  }

  protected startReply(root: CbComment): void {
    this.replyTo.set(root.id);
    this.focusLater(`[data-draft="reply:${root.id}"] .cb-editor__surface`);
  }

  protected startEdit(c: CbComment): void {
    this.setDraft({ edit: c.id }, c.html);
    this.editing.set(c.id);
    this.confirming.set(null);
    this.focusLater(`[data-draft="edit:${c.id}"] .cb-editor__surface`);
  }

  protected askDelete(id: string): void {
    this.confirming.set(this.confirming() === id ? null : id);
    if (this.confirming()) this.focusLater(`#${this.domId(id)}-confirm`);
  }

  protected cancelDelete(id: string): void {
    this.confirming.set(null);
    this.focusLater(`#${this.domId(id)}-delete`);
  }

  protected confirmDelete(c: CbComment): void {
    // Foco al comentario siguiente (o al anterior); si no queda ninguno, a la caja para comentar.
    const articles = Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('.cb-comment'));
    const i = articles.findIndex((a) => a.id === this.domId(c.id));
    const next = articles[i + 1] ?? articles[i - 1];
    this.confirming.set(null);
    this.comments.update((list) => removeComment(list, c.id));
    this.commentDelete.emit(c);
    this.announce(this.t().commentsDeleted);
    this.focusLater(next ? `#${next.id}` : '[data-draft="new"] .cb-editor__surface');
  }

  protected togglePicker(id: string): void {
    const open = this.picker() !== id;
    this.picker.set(open ? id : null);
    if (open) this.focusLater(`#${this.domId(id)}-react + .cb-comment__picker .cb-comment__emoji`);
  }

  protected closePicker(id: string, event?: Event): void {
    event?.stopPropagation();
    this.picker.set(null);
    this.focusLater(`#${this.domId(id)}-react`);
  }

  /** El selector se cierra al salir de él con el teclado o el ratón. */
  protected onPickerFocusOut(id: string, event: FocusEvent): void {
    const wrap = (event.currentTarget as HTMLElement).parentElement;
    const next = event.relatedTarget as Node | null;
    if (next && wrap?.contains(next)) return;
    if (this.picker() === id) this.picker.set(null);
  }

  protected react(c: CbComment, emoji: string, fromPicker = false): void {
    const me = this.currentUser();
    if (!me || this.readonly()) return;
    const { reactions, added } = toggleReaction(c.reactions, emoji, me.id);
    const comment: CbComment = { ...c, reactions };
    this.comments.update((list) => list.map((x) => (x.id === c.id ? comment : x)));
    this.reactionToggle.emit({ comment, emoji, added });
    if (fromPicker) this.closePicker(c.id);
  }

  private find(id: string): CbComment | undefined {
    return this.comments().find((c) => c.id === id);
  }

  private clearDraft(d: Draft): void {
    const key = this.draftKey(d);
    this.drafts.update((all) => {
      const { [key]: _, ...rest } = all;
      return d === 'new' ? { ...rest, new: '' } : rest;
    });
  }

  private announce(text: string): void {
    // Vaciar antes para que el mismo texto se vuelva a anunciar.
    this.announcement.set('');
    afterNextRender(() => this.announcement.set(text), { injector: this.injector });
  }

  private focusLater(selector: string): void {
    afterNextRender(
      () => this.host.nativeElement.querySelector<HTMLElement>(selector)?.focus(),
      { injector: this.injector },
    );
  }
}

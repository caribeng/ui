import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';
import { CbIcon, CbIconRegistry } from '@caribeng/ui/icon';
import { captions, pause, pictureInPicture2, volume2, volumeX } from '@caribeng/ui/icons';
import { CB_MEDIA_RATES, formatTime, shortcutFor, spokenTime, type CbMediaShortcut, type CbMediaSource, type CbMediaTrack } from './media-model';

/** Transcripción del medio (`<div cbMediaTranscript>…</div>`), en un desplegable bajo los controles. */
@Directive({ selector: '[cbMediaTranscript]' })
export class CbMediaTranscript {}

let nextUid = 0;

/**
 * Reproductor de audio y vídeo de CaribeNG con controles propios y accesibles: reproducir,
 * avanzar y retroceder, barra de progreso y volumen (sliders con su valor hablado), silencio,
 * velocidad, subtítulos (WebVTT), imagen en imagen, pantalla completa, atajos de teclado como
 * los de YouTube y transcripción desplegable. Los controles no se ocultan solos.
 *
 * @example
 * ```html
 * <cb-media-player src="/video/bienvenida.mp4" poster="/video/poster.jpg" [tracks]="subtitulos" heading="Bienvenida" />
 * <cb-media-player kind="audio" src="/audio/podcast.mp3" heading="Episodio 12">
 *   <div cbMediaTranscript>…</div>
 * </cb-media-player>
 * ```
 */
@Component({
  selector: 'cb-media-player',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: {
    class: 'cb-media-player',
    '[class.cb-media-player--audio]': 'kind() === "audio"',
    '[class.cb-media-player--fullscreen]': 'fullscreen()',
  },
  template: `
    <div class="cb-mp" role="group" [attr.aria-label]="label()" [attr.aria-describedby]="hintId" (keydown)="onKeydown($event)">
      @if (kind() === 'video') {
        <div class="cb-mp__screen" (click)="toggle()" (dblclick)="toggleFullscreen()">
          <video
            #media
            class="cb-mp__media"
            [attr.poster]="poster() || null"
            [attr.crossorigin]="crossorigin() || null"
            [preload]="preload()"
            [loop]="loop()"
            [muted]="startMuted()"
            playsinline
            (play)="onPlay()"
            (pause)="onPause()"
            (ended)="onEnded($event)"
            (timeupdate)="onTime($event)"
            (loadedmetadata)="sync($event)"
            (durationchange)="sync($event)"
            (volumechange)="sync($event)"
            (ratechange)="sync($event)"
            (waiting)="waiting.set(true)"
            (playing)="waiting.set(false)"
            (canplay)="waiting.set(false)"
            (error)="onError($event)"
            (enterpictureinpicture)="pip.set(true)"
            (leavepictureinpicture)="pip.set(false)"
          >
            @for (s of sourceList(); track s.src) {
              <source [src]="s.src" [attr.type]="s.type || null" />
            }
            @for (tr of tracks(); track tr.src) {
              <track [src]="tr.src" [attr.kind]="tr.kind || 'subtitles'" [attr.srclang]="tr.srclang" [attr.label]="tr.label" [default]="!!tr.default" />
            }
          </video>
          @if (!playing() && !started()) {
            <span class="cb-mp__big-play" aria-hidden="true"><cb-icon name="play" [size]="34" /></span>
          }
          @if (waiting()) {
            <span class="cb-mp__busy" aria-hidden="true"><cb-icon name="loader-circle" [size]="36" /></span>
          }
        </div>
      } @else {
        <audio
          #media
          [attr.crossorigin]="crossorigin() || null"
          [preload]="preload()"
          [loop]="loop()"
          [muted]="startMuted()"
          (play)="onPlay()"
          (pause)="onPause()"
          (ended)="onEnded($event)"
          (timeupdate)="onTime($event)"
          (loadedmetadata)="sync($event)"
          (durationchange)="sync($event)"
          (volumechange)="sync($event)"
          (ratechange)="sync($event)"
          (waiting)="waiting.set(true)"
          (playing)="waiting.set(false)"
          (canplay)="waiting.set(false)"
          (error)="onError($event)"
        >
          @for (s of sourceList(); track s.src) {
            <source [src]="s.src" [attr.type]="s.type || null" />
          }
          @for (tr of tracks(); track tr.src) {
            <track [src]="tr.src" [attr.kind]="tr.kind || 'subtitles'" [attr.srclang]="tr.srclang" [attr.label]="tr.label" [default]="!!tr.default" />
          }
        </audio>
        @if (heading() || subtitle()) {
          <div class="cb-mp__info">
            @if (heading()) {
              <span class="cb-mp__title">{{ heading() }}</span>
            }
            @if (subtitle()) {
              <span class="cb-mp__subtitle">{{ subtitle() }}</span>
            }
          </div>
        }
      }

      @if (error()) {
        <p class="cb-mp__error" role="alert">{{ errorMessage() ?? t().mediaError }}</p>
      }

      <div class="cb-mp__controls" role="group" [attr.aria-label]="t().mediaControls">
        <div class="cb-mp__seek-row">
          <span class="cb-mp__time" aria-hidden="true">{{ timeText(current()) }}</span>
          <input
            type="range"
            class="cb-mp__range cb-mp__seek"
            min="0"
            [max]="duration() || 0"
            step="any"
            [value]="current()"
            [style.--cb-mp-fill]="progress() + '%'"
            [attr.aria-label]="t().mediaSeek"
            [attr.aria-valuetext]="seekText()"
            [disabled]="!duration()"
            (input)="onSeekInput($event)"
            (keydown)="onSeekKeydown($event)"
          />
          <span class="cb-mp__time" aria-hidden="true">{{ timeText(duration()) }}</span>
        </div>

        <div class="cb-mp__buttons">
          <button type="button" class="cb-mp__btn cb-mp__btn--main" [attr.aria-label]="playing() ? t().mediaPause : t().mediaPlay" [attr.title]="playing() ? t().mediaPause : t().mediaPlay" (click)="toggle()">
            <cb-icon [name]="playing() ? 'pause' : 'play'" [size]="20" aria-hidden="true" />
          </button>
          @if (skipSeconds() > 0) {
            <button type="button" class="cb-mp__btn" [attr.aria-label]="fmt(t().mediaBack, skipSeconds())" [attr.title]="fmt(t().mediaBack, skipSeconds())" (click)="seekBy(-skipSeconds())">
              <cb-icon name="rotate-ccw" [size]="18" aria-hidden="true" />
            </button>
            <button type="button" class="cb-mp__btn" [attr.aria-label]="fmt(t().mediaForward, skipSeconds())" [attr.title]="fmt(t().mediaForward, skipSeconds())" (click)="seekBy(skipSeconds())">
              <cb-icon name="rotate-cw" [size]="18" aria-hidden="true" />
            </button>
          }

          <span class="cb-mp__volume">
            <button type="button" class="cb-mp__btn" [attr.aria-label]="t().mediaMute" [attr.title]="t().mediaMute" [attr.aria-pressed]="muted()" (click)="toggleMute()">
              <cb-icon [name]="muted() || volume() === 0 ? 'volume-x' : 'volume-2'" [size]="18" aria-hidden="true" />
            </button>
            <input
              type="range"
              class="cb-mp__range cb-mp__vol"
              min="0"
              max="1"
              step="0.05"
              [value]="muted() ? 0 : volume()"
              [style.--cb-mp-fill]="(muted() ? 0 : volume() * 100) + '%'"
              [attr.aria-label]="t().mediaVolume"
              [attr.aria-valuetext]="(muted() ? 0 : percent(volume())) + ' %'"
              (input)="onVolumeInput($event)"
            />
          </span>

          <span class="cb-mp__spacer"></span>

          <select class="cb-mp__select" [attr.aria-label]="t().mediaSpeed" [attr.title]="t().mediaSpeed" [value]="rate()" (change)="setRate(+$any($event.target).value)">
            @for (r of rates(); track r) {
              <option [value]="r" [selected]="r === rate()">{{ rateText(r) }}</option>
            }
          </select>

          @if (tracks().length) {
            <button type="button" class="cb-mp__btn" [attr.aria-label]="t().mediaCaptions" [attr.title]="t().mediaCaptions" [attr.aria-pressed]="activeTrack() >= 0" (click)="toggleCaptions()">
              <cb-icon name="captions" [size]="18" aria-hidden="true" />
            </button>
            @if (tracks().length > 1) {
              <select class="cb-mp__select" [attr.aria-label]="t().mediaCaptionsLanguage" (change)="setTrack(+$any($event.target).value)">
                <option value="-1" [selected]="activeTrack() < 0">{{ t().mediaCaptionsNone }}</option>
                @for (tr of tracks(); track tr.src; let i = $index) {
                  <option [value]="i" [selected]="activeTrack() === i">{{ tr.label }}</option>
                }
              </select>
            }
          }

          @if (kind() === 'video') {
            @if (pipSupported) {
              <button type="button" class="cb-mp__btn" [attr.aria-label]="t().mediaPip" [attr.title]="t().mediaPip" [attr.aria-pressed]="pip()" (click)="togglePip()">
                <cb-icon name="picture-in-picture-2" [size]="18" aria-hidden="true" />
              </button>
            }
            <button
              type="button"
              class="cb-mp__btn"
              [attr.aria-label]="fullscreen() ? t().mediaExitFullscreen : t().mediaFullscreen"
              [attr.title]="fullscreen() ? t().mediaExitFullscreen : t().mediaFullscreen"
              (click)="toggleFullscreen()"
            >
              <cb-icon [name]="fullscreen() ? 'minimize-2' : 'maximize-2'" [size]="18" aria-hidden="true" />
            </button>
          }
        </div>
      </div>

      @if (transcript()) {
        <details class="cb-mp__transcript">
          <summary>{{ t().mediaTranscript }}</summary>
          <div class="cb-mp__transcript-body"><ng-content select="[cbMediaTranscript]" /></div>
        </details>
      }

      <span class="cb-mp__sr" [id]="hintId">{{ t().mediaShortcuts }}</span>
      <span class="cb-mp__sr" aria-live="polite">{{ announcement() }}</span>
    </div>
  `,
  styleUrl: './media-player.component.css',
})
export class CbMediaPlayer {
  protected readonly t = injectCbTranslation();
  protected readonly fmt = cbFormat;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  protected readonly hintId = `cb-media-${++nextUid}-hint`;

  /** Archivo a reproducir (o `sources` con varios formatos). */
  readonly src = input<string>('');
  readonly sources = input<readonly CbMediaSource[]>([]);
  readonly kind = input<'video' | 'audio'>('video');
  readonly poster = input<string>('');
  /** Título: nombre del reproductor y, en audio, se muestra encima de los controles (no `title`, que daría un tooltip). */
  readonly heading = input<string>('');
  /** Texto secundario en audio (autor, programa…). */
  readonly subtitle = input<string>('');
  /** Subtítulos y descripciones (WebVTT). */
  readonly tracks = input<readonly CbMediaTrack[]>([]);
  readonly rates = input<readonly number[]>(CB_MEDIA_RATES);
  /** Segundos de los botones de retroceder y avanzar (0 los oculta). */
  readonly skipSeconds = input(10, { transform: numberAttribute });
  readonly loop = input(false, { transform: booleanAttribute });
  /** Empieza silenciado. */
  readonly startMuted = input(false, { alias: 'muted', transform: booleanAttribute });
  readonly preload = input<'none' | 'metadata' | 'auto'>('metadata');
  /** `anonymous` para subtítulos o medios de otro dominio con CORS. */
  readonly crossorigin = input<'' | 'anonymous' | 'use-credentials'>('');
  readonly errorMessage = input<string | undefined>(undefined);
  readonly ariaLabel = input<string>('');

  readonly played = output<void>();
  readonly paused = output<void>();
  readonly ended = output<void>();
  /** Segundo actual, mientras se reproduce. */
  readonly timeUpdate = output<number>();
  readonly mediaError = output<MediaError | null>();

  protected readonly transcript = contentChild(CbMediaTranscript);
  private readonly mediaRef = viewChild<ElementRef<HTMLMediaElement>>('media');

  protected readonly playing = signal(false);
  protected readonly started = signal(false);
  protected readonly waiting = signal(false);
  protected readonly current = signal(0);
  protected readonly duration = signal(0);
  protected readonly volume = signal(1);
  protected readonly muted = signal(false);
  protected readonly rate = signal(1);
  protected readonly activeTrack = signal(-1);
  protected readonly fullscreen = signal(false);
  protected readonly pip = signal(false);
  protected readonly error = signal(false);
  protected readonly announcement = signal('');
  protected readonly pipSupported = typeof document !== 'undefined' && 'pictureInPictureEnabled' in document && !!document.pictureInPictureEnabled;

  protected readonly sourceList = computed<readonly CbMediaSource[]>(() => (this.sources().length ? this.sources() : this.src() ? [{ src: this.src() }] : []));
  protected readonly label = computed(() => {
    const kind = this.kind() === 'audio' ? this.t().mediaAudio : this.t().mediaVideo;
    return this.ariaLabel() || (this.heading() ? `${kind}: ${this.heading()}` : kind);
  });
  protected readonly progress = computed(() => (this.duration() ? (this.current() / this.duration()) * 100 : 0));
  protected readonly seekText = computed(() => cbFormat(this.t().mediaTimeOf, this.spoken(this.current()), this.spoken(this.duration())));

  constructor() {
    const registry = inject(CbIconRegistry);
    for (const [name, body] of Object.entries({ pause, 'volume-2': volume2, 'volume-x': volumeX, captions, 'picture-in-picture-2': pictureInPicture2 })) {
      if (!registry.has(name)) registry.register({ [name]: body });
    }
    // Los eventos del medio se enlazan en la plantilla: así están desde que se crea el elemento
    // (con el medio en caché, loadedmetadata puede llegar antes que un afterNextRender).
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const media = this.mediaRef()?.nativeElement;
      if (media) this.syncFromMedia(media);
      const onFullscreen = () => this.fullscreen.set(this.document.fullscreenElement === this.host.nativeElement);
      this.document.addEventListener('fullscreenchange', onFullscreen);
      destroyRef.onDestroy(() => this.document.removeEventListener('fullscreenchange', onFullscreen));
    });
  }

  // --- API pública ---

  play(): Promise<void> {
    const media = this.media();
    if (!media) return Promise.resolve();
    return media.play().catch(() => undefined);
  }

  pause(): void {
    this.media()?.pause();
  }

  toggle(): void {
    if (this.media()?.paused ?? true) void this.play();
    else this.pause();
  }

  /** Salta al segundo indicado. */
  seekTo(seconds: number): void {
    const media = this.media();
    if (!media) return;
    const max = Number.isFinite(media.duration) ? media.duration : this.duration();
    media.currentTime = Math.min(Math.max(0, seconds), max || 0);
    this.current.set(media.currentTime);
  }

  seekBy(seconds: number): void {
    this.seekTo((this.media()?.currentTime ?? this.current()) + seconds);
  }

  // --- Plantilla ---

  protected percent(v: number): number {
    return Math.round(v * 100);
  }

  protected timeText(seconds: number): string {
    return formatTime(seconds, this.duration());
  }

  protected rateText(r: number): string {
    return `${new Intl.NumberFormat(this.t().intlLocale).format(r)}×`;
  }

  private spoken(seconds: number): string {
    const t = this.t();
    return spokenTime(seconds, { hours: t.mediaHours, minutes: t.mediaMinutes, seconds: t.mediaSeconds });
  }

  // --- Eventos ---

  protected onSeekInput(event: Event): void {
    this.seekTo(+(event.target as HTMLInputElement).value);
  }

  /** En la barra de progreso, las flechas saltan 5 s y Re Pág / Av Pág 10 s (el paso nativo sería casi nulo). */
  protected onSeekKeydown(event: KeyboardEvent): void {
    const steps: Record<string, number> = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5, PageDown: -10, PageUp: 10 };
    if (event.key in steps) {
      event.preventDefault();
      event.stopPropagation();
      this.seekBy(steps[event.key]);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      event.stopPropagation();
      this.seekTo(event.key === 'Home' ? 0 : this.duration());
    }
  }

  protected onVolumeInput(event: Event): void {
    const media = this.media();
    if (!media) return;
    media.volume = +(event.target as HTMLInputElement).value;
    media.muted = media.volume === 0;
  }

  protected toggleMute(): void {
    const media = this.media();
    if (!media) return;
    media.muted = !media.muted;
    // Quitar el silencio con el volumen a cero no se oiría: se devuelve a un nivel audible.
    if (!media.muted && media.volume === 0) media.volume = 0.5;
  }

  protected setRate(rate: number): void {
    const media = this.media();
    if (media) media.playbackRate = rate;
    this.rate.set(rate);
    this.announce(cbFormat(this.t().mediaSpeedSet, this.rateText(rate)));
  }

  protected toggleCaptions(): void {
    if (this.activeTrack() >= 0) {
      this.setTrack(-1);
    } else {
      const preferred = this.tracks().findIndex((tr) => tr.default);
      this.setTrack(preferred >= 0 ? preferred : 0);
    }
  }

  protected setTrack(index: number): void {
    const media = this.media();
    if (media) {
      Array.from(media.textTracks ?? []).forEach((track, i) => (track.mode = i === index ? 'showing' : 'disabled'));
    }
    this.activeTrack.set(index);
    this.announce(index >= 0 ? cbFormat(this.t().mediaCaptionsOn, this.tracks()[index]?.label ?? '') : this.t().mediaCaptionsOff);
  }

  protected async toggleFullscreen(): Promise<void> {
    if (this.kind() !== 'video') return;
    try {
      if (this.document.fullscreenElement) await this.document.exitFullscreen();
      else await this.host.nativeElement.requestFullscreen?.();
    } catch {
      // El navegador lo rechazó (p. ej. sin gesto del usuario): no hay nada que hacer.
    }
  }

  protected async togglePip(): Promise<void> {
    const media = this.media() as HTMLVideoElement | undefined;
    if (!media) return;
    try {
      if (this.document.pictureInPictureElement) await this.document.exitPictureInPicture();
      else await media.requestPictureInPicture();
    } catch {
      // Sin soporte o rechazado.
    }
  }

  /** Atajos con el foco en el reproductor, salvo las teclas que ya usa el control enfocado. */
  protected onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (target.tagName === 'SELECT' || target.closest('summary, .cb-mp__transcript-body')) return;
    const shortcut = shortcutFor(event);
    if (!shortcut) return;
    const isRange = target instanceof HTMLInputElement && target.type === 'range';
    const isButton = target.tagName === 'BUTTON';
    // Un slider usa sus flechas e Inicio / Fin; un botón, Espacio.
    if (isRange && (shortcut.action === 'seekBy' || shortcut.action === 'volumeBy' || shortcut.action === 'seekTo') && !/^[0-9]$/.test(event.key)) return;
    if (isButton && event.key === ' ') return;
    event.preventDefault();
    this.run(shortcut);
  }

  // --- Eventos del medio ---

  protected onPlay(): void {
    this.playing.set(true);
    this.started.set(true);
    this.played.emit();
  }

  protected onPause(): void {
    this.playing.set(false);
    this.paused.emit();
  }

  protected onEnded(event: Event): void {
    this.playing.set(false);
    this.sync(event);
    this.ended.emit();
  }

  protected onTime(event: Event): void {
    const media = event.target as HTMLMediaElement;
    this.current.set(media.currentTime);
    this.timeUpdate.emit(media.currentTime);
  }

  protected sync(event: Event): void {
    this.syncFromMedia(event.target as HTMLMediaElement);
  }

  protected onError(event: Event): void {
    const media = event.target as HTMLMediaElement;
    this.error.set(true);
    this.waiting.set(false);
    this.mediaError.emit(media.error);
  }

  // --- Internos ---

  private run(shortcut: CbMediaShortcut): void {
    switch (shortcut.action) {
      case 'toggle':
        return this.toggle();
      case 'mute':
        return this.toggleMute();
      case 'fullscreen':
        void this.toggleFullscreen();
        return;
      case 'captions':
        if (this.tracks().length) this.toggleCaptions();
        return;
      case 'seekBy':
        return this.seekBy(shortcut.seconds);
      case 'seekTo':
        return this.seekTo(shortcut.fraction * this.duration());
      case 'volumeBy': {
        const media = this.media();
        if (!media) return;
        media.muted = false;
        media.volume = Math.min(1, Math.max(0, Math.round((media.volume + shortcut.delta) * 100) / 100));
        this.announce(cbFormat(this.t().mediaVolumeSet, this.percent(media.volume)));
      }
    }
  }

  private media(): HTMLMediaElement | undefined {
    return this.mediaRef()?.nativeElement;
  }

  private syncFromMedia(media: HTMLMediaElement): void {
    this.duration.set(Number.isFinite(media.duration) ? media.duration : 0);
    this.current.set(media.currentTime);
    this.volume.set(media.volume);
    this.muted.set(media.muted);
    this.rate.set(media.playbackRate || 1);
    const showing = Array.from(media.textTracks ?? []).findIndex((tr) => tr.mode === 'showing');
    if (showing >= 0) this.activeTrack.set(showing);
  }

  /** Un espacio duro alterno hace que el mismo texto cuente como cambio y se vuelva a anunciar. */
  private announce(text: string): void {
    this.announceFlip = !this.announceFlip;
    this.announcement.set(this.announceFlip ? text : `${text} `);
  }
  private announceFlip = false;
}

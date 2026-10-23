import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CbMediaPlayer, CbMediaTranscript } from './media-player.component';
import { formatTime, shortcutFor, spokenTime, type CbMediaTrack } from './media-model';

@Component({
  imports: [CbMediaPlayer, CbMediaTranscript],
  template: `
    <cb-media-player [kind]="kind()" src="video.mp4" heading="Bienvenida" subtitle="Equipo de producto" [tracks]="tracks">
      @if (transcript()) {
        <div cbMediaTranscript>Hola y bienvenidos.</div>
      }
    </cb-media-player>
  `,
})
class HostComponent {
  kind = signal<'video' | 'audio'>('video');
  transcript = signal(false);
  tracks: CbMediaTrack[] = [
    { src: 'es.vtt', srclang: 'es', label: 'Español', default: true },
    { src: 'en.vtt', srclang: 'en', label: 'English' },
  ];
}

describe('CbMediaPlayer', () => {
  // jsdom no reproduce: play() y pause() solo cambian el estado y disparan sus eventos.
  const proto = HTMLMediaElement.prototype;
  const original = { play: proto.play, pause: proto.pause, paused: Object.getOwnPropertyDescriptor(proto, 'paused')! };
  beforeEach(() => {
    const state = new WeakMap<HTMLMediaElement, boolean>();
    Object.defineProperty(proto, 'paused', { configurable: true, get(this: HTMLMediaElement) { return state.get(this) ?? true; } });
    proto.play = function (this: HTMLMediaElement) {
      state.set(this, false);
      this.dispatchEvent(new Event('play'));
      return Promise.resolve();
    };
    proto.pause = function (this: HTMLMediaElement) {
      state.set(this, true);
      this.dispatchEvent(new Event('pause'));
    };
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });
  afterEach(() => {
    proto.play = original.play;
    proto.pause = original.pause;
    Object.defineProperty(proto, 'paused', original.paused);
  });

  async function setup(kind: 'video' | 'audio' = 'video', transcript = false) {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.kind.set(kind);
    fixture.componentInstance.transcript.set(transcript);
    fixture.detectChanges();
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const media = el.querySelector<HTMLMediaElement>('video, audio')!;
    // Un medio de 4 minutos.
    Object.defineProperty(media, 'duration', { configurable: true, value: 240 });
    media.dispatchEvent(new Event('durationchange'));
    fixture.detectChanges();
    const btn = (label: string) => el.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;
    const seek = () => el.querySelector<HTMLInputElement>('.cb-mp__seek')!;
    const group = () => el.querySelector<HTMLElement>('.cb-mp')!;
    const key = (target: Element, k: string) => {
      target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
      fixture.detectChanges();
    };
    const live = () => el.querySelector('.cb-mp__sr[aria-live]')!.textContent!.trim();
    return { fixture, el, media, btn, seek, group, key, live };
  }

  it('es un grupo con nombre, controles agrupados y los atajos como descripción', async () => {
    const { el, group } = await setup();
    expect(group().getAttribute('aria-label')).toBe('Reproductor de vídeo: Bienvenida');
    expect(el.querySelector('.cb-mp__controls')!.getAttribute('aria-label')).toBe('Controles');
    expect(document.getElementById(group().getAttribute('aria-describedby')!)!.textContent).toContain('Espacio o K');
    expect(el.querySelector('video')!.hasAttribute('controls')).toBe(false);
  });

  it('el botón principal reproduce y pausa, y cambia de nombre', async () => {
    const { fixture, btn } = await setup();
    btn('Reproducir').click();
    fixture.detectChanges();
    expect(btn('Pausar')).toBeTruthy();
    btn('Pausar').click();
    fixture.detectChanges();
    expect(btn('Reproducir')).toBeTruthy();
  });

  it('la barra de progreso dice el tiempo con palabras y sus flechas saltan 5 s', async () => {
    const { fixture, media, seek, key } = await setup();
    media.currentTime = 65;
    media.dispatchEvent(new Event('timeupdate'));
    fixture.detectChanges();
    expect(seek().getAttribute('aria-label')).toBe('Progreso');
    expect(seek().getAttribute('aria-valuetext')).toBe('1 min 5 s de 4 min');
    key(seek(), 'ArrowRight');
    expect(media.currentTime).toBe(70);
    key(seek(), 'PageDown');
    expect(media.currentTime).toBe(60);
    key(seek(), 'End');
    expect(media.currentTime).toBe(240);
  });

  it('atajos de teclado en el reproductor: números, flechas, M y K', async () => {
    const { fixture, media, group, key, btn } = await setup();
    key(group(), '5');
    expect(media.currentTime).toBe(120);
    key(group(), 'ArrowLeft');
    expect(media.currentTime).toBe(115);
    key(group(), 'm');
    expect(media.muted).toBe(true);
    media.dispatchEvent(new Event('volumechange'));
    fixture.detectChanges();
    expect(btn('Silenciar').getAttribute('aria-pressed')).toBe('true');
    key(group(), 'k');
    expect(media.paused).toBe(false);
  });

  it('Espacio en un botón no reproduce dos veces (lo hace el clic del botón)', async () => {
    const { media, btn, key } = await setup();
    key(btn('Silenciar'), ' ');
    expect(media.paused).toBe(true);
  });

  it('subtítulos: el botón los activa con el idioma por defecto y el selector cambia el idioma', async () => {
    const { fixture, el, btn, live } = await setup();
    btn('Subtítulos').click();
    fixture.detectChanges();
    expect(btn('Subtítulos').getAttribute('aria-pressed')).toBe('true');
    expect(live()).toBe('Subtítulos: Español');
    const select = el.querySelector<HTMLSelectElement>('select[aria-label="Idioma de los subtítulos"]')!;
    select.value = '1';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(live()).toBe('Subtítulos: English');
  });

  it('la velocidad se elige con un select y se anuncia', async () => {
    const { fixture, el, media, live } = await setup();
    const select = el.querySelector<HTMLSelectElement>('select[aria-label="Velocidad"]')!;
    select.value = '1.5';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(media.playbackRate).toBe(1.5);
    expect(live()).toBe('Velocidad 1,5×');
  });

  it('en audio muestra el título y la transcripción, sin pantalla completa', async () => {
    const { el, group } = await setup('audio', true);
    expect(group().getAttribute('aria-label')).toBe('Reproductor de audio: Bienvenida');
    expect(el.querySelector('.cb-mp__title')!.textContent).toBe('Bienvenida');
    expect(el.querySelector('button[aria-label="Pantalla completa"]')).toBeNull();
    const details = el.querySelector('details.cb-mp__transcript')!;
    expect(details.querySelector('summary')!.textContent).toBe('Transcripción');
    expect(details.textContent).toContain('Hola y bienvenidos.');
  });
});

describe('modelo del reproductor', () => {
  it('formatTime con y sin horas', () => {
    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(3725)).toBe('1:02:05');
    expect(formatTime(65, 4000)).toBe('0:01:05');
    expect(formatTime(Number.NaN)).toBe('0:00');
  });

  it('spokenTime omite las unidades vacías', () => {
    const u = { hours: 'h', minutes: 'min', seconds: 's' };
    expect(spokenTime(3605, u)).toBe('1 h 5 s');
    expect(spokenTime(0, u)).toBe('0 s');
  });

  it('shortcutFor ignora las teclas con modificadores', () => {
    expect(shortcutFor({ key: 'K', ctrlKey: false, altKey: false, metaKey: false })).toEqual({ action: 'toggle' });
    expect(shortcutFor({ key: 'f', ctrlKey: true, altKey: false, metaKey: false })).toBeNull();
    expect(shortcutFor({ key: '3', ctrlKey: false, altKey: false, metaKey: false })).toEqual({ action: 'seekTo', fraction: 0.3 });
  });
});

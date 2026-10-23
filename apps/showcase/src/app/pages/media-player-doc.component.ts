import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbMediaPlayer, CbMediaTranscript, type CbMediaTrack } from '@caribeng/ui/media-player';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-media-player-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbMediaPlayer, CbMediaTranscript, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Media"
      title="MediaPlayer"
      lead="Reproductor de vídeo y audio con controles propios y accesibles: reproducir, avanzar y retroceder, barra de progreso y volumen que dicen su valor, silencio, velocidad, subtítulos en varios idiomas, imagen en imagen, pantalla completa, atajos de teclado como los de YouTube y transcripción. Los controles están siempre visibles."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="video"
      title="Vídeo con subtítulos"
      description="tracks añade subtítulos WebVTT: el botón los activa con el idioma por defecto y el selector cambia de idioma. Con el foco dentro del reproductor, Espacio o K reproduce, las flechas avanzan o retroceden 5 s, 0–9 saltan a ese punto, M silencia, F pone pantalla completa y C los subtítulos. Clic en el vídeo reproduce o pausa y doble clic, pantalla completa."
      [code]="videoCode"
    >
      <div style="display: grid; gap: 0.5rem; width: 100%; max-width: 40rem">
        <cb-media-player [src]="video" heading="Flor al amanecer" [tracks]="subtitulos" crossorigin="anonymous" (ended)="estado.set('Fin del vídeo')" (played)="estado.set('Reproduciendo')" (paused)="estado.set('En pausa')" />
        <p class="mp-log">{{ estado() }}</p>
      </div>
    </doc-section>

    <doc-section
      id="audio"
      title="Audio con transcripción"
      description="kind=&quot;audio&quot; muestra el título y el subtítulo encima de los controles, sin pantalla. Un contenido solo de audio necesita una transcripción (WCAG 1.2.1): proyéctala con cbMediaTranscript y aparece en un desplegable. skipSeconds cambia el salto de los botones."
      [code]="audioCode"
    >
      <div style="width: 100%; max-width: 32rem">
        <cb-media-player kind="audio" [src]="audio" heading="Rugido de T-Rex" subtitle="Efecto de sonido · CC0" [skipSeconds]="5">
          <div cbMediaTranscript>
            <p>[Rugido grave y prolongado de un dinosaurio, que se apaga poco a poco.]</p>
          </div>
        </cb-media-player>
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .mp-log {
        min-height: 1.25rem;
        margin: 0;
        color: var(--cb-color-text-muted);
        font-size: 0.875rem;
      }
    `,
  ],
})
export class MediaPlayerDocComponent {
  protected readonly docApi = DOC_API['cb-media-player'];
  protected readonly a11y = DOC_A11Y['cb-media-player'];

  protected readonly video = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
  protected readonly audio = 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3';
  protected readonly subtitulos: CbMediaTrack[] = [
    { src: 'media/flower-es.vtt', srclang: 'es', label: 'Español', default: true },
    { src: 'media/flower-en.vtt', srclang: 'en', label: 'English' },
  ];
  protected readonly estado = signal('');

  protected readonly importCode = `import { CbMediaPlayer, CbMediaTranscript, type CbMediaTrack } from '@caribeng/ui/media-player';`;
  protected readonly videoCode = `<cb-media-player [src]="video" heading="Flor al amanecer" [tracks]="subtitulos" crossorigin="anonymous" (ended)="estado.set('Fin del vídeo')" (played)="estado.set('Reproduciendo')" (paused)="estado.set('En pausa')" />
<p class="mp-log">{{ estado() }}</p>`;
  protected readonly audioCode = `<cb-media-player kind="audio" [src]="audio" heading="Rugido de T-Rex" subtitle="Efecto de sonido · CC0" [skipSeconds]="5">
  <div cbMediaTranscript>
    <p>[Rugido grave y prolongado de un dinosaurio, que se apaga poco a poco.]</p>
  </div>
</cb-media-player>`;

  constructor() {
    inject(TocService).reset();
  }
}

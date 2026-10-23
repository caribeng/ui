import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbComments, type CbActivity, type CbComment, type CbCommentEvent, type CbCommentPerson } from '@caribeng/ui/comments';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

/** Fecha ISO `min` minutos antes de ahora (la demo siempre tiene fechas recientes). */
function ago(min: number): string {
  return new Date(Date.now() - min * 60_000).toISOString();
}

const ANA: CbCommentPerson = { id: 'ana', name: 'Ana López', description: 'Analista de riesgo' };
const LUIS: CbCommentPerson = { id: 'luis', name: 'Luis Pérez', description: 'Jefe de proyecto' };
const CAMILA: CbCommentPerson = { id: 'camila', name: 'Camila Ruiz', description: 'Diseño' };
const MATEO: CbCommentPerson = { id: 'mateo', name: 'Mateo Díaz', description: 'Desarrollo' };

@Component({
  selector: 'doc-comments-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbComments, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Messages"
      title="Comments"
      lead="Hilo de comentarios y actividad: comentarios con formato y @menciones sobre el editor, respuestas, reacciones con emoji, edición y borrado de los propios y, mezclado por fecha, el historial de cambios. Pensado para el detalle de una tarea, un documento o una solicitud."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="thread"
      title="Hilo de una tarea"
      description="Escribe @ para mencionar a alguien (las menciones a ti se resaltan) y Ctrl + Enter para enviar. Responder abre la caja dentro del hilo; Editar y Eliminar solo aparecen en tus comentarios, y eliminar pide confirmación (si el comentario tiene respuestas, se queda como «Comentario eliminado»). Las reacciones dicen quién reaccionó. El filtro de arriba aparece cuando hay actividad."
      [code]="threadCode"
    >
      <div style="display: grid; gap: 0.5rem; width: 100%; max-width: 44rem">
        <cb-comments
          [(comments)]="comentarios"
          [activity]="actividad"
          [currentUser]="yo"
          [people]="equipo"
          (commentAdd)="onAdd($event)"
          (reactionToggle)="ultimo.set(($event.added ? 'Reaccionaste con ' : 'Quitaste ') + $event.emoji)"
          (commentDelete)="ultimo.set('Eliminaste un comentario')"
        />
        <p class="cm-log">{{ ultimo() }}</p>
      </div>
    </doc-section>

    <doc-section
      id="newest"
      title="Más recientes primero"
      description="order=&quot;newest&quot; pone la caja arriba y los comentarios más nuevos debajo. reactions elige los emojis; replies=&quot;false&quot; quita las respuestas y toolbar, las herramientas del editor."
      [code]="newestCode"
    >
      <div style="width: 100%; max-width: 44rem">
        <cb-comments
          [(comments)]="avisos"
          [currentUser]="yo"
          [people]="equipo"
          order="newest"
          [reactions]="['✅', '👏', '🚀']"
          [replies]="false"
          [toolbar]="['bold', 'italic', 'link']"
          placeholder="Comparte una novedad con el equipo…"
        />
      </div>
    </doc-section>

    <doc-section
      id="readonly"
      title="Solo lectura"
      description="Sin currentUser (o con readonly) el hilo solo se lee: no hay caja para comentar ni acciones, y las reacciones se muestran sin poder cambiarlas."
      [code]="readonlyCode"
    >
      <div style="width: 100%; max-width: 44rem">
        <cb-comments [comments]="comentarios()" [activity]="actividad" [people]="equipo" filter="comments" />
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .cm-log {
        min-height: 1.25rem;
        margin: 0;
        color: var(--cb-color-text-muted);
        font-size: 0.875rem;
      }
    `,
  ],
})
export class CommentsDocComponent {
  protected readonly docApi = DOC_API['cb-comments'];
  protected readonly a11y = DOC_A11Y['cb-comments'];

  protected readonly yo = ANA;
  protected readonly equipo = [ANA, LUIS, CAMILA, MATEO];
  protected readonly ultimo = signal('');

  protected readonly comentarios = signal<readonly CbComment[]>([
    {
      id: 'c1',
      author: LUIS,
      html: '<p>He subido el borrador del informe trimestral. <span data-mention="ana">@Ana López</span>, ¿puedes revisar la sección de riesgo de crédito antes del jueves?</p>',
      date: ago(60 * 26),
      reactions: [{ emoji: '👍', by: ['camila', 'mateo'] }],
    },
    { id: 'c2', author: ANA, html: '<p>Sí, lo reviso mañana a primera hora.</p>', date: ago(60 * 25), parentId: 'c1', reactions: [{ emoji: '🙏', by: ['luis'] }] },
    {
      id: 'c3',
      author: CAMILA,
      html: '<p>He cambiado los gráficos a la paleta corporativa:</p><ul><li>Morosidad por segmento</li><li>Evolución de la cartera</li></ul>',
      date: ago(60 * 3),
      edited: ago(60 * 2),
    },
    { id: 'c4', author: ANA, html: '<p>Revisado. Solo falta actualizar la <strong>tabla de provisiones</strong> con el cierre de septiembre.</p>', date: ago(25) },
  ]);

  protected readonly actividad: CbActivity[] = [
    { id: 'a1', author: LUIS, text: 'creó esta tarea', date: ago(60 * 27) },
    { id: 'a2', author: LUIS, text: 'asignó la tarea a Ana López', date: ago(60 * 26 + 30), icon: 'user' },
    { id: 'a3', author: ANA, text: 'movió la tarea de «Por hacer» a «En curso»', date: ago(60 * 20) },
    { id: 'a4', author: CAMILA, text: 'adjuntó graficos-v2.pdf', date: ago(60 * 3 + 5) },
  ];

  protected readonly avisos = signal<readonly CbComment[]>([
    { id: 'n1', author: MATEO, html: '<p>Desplegada la versión 2.4 en el entorno de pruebas.</p>', date: ago(60 * 5), reactions: [{ emoji: '🚀', by: ['luis', 'camila'] }] },
    { id: 'n2', author: LUIS, html: '<p>Mañana no hay reunión de seguimiento; nos vemos el lunes.</p>', date: ago(40) },
  ]);

  protected onAdd(event: CbCommentEvent): void {
    const nombres = event.mentions.map((id) => this.equipo.find((p) => p.id === id)?.name ?? id);
    this.ultimo.set(nombres.length ? `Publicaste un comentario y mencionaste a ${nombres.join(', ')}` : 'Publicaste un comentario');
  }

  protected readonly importCode = `import { CbComments, type CbComment, type CbActivity, type CbCommentPerson } from '@caribeng/ui/comments';`;
  protected readonly threadCode = `<cb-comments
  [(comments)]="comentarios"
  [activity]="actividad"
  [currentUser]="yo"
  [people]="equipo"
  (commentAdd)="onAdd($event)"
  (reactionToggle)="ultimo.set(($event.added ? 'Reaccionaste con ' : 'Quitaste ') + $event.emoji)"
  (commentDelete)="ultimo.set('Eliminaste un comentario')"
/>`;
  protected readonly newestCode = `<cb-comments
  [(comments)]="avisos"
  [currentUser]="yo"
  [people]="equipo"
  order="newest"
  [reactions]="['✅', '👏', '🚀']"
  [replies]="false"
  [toolbar]="['bold', 'italic', 'link']"
  placeholder="Comparte una novedad con el equipo…"
/>`;
  protected readonly readonlyCode = `<cb-comments [comments]="comentarios()" [activity]="actividad" [people]="equipo" filter="comments" />`;

  constructor() {
    inject(TocService).reset();
  }
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { type CbMention, type CbMentionItem, CbMentions } from '@caribeng/ui/mentions';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-mentions-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbMentions, ReactiveFormsModule, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Form"
      title="Mentions"
      lead="Campo de texto con menciones: al escribir @ (u otro disparador como #) muestra sugerencias junto al cursor, que se filtran sin tildes y se eligen con el teclado o el ratón."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Personas y etiquetas"
      description="Escribe @ para mencionar a alguien o # para una etiqueta. Flechas para moverte, Enter o Tab para elegir y Escape para cerrar. El valor es el texto; (mentionsChange) entrega las menciones presentes con su id."
      [code]="basicCode"
      [codeTs]="basicTs"
    >
      <div class="mn-demo">
        <cb-mentions
          label="Comentario"
          hint="Menciona a una persona con @ o añade una etiqueta con #."
          placeholder="Escribe un comentario…"
          [suggestions]="items"
          [triggers]="['@', '#']"
          [formControl]="comment"
          (mentionsChange)="mentions.set($event)"
        />
        <div class="mn-state">
          <strong>Menciones</strong>
          @for (m of mentions(); track m.trigger + m.id) {
            <code>{{ m.trigger }}{{ m.label }} ({{ m.id }})</code>
          } @empty {
            <span class="mn-muted">Ninguna</span>
          }
        </div>
      </div>
    </doc-section>

    <doc-section
      id="server"
      title="Sugerencias del servidor"
      description="Con [filter]=&quot;false&quot; la lista no se filtra: escucha (search) con { trigger, query }, pide las sugerencias y activa loading mientras llegan."
      [code]="serverCode"
    >
      <cb-mentions
        style="width: 100%; max-width: 32rem"
        label="Asignar a"
        [rows]="2"
        [suggestions]="remote()"
        [filter]="false"
        [loading]="loading()"
        (search)="find($event.query)"
      />
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .mn-demo {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 14rem);
        gap: 1.5rem;
        width: 100%;
        align-items: start;
      }
      .mn-state {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        font-size: 0.875rem;
      }
      .mn-muted {
        color: var(--cb-color-text-muted);
      }
      @media (max-width: 640px) {
        .mn-demo {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class MentionsDocComponent {
  protected readonly docApi = DOC_API['cb-mentions'];
  protected readonly a11y = DOC_A11Y['cb-mentions'];

  protected readonly items: CbMentionItem[] = [
    { id: 'u1', label: 'Laura Gómez', description: 'Gerente de producto' },
    { id: 'u2', label: 'Andrés Pérez', description: 'Desarrollo' },
    { id: 'u3', label: 'Ángela Ruiz', description: 'Diseño' },
    { id: 'u4', label: 'Mateo Díaz', description: 'Riesgos' },
    { id: 'u5', label: 'Valentina Torres', description: 'Atención al cliente' },
    { id: 't1', label: 'urgente', trigger: '#' },
    { id: 't2', label: 'fraude', trigger: '#' },
    { id: 't3', label: 'seguimiento', trigger: '#' },
  ];
  protected readonly comment = new FormControl('', { nonNullable: true });
  protected readonly mentions = signal<CbMention[]>([]);

  // --- "Servidor" simulado ---
  private readonly directory = ['Sofía Castro', 'Santiago Rojas', 'Isabella Moreno', 'Samuel Vargas', 'Lucía Herrera'];
  protected readonly remote = signal<CbMentionItem[]>([]);
  protected readonly loading = signal(false);
  private timer: ReturnType<typeof setTimeout> | null = null;

  protected find(query: string): void {
    if (this.timer) clearTimeout(this.timer);
    this.loading.set(true);
    this.remote.set([]);
    this.timer = setTimeout(() => {
      const q = query.toLowerCase();
      this.remote.set(
        this.directory.filter((n) => n.toLowerCase().includes(q)).map((label, i) => ({ id: `s${i}`, label, description: 'Directorio' })),
      );
      this.loading.set(false);
    }, 350);
  }

  protected readonly importCode = `import { CbMentions, type CbMention, type CbMentionItem } from '@caribeng/ui/mentions';`;
  protected readonly basicCode = `<cb-mentions
  label="Comentario"
  [suggestions]="equipo"
  [triggers]="['@', '#']"
  formControlName="comentario"
  (mentionsChange)="menciones = $event" />`;
  protected readonly basicTs = `equipo: CbMentionItem[] = [
  { id: 'u1', label: 'Laura Gómez', description: 'Gerente de producto' },
  { id: 'u2', label: 'Andrés Pérez', description: 'Desarrollo' },
  { id: 't1', label: 'urgente', trigger: '#' },
];`;
  protected readonly serverCode = `<cb-mentions [suggestions]="resultados()" [filter]="false" [loading]="cargando()"
  (search)="buscar($event.query)" />`;

  constructor() {
    inject(TocService).reset();
  }
}

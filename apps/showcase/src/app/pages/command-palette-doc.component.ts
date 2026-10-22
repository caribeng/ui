import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbButton } from '@caribeng/ui/button';
import { type CbCommandItem, CbCommandPalette } from '@caribeng/ui/command-palette';
import { CbKbd } from '@caribeng/ui/kbd';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-command-palette-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbCommandPalette, CbButton, CbKbd, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Overlay"
      title="CommandPalette"
      lead="Buscador global de páginas y acciones con teclado (Ctrl/⌘ + K). Filtra sin tildes ni mayúsculas, agrupa, resalta la coincidencia y muestra atajos."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Básico"
      description="Pulsa Ctrl + K (⌘ K en Mac) en cualquier parte de esta página, o usa el botón. Cada item puede tener group, icon, description, keywords (sinónimos), shortcut y command."
      [code]="basicCode"
      [codeTs]="basicTs"
    >
      <div class="cmd-row">
        <cb-button variant="outlined" (click)="visible.set(true)">Buscar… <cb-kbd [keys]="['mod', 'K']" size="sm" /></cb-button>
        <span class="cmd-log">Última acción: {{ last() }}</span>
      </div>
      <cb-command-palette [items]="items" [(visible)]="visible" (itemSelect)="last.set($event.item.label)" />
    </doc-section>

    <doc-section
      id="server"
      title="Resultados del servidor"
      description="Con [filter]=&quot;false&quot; la paleta no filtra: escucha (queryChange) o [(query)], pide los resultados y actívalo con loading mientras llegan. shortcut cambia o desactiva (&quot;&quot;) el atajo."
      [code]="serverCode"
    >
      <cb-button variant="outlined" (click)="serverVisible.set(true)">Buscar clientes</cb-button>
      <cb-command-palette
        [items]="serverItems()"
        [(visible)]="serverVisible"
        [(query)]="serverQuery"
        [filter]="false"
        [loading]="loading()"
        shortcut=""
        placeholder="Nombre o documento del cliente…"
        (queryChange)="search($event)"
        (itemSelect)="last.set($event.item.label)"
      />
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .cmd-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 1rem;
      }
      .cmd-log {
        color: var(--cb-color-text-muted);
        font-size: 0.875rem;
      }
    `,
  ],
})
export class CommandPaletteDocComponent {
  protected readonly docApi = DOC_API['cb-command-palette'];
  protected readonly a11y = DOC_A11Y['cb-command-palette'];

  protected readonly visible = signal(false);
  protected readonly last = signal('—');

  protected readonly items: CbCommandItem[] = [
    { label: 'Inicio', icon: 'house', group: 'Páginas' },
    { label: 'Movimientos', icon: 'clock', group: 'Páginas', keywords: ['extracto', 'historial'] },
    { label: 'Configuración', icon: 'settings', group: 'Páginas', keywords: ['ajustes', 'preferencias'] },
    { label: 'Transferir dinero', icon: 'arrow-right-left', group: 'Acciones', shortcut: ['mod', 'T'] },
    { label: 'Pagar servicios', icon: 'landmark', group: 'Acciones', description: 'Luz, agua, gas, internet' },
    { label: 'Descargar extracto', icon: 'download', group: 'Acciones', shortcut: ['mod', 'shift', 'E'] },
    { label: 'Bloquear tarjeta', icon: 'lock', group: 'Acciones', description: 'Requiere confirmación', disabled: true },
    { label: 'Cambiar tema', icon: 'moon', group: 'Preferencias', keywords: ['oscuro', 'claro', 'dark'] },
  ];

  // --- Resultados "del servidor" simulados ---
  private readonly customers = ['Laura Gómez', 'Andrés Pérez', 'Camila Rodríguez', 'Mateo Ruiz', 'Valentina Díaz', 'Sebastián Torres'];
  protected readonly serverVisible = signal(false);
  protected readonly serverQuery = signal('');
  protected readonly serverItems = signal<CbCommandItem[]>([]);
  protected readonly loading = signal(false);
  private timer: ReturnType<typeof setTimeout> | null = null;

  protected search(query: string): void {
    if (this.timer) clearTimeout(this.timer);
    this.loading.set(true);
    this.serverItems.set([]);
    this.timer = setTimeout(() => {
      const q = query.trim().toLowerCase();
      this.serverItems.set(
        this.customers
          .filter((name) => name.toLowerCase().includes(q))
          .map((name, i) => ({ label: name, icon: 'user', description: `CC 10${i}4 5${i}8 ${i}21`, group: 'Clientes' })),
      );
      this.loading.set(false);
    }, 400);
  }

  protected readonly importCode = `import { CbCommandPalette, type CbCommandItem } from '@caribeng/ui/command-palette';`;
  protected readonly basicCode = `<cb-command-palette [items]="comandos" (itemSelect)="onComando($event.item)" />`;
  protected readonly basicTs = `comandos: CbCommandItem[] = [
  { label: 'Inicio', icon: 'house', group: 'Páginas', command: () => this.router.navigateByUrl('/') },
  { label: 'Configuración', icon: 'settings', group: 'Páginas', keywords: ['ajustes'] },
  { label: 'Transferir dinero', icon: 'arrow-right-left', group: 'Acciones', shortcut: ['mod', 'T'] },
  { label: 'Bloquear tarjeta', icon: 'lock', group: 'Acciones', disabled: true },
];`;
  protected readonly serverCode = `<cb-command-palette
  [items]="resultados()"
  [filter]="false"
  [loading]="cargando()"
  [(visible)]="abierta"
  (queryChange)="buscar($event)"
  shortcut="" />`;

  constructor() {
    inject(TocService).reset();
  }
}

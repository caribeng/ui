import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbInfiniteScroll } from '@caribeng/ui/infinite-scroll';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

interface Movimiento {
  id: number;
  concepto: string;
  importe: number;
}

const CONCEPTOS = ['Supermercado', 'Transferencia recibida', 'Gasolina', 'Restaurante', 'Nómina', 'Farmacia', 'Suscripción', 'Retiro en cajero'];

/** Página `n` (desde 0) de movimientos de prueba; hay 60 en total. */
function pagina(n: number, tam = 12): Movimiento[] {
  return Array.from({ length: tam }, (_, i) => {
    const id = n * tam + i + 1;
    const concepto = CONCEPTOS[id % CONCEPTOS.length];
    return { id, concepto, importe: (concepto === 'Nómina' || concepto.startsWith('Transferencia') ? 1 : -1) * (((id * 7919) % 480000) + 12000) };
  }).filter((m) => m.id <= 60);
}

/** Lista que se carga por páginas con un retraso, como una API. */
class Fuente {
  readonly items = signal<Movimiento[]>(pagina(0));
  readonly cargando = signal(false);
  readonly hayMas = signal(true);
  readonly error = signal(false);
  private siguiente = 1;
  fallarUnaVez = false;

  cargar(): void {
    this.cargando.set(true);
    this.error.set(false);
    setTimeout(() => {
      if (this.fallarUnaVez) {
        this.fallarUnaVez = false;
        this.error.set(true);
      } else {
        const nuevos = pagina(this.siguiente++);
        this.items.update((l) => [...l, ...nuevos]);
        this.hayMas.set(this.items().length < 60);
      }
      this.cargando.set(false);
    }, 700);
  }
}

@Component({
  selector: 'doc-infinite-scroll-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbInfiniteScroll, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Data"
      title="InfiniteScroll"
      lead="Scroll infinito para listas largas: pide la siguiente página al acercarse al final, con un botón «Cargar más» como alternativa. Tras unas cuantas cargas automáticas pasa al botón para que el pie de la página siga siendo alcanzable, anuncia lo que llega y, al cargar con el botón, lleva el foco al primer elemento nuevo."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="auto"
      title="Movimientos de la cuenta"
      description="El propio componente hace scroll (scrollable) y pide más al acercarse al final (loadMore). Con autoLimit=&quot;2&quot;, tras dos cargas automáticas aparece «Cargar más»; al pulsarlo, vuelve a cargar solo. [count] le dice cuántos hay para anunciar cuántos llegaron."
      [code]="autoCode"
    >
      <div style="width: 100%; max-width: 32rem">
        <cb-infinite-scroll scrollable height="22rem" [autoLimit]="2" [loading]="a.cargando()" [hasMore]="a.hayMas()" [count]="a.items().length" (loadMore)="a.cargar()">
          <ul class="is-list" aria-label="Movimientos">
            @for (m of a.items(); track m.id) {
              <li class="is-row">
                <span>{{ m.concepto }}</span>
                <strong [class.is-in]="m.importe > 0">{{ fmt(m.importe) }}</strong>
              </li>
            }
          </ul>
        </cb-infinite-scroll>
      </div>
    </doc-section>

    <doc-section
      id="button"
      title="Solo con botón y con errores"
      description="mode=&quot;button&quot; nunca carga solo: útil cuando hay contenido importante después de la lista. Si la carga falla ([error]), aparece el aviso y «Reintentar». Pulsa «Simular fallo» y después «Cargar más»."
      [code]="buttonCode"
    >
      <div style="display: grid; gap: 0.75rem; width: 100%; max-width: 32rem">
        <button type="button" class="is-sim" (click)="b.fallarUnaVez = true">Simular fallo en la siguiente carga</button>
        <cb-infinite-scroll mode="button" [loading]="b.cargando()" [hasMore]="b.hayMas()" [error]="b.error()" [count]="b.items().length" (loadMore)="b.cargar()">
          <ul class="is-list" aria-label="Movimientos">
            @for (m of b.items(); track m.id) {
              <li class="is-row">
                <span>{{ m.concepto }}</span>
                <strong [class.is-in]="m.importe > 0">{{ fmt(m.importe) }}</strong>
              </li>
            }
          </ul>
        </cb-infinite-scroll>
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .is-list {
        margin: 0;
        padding: 0;
        list-style: none;
      }
      .is-row {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.625rem 0.75rem;
        border-bottom: 1px solid var(--cb-color-border);
      }
      .is-row strong {
        font-variant-numeric: tabular-nums;
      }
      .is-in {
        color: var(--cb-color-success);
      }
      .is-sim {
        justify-self: start;
        padding: 0.375rem 0.75rem;
        border: 1px solid var(--cb-color-border-strong);
        border-radius: 6px;
        background: transparent;
        color: var(--cb-color-text);
        font: inherit;
        font-size: 0.8125rem;
        cursor: pointer;
      }
    `,
  ],
})
export class InfiniteScrollDocComponent {
  protected readonly docApi = DOC_API['cb-infinite-scroll'];
  protected readonly a11y = DOC_A11Y['cb-infinite-scroll'];

  protected readonly a = new Fuente();
  protected readonly b = new Fuente();
  private readonly moneda = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

  protected fmt(n: number): string {
    return this.moneda.format(n);
  }

  protected readonly importCode = `import { CbInfiniteScroll } from '@caribeng/ui/infinite-scroll';`;
  protected readonly autoCode = `<cb-infinite-scroll scrollable height="22rem" [autoLimit]="2" [loading]="a.cargando()" [hasMore]="a.hayMas()" [count]="a.items().length" (loadMore)="a.cargar()">
  <ul class="is-list" aria-label="Movimientos">
    @for (m of a.items(); track m.id) {
      <li class="is-row">
        <span>{{ m.concepto }}</span>
        <strong [class.is-in]="m.importe > 0">{{ fmt(m.importe) }}</strong>
      </li>
    }
  </ul>
</cb-infinite-scroll>`;
  protected readonly buttonCode = `<button type="button" class="is-sim" (click)="b.fallarUnaVez = true">Simular fallo en la siguiente carga</button>
<cb-infinite-scroll mode="button" [loading]="b.cargando()" [hasMore]="b.hayMas()" [error]="b.error()" [count]="b.items().length" (loadMore)="b.cargar()">
  <ul class="is-list" aria-label="Movimientos">
    @for (m of b.items(); track m.id) {
      <li class="is-row">
        <span>{{ m.concepto }}</span>
        <strong [class.is-in]="m.importe > 0">{{ fmt(m.importe) }}</strong>
      </li>
    }
  </ul>
</cb-infinite-scroll>`;

  constructor() {
    inject(TocService).reset();
  }
}

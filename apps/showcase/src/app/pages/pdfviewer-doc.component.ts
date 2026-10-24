import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbPdfViewer, type CbPdfAnnotation, type CbPdfRotation, type CbPdfSource, type CbPdfZoom } from '@caribeng/ui/pdfviewer';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-pdfviewer-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbPdfViewer, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Multimedia"
      title="PDF Viewer"
      lead="Visor de documentos PDF con miniaturas, índice, enlaces, formularios rellenables, búsqueda, zoom, giro, descarga, impresión y documentos con contraseña. El texto se puede seleccionar y lo leen los lectores de pantalla."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="setup"
      title="Instalación"
      description="El visor usa pdf.js de Mozilla (licencia Apache-2.0), una dependencia opcional: solo la instalan las aplicaciones que usan el visor, y se descarga al abrir el primer documento. Copia su worker y sus recursos en los assets para servirlos desde tu propio dominio (sin CDN), lo que también cumple políticas CSP estrictas."
    >
      <div style="display: grid; gap: 1rem; width: 100%">
        <doc-code-block [code]="installCode" lang="bash" />
        <doc-code-block [code]="assetsCode" lang="typescript" />
        <doc-code-block [code]="providerCode" lang="typescript" />
      </div>
    </doc-section>

    <doc-section
      id="basic"
      title="Básico"
      description="src acepta una URL, un ArrayBuffer, un Uint8Array o un Blob / File. Las páginas se renderizan a medida que se ven. Prueba a buscar &quot;direccion&quot;: la búsqueda ignora tildes y mayúsculas."
      [code]="basicCode"
    >
      <cb-pdf-viewer src="pdf/extracto-demo.pdf" />
    </doc-section>

    <doc-section
      id="state"
      title="Página, zoom y miniaturas"
      description="[(page)], [(zoom)] y [(sidebar)] son bidireccionales. zoom acepta 'page-width', 'page-fit' o un factor (1 = 100 %, tamaño real)."
      [code]="stateCode"
      [codeTs]="stateTs"
    >
      <div style="display: grid; gap: 0.75rem; width: 100%">
        <cb-pdf-viewer
          style="--cb-pdf-viewer-height: 32rem"
          src="pdf/extracto-demo.pdf"
          [(page)]="pagina"
          [(zoom)]="zoom"
          [(sidebar)]="miniaturas"
        />
        <p style="margin: 0; font-size: 0.875rem; color: var(--cb-color-text-muted)">
          Página {{ pagina() }} · zoom {{ zoom() }} · miniaturas {{ miniaturas() ? 'abiertas' : 'cerradas' }}
        </p>
      </div>
    </doc-section>

    <doc-section
      id="password"
      title="Documento con contraseña"
      description="Si el PDF está cifrado, el visor pide la contraseña y avisa si es incorrecta. También puedes pasarla con [password]. La contraseña de este ejemplo es caribe."
      [code]="passwordCode"
    >
      <cb-pdf-viewer style="--cb-pdf-viewer-height: 26rem" src="pdf/extracto-protegido.pdf" />
    </doc-section>

    <doc-section
      id="forms"
      title="Índice, enlaces y formularios"
      description="Si el documento tiene marcadores, el panel lateral muestra la pestaña Índice. Los enlaces internos llevan a su página y posición, y los externos se abren en otra pestaña. Los campos de formulario se rellenan en el visor; Descargar e Imprimir incluyen lo escrito, getFormData() devuelve los valores por nombre de campo y save() el PDF relleno como Blob."
      [code]="formsCode"
    >
      <div style="display: grid; gap: 0.75rem; width: 100%">
        <cb-pdf-viewer
          #solicitud
          style="--cb-pdf-viewer-height: 34rem"
          src="pdf/solicitud-formulario.pdf"
          [sidebar]="true"
          sidebarView="outline"
          (formChange)="cambios.set(cambios() + 1)"
        />
        <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap">
          <button type="button" class="doc-btn" (click)="verDatos(solicitud)">Ver datos del formulario</button>
          <button type="button" class="doc-btn" (click)="obtenerPdf(solicitud)">Obtener el PDF relleno (save)</button>
          @if (pdfRelleno()) {
            <span style="font-size: 0.875rem">{{ pdfRelleno() }}</span>
          }
          <span style="font-size: 0.875rem; color: var(--cb-color-text-muted)">Cambios: {{ cambios() }}</span>
        </div>
        @if (datos(); as d) {
          <pre class="doc-pre" aria-label="Datos del formulario">{{ d }}</pre>
        }
      </div>
    </doc-section>

    <doc-section
      id="annotations"
      title="Anotaciones y firma"
      description="Con annotatable, la barra añade Resaltar (con texto seleccionado lo resalta al momento; si no, resalta lo que selecciones después), Nota (clic en la página; con el teclado se pone en la página visible), Dibujar y Firmar, que abre un panel de firma y la coloca en la página. Con el foco en una anotación, las flechas la mueven, + y − cambian su tamaño, Intro edita la nota o el comentario del resaltado y Supr la borra; la pestaña Anotaciones del panel lateral las lista todas. [(annotations)] las da en puntos PDF para guardarlas en tu servidor, y Descargar, Imprimir y save() las escriben en el PDF como anotaciones estándar que se ven en cualquier lector."
      [code]="annotationsCode"
      [codeTs]="annotationsTs"
    >
      <div style="display: grid; gap: 0.75rem; width: 100%">
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center">
          <button type="button" class="doc-btn" (click)="anotaciones.set(ejemploAnotaciones)">Cargar anotaciones de ejemplo</button>
          <button type="button" class="doc-btn" (click)="anotaciones.set([])">Quitar todas</button>
          <span style="font-size: 0.875rem; color: var(--cb-color-text-muted)">{{ anotaciones().length }} anotaciones</span>
        </div>
        <cb-pdf-viewer
          style="--cb-pdf-viewer-height: 36rem"
          src="pdf/extracto-demo.pdf"
          fileName="extracto-anotado.pdf"
          annotatable
          author="Ana Pérez"
          [(annotations)]="anotaciones"
          [sidebar]="true"
          sidebarView="annotations"
        />
      </div>
    </doc-section>

    <doc-section
      id="search"
      title="Búsqueda"
      description="Escribe en el campo de búsqueda (o pulsa Ctrl + F dentro del visor): resalta todas las coincidencias, ignora tildes y mayúsculas, y Enter / Mayús + Enter recorren la siguiente y la anterior; Escape la vacía. También se busca por código con search(); este ejemplo busca &quot;Supermercado&quot; al abrir el documento."
      [code]="searchCode"
    >
      <cb-pdf-viewer #buscador style="--cb-pdf-viewer-height: 26rem" src="pdf/extracto-demo.pdf" (loaded)="buscador.search('Supermercado')" />
    </doc-section>

    <doc-section
      id="rotation"
      title="Giro"
      description="[(rotation)] gira todas las páginas 0, 90, 180 o 270 grados; el botón de la barra gira 90° a la derecha y rotate(-1) a la izquierda. Las miniaturas y la impresión respetan el giro."
      [code]="rotationCode"
    >
      <div style="display: grid; gap: 0.75rem; width: 100%">
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center">
          @for (grados of giros; track grados) {
            <button type="button" class="doc-btn" [attr.aria-pressed]="giro() === grados" (click)="giro.set(grados)">{{ grados }}°</button>
          }
        </div>
        <cb-pdf-viewer style="--cb-pdf-viewer-height: 26rem" src="pdf/extracto-demo.pdf" zoom="page-fit" [(rotation)]="giro" />
      </div>
    </doc-section>

    <doc-section
      id="toolbar"
      title="Barra reducida"
      description="Cada parte de la barra se puede quitar: showSearch, showRotate, showThumbnails, downloadable y printable. Aquí solo quedan la paginación y el zoom."
      [code]="toolbarCode"
    >
      <cb-pdf-viewer
        style="--cb-pdf-viewer-height: 24rem"
        src="pdf/extracto-demo.pdf"
        [showSearch]="false"
        [showRotate]="false"
        [showThumbnails]="false"
        [downloadable]="false"
        [printable]="false"
      />
    </doc-section>

    <doc-section
      id="download"
      title="Descargar e imprimir"
      description="Descargar guarda el documento con el nombre de fileName (por defecto, el de la URL o del File). Imprimir abre el diálogo del navegador con las páginas del PDF, no con la página de la aplicación, y muestra el progreso mientras las prepara. Ambos se pueden llamar por código con download() y print()."
      [code]="downloadCode"
    >
      <div style="display: grid; gap: 0.75rem; width: 100%">
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
          <button type="button" class="doc-btn" (click)="extracto.download()">Descargar «extracto-septiembre-2026.pdf»</button>
          <button type="button" class="doc-btn" (click)="extracto.print()">Imprimir</button>
        </div>
        <cb-pdf-viewer #extracto style="--cb-pdf-viewer-height: 24rem" src="pdf/extracto-demo.pdf" fileName="extracto-septiembre-2026.pdf" />
      </div>
    </doc-section>

    <doc-section
      id="events"
      title="Eventos y errores"
      description="loaded avisa al abrir el documento (con su número de páginas) y loadError si no se pudo abrir: el visor muestra el error con role=alert. Cambia de documento para ver los dos casos."
      [code]="eventsCode"
    >
      <div style="display: grid; gap: 0.75rem; width: 100%">
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center">
          <button type="button" class="doc-btn" (click)="origen.set('pdf/extracto-demo.pdf')">Documento válido</button>
          <button type="button" class="doc-btn" (click)="origen.set('pdf/no-existe.pdf')">Archivo que no existe</button>
          <span style="font-size: 0.875rem; color: var(--cb-color-text-muted)">{{ registro() }}</span>
        </div>
        <cb-pdf-viewer
          style="--cb-pdf-viewer-height: 22rem"
          [src]="origen()"
          (loaded)="registro.set('loaded: ' + $event.numPages + ' páginas')"
          (loadError)="registro.set('loadError: no se pudo abrir el documento')"
        />
      </div>
    </doc-section>

    <doc-section
      id="forms-off"
      title="Formulario como imagen y enlaces desactivados"
      description="Con [forms]=&quot;false&quot; los campos se pintan como parte de la página y no se pueden editar; [externalLinks]=&quot;false&quot; desactiva los enlaces a otras webs (los internos siguen funcionando) y [showOutline]=&quot;false&quot; oculta la pestaña Índice."
      [code]="formsOffCode"
    >
      <cb-pdf-viewer
        style="--cb-pdf-viewer-height: 26rem"
        src="pdf/solicitud-formulario.pdf"
        [forms]="false"
        [externalLinks]="false"
        [showOutline]="false"
      />
    </doc-section>

    <doc-section
      id="file"
      title="Archivo local"
      description="Con un File de un input type=file el documento se abre sin subirlo a ningún servidor. fileName define el nombre al descargar."
      [code]="fileCode"
      [codeTs]="fileTs"
    >
      <div style="display: grid; gap: 0.75rem; width: 100%">
        <label style="display: grid; gap: 0.375rem; font-size: 0.875rem">
          Elige un PDF
          <input type="file" accept="application/pdf" (change)="onFile($event)" />
        </label>
        @if (archivo(); as file) {
          <cb-pdf-viewer style="--cb-pdf-viewer-height: 30rem" [src]="file" />
        }
      </div>
    </doc-section>

    <doc-section
      id="api"
      title="Barra propia"
      description="Sin la barra (showToolbar en false), controla el visor con sus métodos: goToPage, zoomIn, zoomOut, rotate, search, findNext, findPrevious, download y print."
      [code]="apiCode"
    >
      <div style="display: grid; gap: 0.75rem; width: 100%">
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
          <button type="button" class="doc-btn" (click)="visor.previousPage()">Anterior</button>
          <button type="button" class="doc-btn" (click)="visor.nextPage()">Siguiente</button>
          <button type="button" class="doc-btn" (click)="visor.zoomIn()">Acercar</button>
          <button type="button" class="doc-btn" (click)="visor.search('Supermercado')">Buscar "Supermercado"</button>
          <button type="button" class="doc-btn" (click)="visor.findNext()">Siguiente coincidencia</button>
        </div>
        <cb-pdf-viewer #visor [showToolbar]="false" style="--cb-pdf-viewer-height: 26rem" src="pdf/extracto-demo.pdf" zoom="page-fit" />
      </div>
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: `
    .doc-btn {
      padding: 0.375rem 0.75rem;
      border: 1px solid var(--cb-color-border-strong);
      border-radius: var(--cb-radius-md);
      background: var(--cb-color-surface);
      color: var(--cb-color-text);
      font: inherit;
      font-size: 0.875rem;
      cursor: pointer;
    }
    .doc-btn:hover {
      background: var(--cb-color-surface-hover);
    }
    .doc-pre {
      margin: 0;
      padding: 0.75rem;
      border-radius: var(--cb-radius-md);
      background: var(--cb-color-surface-subtle);
      font-size: 0.8125rem;
      white-space: pre-wrap;
    }
    .doc-btn:focus-visible {
      outline: 2px solid var(--cb-color-focus-ring);
      outline-offset: 2px;
    }
  `,
})
export class PdfviewerDocComponent {
  protected readonly docApi = DOC_API['cb-pdf-viewer'];
  protected readonly a11y = DOC_A11Y['cb-pdf-viewer'];

  protected readonly pagina = signal(1);
  protected readonly zoom = signal<CbPdfZoom>('page-width');
  protected readonly miniaturas = signal(true);
  protected readonly archivo = signal<CbPdfSource | null>(null);

  protected readonly cambios = signal(0);
  protected readonly ejemploAnotaciones: readonly CbPdfAnnotation[] = [
    {
      id: 'ejemplo-1',
      page: 1,
      type: 'highlight',
      rects: [[108, 375, 220, 388]],
      color: 'yellow',
      text: 'Supermercado La Ceiba',
      comment: 'No reconozco este cargo',
      author: 'Ana Pérez',
    },
    { id: 'ejemplo-2', page: 1, type: 'note', rect: [330, 516, 462, 532], text: 'Confirmar con el titular', color: 'red', author: 'Ana Pérez' },
  ];
  protected readonly anotaciones = signal<readonly CbPdfAnnotation[]>(this.ejemploAnotaciones);
  protected readonly annotationsCode = `<cb-pdf-viewer
  src="pdf/extracto-demo.pdf"
  fileName="extracto-anotado.pdf"
  annotatable
  author="Ana Pérez"
  [(annotations)]="anotaciones"
  [sidebar]="true"
  sidebarView="annotations"
/>`;
  protected readonly annotationsTs = `import { signal } from '@angular/core';
import { CbPdfViewer, type CbPdfAnnotation } from '@caribeng/ui/pdfviewer';

// Coordenadas en puntos PDF (y hacia arriba): no cambian con el zoom ni el giro.
anotaciones = signal<readonly CbPdfAnnotation[]>([
  {
    id: 'ejemplo-1',
    page: 1,
    type: 'highlight',
    rects: [[108, 375, 220, 388]],
    color: 'yellow',
    text: 'Supermercado La Ceiba',
    comment: 'No reconozco este cargo',
  },
  { id: 'ejemplo-2', page: 1, type: 'note', rect: [330, 516, 462, 532], text: 'Confirmar con el titular', color: 'red' },
]);`;
  protected readonly pdfRelleno = signal('');
  protected readonly giros: CbPdfRotation[] = [0, 90, 180, 270];
  protected readonly giro = signal<CbPdfRotation>(0);
  protected readonly origen = signal('pdf/extracto-demo.pdf');
  protected readonly registro = signal('');

  protected async obtenerPdf(visor: CbPdfViewer): Promise<void> {
    const pdf = await visor.save();
    this.pdfRelleno.set(pdf ? `PDF de ${Math.round(pdf.size / 1024)} KB listo para enviar al servidor.` : '');
  }
  protected readonly datos = signal('');

  protected async verDatos(visor: CbPdfViewer): Promise<void> {
    this.datos.set(JSON.stringify(await visor.getFormData(), null, 2));
  }

  protected onFile(event: Event): void {
    this.archivo.set((event.target as HTMLInputElement).files?.[0] ?? null);
  }

  protected readonly formsCode = `<div style="display: grid; gap: 0.75rem; width: 100%">
  <cb-pdf-viewer
    #solicitud
    style="--cb-pdf-viewer-height: 34rem"
    src="pdf/solicitud-formulario.pdf"
    [sidebar]="true"
    sidebarView="outline"
    (formChange)="cambios.set(cambios() + 1)"
  />
  <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap">
    <button type="button" class="doc-btn" (click)="verDatos(solicitud)">Ver datos del formulario</button>
    <button type="button" class="doc-btn" (click)="obtenerPdf(solicitud)">Obtener el PDF relleno (save)</button>
    @if (pdfRelleno()) {
      <span style="font-size: 0.875rem">{{ pdfRelleno() }}</span>
    }
    <span style="font-size: 0.875rem; color: var(--cb-color-text-muted)">Cambios: {{ cambios() }}</span>
  </div>
  @if (datos(); as d) {
    <pre class="doc-pre" aria-label="Datos del formulario">{{ d }}</pre>
  }
</div>`;
  protected readonly searchCode = `<cb-pdf-viewer #buscador style="--cb-pdf-viewer-height: 26rem" src="pdf/extracto-demo.pdf" (loaded)="buscador.search('Supermercado')" />`;
  protected readonly rotationCode = `<div style="display: grid; gap: 0.75rem; width: 100%">
  <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center">
    @for (grados of giros; track grados) {
      <button type="button" class="doc-btn" [attr.aria-pressed]="giro() === grados" (click)="giro.set(grados)">{{ grados }}°</button>
    }
  </div>
  <cb-pdf-viewer style="--cb-pdf-viewer-height: 26rem" src="pdf/extracto-demo.pdf" zoom="page-fit" [(rotation)]="giro" />
</div>`;
  protected readonly toolbarCode = `<cb-pdf-viewer
  style="--cb-pdf-viewer-height: 24rem"
  src="pdf/extracto-demo.pdf"
  [showSearch]="false"
  [showRotate]="false"
  [showThumbnails]="false"
  [downloadable]="false"
  [printable]="false"
/>`;
  protected readonly downloadCode = `<div style="display: grid; gap: 0.75rem; width: 100%">
  <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
    <button type="button" class="doc-btn" (click)="extracto.download()">Descargar «extracto-septiembre-2026.pdf»</button>
    <button type="button" class="doc-btn" (click)="extracto.print()">Imprimir</button>
  </div>
  <cb-pdf-viewer #extracto style="--cb-pdf-viewer-height: 24rem" src="pdf/extracto-demo.pdf" fileName="extracto-septiembre-2026.pdf" />
</div>`;
  protected readonly eventsCode = `<div style="display: grid; gap: 0.75rem; width: 100%">
  <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center">
    <button type="button" class="doc-btn" (click)="origen.set('pdf/extracto-demo.pdf')">Documento válido</button>
    <button type="button" class="doc-btn" (click)="origen.set('pdf/no-existe.pdf')">Archivo que no existe</button>
    <span style="font-size: 0.875rem; color: var(--cb-color-text-muted)">{{ registro() }}</span>
  </div>
  <cb-pdf-viewer
    style="--cb-pdf-viewer-height: 22rem"
    [src]="origen()"
    (loaded)="registro.set('loaded: ' + $event.numPages + ' páginas')"
    (loadError)="registro.set('loadError: no se pudo abrir el documento')"
  />
</div>`;
  protected readonly formsOffCode = `<cb-pdf-viewer
  style="--cb-pdf-viewer-height: 26rem"
  src="pdf/solicitud-formulario.pdf"
  [forms]="false"
  [externalLinks]="false"
  [showOutline]="false"
/>`;
  protected readonly importCode = `import { CbPdfViewer } from '@caribeng/ui/pdfviewer';`;
  protected readonly installCode = `pnpm add pdfjs-dist`;
  protected readonly assetsCode = `// angular.json → projects.<app>.architect.build.options.assets
{ "glob": "pdf.worker.min.mjs", "input": "node_modules/pdfjs-dist/legacy/build", "output": "pdfjs/build" },
{ "glob": "**/*", "input": "node_modules/pdfjs-dist/cmaps", "output": "pdfjs/cmaps" },
{ "glob": "**/*", "input": "node_modules/pdfjs-dist/standard_fonts", "output": "pdfjs/standard_fonts" },
{ "glob": "**/*", "input": "node_modules/pdfjs-dist/wasm", "output": "pdfjs/wasm" },
{ "glob": "**/*", "input": "node_modules/pdfjs-dist/iccs", "output": "pdfjs/iccs" }`;
  protected readonly providerCode = `// Opcional: solo si sirves los archivos en otra ruta.
import { provideCbPdfViewer } from '@caribeng/ui/pdfviewer';

bootstrapApplication(App, {
  providers: [
    provideCaribeNG(),
    provideCbPdfViewer({
      workerSrc: '/static/pdfjs/build/pdf.worker.min.mjs',
      assetsUrl: '/static/pdfjs/',
    }),
  ],
});`;
  protected readonly basicCode = `<cb-pdf-viewer src="pdf/extracto-demo.pdf" />`;
  protected readonly stateCode = `<cb-pdf-viewer
  style="--cb-pdf-viewer-height: 32rem"
  src="pdf/extracto-demo.pdf"
  [(page)]="pagina"
  [(zoom)]="zoom"
  [(sidebar)]="miniaturas"
/>`;
  protected readonly stateTs = `pagina = signal(1);
zoom = signal<CbPdfZoom>('page-width');
miniaturas = signal(true);`;
  protected readonly passwordCode = `<cb-pdf-viewer src="pdf/extracto-protegido.pdf" />

<!-- o, si ya conoces la contraseña -->
<cb-pdf-viewer src="pdf/extracto-protegido.pdf" password="caribe" />`;
  protected readonly fileCode = `<input type="file" accept="application/pdf" (change)="onFile($event)" />
@if (archivo(); as file) {
  <cb-pdf-viewer [src]="file" />
}`;
  protected readonly fileTs = `archivo = signal<CbPdfSource | null>(null);

onFile(event: Event) {
  this.archivo.set((event.target as HTMLInputElement).files?.[0] ?? null);
}`;
  protected readonly apiCode = `<button (click)="visor.zoomIn()">Acercar</button>
<button (click)="visor.search('Supermercado')">Buscar</button>
<button (click)="visor.findNext()">Siguiente coincidencia</button>

<cb-pdf-viewer #visor [showToolbar]="false" src="pdf/extracto-demo.pdf" zoom="page-fit" />`;

  constructor() {
    inject(TocService).reset();
  }
}

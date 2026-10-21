import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { CbEditor, type CbEditorImageUpload, type CbEditorTool } from '@caribeng/ui/editor';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'doc-editor-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocA11yComponent, DocPlaygroundComponent, CbEditor, ReactiveFormsModule, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Formulario"
      title="Editor"
      lead="Editor de texto enriquecido sin dependencias. El valor es HTML saneado y normalizado: se puede guardar y volver a cargar sin riesgo de scripts, igual en todos los navegadores."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Guardar y volver a cargar"
      description="[(value)] (o un FormControl) es el HTML del contenido. Al cargarlo se sanea con una lista blanca de etiquetas y atributos, y al editar se emite normalizado (<strong> en vez de <b>, <p> en vez de <div>, '' si está vacío). Debajo se ve lo que se guardaría."
      [code]="basicCode"
    >
      <div style="display: grid; gap: 0.75rem; width: 100%">
        <cb-editor [(value)]="content" />
        <pre class="ed-output" [attr.aria-label]="i18n.t('HTML guardado', 'Saved HTML')">{{ content() || "''" }}</pre>
      </div>
    </doc-section>

    <doc-section
      id="security"
      title="Contenido no confiable"
      description="Este valor trae un script, un evento onerror y un enlace javascript:. El editor los descarta al cargar: solo pinta lo seguro. Lo mismo pasa al pegar y en la vista de HTML."
      [code]="securityCode"
    >
      <cb-editor [value]="htmlPeligroso" readonly style="width: 100%" />
    </doc-section>

    <doc-section
      id="paste"
      title="Pegar desde Word, Google Docs o la web"
      description="Al pegar se quitan estilos, clases, comentarios de Office y etiquetas no permitidas; la negrita y la cursiva de Google Docs se convierten en <strong> y <em>. Con pastePlainText se pega siempre como texto."
      [code]="pasteCode"
    >
      <cb-editor placeholder="Pega aquí un texto copiado de Word o de una web…" style="width: 100%" />
    </doc-section>

    <doc-section
      id="writing"
      title="Escribir más rápido"
      description="Atajos al escribir como en Markdown: # , ## o ### para títulos, * o - para lista, 1. para lista numerada y > para cita, al inicio de un párrafo. Ctrl + K abre el enlace; Ctrl + Mayús + 7 / 8 crean listas; Ctrl + Alt + 1–3 títulos y Ctrl + Alt + 0 párrafo."
    >
      <cb-editor placeholder="Prueba a escribir «## » al inicio de una línea…" style="width: 100%" />
    </doc-section>

    <doc-section
      id="images"
      title="Imágenes"
      description="Con imageUpload tu función sube el archivo y devuelve su URL: el HTML guarda la URL, no la imagen. Sin ella, la imagen se inserta como data URL si no supera maxImageSize (1 MB por defecto). También se pueden pegar o soltar."
      [code]="imagesCode"
      [codeTs]="imagesTs"
    >
      <cb-editor [imageUpload]="subirImagen" placeholder="Inserta, pega o suelta una imagen…" style="width: 100%" />
    </doc-section>

    <doc-section
      id="tables"
      title="Tablas"
      description="1) Pulsa el botón de tabla y elige el tamaño en la cuadrícula (ratón o flechas). 2) Haz clic dentro de una celda: aparece la barra Tabla con Fila (arriba, abajo, eliminar), Columna (izquierda, derecha, eliminar), Fila de encabezado, Bordes (todos, solo horizontales o ninguno) y su color, y Eliminar tabla. Los bordes se guardan en el HTML, así la tabla se ve igual fuera del editor; en el editor, las celdas sin borde se marcan con una guía punteada que no se guarda. Tab y Mayús + Tab pasan de celda en celda; Tab en la última añade una fila."
      [code]="tablesCode"
    >
      <cb-editor [(value)]="tabla" style="width: 100%" />
    </doc-section>

    <doc-section
      id="image-layout"
      title="Tamaño, alineación y recorte de imágenes"
      description="Haz clic en una imagen: su barra permite ponerla en línea con el texto, a la izquierda o a la derecha (el texto la rodea) o centrada, elegir un ancho (25 %, 50 %, 75 %, 100 % o el original), recortarla, escribir el texto alternativo o eliminarla. El tirador de la esquina cambia el ancho arrastrando. Recortar abre un recuadro libre o con proporción fija (1:1, 4:3, 16:9) que se mueve con el ratón o las flechas; al aplicarlo se recortan los píxeles y la imagen nueva se sube con imageUpload (o se guarda como data URL). Las imágenes de otro dominio necesitan que su servidor permita CORS para poder recortarlas."
      [code]="imageLayoutCode"
    >
      <cb-editor [(value)]="conImagen" style="width: 100%" />
    </doc-section>

    <doc-section
      id="code"
      title="Código"
      description="El bloque de código conserva espacios y saltos; Tab inserta dos espacios. Al pegar desde VS Code se mantienen los colores del resaltado y el fondo, y se anota el lenguaje. Dentro de un bloque, lo pegado entra como texto."
      [code]="codeCode"
    >
      <cb-editor [(value)]="codigo" style="width: 100%" />
    </doc-section>

    <doc-section
      id="limits"
      title="Límite de caracteres y validación"
      description="maxLength muestra un contador, impide escribir de más y recorta lo pegado. Con Validators.required, un editor vacío vale '' y el control es inválido."
      [code]="limitsCode"
      [codeTs]="limitsTs"
    >
      <cb-editor [formControl]="comentario" [maxLength]="280" placeholder="Comentario para el cliente…" style="width: 100%" />
    </doc-section>

    <doc-section
      id="toolbar"
      title="Barra configurable"
      description="toolbar elige las herramientas y su orden ('|' separa grupos). Las herramientas activas se marcan con aria-pressed."
      [code]="toolbarCode"
      [codeTs]="toolbarTs"
    >
      <cb-editor [toolbar]="barraCorta" placeholder="Solo formato básico y enlaces…" height="120px" style="width: 100%" />
    </doc-section>

    <doc-section
      id="readonly"
      title="Solo lectura"
      description="readonly muestra el HTML guardado, saneado, sin barra ni edición: útil para ver el contenido en otra pantalla."
      [code]="readonlyCode"
    >
      <cb-editor [value]="content()" readonly style="width: 100%" />
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: `
    .ed-output {
      margin: 0;
      padding: 0.75rem 1rem;
      max-height: 10rem;
      overflow: auto;
      border-radius: var(--cb-radius-md);
      background: var(--cb-color-surface-subtle);
      color: var(--cb-color-text);
      font-family: var(--cb-font-mono, monospace);
      font-size: 0.8rem;
      white-space: pre-wrap;
      word-break: break-word;
    }
  `,
})
export class EditorDocComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly docApi = DOC_API['cb-editor'];
  protected readonly a11y = DOC_A11Y['cb-editor'];

  constructor() {
    inject(TocService).reset();
  }

  protected readonly content = signal(
    '<h2>Condiciones del crédito</h2><p>Bienvenido a <strong>CaribeNG</strong>. Revisa la <a href="https://caribeng.dev" target="_blank" rel="noopener noreferrer">documentación</a>.</p><ul><li>Tasa fija</li><li>Plazo de 36 meses</li></ul>',
  );
  protected readonly htmlPeligroso =
    '<p>Mensaje del cliente<script>robarSesion()</script></p><img src="x" onerror="alert(\'xss\')"><p><a href="javascript:alert(1)">Haz clic aquí</a> para ver tu premio.</p>';
  protected readonly tabla = signal(
    '<p>Tarifas vigentes:</p><table style="border-collapse: collapse; width: 100%"><thead><tr>' +
      ['Producto', 'Tasa E.A.', 'Plazo'].map((h) => `<th scope="col" style="border: 1px solid #d0d5dd">${h}</th>`).join('') +
      '</tr></thead><tbody>' +
      [['CDT', '11,2 %', '360 días'], ['Ahorro', '4,5 %', '—']]
        .map((r) => `<tr><td style="border: 1px solid #d0d5dd">${r[0]}</td><td style="text-align: right; border: 1px solid #d0d5dd">${r[1]}</td><td style="border: 1px solid #d0d5dd">${r[2]}</td></tr>`)
        .join('') +
      '</tbody></table>',
  );
  protected readonly conImagen = signal(
    '<p><img src="https://picsum.photos/seed/caribeng/480/300" alt="Paisaje" style="width: 40%; height: auto; float: left; margin: 0 1rem 0.5rem 0">' +
      'Este texto rodea la imagen alineada a la izquierda. Haz clic en la imagen para cambiar su alineación o su ancho, o arrastra el tirador de la esquina. ' +
      'El HTML guarda el ancho en porcentaje, de modo que la imagen se adapta al ancho de la pantalla donde se muestre.</p>',
  );
  protected readonly codigo = signal(
    '<p>Ejemplo pegado desde VS Code (tema oscuro):</p>' +
      '<pre data-language="typescript" style="color: #cccccc; background-color: #1f1f1f"><code>' +
      '<span style="color: #569cd6">const</span> <span style="color: #4fc1ff">saldo</span> = <span style="color: #dcdcaa">calcular</span>(<span style="color: #9cdcfe">cuenta</span>);\n' +
      '<span style="color: #c586c0">if</span> (<span style="color: #9cdcfe">saldo</span> &lt; <span style="color: #b5cea8">0</span>) {\n' +
      '  <span style="color: #dcdcaa">avisar</span>(<span style="color: #ce9178">\'Saldo negativo\'</span>);\n' +
      '}</code></pre>',
  );
  protected readonly comentario = new FormControl('', [Validators.required]);
  protected readonly barraCorta: CbEditorTool[] = ['bold', 'italic', 'underline', '|', 'bulletList', 'orderedList', '|', 'link'];

  /** Simula la subida: espera un momento y devuelve una URL pública. */
  protected readonly subirImagen: CbEditorImageUpload = async (file) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return `https://picsum.photos/seed/${encodeURIComponent(file.name)}/480/280`;
  };

  protected readonly importCode = `import { CbEditor, cbSanitizeHtml, cbHtmlToText } from '@caribeng/ui/editor';`;
  protected readonly basicCode = `<cb-editor [(value)]="content" />

<!-- content() es HTML saneado, p. ej.:
<h2>Condiciones del crédito</h2><p>Bienvenido a <strong>CaribeNG</strong>.</p> -->`;
  protected readonly securityCode = `<cb-editor [value]="htmlDeLaBaseDeDatos" readonly />

<!-- Para mostrarlo en otro sitio, sanéalo igual:
     cbSanitizeHtml(html) · cbHtmlToText(html) para un resumen en texto -->`;
  protected readonly pasteCode = `<cb-editor [(value)]="texto" />
<cb-editor [(value)]="texto" pastePlainText />`;
  protected readonly imagesCode = `<cb-editor [imageUpload]="subirImagen" [(value)]="texto" />`;
  protected readonly imagesTs = `subirImagen: CbEditorImageUpload = async (file) => {
  const form = new FormData();
  form.append('file', file);
  const { url } = await firstValueFrom(this.http.post<{ url: string }>('/api/imagenes', form));
  return url; // el HTML guarda <img src="https://...">
};`;
  protected readonly tablesCode = `<cb-editor [(value)]="tarifas" />

<!-- El HTML guardado (los bordes van en cada celda):
<table style="border-collapse: collapse; width: 100%">
  <thead><tr><th scope="col" style="border: 1px solid #d0d5dd">Producto</th>…</tr></thead>
  <tbody><tr><td style="border: 1px solid #d0d5dd">CDT</td>…</tr></tbody>
</table> -->`;
  protected readonly imageLayoutCode = `<!-- Imagen a la izquierda al 40 %: -->
<img src="..." alt="Paisaje" style="width: 40%; height: auto; float: left; margin: 0 1rem 0.5rem 0">

<!-- Centrada: style="display: block; margin: 0.5rem auto" -->`;
  protected readonly codeCode = `<!-- Copiado de VS Code: un bloque con los colores de cada token -->
<pre data-language="typescript" style="color: #cccccc; background-color: #1f1f1f"><code>
<span style="color: #569cd6">const</span> saldo = ...
</code></pre>`;
  protected readonly limitsCode = `<cb-editor [formControl]="comentario" [maxLength]="280" />`;
  protected readonly limitsTs = `comentario = new FormControl('', [Validators.required]);`;
  protected readonly toolbarCode = `<cb-editor [toolbar]="barraCorta" height="120px" />`;
  protected readonly toolbarTs = `barraCorta: CbEditorTool[] = ['bold', 'italic', 'underline', '|', 'bulletList', 'orderedList', '|', 'link'];

// Todas: heading, bold, italic, underline, strike, code, bulletList, orderedList, quote, codeBlock,
// alignLeft, alignCenter, alignRight, link, image, table, horizontalRule, clear, undo, redo, source`;
  protected readonly readonlyCode = `<cb-editor [value]="contenidoGuardado" readonly />`;
}

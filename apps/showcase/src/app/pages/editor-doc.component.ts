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
      id="formatting"
      title="Formato completo y atajos"
      description="La barra tiene dos filas. Arriba, el texto: deshacer y rehacer; párrafo o título 1–4, fuente y tamaño en px; negrita, cursiva, subrayado y tachado; color de texto y resaltado; subíndice, superíndice, código y limpiar formato. Abajo, la estructura: listas con viñetas, numeradas y de tareas, sangría y alineación; enlace, imagen, tabla, bloque de código, cita, línea y caracteres especiales; buscar y reemplazar; vista de HTML y pantalla completa. La barra queda fija arriba al hacer scroll y cada botón muestra su atajo. El área mide 320 px y se puede estirar desde la esquina; maxHeight la limita y hace scroll."
      [code]="formattingCode"
    >
      <div style="display: grid; gap: 1rem; width: 100%">
        <cb-editor [(value)]="formato" maxHeight="560px" />
        <div class="ed-keys">
          <table>
            <thead>
              <tr><th>{{ i18n.t('Atajo', 'Shortcut') }}</th><th>{{ i18n.t('Acción', 'Action') }}</th></tr>
            </thead>
            <tbody>
              @for (row of atajos; track row.keys) {
                <tr><td><kbd>{{ row.keys }}</kbd></td><td>{{ i18n.auto(row.action) }}</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </doc-section>

    <doc-section
      id="fonts"
      title="Fuentes y tamaño de letra"
      description="El selector de fuente agrupa tipografías libres: la predeterminada (Carlito, compatible con Calibri), recomendadas, clásicas de Office (compatibles con Arial, Times New Roman y Courier New), sans serif modernas, serif, monoespaciadas para código, una pensada para la accesibilidad (Atkinson Hyperlegible) y una divertida. Cada opción se muestra con su propia letra. El tamaño se elige en px, de 10 a 48. Las fuentes se cargan desde Google Fonts; si las sirves tú (o tu CSP no lo permite), deja fontsHref vacío, y con fonts cambias la lista. Al pegar solo se conservan las tipografías de la lista."
      [code]="fontsCode"
      [codeTs]="fontsTs"
    >
      <cb-editor [(value)]="fuentes" style="width: 100%" />
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
      description="Escribe / al inicio de una línea (o tras un espacio) para insertar un bloque: párrafo, títulos, listas, tareas, cita, código, tabla, imagen o línea; sigue escribiendo para filtrar y elige con las flechas y Enter. Al seleccionar texto aparece un menú flotante con negrita, cursiva, subrayado, tachado, código, enlace y limpiar formato. Las URL se convierten en enlace al escribir un espacio detrás (o al pegarlas sobre un texto seleccionado), y la tipografía se corrige sola: (c) → ©, ... → …, -> → →, -- → –, 1/2 → ½. También funcionan los atajos tipo Markdown: # , * , 1. , [ ] y > al inicio de un párrafo. Cada ayuda se puede desactivar."
      [code]="writingCode"
    >
      <cb-editor [placeholder]="i18n.auto('Escribe / para insertar un bloque, o una URL seguida de un espacio…')" style="width: 100%" />
    </doc-section>

    <doc-section
      id="find"
      title="Buscar y reemplazar, y caracteres especiales"
      description="Ctrl + F (o el botón de la lupa) abre el panel: cuenta las coincidencias, las resalta en el texto y las recorre con Enter y Mayús + Enter; puede distinguir mayúsculas y buscar palabras completas, y reemplaza una o todas (cada reemplazo se puede deshacer). Escape cierra el panel y deja seleccionada la coincidencia. El botón Ω inserta monedas, símbolos matemáticos, puntuación, flechas y emoji."
      [code]="findCode"
    >
      <cb-editor [(value)]="buscar" style="width: 100%" />
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
      description="toolbar elige las herramientas y su orden: '|' separa grupos y '-' empieza una fila nueva. Las herramientas activas se marcan con aria-pressed."
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
    .ed-keys {
      max-width: 640px;
      overflow-x: auto;
    }
    .ed-keys table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }
    .ed-keys th,
    .ed-keys td {
      padding: 0.4rem 0.75rem;
      text-align: left;
      border-bottom: 1px solid var(--cb-color-border);
    }
    .ed-keys th {
      font-weight: 600;
      color: var(--cb-color-text-muted);
    }
    .ed-keys kbd {
      font-family: var(--cb-font-mono, monospace);
      font-size: 0.8rem;
      white-space: nowrap;
    }
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
  protected readonly formato = signal(
    '<h2>Acta de comité</h2><p>Se revisaron las <span style="color: #2563eb">tasas</span> y los <span style="background-color: #fef08a">plazos pendientes</span>. ' +
      'La fórmula del interés es I = C · r<sup>t</sup>; el CO<sub>2</sub> no aplica.</p>' +
      '<p style="margin-left: 2rem">Párrafo con sangría.</p>' +
      '<ul data-type="taskList"><li data-checked="true">Aprobar el presupuesto</li><li data-checked="false">Enviar el acta a los socios</li></ul>' +
      '<p style="text-align: justify"><span style="font-size: 20px">Texto justificado a 20 px</span> para comprobar la alineación de un párrafo largo dentro del editor.</p>',
  );
  protected readonly fuentes = signal(
    '<h2>Prueba de tipografías</h2>' +
      '<p>Texto con la fuente predeterminada a 16 px.</p>' +
      `<p><span style="font-family: 'Source Serif 4', serif; font-size: 20px">Source Serif 4 a 20 px, para textos largos.</span></p>` +
      `<p><span style="font-family: 'Atkinson Hyperlegible', sans-serif">Atkinson Hyperlegible: 0O 1lI, letras fáciles de distinguir.</span></p>` +
      `<p><span style="font-family: 'JetBrains Mono', monospace; font-size: 14px">const saldo = calcular(cuenta);</span></p>` +
      `<p><span style="font-family: 'Comic Neue', 'Comic Sans MS', cursive; font-size: 24px">Comic Neue a 24 px</span></p>`,
  );
  protected readonly buscar = signal(
    '<p>El banco revisó las tasas del banco central. La tasa fija se mantiene; la tasa variable baja.</p>' +
      '<ul><li>Tasa de interés: 11 %</li><li>Banco emisor: CaribeNG</li></ul>' +
      '<p>Prueba a buscar «tasa» y a reemplazarla por «tarifa», o a insertar € con el botón Ω.</p>',
  );
  protected readonly atajos = [
    { keys: 'Ctrl + B / I / U', action: 'Negrita, cursiva, subrayado' },
    { keys: 'Ctrl + Shift + X', action: 'Tachado' },
    { keys: 'Ctrl + E', action: 'Código en línea' },
    { keys: 'Ctrl + . / Ctrl + ,', action: 'Superíndice / subíndice' },
    { keys: 'Ctrl + Alt + 0–4', action: 'Párrafo / título 1–4' },
    { keys: 'Ctrl + Shift + 7 / 8 / 9', action: 'Lista numerada / con viñetas / de tareas' },
    { keys: 'Ctrl + Enter', action: 'Marcar o desmarcar la tarea' },
    { keys: 'Ctrl + ] / Ctrl + [', action: 'Aumentar / reducir sangría' },
    { keys: 'Ctrl + Shift + L / E / R / J', action: 'Alinear a la izquierda / centrar / a la derecha / justificar' },
    { keys: 'Ctrl + Shift + B', action: 'Cita' },
    { keys: 'Ctrl + Alt + C', action: 'Bloque de código' },
    { keys: 'Ctrl + K', action: 'Enlace' },
    { keys: 'Ctrl + \\', action: 'Limpiar formato' },
    { keys: 'Ctrl + Z / Ctrl + Y', action: 'Deshacer / rehacer' },
    { keys: '# , ## , ### , #### + Espacio', action: 'Título 1–4 al inicio de un párrafo' },
    { keys: '* , - , 1. , [ ] , > + Espacio', action: 'Lista, lista numerada, tareas o cita' },
    { keys: 'Ctrl + F', action: 'Buscar y reemplazar' },
    { keys: 'Alt + F10', action: 'Ir a la barra de herramientas' },
    { keys: '/', action: 'Menú para insertar un bloque' },
    { keys: 'Escape', action: 'Cerrar un menú o salir de pantalla completa' },
  ];
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
  protected readonly fontsCode = `<cb-editor [(value)]="texto" />

<!-- Lista propia, con las fuentes servidas por tu aplicación (sin Google Fonts): -->
<cb-editor [(value)]="texto" [fonts]="fuentesMarca" fontsHref="" />`;
  protected readonly fontsTs = `import type { CbEditorFontGroup } from '@caribeng/ui/editor';

// value es la pila CSS que se guarda en el HTML; '' = la predeterminada.
fuentesMarca: CbEditorFontGroup[] = [
  { label: 'Predeterminada', fonts: [{ name: 'Carlito', value: '' }] },
  { label: 'Marca', fonts: [{ name: 'Mi Marca', value: "'Mi Marca', Arial, sans-serif" }] },
];

// Para mostrar el HTML fuera del editor, sanéalo con la misma lista:
cbSanitizeHtml(html, { fonts: ["'Mi Marca', Arial, sans-serif"] });`;
  protected readonly writingCode = `<cb-editor [(value)]="texto" />

<!-- Cada ayuda se puede desactivar: -->
<cb-editor [(value)]="texto" [slashCommands]="false" [bubbleMenu]="false" [autolink]="false" [typography]="false" />`;
  protected readonly findCode = `<!-- Incluidos en la barra por defecto; en una barra propia: -->
<cb-editor [toolbar]="['bold', 'italic', '|', 'specialChars', 'findReplace']" />`;
  protected readonly formattingCode = `<cb-editor [(value)]="acta" maxHeight="560px" />

<!-- Alto mínimo (height, 320px por defecto), alto máximo con scroll (maxHeight),
     contador de palabras (wordCount) y barra a medida (toolbar). -->`;
  protected readonly limitsCode = `<cb-editor [formControl]="comentario" [maxLength]="280" />`;
  protected readonly limitsTs = `comentario = new FormControl('', [Validators.required]);`;
  protected readonly toolbarCode = `<cb-editor [toolbar]="barraCorta" height="120px" />`;
  protected readonly toolbarTs = `barraCorta: CbEditorTool[] = ['bold', 'italic', 'underline', '|', 'bulletList', 'orderedList', '|', 'link'];

// '|' separa grupos y '-' empieza una fila nueva.
// Todas: undo, redo, heading, fontFamily, fontSize, bold, italic, underline, strike, textColor,
// highlight, subscript, superscript, code, clear, bulletList, orderedList, taskList, outdent,
// indent, alignment (o alignLeft / alignCenter / alignRight / alignJustify sueltos), link, image,
// table, codeBlock, quote, horizontalRule, specialChars, findReplace, source, fullscreen`;
  protected readonly readonlyCode = `<cb-editor [value]="contenidoGuardado" readonly />`;
}

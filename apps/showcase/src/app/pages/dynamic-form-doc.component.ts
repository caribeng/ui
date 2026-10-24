import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CbDynamicForm, CbFormFieldTemplate, type CbFormLabelPosition, type CbFormOptionsLoader, type CbFormSchema } from '@caribeng/ui/dynamic-form';
import { CbSignaturePad } from '@caribeng/ui/signature-pad';
import { CbSelectButton } from '@caribeng/ui/selectbutton';
import { CbTextarea } from '@caribeng/ui/textarea';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

const PAISES = [
  { label: 'Colombia', value: 'CO' },
  { label: 'Panamá', value: 'PA' },
  { label: 'República Dominicana', value: 'DO' },
  { label: 'México', value: 'MX' },
];

const JSON_INICIAL = `{
  "columns": 2,
  "layout": "vertical",
  "submitLabel": "Crear cuenta",
  "fields": [
    { "key": "usuario", "label": "Usuario", "required": true, "minLength": 4 },
    { "key": "correo", "label": "Correo", "type": "email", "required": true },
    { "key": "plan", "label": "Plan", "type": "buttons", "default": "basico",
      "options": [
        { "label": "Básico", "value": "basico" },
        { "label": "Pro", "value": "pro" }
      ] },
    { "key": "equipo", "label": "Personas del equipo", "type": "number", "min": 2,
      "visibleWhen": { "field": "plan", "equals": "pro" } },
    { "key": "acepto", "label": "Acepto los términos", "type": "checkbox",
      "required": true, "colSpan": "full" }
  ]
}`;

@Component({
  selector: 'doc-dynamic-form-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbDynamicForm, CbFormFieldTemplate, CbSignaturePad, CbSelectButton, CbTextarea, FormsModule, ReactiveFormsModule, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Form"
      title="Dynamic Form"
      lead="Formulario que se arma a partir de un esquema JSON: cada campo dice su tipo, etiqueta, validaciones y cuántas columnas ocupa. Las etiquetas van encima, a un lado, flotantes u ocultas; hay columnas por tamaño de pantalla, secciones, pasos, grupos repetibles, opciones que dependen de otros campos y campos calculados."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="layout"
      title="Etiquetas y columnas"
      description="labelPosition ubica las etiquetas: encima (top), a la izquierda (left), a la derecha (right), dentro del campo (floating, sube al escribir) u ocultas (hidden, solo para lectores de pantalla). Se fija en el formulario, en cada sección o en cada campo; labelAlign las alinea al inicio o al final y labelWidth da su ancho. columns da las columnas y colSpan cuántas ocupa un campo (o full). Cambia las opciones: en un contenedor estrecho todo pasa a una columna y las etiquetas laterales suben."
      [code]="layoutCode"
    >
      <div class="df-demo">
        <div class="df-options">
          <cb-selectbutton [(ngModel)]="posicion" [options]="posiciones" optionValue="value" ariaLabel="Posición de las etiquetas" />
          <cb-selectbutton [(ngModel)]="alineacion" [options]="alineaciones" optionValue="value" ariaLabel="Alineación de las etiquetas" />
          <cb-selectbutton [(ngModel)]="columnas" [options]="opcionesColumnas" optionValue="value" ariaLabel="Columnas" />
        </div>
        <cb-dynamic-form [schema]="registroAlineado()" [labelPosition]="posicion()" [columns]="columnas()" [(value)]="datos" (formSubmit)="enviado.set($event)" />
        <pre class="df-value">{{ datosJson() }}</pre>
      </div>
    </doc-section>

    <doc-section
      id="json"
      title="Esquema en JSON"
      description="El esquema es JSON puro: se puede guardar en una base de datos o recibir de una API. Edita el JSON y el formulario se vuelve a armar al momento; las condiciones también son JSON (visibleWhen con equals, notEquals, in o filled)."
      [code]="jsonCode"
    >
      <div class="df-split">
        <cb-textarea label="Esquema" [(ngModel)]="json" [rows]="22" [error]="errorJson()" [invalid]="!!errorJson()" class="df-json" />
        <cb-dynamic-form [schema]="esquemaJson()" (formSubmit)="enviadoJson.set($event)" />
      </div>
    </doc-section>

    <doc-section
      id="conditional"
      title="Campos condicionales"
      description="visibleWhen muestra un campo solo si se cumple la condición (los ocultos no se validan ni se envían), requiredWhen lo vuelve obligatorio y disabledWhen lo deshabilita. Aquí el NIT y la razón social solo aparecen para empresas, el teléfono es obligatorio si se elige contactar por teléfono y el código postal se deshabilita fuera de México."
      [code]="conditionalCode"
    >
      <cb-dynamic-form [schema]="condicional" (formSubmit)="enviadoCondicional.set($event)" />
    </doc-section>

    <doc-section
      id="design"
      title="Diseño: columnas por tamaño, títulos y separadores"
      description="columns y colSpan aceptan un valor por tamaño del formulario: base (móvil), sm (desde 30rem), md (desde 40rem) y lg (desde 60rem); cada uno hereda el anterior. Los elementos heading, paragraph y divider ponen títulos, textos y separadores entre los campos; newRow empieza una fila nueva, order cambia el orden y size el tamaño de los controles. Cada sección puede tener su propia posición de etiquetas."
      [code]="designCode"
    >
      <cb-dynamic-form [schema]="diseno" />
    </doc-section>

    <doc-section
      id="dependent"
      title="Opciones dependientes y cargadas"
      description="optionsFrom toma las opciones según el valor de otro campo (el departamento según el país); optionsLoader las pide a una función de loaders (aquí, una API simulada que tarda medio segundo) y se vuelve a llamar cuando cambia algo de dependsOn. Si el valor elegido ya no está entre las opciones nuevas, se limpia."
      [code]="dependentCode"
    >
      <cb-dynamic-form [schema]="dependientes" [loaders]="cargadores" />
    </doc-section>

    <doc-section
      id="repeatable"
      title="Grupos repetibles y campos calculados"
      description="Un campo type: 'group' agrupa otros en un objeto; con repeatable es una lista que se amplía con «Añadir línea» y cada elemento se quita con su botón (minItems y maxItems ponen límites). formula calcula un campo con una expresión segura: aquí cada subtotal es cantidad * precio y el total suma la lista con sum(lineas.subtotal); también hay round, min, max, abs y count."
      [code]="repeatableCode"
    >
      <div class="df-demo">
        <cb-dynamic-form [schema]="factura" [(value)]="facturaValor" />
        <pre class="df-value">{{ facturaJson() }}</pre>
      </div>
    </doc-section>

    <doc-section
      id="steps"
      title="Formulario por pasos"
      description="steps divide el formulario en pasos con su título: Siguiente valida los campos del paso y muestra sus errores antes de avanzar, Atrás vuelve sin validar y el último paso envía. El foco va al título de cada paso al cambiar."
      [code]="stepsCode"
    >
      <cb-dynamic-form [schema]="pasos" (formSubmit)="enviadoPasos.set($event)" />
    </doc-section>

    <doc-section
      id="advanced"
      title="Validaciones entre campos, prefijos, máscaras y campos propios"
      description="rules compara un campo con otro: equalsField para confirmar la contraseña, gteField para que la fecha final no sea anterior a la inicial. prefix, suffix e icon ponen símbolos alrededor del control; type: 'mask' usa una máscara. Un type propio (aquí 'firma') se pinta con la plantilla ng-template cbFormField de ese nombre, que recibe el control, el campo y su id."
      [code]="advancedCode"
    >
      <cb-dynamic-form [schema]="avanzado">
        <ng-template cbFormField="firma" let-control let-field="field">
          <cb-signature-pad [formControl]="control" [ariaLabel]="$any(field.label)" height="9rem" />
        </ng-template>
      </cb-dynamic-form>
    </doc-section>

    <doc-section
      id="types"
      title="Todos los tipos de campo"
      description="text, email, password, tel, url, number, textarea, select, multiselect, radio, buttons, checkbox, toggle, date, slider, rating, chips y color: cada uno usa el control de CaribeNG correspondiente, conectado con Angular Forms."
      [code]="typesCode"
    >
      <cb-dynamic-form [schema]="tipos" />
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .df-demo {
        display: grid;
        gap: 1rem;
        width: 100%;
      }
      .df-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
      }
      .df-value {
        margin: 0;
        padding: 0.75rem 1rem;
        overflow: auto;
        border-radius: var(--cb-radius-md);
        background: var(--cb-color-surface-subtle);
        font-size: 0.8rem;
      }
      .df-split {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
        gap: 1.5rem;
        width: 100%;
        align-items: start;
      }
      .df-json {
        font-family: var(--cb-font-mono, monospace);
      }
    `,
  ],
})
export class DynamicFormDocComponent {
  protected readonly docApi = DOC_API['cb-dynamic-form'];
  protected readonly a11y = DOC_A11Y['cb-dynamic-form'];

  protected readonly posicion = signal<CbFormLabelPosition>('top');
  protected readonly alineacion = signal<'start' | 'end'>('start');
  protected readonly columnas = signal(2);
  protected readonly posiciones = [
    { label: 'Encima', value: 'top' },
    { label: 'Izquierda', value: 'left' },
    { label: 'Derecha', value: 'right' },
    { label: 'Flotante', value: 'floating' },
    { label: 'Oculta', value: 'hidden' },
  ];
  protected readonly alineaciones = [
    { label: 'Inicio', value: 'start' },
    { label: 'Fin', value: 'end' },
  ];
  protected readonly opcionesColumnas = [
    { label: '1 columna', value: 1 },
    { label: '2 columnas', value: 2 },
    { label: '3 columnas', value: 3 },
  ];
  protected readonly datos = signal<Record<string, unknown>>({});
  protected readonly enviado = signal<Record<string, unknown> | null>(null);
  protected readonly datosJson = computed(() => JSON.stringify(this.enviado() ?? this.datos(), null, 2));

  protected readonly registro: CbFormSchema = {
    labelWidth: '9rem',
    submitLabel: 'Guardar',
    resetLabel: 'Restablecer',
    sections: [
      {
        title: 'Datos personales',
        fields: [
          { key: 'nombre', label: 'Nombre', required: true, minLength: 2 },
          { key: 'apellidos', label: 'Apellidos', required: true },
          { key: 'email', label: 'Correo', type: 'email', required: true, hint: 'Te enviaremos la confirmación aquí.' },
          { key: 'nacimiento', label: 'Nacimiento', type: 'date' },
        ],
      },
      {
        title: 'Dirección',
        fields: [
          { key: 'pais', label: 'País', type: 'select', options: PAISES, required: true },
          { key: 'ciudad', label: 'Ciudad' },
          { key: 'direccion', label: 'Dirección', colSpan: 'full' },
        ],
      },
      {
        title: 'Preferencias',
        fields: [
          { key: 'boletin', label: 'Quiero recibir el boletín', type: 'toggle', default: true },
          { key: 'comentarios', label: 'Comentarios', type: 'textarea', colSpan: 'full', maxLength: 300 },
        ],
      },
    ],
  };

  /** El registro con la alineación elegida. */
  protected readonly registroAlineado = computed<CbFormSchema>(() => ({ ...this.registro, labelAlign: this.alineacion() }));

  protected readonly diseno: CbFormSchema = {
    columns: { base: 1, sm: 2, lg: 4 },
    submitLabel: 'Guardar',
    fields: [
      { type: 'heading', content: 'Datos de la empresa' },
      { type: 'paragraph', content: 'En pantallas grandes caben cuatro columnas; en tabletas, dos, y en móvil, una.' },
      { key: 'razon', label: 'Razón social', colSpan: { base: 'full', lg: 2 }, required: true },
      { key: 'nit', label: 'NIT', mask: '999.999.999-9', type: 'mask' },
      { key: 'regimen', label: 'Régimen', type: 'select', options: [{ label: 'Común', value: 'comun' }, { label: 'Simple', value: 'simple' }] },
      { type: 'divider' },
      { type: 'heading', content: 'Contacto' },
      { key: 'correo', label: 'Correo', type: 'email', newRow: true },
      { key: 'telefono', label: 'Teléfono', type: 'tel' },
      { key: 'web', label: 'Sitio web', type: 'url', size: 'sm', order: 99 },
    ],
  };

  protected readonly dependientes: CbFormSchema = {
    columns: 3,
    submitLabel: 'Guardar',
    fields: [
      { key: 'pais', label: 'País', type: 'select', options: PAISES, default: 'CO' },
      {
        key: 'departamento',
        label: 'Departamento',
        type: 'select',
        optionsFrom: {
          field: 'pais',
          map: {
            CO: [{ label: 'Atlántico', value: 'ATL' }, { label: 'Bolívar', value: 'BOL' }, { label: 'Magdalena', value: 'MAG' }],
            PA: [{ label: 'Panamá', value: 'PAN' }, { label: 'Chiriquí', value: 'CHI' }],
            DO: [{ label: 'Santo Domingo', value: 'SDO' }],
            MX: [{ label: 'Yucatán', value: 'YUC' }, { label: 'Quintana Roo', value: 'QRO' }],
          },
        },
      },
      { key: 'ciudad', label: 'Ciudad', type: 'select', optionsLoader: 'ciudades', dependsOn: ['departamento'], hint: 'Se cargan al elegir el departamento.' },
    ],
  };

  /** API simulada: ciudades de un departamento con medio segundo de espera. */
  protected readonly cargadores: Record<string, CbFormOptionsLoader> = {
    ciudades: ({ value }) => {
      const ciudades: Record<string, string[]> = {
        ATL: ['Barranquilla', 'Soledad', 'Puerto Colombia'],
        BOL: ['Cartagena', 'Turbaco', 'Mompox'],
        MAG: ['Santa Marta', 'Ciénaga'],
        PAN: ['Ciudad de Panamá', 'San Miguelito'],
        CHI: ['David', 'Boquete'],
        SDO: ['Santo Domingo Este', 'Boca Chica'],
        YUC: ['Mérida', 'Valladolid'],
        QRO: ['Cancún', 'Tulum'],
      };
      const lista = (ciudades[String(value['departamento'] ?? '')] ?? []).map((c) => ({ label: c, value: c }));
      return new Promise((resolve) => setTimeout(() => resolve(lista), 500));
    },
  };

  protected readonly factura: CbFormSchema = {
    submitLabel: 'Guardar factura',
    fields: [
      { key: 'cliente', label: 'Cliente', required: true },
      {
        key: 'lineas',
        label: 'Líneas',
        addLabel: 'Añadir línea',
        type: 'group',
        repeatable: true,
        minItems: 1,
        maxItems: 10,
        itemLabel: 'Línea {n}',
        columns: { base: 1, md: 4 },
        fields: [
          { key: 'descripcion', label: 'Descripción', required: true },
          { key: 'cantidad', label: 'Cantidad', type: 'number', default: 1, min: 1 },
          { key: 'precio', label: 'Precio', type: 'number', min: 0, prefix: '$' },
          { key: 'subtotal', label: 'Subtotal', type: 'number', formula: 'cantidad * precio', prefix: '$' },
        ],
      },
      { key: 'neto', label: 'Neto', type: 'number', formula: 'sum(lineas.subtotal)', prefix: '$', labelPosition: 'left' },
      { key: 'iva', label: 'IVA 19 %', type: 'number', formula: 'round(neto * 0.19, 0)', prefix: '$', labelPosition: 'left' },
      { key: 'total', label: 'Total', type: 'number', formula: 'neto + iva', prefix: '$', labelPosition: 'left' },
    ],
  };
  protected readonly facturaValor = signal<Record<string, unknown>>({});
  protected readonly facturaJson = computed(() => JSON.stringify(this.facturaValor(), null, 2));

  protected readonly pasos: CbFormSchema = {
    submitLabel: 'Crear cuenta',
    steps: [
      { title: 'Empresa', description: 'Datos legales de la empresa.', fields: [{ key: 'razon', label: 'Razón social', required: true }, { key: 'nit', label: 'NIT', required: true, pattern: '\\d{9}-\\d', messages: { pattern: 'Usa el formato 900123456-7.' } }] },
      { title: 'Contacto', fields: [{ key: 'contacto', label: 'Nombre del contacto', required: true }, { key: 'correo', label: 'Correo', type: 'email', required: true }] },
      { title: 'Confirmación', fields: [{ type: 'paragraph', content: 'Revisa los datos y acepta las condiciones para crear la cuenta.' }, { key: 'acepto', label: 'Acepto los términos y condiciones', type: 'checkbox', required: true }] },
    ],
  };
  protected readonly enviadoPasos = signal<Record<string, unknown> | null>(null);

  protected readonly avanzado: CbFormSchema = {
    columns: 2,
    submitLabel: 'Enviar',
    fields: [
      { key: 'clave', label: 'Contraseña', type: 'password', required: true, minLength: 8 },
      { key: 'repetir', label: 'Repetir contraseña', type: 'password', required: true, rules: [{ equalsField: 'clave', message: 'Las contraseñas no coinciden.' }] },
      { key: 'desde', label: 'Desde', type: 'date' },
      { key: 'hasta', label: 'Hasta', type: 'date', rules: [{ gteField: 'desde', message: 'La fecha final no puede ser anterior a la inicial.' }] },
      { key: 'monto', label: 'Monto', type: 'number', prefix: '$', suffix: 'COP' },
      { key: 'descuento', label: 'Descuento', type: 'number', suffix: '%', max: 100 },
      { key: 'buscar', label: 'Referencia', icon: 'search', placeholder: 'FV-0000' },
      { key: 'celular', label: 'Celular', type: 'mask', mask: '(999) 999-9999' },
      { key: 'firma', label: 'Firma', type: 'firma', colSpan: 'full', required: true },
    ],
  };

  protected readonly json = signal(JSON_INICIAL);
  protected readonly enviadoJson = signal<Record<string, unknown> | null>(null);
  private ultimoValido: CbFormSchema = JSON.parse(JSON_INICIAL);
  protected readonly errorJson = computed(() => {
    try {
      JSON.parse(this.json());
      return '';
    } catch (e) {
      return `JSON no válido: ${(e as Error).message}`;
    }
  });
  /** El último esquema que se pudo leer (mientras escribes, el JSON a medias no rompe el formulario). */
  protected readonly esquemaJson = computed<CbFormSchema>(() => {
    try {
      const schema = JSON.parse(this.json()) as CbFormSchema;
      if (schema && (Array.isArray(schema.fields) || Array.isArray(schema.sections) || Array.isArray(schema.steps))) this.ultimoValido = schema;
    } catch {
      // Se queda con el último válido.
    }
    return this.ultimoValido;
  });

  protected readonly enviadoCondicional = signal<Record<string, unknown> | null>(null);
  protected readonly condicional: CbFormSchema = {
    columns: 2,
    layout: 'horizontal',
    labelWidth: '9rem',
    submitLabel: 'Registrar',
    fields: [
      {
        key: 'tipo',
        label: 'Tipo de cliente',
        type: 'radio',
        orientation: 'horizontal',
        default: 'persona',
        colSpan: 'full',
        options: [
          { label: 'Persona', value: 'persona' },
          { label: 'Empresa', value: 'empresa' },
        ],
      },
      { key: 'nombre', label: 'Nombre', required: true, visibleWhen: { field: 'tipo', equals: 'persona' } },
      { key: 'documento', label: 'Documento', required: true, visibleWhen: { field: 'tipo', equals: 'persona' } },
      { key: 'razon', label: 'Razón social', required: true, visibleWhen: { field: 'tipo', equals: 'empresa' } },
      { key: 'nit', label: 'NIT', required: true, pattern: '\\d{9}-\\d', hint: 'Formato 900123456-7', messages: { pattern: 'Usa el formato 900123456-7.' }, visibleWhen: { field: 'tipo', equals: 'empresa' } },
      {
        key: 'contacto',
        label: 'Contactar por',
        type: 'select',
        default: 'email',
        options: [
          { label: 'Correo', value: 'email' },
          { label: 'Teléfono', value: 'tel' },
        ],
      },
      { key: 'telefono', label: 'Teléfono', type: 'tel', requiredWhen: { field: 'contacto', equals: 'tel' } },
      { key: 'pais', label: 'País', type: 'select', options: PAISES, default: 'CO' },
      { key: 'cp', label: 'Código postal', disabledWhen: { field: 'pais', notEquals: 'MX' } },
    ],
  };

  protected readonly tipos: CbFormSchema = {
    columns: 3,
    submitLabel: 'Enviar',
    fields: [
      { key: 'texto', label: 'Texto', placeholder: 'Escribe algo' },
      { key: 'correo', label: 'Correo', type: 'email' },
      { key: 'clave', label: 'Contraseña', type: 'password' },
      { key: 'telefono', label: 'Teléfono', type: 'tel' },
      { key: 'web', label: 'Sitio web', type: 'url', placeholder: 'https://' },
      { key: 'cantidad', label: 'Cantidad', type: 'number', min: 0, max: 10, default: 1 },
      { key: 'pais', label: 'País', type: 'select', options: PAISES },
      { key: 'idiomas', label: 'Idiomas', type: 'multiselect', options: [{ label: 'Español', value: 'es' }, { label: 'Inglés', value: 'en' }, { label: 'Portugués', value: 'pt' }] },
      { key: 'fecha', label: 'Fecha', type: 'date' },
      { key: 'talla', label: 'Talla', type: 'buttons', options: [{ label: 'S', value: 's' }, { label: 'M', value: 'm' }, { label: 'L', value: 'l' }] },
      { key: 'envio', label: 'Envío', type: 'radio', options: [{ label: 'Estándar', value: 'std' }, { label: 'Exprés', value: 'exp' }], default: 'std' },
      { key: 'color', label: 'Color', type: 'color' },
      { key: 'volumen', label: 'Volumen', type: 'slider', min: 0, max: 100, default: 40 },
      { key: 'valoracion', label: 'Valoración', type: 'rating', default: 3 },
      { key: 'etiquetas', label: 'Etiquetas', type: 'chips', placeholder: 'Escribe y pulsa Enter' },
      { key: 'notas', label: 'Notas', type: 'textarea', colSpan: 2 },
      { key: 'avisos', label: 'Recibir avisos', type: 'toggle' },
      { key: 'acepto', label: 'Acepto las condiciones', type: 'checkbox', colSpan: 'full' },
    ],
  };

  protected readonly importCode = `import { CbDynamicForm, type CbFormSchema } from '@caribeng/ui/dynamic-form';`;
  protected readonly layoutCode = `<div class="df-demo">
  <div class="df-options">
    <cb-selectbutton [(ngModel)]="posicion" [options]="posiciones" optionValue="value" ariaLabel="Posición de las etiquetas" />
    <cb-selectbutton [(ngModel)]="alineacion" [options]="alineaciones" optionValue="value" ariaLabel="Alineación de las etiquetas" />
    <cb-selectbutton [(ngModel)]="columnas" [options]="opcionesColumnas" optionValue="value" ariaLabel="Columnas" />
  </div>
  <cb-dynamic-form [schema]="registroAlineado()" [labelPosition]="posicion()" [columns]="columnas()" [(value)]="datos" (formSubmit)="enviado.set($event)" />
  <pre class="df-value">{{ datosJson() }}</pre>
</div>`;
  protected readonly jsonCode = `<div class="df-split">
  <cb-textarea label="Esquema" [(ngModel)]="json" [rows]="22" [error]="errorJson()" [invalid]="!!errorJson()" class="df-json" />
  <cb-dynamic-form [schema]="esquemaJson()" (formSubmit)="enviadoJson.set($event)" />
</div>`;
  protected readonly conditionalCode = `<cb-dynamic-form [schema]="condicional" (formSubmit)="enviadoCondicional.set($event)" />`;
  protected readonly typesCode = `<cb-dynamic-form [schema]="tipos" />`;
  protected readonly designCode = `<cb-dynamic-form [schema]="diseno" />`;
  protected readonly dependentCode = `<cb-dynamic-form [schema]="dependientes" [loaders]="cargadores" />`;
  protected readonly repeatableCode = `<div class="df-demo">
  <cb-dynamic-form [schema]="factura" [(value)]="facturaValor" />
  <pre class="df-value">{{ facturaJson() }}</pre>
</div>`;
  protected readonly stepsCode = `<cb-dynamic-form [schema]="pasos" (formSubmit)="enviadoPasos.set($event)" />`;
  protected readonly advancedCode = `<cb-dynamic-form [schema]="avanzado">
  <ng-template cbFormField="firma" let-control let-field="field">
    <cb-signature-pad [formControl]="control" [ariaLabel]="$any(field.label)" height="9rem" />
  </ng-template>
</cb-dynamic-form>`;

  constructor() {
    inject(TocService).reset();
  }
}

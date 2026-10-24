import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CbDynamicForm, type CbFormLayout, type CbFormSchema } from '@caribeng/ui/dynamic-form';
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
  imports: [CbDynamicForm, CbSelectButton, CbTextarea, FormsModule, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Form"
      title="Dynamic Form"
      lead="Formulario que se arma a partir de un esquema JSON: cada campo dice su tipo, etiqueta, validaciones y cuántas columnas ocupa. La disposición puede ser vertical (etiqueta encima) u horizontal (etiqueta a la izquierda), en una o varias columnas, con secciones y campos que aparecen según otros valores."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="layout"
      title="Disposición y columnas"
      description="layout elige si la etiqueta va encima (vertical) o a la izquierda (horizontal, con labelWidth) y columns cuántas columnas tiene la rejilla; colSpan hace que un campo ocupe varias (o full, toda la fila) y cada sección puede tener sus propias columnas. Cambia las opciones: en un contenedor estrecho todo pasa a una columna y la etiqueta vuelve arriba."
      [code]="layoutCode"
    >
      <div class="df-demo">
        <div class="df-options">
          <cb-selectbutton [(ngModel)]="disposicion" [options]="disposiciones" optionValue="value" ariaLabel="Disposición" />
          <cb-selectbutton [(ngModel)]="columnas" [options]="opcionesColumnas" optionValue="value" ariaLabel="Columnas" />
        </div>
        <cb-dynamic-form [schema]="registro" [layout]="disposicion()" [columns]="columnas()" [(value)]="datos" (formSubmit)="enviado.set($event)" />
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

  protected readonly disposicion = signal<CbFormLayout>('vertical');
  protected readonly columnas = signal(2);
  protected readonly disposiciones = [
    { label: 'Vertical', value: 'vertical' },
    { label: 'Horizontal', value: 'horizontal' },
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
      if (schema && (Array.isArray(schema.fields) || Array.isArray(schema.sections))) this.ultimoValido = schema;
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
    <cb-selectbutton [(ngModel)]="disposicion" [options]="disposiciones" optionValue="value" ariaLabel="Disposición" />
    <cb-selectbutton [(ngModel)]="columnas" [options]="opcionesColumnas" optionValue="value" ariaLabel="Columnas" />
  </div>
  <cb-dynamic-form [schema]="registro" [layout]="disposicion()" [columns]="columnas()" [(value)]="datos" (formSubmit)="enviado.set($event)" />
  <pre class="df-value">{{ datosJson() }}</pre>
</div>`;
  protected readonly jsonCode = `<div class="df-split">
  <cb-textarea label="Esquema" [(ngModel)]="json" [rows]="22" [error]="errorJson()" [invalid]="!!errorJson()" class="df-json" />
  <cb-dynamic-form [schema]="esquemaJson()" (formSubmit)="enviadoJson.set($event)" />
</div>`;
  protected readonly conditionalCode = `<cb-dynamic-form [schema]="condicional" (formSubmit)="enviadoCondicional.set($event)" />`;
  protected readonly typesCode = `<cb-dynamic-form [schema]="tipos" />`;

  constructor() {
    inject(TocService).reset();
  }
}

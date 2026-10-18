import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbButton } from '@caribeng/ui/button';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import type { DocApi } from '../components/doc-api.model';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-button-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CbButton,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
    DocPlaygroundComponent,
  ],
  template: `
    <doc-page-header
      eyebrow="Form"
      title="Button"
      lead="Botón accesible con severidades, variantes, tamaños y estado de carga."
    />

    <doc-section
      id="playground"
      title="Playground"
      description="Ajusta las propiedades y observa el componente en vivo."
    >
      <doc-playground [api]="playground" />
    </doc-section>

    <doc-section id="import" title="Import">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="basic"
      title="Basic"
      description="El contenido se proyecta dentro del botón. El evento click nativo funciona con (click)."
      [code]="basicCode"
    >
      <cb-button>Guardar</cb-button>
    </doc-section>

    <doc-section
      id="severity"
      title="Severity"
      description="Ocho severidades semánticas alineadas con la paleta del tema."
      [code]="severityCode"
    >
      @for (s of severities; track s) {
        <cb-button [severity]="s">{{ s }}</cb-button>
      }
    </doc-section>

    <doc-section
      id="variants"
      title="Variantes"
      description="solid (por defecto), outlined y text."
      [code]="variantsCode"
    >
      <cb-button variant="solid">Solid</cb-button>
      <cb-button variant="outlined">Outlined</cb-button>
      <cb-button variant="text">Text</cb-button>
    </doc-section>

    <doc-section
      id="sizes"
      title="Sizes"
      description="Tres tamaños: sm, md (por defecto) y lg."
      [code]="sizesCode"
    >
      <cb-button size="sm">Small</cb-button>
      <cb-button size="md">Medium</cb-button>
      <cb-button size="lg">Large</cb-button>
    </doc-section>

    <doc-section
      id="loading"
      title="Loading"
      description="Muestra un spinner y bloquea la interacción (aria-busy)."
      [code]="loadingCode"
    >
      <cb-button [loading]="true">Procesando</cb-button>
      <cb-button severity="success" variant="outlined" [loading]="true">
        Guardando
      </cb-button>
    </doc-section>

    <doc-section
      id="disabled"
      title="Disabled"
      description="El botón deshabilitado no es interactivo."
      [code]="disabledCode"
    >
      <cb-button [disabled]="true">Deshabilitado</cb-button>
      <cb-button severity="danger" variant="outlined" [disabled]="true">
        Eliminar
      </cb-button>
    </doc-section>
  `,
})
export class ButtonDocComponent {
  constructor() {
    inject(TocService).reset();
  }

  protected readonly playground: DocApi = {
    component: CbButton,
    selector: 'cb-button',
    content: { default: 'Guardar' },
    props: [
      {
        name: 'severity',
        kind: 'enum',
        type: 'CbSeverity',
        default: 'primary',
        options: [
          'primary',
          'secondary',
          'success',
          'info',
          'warning',
          'help',
          'danger',
          'contrast',
        ],
        description: 'Color e intención semántica del botón.',
      },
      {
        name: 'variant',
        kind: 'enum',
        type: "'solid' | 'outlined' | 'text'",
        default: 'solid',
        options: ['solid', 'outlined', 'text'],
        description: 'Estilo visual del botón.',
      },
      {
        name: 'size',
        kind: 'enum',
        type: "'sm' | 'md' | 'lg'",
        default: 'md',
        options: ['sm', 'md', 'lg'],
        description: 'Tamaño del botón.',
      },
      {
        name: 'type',
        kind: 'enum',
        type: "'button' | 'submit' | 'reset'",
        default: 'button',
        options: ['button', 'submit', 'reset'],
        description: 'Atributo type nativo del botón.',
      },
      {
        name: 'disabled',
        kind: 'boolean',
        type: 'boolean',
        default: false,
        description: 'Deshabilita el botón.',
      },
      {
        name: 'loading',
        kind: 'boolean',
        type: 'boolean',
        default: false,
        description: 'Muestra un spinner y bloquea la interacción.',
      },
      {
        name: 'fullWidth',
        kind: 'boolean',
        type: 'boolean',
        default: false,
        description: 'Ocupa todo el ancho disponible.',
      },
    ],
  };

  protected readonly severities = [
    'primary',
    'secondary',
    'success',
    'info',
    'warning',
    'help',
    'danger',
    'contrast',
  ] as const;

  protected readonly installCode = `npm install @caribeng/ui`;

  protected readonly importCode = `import { CbButton } from '@caribeng/ui/button';

@Component({
  imports: [CbButton],
  // ...
})
export class MyComponent {}`;

  protected readonly basicCode = `<cb-button (click)="guardar()">Guardar</cb-button>`;

  protected readonly severityCode = `<cb-button severity="primary">primary</cb-button>
<cb-button severity="secondary">secondary</cb-button>
<cb-button severity="success">success</cb-button>
<cb-button severity="info">info</cb-button>
<cb-button severity="warning">warning</cb-button>
<cb-button severity="help">help</cb-button>
<cb-button severity="danger">danger</cb-button>
<cb-button severity="contrast">contrast</cb-button>`;

  protected readonly variantsCode = `<cb-button variant="solid">Solid</cb-button>
<cb-button variant="outlined">Outlined</cb-button>
<cb-button variant="text">Text</cb-button>`;

  protected readonly sizesCode = `<cb-button size="sm">Small</cb-button>
<cb-button size="md">Medium</cb-button>
<cb-button size="lg">Large</cb-button>`;

  protected readonly loadingCode = `<cb-button [loading]="true">Procesando</cb-button>
<cb-button severity="success" variant="outlined" [loading]="true">
  Guardando
</cb-button>`;

  protected readonly disabledCode = `<cb-button [disabled]="true">Deshabilitado</cb-button>
<cb-button severity="danger" variant="outlined" [disabled]="true">
  Eliminar
</cb-button>`;
}

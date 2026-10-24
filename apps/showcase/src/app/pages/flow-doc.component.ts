import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CbFlowEditor, cbLayoutFlow, cbValidateFlow, type CbFlow, type CbFlowNode } from '@caribeng/ui/flow';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

/** Aprobación de un crédito, con una vuelta atrás si falta documentación. */
const APROBACION: CbFlow = {
  nodes: [
    { id: 'solicitud', type: 'start', label: 'Solicitud recibida', x: 0, y: 0 },
    { id: 'documentos', type: 'task', label: 'Revisar documentos', x: -16, y: 112 },
    { id: 'completos', type: 'decision', label: '¿Documentación completa?', x: -8, y: 240 },
    { id: 'pedir', type: 'task', label: 'Pedir lo que falta', x: 256, y: 256 },
    { id: 'monto', type: 'decision', label: '¿Monto mayor a $ 50 M?', x: -8, y: 400 },
    { id: 'analista', type: 'task', label: 'Aprueba el analista', x: -224, y: 560 },
    { id: 'comite', type: 'task', label: 'Comité de crédito', x: 192, y: 560 },
    { id: 'desembolso', type: 'end', label: 'Desembolso', x: 0, y: 688 },
  ],
  edges: [
    { id: 'e1', from: 'solicitud', to: 'documentos' },
    { id: 'e2', from: 'documentos', to: 'completos' },
    { id: 'e3', from: 'completos', to: 'monto', label: 'Sí' },
    { id: 'e4', from: 'completos', to: 'pedir', label: 'No' },
    { id: 'e5', from: 'pedir', to: 'documentos', label: 'Reenvío' },
    { id: 'e6', from: 'monto', to: 'analista', label: 'No' },
    { id: 'e7', from: 'monto', to: 'comite', label: 'Sí' },
    { id: 'e8', from: 'analista', to: 'desembolso' },
    { id: 'e9', from: 'comite', to: 'desembolso' },
  ],
};

/** Un flujo que llega de un servidor sin posiciones (todas en 0). */
const SIN_POSICIONES: CbFlow = {
  nodes: [
    { id: 'a', type: 'start', label: 'Gasto registrado', x: 0, y: 0 },
    { id: 'b', type: 'decision', label: '¿Supera el tope?', x: 0, y: 0 },
    { id: 'c', type: 'task', label: 'Aprueba el jefe', x: 0, y: 0 },
    { id: 'd', type: 'task', label: 'Aprueba finanzas', x: 0, y: 0 },
    { id: 'e', type: 'end', label: 'Reembolso', x: 0, y: 0 },
  ],
  edges: [
    { id: '1', from: 'a', to: 'b' },
    { id: '2', from: 'b', to: 'c', label: 'No' },
    { id: '3', from: 'b', to: 'd', label: 'Sí' },
    { id: '4', from: 'c', to: 'e' },
    { id: '5', from: 'd', to: 'e' },
  ],
};

@Component({
  selector: 'doc-flow-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbFlowEditor, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Data"
      title="FlowEditor"
      lead="Editor de flujos para aprobaciones y procesos: nodos de inicio, tarea, decisión y fin unidos por conexiones con etiqueta. Se arrastran, se conectan desde su tirador y el lienzo se desplaza y amplía; todo se puede hacer con el teclado y la vista Lista permite editar el flujo sin lienzo. Avisa de los problemas del flujo y lo ordena por niveles."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="approval"
      title="Flujo de aprobación"
      description="Arrastra los nodos para moverlos y el tirador de su borde inferior hasta otro nodo para conectarlos; doble clic renombra un nodo o la etiqueta de una conexión. Con el teclado: Tab recorre nodos y conexiones, las flechas mueven el nodo, Intro lo renombra, C empieza una conexión (ve al destino y pulsa Intro) y Supr borra. Los botones de Añadir ponen el nodo nuevo debajo del seleccionado, ya conectado. La rueda desplaza el lienzo y Ctrl + rueda (o + y −) cambia el zoom."
      [code]="approvalCode"
      [codeTs]="approvalTs"
    >
      <div style="display: grid; gap: 0.75rem; width: 100%">
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center">
          <button type="button" class="doc-btn" (click)="aprobacion.set(ejemplo)">Restaurar el ejemplo</button>
          <button type="button" class="doc-btn" (click)="aprobacion.set({ nodes: [], edges: [] })">Empezar vacío</button>
          <span style="font-size: 0.875rem; color: var(--cb-color-text-muted)">{{ resumen() }}</span>
        </div>
        <cb-flow-editor [(flow)]="aprobacion" style="--cb-flow-height: 34rem" />
      </div>
    </doc-section>

    <doc-section
      id="readonly"
      title="Solo lectura"
      description="readonly muestra el flujo sin herramientas de edición: se recorre, se desplaza y se amplía. Intro o doble clic en un nodo emite nodeOpen, para abrir su detalle."
      [code]="readonlyCode"
    >
      <div style="display: grid; gap: 0.5rem; width: 100%">
        <cb-flow-editor [flow]="ejemplo" readonly [showValidation]="false" style="--cb-flow-height: 26rem" (nodeOpen)="abierto.set($event)" />
        <p class="flow-log">{{ abierto() ? 'nodeOpen: ' + abierto()!.label : 'Pulsa Intro o haz doble clic en un nodo.' }}</p>
      </div>
    </doc-section>

    <doc-section
      id="list"
      title="Vista de lista"
      description="view=&quot;list&quot; muestra el mismo flujo como una lista en orden de lectura: cada nodo con su nombre editable, sus salidas con su etiqueta y un selector para añadir conexiones. Es la forma de editar el flujo con lector de pantalla o sin puntero; el botón Diagrama / Lista de la barra cambia de vista."
      [code]="listCode"
    >
      <cb-flow-editor [(flow)]="lista" view="list" style="--cb-flow-height: 26rem" />
    </doc-section>

    <doc-section
      id="layout"
      title="Validación y orden automático"
      description="cbValidateFlow(flow) devuelve los problemas (falta inicio o fin, nodos sin salida o inalcanzables, decisiones con una sola salida o sin etiquetas) y cbLayoutFlow(flow) coloca los nodos por niveles. Este flujo llega sin posiciones y se ordena al cargarlo; el botón Ordenar de la barra hace lo mismo."
      [code]="layoutCode"
      [codeTs]="layoutTs"
    >
      <cb-flow-editor [(flow)]="ordenado" style="--cb-flow-height: 26rem" />
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
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
      .flow-log {
        min-height: 1.25rem;
        margin: 0;
        color: var(--cb-color-text-muted);
        font-size: 0.875rem;
      }
    `,
  ],
})
export class FlowDocComponent {
  protected readonly docApi = DOC_API['cb-flow-editor'];
  protected readonly a11y = DOC_A11Y['cb-flow-editor'];

  protected readonly ejemplo = APROBACION;
  protected readonly aprobacion = signal<CbFlow>(APROBACION);
  protected readonly lista = signal<CbFlow>(SIN_POSICIONES);
  protected readonly ordenado = signal<CbFlow>(cbLayoutFlow(SIN_POSICIONES));
  protected readonly abierto = signal<CbFlowNode | null>(null);
  protected readonly resumen = computed(() => {
    const flow = this.aprobacion();
    const problemas = cbValidateFlow(flow).length;
    return `${flow.nodes.length} nodos · ${flow.edges.length} conexiones · ${problemas === 1 ? '1 problema' : problemas ? `${problemas} problemas` : 'válido'}`;
  });

  protected readonly importCode = `import { CbFlowEditor, cbLayoutFlow, cbValidateFlow, type CbFlow } from '@caribeng/ui/flow';`;
  protected readonly approvalCode = `<cb-flow-editor [(flow)]="aprobacion" style="--cb-flow-height: 34rem" />`;
  protected readonly approvalTs = `aprobacion = signal<CbFlow>({
  nodes: [
    { id: 'solicitud', type: 'start', label: 'Solicitud recibida', x: 0, y: 0 },
    { id: 'documentos', type: 'task', label: 'Revisar documentos', x: -16, y: 112 },
    { id: 'completos', type: 'decision', label: '¿Documentación completa?', x: -8, y: 240 },
    // …
  ],
  edges: [
    { id: 'e1', from: 'solicitud', to: 'documentos' },
    { id: 'e3', from: 'completos', to: 'monto', label: 'Sí' },
    { id: 'e5', from: 'pedir', to: 'documentos', label: 'Reenvío' },
    // …
  ],
});`;
  protected readonly readonlyCode = `<cb-flow-editor [flow]="ejemplo" readonly [showValidation]="false" (nodeOpen)="abierto.set($event)" />`;
  protected readonly listCode = `<cb-flow-editor [(flow)]="lista" view="list" />`;
  protected readonly layoutCode = `<cb-flow-editor [(flow)]="ordenado" />`;
  protected readonly layoutTs = `// Llega sin posiciones: se ordena por niveles antes de mostrarlo.
ordenado = signal<CbFlow>(cbLayoutFlow(delServidor));

// Antes de guardar, comprueba que el flujo tiene sentido.
const problemas = cbValidateFlow(this.ordenado());
if (problemas.some((p) => p.severity === 'error')) { … }`;

  constructor() {
    inject(TocService).reset();
  }
}

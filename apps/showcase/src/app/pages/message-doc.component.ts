import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CbMessage } from '@caribeng/ui/message';
import { CbButton } from '@caribeng/ui/button';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-message-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CbMessage,
    CbButton,
    DocSectionComponent,
    CodeBlockComponent,
    DocPageHeaderComponent,
  ],
  template: `
    <doc-page-header eyebrow="Messages" title="Message" lead="Mensaje inline con severidad, icono y cierre opcional." />

    <doc-section id="import" title="Import">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="severities" title="Severidades" [code]="sevCode">
      <div style="display: flex; flex-direction: column; gap: 0.75rem">
        <cb-message severity="success">Los cambios se guardaron correctamente.</cb-message>
        <cb-message severity="info">Hay una nueva versión disponible.</cb-message>
        <cb-message severity="warning">Revisa los campos marcados.</cb-message>
        <cb-message severity="danger">No se pudo completar la operación.</cb-message>
      </div>
    </doc-section>

    <doc-section id="closable" title="Cerrable" description="closable muestra un botón para descartar; emite (closed)." [code]="closableCode">
      @if (visible()) {
        <cb-message severity="info" closable [(visible)]="visible">
          Este mensaje se puede cerrar.
        </cb-message>
      } @else {
        <cb-button variant="outlined" size="sm" (click)="visible.set(true)">Mostrar de nuevo</cb-button>
      }
    </doc-section>
  `,
})
export class MessageDocComponent {
  constructor() {
    inject(TocService).reset();
  }
  protected readonly visible = signal(true);
  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbMessage } from '@caribeng/ui/message';`;
  protected readonly sevCode = `<cb-message severity="success">Guardado correctamente.</cb-message>
<cb-message severity="danger">No se pudo completar.</cb-message>`;
  protected readonly closableCode = `<cb-message severity="info" closable [(visible)]="visible">
  Este mensaje se puede cerrar.
</cb-message>`;
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbAvatar } from '@caribeng/ui/avatar';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-avatar-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbAvatar, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Multimedia" title="Avatar" lead="Imagen, iniciales o icono en círculo o cuadrado." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="installCode" lang="bash" />
      <br />
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section id="types" title="Tipos" description="Iniciales, icono o imagen." [code]="typesCode">
      <div style="display: flex; gap: 1rem; align-items: center">
        <cb-avatar label="AP" severity="info" />
        <cb-avatar icon="user" />
        <cb-avatar icon="user" shape="square" severity="primary" />
      </div>
    </doc-section>

    <doc-section id="sizes" title="Tamaños" description="Cuatro tamaños con size: sm, md (por defecto), lg y xl." [code]="sizeCode">
      <div style="display: flex; gap: 1rem; align-items: center">
        <cb-avatar label="SM" size="sm" severity="success" />
        <cb-avatar label="MD" severity="success" />
        <cb-avatar label="LG" size="lg" severity="success" />
        <cb-avatar label="XL" size="xl" severity="success" />
      </div>
    </doc-section>

    <doc-section id="severities" title="Severidades" description="severity aplica el color semántico de fondo cuando se muestran iniciales o icono." [code]="sevCode">
      <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap">
        <cb-avatar label="P" severity="primary" />
        <cb-avatar label="S" severity="secondary" />
        <cb-avatar label="OK" severity="success" />
        <cb-avatar label="I" severity="info" />
        <cb-avatar label="!" severity="warning" />
        <cb-avatar label="X" severity="danger" />
        <cb-avatar label="?" severity="help" />
        <cb-avatar label="C" severity="contrast" />
      </div>
    </doc-section>

    <doc-playground [api]="docApi" />
  `,
})
export class AvatarDocComponent {
  protected readonly docApi = DOC_API['cb-avatar'];

  constructor() {
    inject(TocService).reset();
  }
  protected readonly installCode = `npm install @caribeng/ui`;
  protected readonly importCode = `import { CbAvatar } from '@caribeng/ui/avatar';`;
  protected readonly typesCode = `<cb-avatar label="AP" severity="info" />
<cb-avatar icon="user" />
<cb-avatar image="/u/ana.jpg" />`;
  protected readonly sizeCode = `<cb-avatar label="SM" size="sm" />
<cb-avatar label="XL" size="xl" />`;
  protected readonly sevCode = `<cb-avatar label="OK" severity="success" />`;
}

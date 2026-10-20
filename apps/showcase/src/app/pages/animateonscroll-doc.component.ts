import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CbAnimateOnScrollDirective } from '@caribeng/ui/animateonscroll';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

const BASIC_CODE = `<div cbAnimateOnScroll enterClass="cb-fade-in">
  Tarjeta animada al entrar en viewport
</div>`;

@Component({
  selector: 'cb-animateonscroll-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbDocPageComponent, CbDocExampleComponent, CbAnimateOnScrollDirective],
  template: `
    <cb-doc-page
      category="Varios"
      title="AnimateOnScroll"
      subtitle="Directiva que observa la intersección con el viewport y aplica clases CSS de entrada/salida."
      importCode="import { CbAnimateOnScrollDirective } from '@caribeng/ui/animateonscroll';"
      [api]="api"
    >
      <cb-doc-example
        title="Animación en entrada al viewport"
        description="Usa IntersectionObserver con degradación elegante en entornos sin soporte."
        [code]="basicCode"
      >
        <div
          cbAnimateOnScroll
          enterClass="cb-animate-enter"
          style="padding: 1rem 1.25rem; border-radius: 0.5rem; border: 1px solid var(--cb-border-subtle, #e2e8f0); background: var(--cb-surface-card, #fff)"
        >
          Elemento observado con <code>[cbAnimateOnScroll]</code>
        </div>
      </cb-doc-example>
    </cb-doc-page>
  `,
})
export class AnimateonscrollDocComponent {
  protected readonly basicCode = BASIC_CODE;

  protected readonly api: CbDocApiRow[] = [
    { name: 'enterClass', type: 'string', default: "'cb-animate-enter'", description: 'Clase(s) aplicadas al entrar en el viewport.' },
    { name: 'leaveClass', type: 'string', default: "''", description: 'Clase(s) aplicadas al salir del viewport.' },
    { name: 'once', type: 'boolean', default: 'true', description: 'Si es true, desconecta el observador tras la primera entrada.' },
    { name: 'threshold', type: 'number', default: '0.15', description: 'Umbral de intersección entre 0 y 1.' },
  ];
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CbAnimationLottieComponent } from '@caribeng/ui/animation-lottie';
import { CbDocApiRow, CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-animation-lottie-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbDocPageComponent, CbDocExampleComponent, CbAnimationLottieComponent],
  template: `
    <cb-doc-page
      category="Caribe Design · Identidad"
      title="AnimationLottie"
      subtitle="Contenedor accesible de animaciones vectoriales tipo Lottie con control de reproducción."
      importCode="import { CbAnimationLottieComponent } from '@caribeng/ui/animation-lottie';"
      [api]="api"
    >
      <cb-doc-example title="Animación en bucle" code='<cb-animation-lottie size="96px" [loop]="true" />'>
        <cb-animation-lottie size="96px" [loop]="true" />
      </cb-doc-example>
    </cb-doc-page>
  `,
})
export class AnimationLottieDocComponent {
  protected readonly api: CbDocApiRow[] = [
    { name: 'src', type: 'string', default: "''", description: 'Ruta o JSON de la animación.' },
    { name: 'autoplay', type: 'boolean', default: 'true', description: 'Inicia automáticamente al montar.' },
    { name: 'loop', type: 'boolean', default: 'true', description: 'Repite la animación en ciclo continuo.' },
    { name: 'size', type: 'string', default: "'96px'", description: 'Dimensiones del lienzo.' },
  ];
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbAnimationLottie } from '@caribeng/ui/caribe/animation-lottie';
import { CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-animation-lottie-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbAnimationLottie],
  template: `
    <cb-doc-page
      category="Caribe Design · Identidad"
      title="AnimationLottie"
      subtitle="Contenedor accesible de animaciones vectoriales tipo Lottie con control de reproducción."
      importCode="import { CbAnimationLottie } from '@caribeng/ui/caribe/animation-lottie';"
    >
      <cb-doc-example title="Animación en bucle" code='<cb-animation-lottie size="96px" [loop]="true" />'>
        <cb-animation-lottie size="96px" [loop]="true" />
      </cb-doc-example>
    
      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class AnimationLottieDocComponent {
  protected readonly docApi = DOC_API['cb-animation-lottie'];

}

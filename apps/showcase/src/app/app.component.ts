import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocLayoutComponent } from './layout/doc-layout.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocLayoutComponent],
  template: `<doc-layout />`,
})
export class AppComponent {}

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbFloatMenu } from '@caribeng/ui/caribe/float-menu';
import { CbCardContent } from '@caribeng/ui/caribe/card-content';
import { CbDocPageComponent } from '../components/doc-page.component';
import { CbDocExampleComponent } from '../components/doc-example.component';

@Component({
  selector: 'cb-float-menu-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocPlaygroundComponent, CbDocPageComponent, CbDocExampleComponent, CbFloatMenu, CbCardContent],
  template: `
    <cb-doc-page
      category="Caribe Design · Navegación"
      title="FloatMenu"
      subtitle="Barra de navegación flotante tipo píldora para vistas móviles y web."
      importCode="import { CbFloatMenu } from '@caribeng/ui/caribe/float-menu';"
    >
      <cb-doc-example title="Barra flotante" code='<cb-float-menu [items]="items" [activeId]="active()" />'>
        <cb-float-menu [items]="items" [activeId]="active()" (select)="active.set($event.id)" />
      </cb-doc-example>

      <cb-doc-example title="Navegación con vistas" [code]="composedCode">
        <div style="display: flex; flex-direction: column; gap: 1rem; align-items: center">
          <cb-float-menu [items]="views" [activeId]="view()" (select)="view.set($event.id)" />
          @switch (view()) {
            @case ('home') {
              <cb-card-content title="Home" subtitle="Overview">Welcome back. Here is your account summary.</cb-card-content>
            }
            @case ('cards') {
              <cb-card-content title="Cards" subtitle="2 active">Manage your cards, limits and security.</cb-card-content>
            }
            @case ('profile') {
              <cb-card-content title="Profile" subtitle="Personal data">Update your contact information.</cb-card-content>
            }
          }
        </div>
      </cb-doc-example>

      <doc-playground [api]="docApi" />
    </cb-doc-page>
  `,
})
export class FloatMenuDocComponent {
  protected readonly docApi = DOC_API['cb-float-menu'];

  protected readonly active = signal('home');
  protected readonly view = signal('home');
  protected readonly views = [
    { id: 'home', label: 'Home' },
    { id: 'cards', label: 'Cards' },
    { id: 'profile', label: 'Profile' },
  ];
  protected readonly composedCode = `<cb-float-menu [items]="views" [activeId]="view()" (select)="view.set($event.id)" />

@switch (view()) {
  @case ('home') { <cb-card-content title="Home" subtitle="Overview">…</cb-card-content> }
  @case ('cards') { <cb-card-content title="Cards" subtitle="2 active">…</cb-card-content> }
  @case ('profile') { <cb-card-content title="Profile" subtitle="Personal data">…</cb-card-content> }
}`;
  protected readonly items = [
    { id: 'home', label: 'Inicio' },
    { id: 'cards', label: 'Productos' },
    { id: 'profile', label: 'Perfil' },
  ];
}

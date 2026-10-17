import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbSplitterComponent, CbSplitterPanelComponent } from './splitter.component';

@Component({
  imports: [CbSplitterComponent, CbSplitterPanelComponent],
  template: `
    <cb-splitter [layout]="layout()" [step]="10">
      <cb-splitter-panel [size]="30" [minSize]="15">Panel A</cb-splitter-panel>
      <cb-splitter-panel [size]="70" [minSize]="15">Panel B</cb-splitter-panel>
    </cb-splitter>
  `,
})
class HostComponent {
  layout = signal<'horizontal' | 'vertical'>('horizontal');
}

describe('CbSplitterComponent', () => {
  it('renderiza paneles con flex-basis inicial y un separador accesible', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const panels = el.querySelectorAll<HTMLElement>('cb-splitter-panel');
    const gutter = el.querySelector<HTMLElement>('.cb-splitter__gutter')!;

    expect(panels.length).toBe(2);
    expect(panels[0].style.flexBasis).toBe('30%');
    expect(panels[1].style.flexBasis).toBe('70%');
    expect(gutter.getAttribute('role')).toBe('separator');
    expect(gutter.getAttribute('aria-valuenow')).toBe('30');
  });

  it('redimensiona con teclado ArrowRight y ArrowLeft respetando minSize', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const panels = el.querySelectorAll<HTMLElement>('cb-splitter-panel');
    const gutter = el.querySelector<HTMLElement>('.cb-splitter__gutter')!;

    gutter.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();

    expect(panels[0].style.flexBasis).toBe('40%');
    expect(panels[1].style.flexBasis).toBe('60%');

    gutter.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    fixture.detectChanges();

    expect(panels[0].style.flexBasis).toBe('15%');
    expect(panels[1].style.flexBasis).toBe('85%');
  });
});

import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbThemeService } from '@caribeng/ui';
import { CbThemeToggle } from './themetoggle.component';

function setup(showLabel = false) {
  const fixture = TestBed.createComponent(CbThemeToggle);
  fixture.componentRef.setInput('showLabel', showLabel);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const theme = TestBed.inject(CbThemeService);
  theme.setTheme('light');
  fixture.detectChanges();
  return { fixture, el, theme, button: () => el.querySelector('button')! };
}

describe('CbThemeToggle', () => {
  it('el botón describe la acción y alterna el tema', () => {
    const { fixture, theme, button } = setup();
    expect(button().getAttribute('aria-label')).toBe('Cambiar a tema oscuro');
    button().click();
    fixture.detectChanges();
    expect(theme.isDark()).toBe(true);
    expect(button().getAttribute('aria-label')).toBe('Cambiar a tema claro');
  });

  it('el icono es decorativo y cambia entre luna y sol', () => {
    const { fixture, el, button } = setup();
    const icon = () => fixture.debugElement.query((d) => d.name === 'cb-icon').componentInstance.name();
    expect(icon()).toBe('moon');
    expect(el.querySelector('cb-icon')!.getAttribute('aria-hidden')).toBe('true');
    button().click();
    fixture.detectChanges();
    expect(icon()).toBe('sun');
  });

  it('con showLabel muestra el texto visible en lugar de aria-label', () => {
    const { button } = setup(true);
    expect(button().hasAttribute('aria-label')).toBe(false);
    expect(button().textContent!.trim()).toBe('Cambiar a tema oscuro');
  });
});

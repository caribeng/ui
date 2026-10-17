import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CB_CONFIG, CB_DEFAULT_CONFIG } from './caribeng.config';
import { CbThemeService } from './theme.service';

describe('CbThemeService', () => {
  function configure(theme: 'light' | 'dark' = 'light') {
    TestBed.configureTestingModule({
      providers: [
        { provide: CB_CONFIG, useValue: { ...CB_DEFAULT_CONFIG, theme } },
      ],
    });
    return TestBed.inject(CbThemeService);
  }

  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it('inicia con el tema de la configuración', () => {
    const svc = configure('light');
    expect(svc.theme()).toBe('light');
    expect(svc.isDark()).toBe(false);
  });

  it('refleja el tema en el atributo data-theme del elemento raíz', () => {
    const svc = configure('light');
    TestBed.tick();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    svc.setTheme('dark');
    TestBed.tick();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('alterna entre claro y oscuro', () => {
    const svc = configure('light');
    svc.toggle();
    expect(svc.isDark()).toBe(true);
    svc.toggle();
    expect(svc.isDark()).toBe(false);
  });
});

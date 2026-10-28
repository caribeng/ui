import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CB_CONFIG, CB_DEFAULT_CONFIG, type CaribeNgConfig } from './caribeng.config';
import { CB_LOCALE_EN, CB_LOCALE_ES, cbFormat } from './locale';
import { CbLocaleService } from './locale.service';

function service(config: Partial<CaribeNgConfig> = {}) {
  TestBed.configureTestingModule({
    providers: [{ provide: CB_CONFIG, useValue: { ...CB_DEFAULT_CONFIG, ...config } }],
  });
  return TestBed.inject(CbLocaleService);
}

const placeholders = (s: string) => (s.match(/\{\d+\}/g) ?? []).sort().join(',');

describe('Locale de CaribeNG', () => {
  it('español e inglés tienen las mismas claves y los mismos marcadores {n}', () => {
    expect(Object.keys(CB_LOCALE_EN).sort()).toEqual(Object.keys(CB_LOCALE_ES).sort());
    for (const key of Object.keys(CB_LOCALE_ES) as (keyof typeof CB_LOCALE_ES)[]) {
      expect(placeholders(CB_LOCALE_EN[key]), key).toBe(placeholders(CB_LOCALE_ES[key]));
      expect(CB_LOCALE_EN[key].trim(), key).not.toBe('');
    }
  });

  it('cbFormat rellena los marcadores y conserva los que faltan', () => {
    expect(cbFormat('Paso {0} de {1}', 2, 5)).toBe('Paso 2 de 5');
    expect(cbFormat('Dígito {0}', 3)).toBe('Dígito 3');
    expect(cbFormat('{0} y {1}', 'a')).toBe('a y {1}');
  });

  it('usa inglés por defecto', () => {
    expect(service().translation().close).toBe('Close');
  });

  it('respeta el idioma configurado y los textos sobrescritos', () => {
    const s = service({ locale: 'en', translation: { close: 'Dismiss' } });
    expect(s.translation().close).toBe('Dismiss');
    expect(s.translation().noResults).toBe('No results found');
  });

  it('cambia de idioma en caliente y mantiene los textos sobrescritos', () => {
    const s = service({ translation: { close: 'Salir' } });
    expect(s.translation().today).toBe('Today');
    s.use('es');
    expect(s.translation().today).toBe('Hoy');
    expect(s.translation().close).toBe('Salir');
    s.setTranslation({ today: 'Now' });
    expect(s.translation().today).toBe('Now');
  });
});

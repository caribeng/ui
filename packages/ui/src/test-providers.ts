import { CB_CONFIG, CB_DEFAULT_CONFIG } from './lib/caribeng.config';

/**
 * Providers globales del entorno de test.
 *
 * La librería usa inglés por defecto en producción (`CB_DEFAULT_CONFIG.locale`),
 * pero los specs están escritos asertando los textos en español. Para no depender
 * del idioma por defecto, el entorno de test fija explícitamente `locale: 'es'`;
 * los tests que comprueban el inglés lo declaran aparte (p. ej. `locale.spec.ts`).
 */
export default [
  { provide: CB_CONFIG, useValue: { ...CB_DEFAULT_CONFIG, locale: 'es' as const } },
];

import { Directive, booleanAttribute, forwardRef, input, numberAttribute } from '@angular/core';
import type { CbChartValueFormat } from './chart-model';

/** Un registro de datos del modo composable: cada serie elige sus campos. */
export type CbChartRecord = Readonly<Record<string, unknown>>;

/** Forma de unir los puntos de una línea o un área. */
export type CbChartCurve = 'linear' | 'smooth' | 'step';

/** Eje vertical al que se asocia una serie o una referencia. */
export type CbChartYAxis = 'left' | 'right';

/** Tipo de eje: `auto` lo deduce de los datos (texto → categorías, número → lineal, `Date` → tiempo). */
export type CbChartAxisType = 'auto' | 'category' | 'linear' | 'time';

/** Valor de una referencia: número en un eje Y; número, fecha o categoría en el eje X. */
export type CbChartRefValue = number | string | Date;

/**
 * Base de las series del modo composable (`<cb-chart>` con hijos). Cada serie lee
 * de `data` (la del gráfico o la suya) los campos que indique.
 */
@Directive()
export abstract class CbChartSeries {
  abstract readonly kind: 'bar' | 'line' | 'area' | 'scatter' | 'rangeArea' | 'candlestick';
  /** Nombre en la leyenda, el tooltip y la tabla accesible. */
  readonly name = input<string>('');
  /** Campo con el valor del eje X (categoría, número o fecha). */
  readonly x = input<string>('x');
  readonly color = input<string | undefined>(undefined);
  /** Eje Y de la serie. */
  readonly axis = input<CbChartYAxis>('left');
  /** Datos propios; si se omite, usa los del gráfico. */
  readonly data = input<readonly CbChartRecord[] | undefined>(undefined);
}

/** Barras. Las series con el mismo `stack` se apilan. */
@Directive({
  selector: 'cb-chart-bar',
  providers: [{ provide: CbChartSeries, useExisting: forwardRef(() => CbChartBar) }],
})
export class CbChartBar extends CbChartSeries {
  readonly kind = 'bar' as const;
  /** Campo del valor. */
  readonly y = input<string>('y');
  /** Grupo de apilado: las barras con el mismo valor se apilan. */
  readonly stack = input<string | undefined>(undefined);
}

/** Línea. */
@Directive({
  selector: 'cb-chart-line',
  providers: [{ provide: CbChartSeries, useExisting: forwardRef(() => CbChartLine) }],
})
export class CbChartLine extends CbChartSeries {
  readonly kind = 'line' as const;
  readonly y = input<string>('y');
  readonly curve = input<CbChartCurve>('linear');
  /** Trazo discontinuo (p. ej. para una proyección o una media). */
  readonly dashed = input(false, { transform: booleanAttribute });
  /** Dibuja un punto en cada dato. */
  readonly points = input(true, { transform: booleanAttribute });
}

/** Área: una línea con relleno hasta el 0 (o hasta la serie de debajo si se apila). */
@Directive({
  selector: 'cb-chart-area',
  providers: [{ provide: CbChartSeries, useExisting: forwardRef(() => CbChartArea) }],
})
export class CbChartArea extends CbChartSeries {
  readonly kind = 'area' as const;
  readonly y = input<string>('y');
  readonly curve = input<CbChartCurve>('linear');
  /** Grupo de apilado: las áreas con el mismo valor se apilan. */
  readonly stack = input<string | undefined>(undefined);
}

/** Dispersión: un punto por registro. */
@Directive({
  selector: 'cb-chart-scatter',
  providers: [{ provide: CbChartSeries, useExisting: forwardRef(() => CbChartScatter) }],
})
export class CbChartScatter extends CbChartSeries {
  readonly kind = 'scatter' as const;
  readonly y = input<string>('y');
  /** Radio de los puntos. */
  readonly size = input(5, { transform: numberAttribute });
}

/** Banda entre un mínimo y un máximo (rango, intervalo de confianza…). */
@Directive({
  selector: 'cb-chart-range-area',
  providers: [{ provide: CbChartSeries, useExisting: forwardRef(() => CbChartRangeArea) }],
})
export class CbChartRangeArea extends CbChartSeries {
  readonly kind = 'rangeArea' as const;
  readonly low = input<string>('low');
  readonly high = input<string>('high');
  readonly curve = input<CbChartCurve>('linear');
}

/** Velas japonesas u OHLC (apertura, máximo, mínimo y cierre). */
@Directive({
  selector: 'cb-chart-candlestick',
  providers: [{ provide: CbChartSeries, useExisting: forwardRef(() => CbChartCandlestick) }],
})
export class CbChartCandlestick extends CbChartSeries {
  readonly kind = 'candlestick' as const;
  readonly open = input<string>('open');
  readonly high = input<string>('high');
  readonly low = input<string>('low');
  readonly close = input<string>('close');
  /** `candle`: cuerpo relleno; `ohlc`: barra con marcas de apertura y cierre. */
  readonly variant = input<'candle' | 'ohlc'>('candle');
  /** Color cuando cierra por encima de la apertura. */
  readonly upColor = input<string>('var(--cb-color-success-500)');
  /** Color cuando cierra por debajo. */
  readonly downColor = input<string>('var(--cb-color-danger-500)');
}

/** Configuración de un eje: posición, tipo, rango, formato y título. */
@Directive({ selector: 'cb-chart-axis' })
export class CbChartAxis {
  /** `bottom` es el eje X; `left` y `right`, los ejes Y. */
  readonly position = input<'bottom' | CbChartYAxis>('left');
  /** Solo para el eje X. */
  readonly type = input<CbChartAxisType>('auto');
  readonly min = input<number | undefined>(undefined);
  readonly max = input<number | undefined>(undefined);
  /** Título del eje. */
  readonly label = input<string | undefined>(undefined);
  /** Formato de las marcas (por defecto, el `valueFormat` del gráfico en los ejes Y). */
  readonly format = input<CbChartValueFormat | undefined>(undefined);
  /** Líneas de rejilla en las marcas (por defecto, solo el eje Y principal). */
  readonly grid = input<boolean | undefined>(undefined);
}

/** Línea de referencia (meta, umbral, media…) en un valor de un eje. */
@Directive({ selector: 'cb-chart-reference-line' })
export class CbChartReferenceLine {
  readonly value = input.required<CbChartRefValue>();
  /** `left` / `right`: línea horizontal en ese eje Y; `x`: línea vertical. */
  readonly axis = input<CbChartYAxis | 'x'>('left');
  readonly label = input<string | undefined>(undefined);
  readonly color = input<string | undefined>(undefined);
}

/** Franja de referencia entre dos valores de un eje (rango objetivo, horario…). */
@Directive({ selector: 'cb-chart-reference-band' })
export class CbChartReferenceBand {
  readonly from = input.required<CbChartRefValue>();
  readonly to = input.required<CbChartRefValue>();
  readonly axis = input<CbChartYAxis | 'x'>('left');
  readonly label = input<string | undefined>(undefined);
  readonly color = input<string | undefined>(undefined);
}

/** Anotación: marca un punto (x, y) con una etiqueta, p. ej. "Máximo de la sesión". */
@Directive({ selector: 'cb-chart-annotation' })
export class CbChartAnnotation {
  /** Valor de X (número, fecha o categoría). */
  readonly x = input.required<CbChartRefValue>();
  /** Valor en el eje Y. */
  readonly y = input.required<number>();
  readonly axis = input<CbChartYAxis>('left');
  readonly label = input.required<string>();
  readonly color = input<string | undefined>(undefined);
}

import type { CbAccount } from '@caribeng/ui/account-picker';

/** Extracto del Plan Único de Cuentas (PUC) colombiano para los ejemplos contables. */
export const PUC: CbAccount[] = [
  { code: '1', name: 'Activo', nature: 'debit' },
  { code: '11', name: 'Disponible' },
  { code: '1105', name: 'Caja' },
  { code: '110505', name: 'Caja general' },
  { code: '110510', name: 'Cajas menores' },
  { code: '1110', name: 'Bancos' },
  { code: '111005', name: 'Moneda nacional' },
  { code: '111010', name: 'Moneda extranjera' },
  { code: '1120', name: 'Cuentas de ahorro' },
  { code: '112005', name: 'Bancos' },
  { code: '13', name: 'Deudores' },
  { code: '1305', name: 'Clientes' },
  { code: '130505', name: 'Nacionales' },
  { code: '130510', name: 'Del exterior' },
  { code: '1355', name: 'Anticipo de impuestos y contribuciones' },
  { code: '135515', name: 'Retención en la fuente' },
  { code: '135517', name: 'Impuesto a las ventas retenido' },
  { code: '14', name: 'Inventarios' },
  { code: '1435', name: 'Mercancías no fabricadas por la empresa' },
  { code: '143505', name: 'Mercancías' },
  { code: '15', name: 'Propiedades, planta y equipo' },
  { code: '1524', name: 'Equipo de oficina' },
  { code: '152405', name: 'Muebles y enseres' },
  { code: '1528', name: 'Equipo de computación y comunicación' },
  { code: '152805', name: 'Equipos de procesamiento de datos' },
  { code: '2', name: 'Pasivo', nature: 'credit' },
  { code: '21', name: 'Obligaciones financieras' },
  { code: '2105', name: 'Bancos nacionales' },
  { code: '210510', name: 'Pagarés' },
  { code: '22', name: 'Proveedores' },
  { code: '2205', name: 'Nacionales' },
  { code: '220505', name: 'Proveedores nacionales' },
  { code: '23', name: 'Cuentas por pagar' },
  { code: '2335', name: 'Costos y gastos por pagar' },
  { code: '233550', name: 'Servicios públicos' },
  { code: '2365', name: 'Retención en la fuente' },
  { code: '236525', name: 'Servicios' },
  { code: '236540', name: 'Compras' },
  { code: '2367', name: 'Impuesto a las ventas retenido' },
  { code: '236701', name: 'IVA retenido' },
  { code: '24', name: 'Impuestos, gravámenes y tasas' },
  { code: '2408', name: 'Impuesto sobre las ventas por pagar' },
  { code: '240805', name: 'IVA generado' },
  { code: '240810', name: 'IVA descontable' },
  { code: '25', name: 'Obligaciones laborales' },
  { code: '2505', name: 'Salarios por pagar' },
  { code: '250505', name: 'Salarios' },
  { code: '3', name: 'Patrimonio', nature: 'credit' },
  { code: '31', name: 'Capital social' },
  { code: '3105', name: 'Capital suscrito y pagado' },
  { code: '310505', name: 'Capital autorizado' },
  { code: '36', name: 'Resultados del ejercicio' },
  { code: '3605', name: 'Utilidad del ejercicio' },
  { code: '360505', name: 'Utilidad del ejercicio' },
  { code: '4', name: 'Ingresos', nature: 'credit' },
  { code: '41', name: 'Operacionales' },
  { code: '4135', name: 'Comercio al por mayor y al por menor' },
  { code: '413505', name: 'Venta de productos agrícolas' },
  { code: '413595', name: 'Venta de otros productos' },
  { code: '42', name: 'No operacionales' },
  { code: '4210', name: 'Financieros' },
  { code: '421005', name: 'Intereses' },
  { code: '5', name: 'Gastos', nature: 'debit' },
  { code: '51', name: 'Operacionales de administración' },
  { code: '5105', name: 'Gastos de personal' },
  { code: '510506', name: 'Sueldos' },
  { code: '5120', name: 'Arrendamientos' },
  { code: '512010', name: 'Construcciones y edificaciones' },
  { code: '5135', name: 'Servicios' },
  { code: '513525', name: 'Acueducto y alcantarillado' },
  { code: '513530', name: 'Energía eléctrica' },
  { code: '513535', name: 'Teléfono' },
  { code: '513540', name: 'Internet' },
  { code: '5195', name: 'Diversos' },
  { code: '519530', name: 'Útiles, papelería y fotocopias' },
  { code: '53', name: 'No operacionales' },
  { code: '5305', name: 'Financieros' },
  { code: '530505', name: 'Gastos bancarios' },
  { code: '530515', name: 'Comisiones', disabled: true },
  { code: '6', name: 'Costos de ventas', nature: 'debit' },
  { code: '61', name: 'Costo de ventas y de prestación de servicios' },
  { code: '6135', name: 'Comercio al por mayor y al por menor' },
  { code: '613595', name: 'Venta de otros productos' },
];

/** Terceros de ejemplo. */
export const TERCEROS = [
  { label: 'Enel Colombia S.A.', value: '860063875', description: 'NIT 860.063.875-8' },
  { label: 'Claro Colombia', value: '800153993', description: 'NIT 800.153.993-7' },
  { label: 'Distribuidora El Caribe S.A.S.', value: '901234567', description: 'NIT 901.234.567-1' },
  { label: 'Ana Ruiz Mendoza', value: '52876543', description: 'C.C. 52.876.543' },
  { label: 'Banco de Bogotá', value: '860002964', description: 'NIT 860.002.964-4' },
  { label: 'DIAN', value: '800197268', description: 'NIT 800.197.268-4' },
];

/** Centros de costo de ejemplo. */
export const CENTROS_COSTO = [
  { label: '100 Administración', value: '100' },
  { label: '200 Ventas', value: '200' },
  { label: '300 Logística', value: '300' },
];

/** Tipos de comprobante de ejemplo. */
export const TIPOS_COMPROBANTE = [
  { label: 'CE · Comprobante de egreso', value: 'CE' },
  { label: 'RC · Recibo de caja', value: 'RC' },
  { label: 'NC · Nota de contabilidad', value: 'NC' },
  { label: 'FV · Factura de venta', value: 'FV' },
];

/**
 * Saldos contables de ejemplo (débito positivo, crédito negativo) a octubre de
 * 2026 y de 2025. El balance cuadra con la utilidad del estado de resultados y
 * el balance de prueba suma cero.
 */
export const SALDOS: Readonly<Record<string, readonly number[]>> = {
  '110505': [3200000, 2100000],
  '110510': [500000, 500000],
  '111005': [48750000, 36400000],
  '111010': [12300000, 9800000],
  '112005': [25000000, 20000000],
  '130505': [31450000, 27900000],
  '130510': [6200000, 4100000],
  '135515': [2340000, 1980000],
  '135517': [860000, 640000],
  '143505': [54600000, 48200000],
  '152405': [18900000, 18900000],
  '152805': [22400000, 16800000],
  '210510': [-40000000, -45000000],
  '220505': [-28700000, -24300000],
  '233550': [-1850000, -1420000],
  '236525': [-420000, -380000],
  '236540': [-960000, -810000],
  '236701': [-310000, -260000],
  '240805': [-9880000, -8120000],
  '240810': [4250000, 3600000],
  '250505': [-6400000, -5900000],
  '310505': [-80000000, -80000000],
  '413505': [-120000000, -95000000],
  '413595': [-86500000, -71200000],
  '421005': [-1830000, -1240000],
  '510506': [32000000, 43500000],
  '512010': [9600000, 9000000],
  '513525': [820000, 760000],
  '513530': [2450000, 2180000],
  '513535': [640000, 610000],
  '513540': [1080000, 960000],
  '519530': [560000, 480000],
  '530505': [550000, 620000],
  '613595': [98400000, 84600000],
};

/** Meses cerrados de ejemplo para el selector de periodo. */
export const MESES_CERRADOS = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];

/** Facturas pendientes de clientes (corte: 31 de octubre de 2026). */
export const CARTERA = [
  { id: 1, party: 'Distribuidora El Caribe S.A.S.', number: 'FV-1188', date: '2026-07-20', due: '2026-08-19', balance: 3250000 },
  { id: 2, party: 'Distribuidora El Caribe S.A.S.', number: 'FV-1203', date: '2026-09-05', due: '2026-10-05', balance: 1870000 },
  { id: 3, party: 'Distribuidora El Caribe S.A.S.', number: 'FV-1241', date: '2026-10-12', due: '2026-11-11', balance: 2640000 },
  { id: 4, party: 'Supermercados La 14', number: 'FV-1150', date: '2026-05-02', due: '2026-06-01', balance: 980000 },
  { id: 5, party: 'Supermercados La 14', number: 'FV-1222', date: '2026-09-25', due: '2026-10-25', balance: 4120000 },
  { id: 6, party: 'Ana Ruiz Mendoza', number: 'FV-1199', date: '2026-08-28', due: '2026-09-27', balance: 450000 },
  { id: 7, party: 'Ferretería Bolívar', number: 'FV-1230', date: '2026-10-01', due: '2026-10-31', balance: 1360000 },
  { id: 8, party: 'Ferretería Bolívar', number: 'FV-1252', date: '2026-10-20', due: '2026-11-19', balance: 2210000 },
  { id: 9, party: 'Hotel Las Américas', number: 'FV-1101', date: '2026-03-15', due: '2026-04-14', balance: 5600000 },
  { id: 10, party: 'Hotel Las Américas', number: 'FV-1214', date: '2026-09-18', due: '2026-10-18', balance: 3080000 },
];

/** Extracto del Banco de Bogotá de octubre de 2026 (positivo: entra; negativo: sale). */
export const EXTRACTO = [
  { id: 'e1', date: '2026-10-02', description: 'Consignación Distribuidora El Caribe', amount: 2450000, reference: 'RC-087' },
  { id: 'e2', date: '2026-10-05', description: 'Transferencia a Enel Colombia', amount: -971750, reference: 'CE-124' },
  { id: 'e3', date: '2026-10-08', description: 'Transferencia recibida Supermercados La 14', amount: 1000000 },
  { id: 'e4', date: '2026-10-12', description: 'Pago nómina', amount: -6400000, reference: 'NOM-10' },
  { id: 'e5', date: '2026-10-15', description: 'Cheque 1045 cobrado', amount: -350000, reference: 'CH-1045' },
  { id: 'e6', date: '2026-10-21', description: 'Consignación Hotel Las Américas', amount: 1500000 },
  { id: 'e7', date: '2026-10-31', description: 'Comisión manejo de cuenta', amount: -18900 },
  { id: 'e8', date: '2026-10-31', description: 'Gravamen 4 x 1000', amount: -30970 },
];

/** Movimientos de la cuenta 111005 en libros, octubre de 2026. */
export const LIBROS = [
  { id: 'l1', date: '2026-10-01', description: 'Recaudo FV-1203', amount: 2450000, reference: 'RC-087' },
  { id: 'l2', date: '2026-10-04', description: 'Pago Enel energía', amount: -971750, reference: 'CE-124' },
  { id: 'l3', date: '2026-10-07', description: 'Abono FV-1210 La 14', amount: 600000 },
  { id: 'l4', date: '2026-10-07', description: 'Abono FV-1211 La 14', amount: 400000 },
  { id: 'l5', date: '2026-10-11', description: 'Nómina primera quincena', amount: -6400000, reference: 'NOM-10' },
  { id: 'l6', date: '2026-10-14', description: 'Cheque 1045 a Ferretería', amount: -350000, reference: 'CH-1045' },
  { id: 'l7', date: '2026-10-20', description: 'Recaudo Hotel Las Américas', amount: 1500000 },
  { id: 'l8', date: '2026-10-29', description: 'Cheque 1046 a Papelería', amount: -280000, reference: 'CH-1046' },
];

/** Movimientos de gasto por cuenta, centro de costo y mes (julio a octubre de 2026). */
export const MOVIMIENTOS_GASTO = (() => {
  const cuentas = ['510506', '512010', '513530', '513535', '513540', '519530'];
  const base: Record<string, number> = { '510506': 8000000, '512010': 2400000, '513530': 610000, '513535': 160000, '513540': 270000, '519530': 140000 };
  const centros = ['100', '200', '300'];
  const meses = ['2026-07', '2026-08', '2026-09', '2026-10'];
  const out: { cuenta: string; centro: string; mes: string; valor: number }[] = [];
  meses.forEach((mes, mi) =>
    cuentas.forEach((cuenta, ci) =>
      centros.forEach((centro, ki) => {
        // Reparto fijo por centro y una pequeña variación mensual, sin azar.
        const share = [0.5, 0.3, 0.2][ki];
        const factor = 1 + (((mi + ci + ki) % 4) - 1.5) * 0.04;
        out.push({ cuenta, centro, mes, valor: Math.round((base[cuenta] * share * factor) / 100) * 100 });
      }),
    ),
  );
  return out;
})();

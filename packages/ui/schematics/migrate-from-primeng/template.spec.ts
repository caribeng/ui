import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { type Compiler, loadCompiler, rewriteTemplate } from './template';

let compiler: Compiler;
before(async () => {
  compiler = await loadCompiler();
});

const migrate = (html: string) => rewriteTemplate(compiler, html, 'test.html');
const text = (html: string) => migrate(html).text;

describe('plantillas: button', () => {
  it('p-button con label, icono y variante', () => {
    assert.equal(
      text(`<p-button label="Guardar" icon="pi pi-check" [outlined]="true" severity="danger" (onClick)="guardar()" />`),
      `<cb-button variant="outlined" severity="danger" (click)="guardar()"><cb-icon name="check" />Guardar</cb-button>`,
    );
  });

  it('pButton en <button> conserva type, (click) y el contenido', () => {
    assert.equal(
      text(`<button pButton type="submit" label="Enviar" [disabled]="form.invalid" (click)="enviar()"></button>`),
      `<cb-button type="submit" [disabled]="form.invalid" (click)="enviar()">Enviar</cb-button>`,
    );
  });

  it('label con expresión, icono a la derecha, tamaño y fluid', () => {
    assert.equal(
      text(`<p-button [label]="titulo()" icon="pi pi-arrow-right" iconPos="right" size="small" fluid />`),
      `<cb-button size="sm" fullWidth>{{ titulo() }}<cb-icon name="arrow-right" /></cb-button>`,
    );
  });

  it('outlined con expresión → ternario; warn → warning', () => {
    assert.equal(
      text(`<p-button label="X" [outlined]="secundario" severity="warn" />`),
      `<cb-button [variant]="(secundario) ? 'outlined' : 'solid'" severity="warning">X</cb-button>`,
    );
  });

  it('styleClass se une a class', () => {
    assert.equal(text(`<p-button class="a" styleClass="b" label="X" />`), `<cb-button class="a b">X</cb-button>`);
  });

  it('atributos sin equivalente: aviso con el original y se eliminan', () => {
    const out = text(`<div>\n  <p-button label="X" [rounded]="true" badge="2" />\n</div>`);
    assert.match(out, /^<div>\n  <!-- TODO\(caribeng\): \[rounded\]="true" — .*-->\n  <!-- TODO\(caribeng\): badge="2" — .*-->\n  <cb-button>X<\/cb-button>\n<\/div>$/);
  });

  it('botón solo con icono sin nombre accesible: aviso', () => {
    const out = text(`<p-button icon="pi pi-times" [text]="true" />`);
    assert.match(out, /TODO\(caribeng\): botón solo con icono/);
    assert.match(out, /<cb-button variant="text"><cb-icon name="x" \/><\/cb-button>/);
  });

  it('pButton en <a> no se convierte: solo aviso', () => {
    assert.match(text(`<a pButton href="/x" label="Ir"></a>`), /^<!-- TODO\(caribeng\): pButton en <a> .*-->\n<a pButton href="\/x" label="Ir"><\/a>$/);
    assert.match(text(`<p>Ver <a pButton href="/x"></a></p>`), /^<p>Ver <!-- TODO\(caribeng\): pButton en <a> .*--> <a pButton/);
  });

  it('conserva los atributos en varias líneas', () => {
    assert.equal(
      text(`<p-button\n    label="Guardar"\n    severity="success"\n    (onClick)="guardar()"\n/>`),
      `<cb-button\n    severity="success"\n    (click)="guardar()"\n>Guardar</cb-button>`,
    );
  });

  it('migra dentro de bloques @if/@for', () => {
    assert.equal(
      text(`@if (ok) {\n  @for (b of botones; track b.id) {\n    <p-button [label]="b.texto" />\n  }\n}`),
      `@if (ok) {\n  @for (b of botones; track b.id) {\n    <cb-button>{{ b.texto }}</cb-button>\n  }\n}`,
    );
  });

  it('registra los iconos usados', () => {
    assert.deepEqual([...migrate(`<p-button icon="pi pi-heart" label="Me gusta" />`).icons], ['heart']);
  });
});

describe('plantillas: inputtext', () => {
  it('pInputText → cb-input auto-cerrado; id → inputId', () => {
    assert.equal(
      text(`<input pInputText id="email" type="email" [(ngModel)]="email" placeholder="Correo">`),
      `<cb-input inputId="email" type="email" [(ngModel)]="email" placeholder="Correo" />`,
    );
  });

  it('pSize y eventos de foco', () => {
    assert.equal(
      text(`<input pInputText formControlName="nombre" pSize="large" (blur)="tocar()" />`),
      `<cb-input formControlName="nombre" size="lg" (focusout)="tocar()" />`,
    );
  });

  it('tipos y atributos nativos no soportados dejan aviso', () => {
    const out = text(`<input pInputText type="date" maxlength="10" />`);
    assert.match(out, /TODO\(caribeng\): type="date"/);
    assert.match(out, /TODO\(caribeng\): maxlength="10"/);
    assert.match(out, /<cb-input \/>$/);
  });

  it('pInputText en <textarea> no se convierte', () => {
    assert.match(text(`<textarea pInputText></textarea>`), /TODO\(caribeng\): pInputText en <textarea>/);
  });
});

describe('plantillas: select', () => {
  it('p-select conserva la API común y traduce el tamaño', () => {
    assert.equal(
      text(`<p-select [options]="ciudades" optionLabel="nombre" optionValue="id" [(ngModel)]="ciudad" placeholder="Elige" [filter]="true" [showClear]="true" size="small" appendTo="body" />`),
      `<cb-select [options]="ciudades" optionLabel="nombre" optionValue="id" [(ngModel)]="ciudad" placeholder="Elige" [filter]="true" [showClear]="true" size="sm" />`,
    );
  });

  it('p-dropdown (PrimeNG < 18) también se migra', () => {
    assert.equal(text(`<p-dropdown [options]="o" formControlName="c"></p-dropdown>`), `<cb-select [options]="o" formControlName="c"></cb-select>`);
  });

  it('(onChange) con $event.value → (valueChange) con $event', () => {
    assert.equal(text(`<p-select [options]="o" (onChange)="cambiar($event.value)" />`), `<cb-select [options]="o" (valueChange)="cambiar($event)" />`);
  });

  it('(onChange) con otro uso de $event deja aviso', () => {
    const out = text(`<p-select [options]="o" (onChange)="cambiar($event)" />`);
    assert.match(out, /TODO\(caribeng\): \(onChange\)="cambiar\(\$event\)" — el evento ahora es \(valueChange\)/);
    assert.match(out, /<cb-select \[options\]="o" \(valueChange\)="cambiar\(\$event\)" \/>/);
  });

  it('plantillas personalizadas dejan aviso', () => {
    const out = text(`<p-select [options]="o">\n  <ng-template #item let-c>{{ c.nombre }}</ng-template>\n</p-select>`);
    assert.match(out, /<cb-select \[options\]="o">\n  <!-- TODO\(caribeng\): cb-select no admite plantillas personalizadas.*-->\n  <ng-template #item/);
  });
});

describe('plantillas: dialog', () => {
  it('p-dialog con style → width y modal eliminado', () => {
    assert.equal(
      text(`<p-dialog header="Editar" [(visible)]="abierto" [modal]="true" [style]="{ width: '25rem' }">Hola</p-dialog>`),
      `<cb-dialog header="Editar" [(visible)]="abierto" width="25rem">Hola</cb-dialog>`,
    );
  });

  it('el pie (#footer, pTemplate, p-footer) pasa a <div cb-dialog-footer>', () => {
    assert.equal(
      text(`<p-dialog [(visible)]="v"><p>Texto</p><ng-template #footer><p-button label="Cerrar" (onClick)="v = false" /></ng-template></p-dialog>`),
      `<cb-dialog [(visible)]="v"><p>Texto</p><div cb-dialog-footer><cb-button (click)="v = false">Cerrar</cb-button></div></cb-dialog>`,
    );
    assert.equal(
      text(`<p-dialog [(visible)]="v"><ng-template pTemplate="footer">x</ng-template></p-dialog>`),
      `<cb-dialog [(visible)]="v"><div cb-dialog-footer>x</div></cb-dialog>`,
    );
    assert.equal(text(`<p-dialog [(visible)]="v"><p-footer>x</p-footer></p-dialog>`), `<cb-dialog [(visible)]="v"><div cb-dialog-footer>x</div></cb-dialog>`);
  });

  it('cabecera personalizada, posición y style complejo dejan aviso', () => {
    const out = text(`<p-dialog [(visible)]="v" position="top" [style]="{ width: '30rem', height: '20rem' }"><ng-template #header>H</ng-template></p-dialog>`);
    assert.match(out, /TODO\(caribeng\): position="top"/);
    assert.match(out, /TODO\(caribeng\): \[style\]=/);
    assert.match(out, /TODO\(caribeng\): cb-dialog solo admite una cabecera de texto/);
  });

  it('[modal]="false" deja aviso', () => {
    assert.match(text(`<p-dialog [(visible)]="v" [modal]="false"></p-dialog>`), /TODO\(caribeng\): \[modal\]="false" — cb-dialog siempre es modal/);
  });
});

describe('plantillas: dialog (contenido)', () => {
  it('#content se desenvuelve en <ng-container>', () => {
    assert.equal(
      text(`<p-dialog [(visible)]="v"><ng-template #content>Hola</ng-template></p-dialog>`),
      `<cb-dialog [(visible)]="v"><ng-container>Hola</ng-container></cb-dialog>`,
    );
  });
});

describe('plantillas: tag', () => {
  it('icono pi → nombre, warn → warning', () => {
    const result = migrate(`<p-tag value="Nuevo" severity="warn" icon="pi pi-bookmark" [rounded]="true" />`);
    assert.equal(result.text, `<cb-tag value="Nuevo" severity="warning" icon="bookmark" [rounded]="true" />`);
    assert.deepEqual([...result.icons], ['bookmark']);
  });

  it('icono dinámico: se conserva con aviso', () => {
    const out = text(`<p-tag [value]="e.nombre" [icon]="e.icono" />`);
    assert.match(out, /TODO\(caribeng\): \[icon\]="e.icono" — icon recibe el nombre de un icono de CaribeNG/);
    assert.match(out, /<cb-tag \[value\]="e.nombre" \[icon\]="e.icono" \/>/);
  });
});

describe('plantillas: toast', () => {
  it('posición y opciones sin equivalente', () => {
    assert.equal(text(`<p-toast position="bottom-center" [baseZIndex]="5000" />`), `<cb-toast position="bottom-center" />`);
    const out = text(`<p-toast key="tc" position="center" />`);
    assert.match(out, /TODO\(caribeng\): key="tc" — cb-toast muestra todos los mensajes/);
    assert.match(out, /TODO\(caribeng\): position="center" — valor sin equivalente/);
  });
});

describe('plantillas: card', () => {
  it('subheader → subtitle; pie y contenido', () => {
    assert.equal(
      text(`<p-card header="Resumen" subheader="Octubre"><p>Texto</p><ng-template #footer><p-button label="Ver" /></ng-template></p-card>`),
      `<cb-card header="Resumen" subtitle="Octubre"><p>Texto</p><div cb-card-footer><cb-button>Ver</cb-button></div></cb-card>`,
    );
  });

  it('cabecera con imagen: aviso', () => {
    assert.match(text(`<p-card><ng-template #header><img src="a.png" /></ng-template></p-card>`), /TODO\(caribeng\): cb-card no tiene zona de cabecera/);
  });
});

describe('plantillas: tooltip', () => {
  it('en cualquier elemento, conserva el tag y su contenido', () => {
    assert.equal(
      text(`<span pTooltip="Ayuda" tooltipPosition="bottom" class="x">?</span>`),
      `<span cbTooltip="Ayuda" cbTooltipPosition="bottom" class="x">?</span>`,
    );
    assert.equal(text(`<input [pTooltip]="msg" [tooltipDisabled]="!msg">`), `<input [cbTooltip]="msg" [cbTooltipDisabled]="!msg">`);
  });

  it('sobre un componente que también se migra', () => {
    assert.equal(
      text(`<p-button label="Guardar" pTooltip="Guarda los cambios" tooltipPosition="left" />`),
      `<cb-button cbTooltip="Guarda los cambios" cbTooltipPosition="left">Guardar</cb-button>`,
    );
  });

  it('opciones sin equivalente: aviso', () => {
    const out = text(`<span pTooltip="x" [showDelay]="500" tooltipEvent="focus">?</span>`);
    assert.match(out, /TODO\(caribeng\): \[showDelay\]="500"/);
    assert.match(out, /TODO\(caribeng\): tooltipEvent="focus"/);
    assert.match(out, /<span cbTooltip="x">\?<\/span>$/);
  });
});

describe('plantillas: checkbox', () => {
  it('binario: binary desaparece', () => {
    assert.equal(
      text(`<p-checkbox [(ngModel)]="acepto" [binary]="true" inputId="acepto" />`),
      `<cb-checkbox [(ngModel)]="acepto" inputId="acepto" />`,
    );
  });

  it('lista con value, tamaño y (onChange) con $event.checked', () => {
    assert.equal(
      text(`<p-checkbox formControlName="gustos" value="cafe" size="small" (onChange)="cambio($event.checked)" />`),
      `<cb-checkbox formControlName="gustos" value="cafe" size="sm" (changed)="cambio($event)" />`,
    );
  });

  it('trueValue sin equivalente: aviso', () => {
    assert.match(text(`<p-checkbox [(ngModel)]="v" trueValue="S" falseValue="N" />`), /TODO\(caribeng\): trueValue="S"/);
  });
});

describe('plantillas: textarea', () => {
  it('pTextarea → cb-textarea; números como binding', () => {
    assert.equal(
      text(`<textarea pTextarea id="nota" rows="5" maxlength="200" [autoResize]="true" [(ngModel)]="nota"></textarea>`),
      `<cb-textarea inputId="nota" [rows]="5" [maxlength]="200" [autoResize]="true" [(ngModel)]="nota" />`,
    );
  });

  it('pInputTextarea (PrimeNG < 18) también', () => {
    assert.equal(text(`<textarea pInputTextarea formControlName="obs"></textarea>`), `<cb-textarea formControlName="obs" />`);
  });
});

describe('plantillas: inputnumber', () => {
  it('moneda, límites y botones', () => {
    assert.equal(
      text(`<p-inputnumber [(ngModel)]="precio" mode="currency" currency="EUR" locale="es-ES" min="0" [max]="limite" [showButtons]="true" buttonLayout="stacked" />`),
      `<cb-input-number [(ngModel)]="precio" mode="currency" currency="EUR" locale="es-ES" [min]="0" [max]="limite" [showButtons]="true" />`,
    );
  });

  it('decimales y eventos', () => {
    assert.equal(
      text(`<p-inputNumber formControlName="peso" [minFractionDigits]="2" maxFractionDigits="3" suffix=" kg" (onKeyDown)="tecla($event)" (onBlur)="salir()" />`),
      `<cb-input-number formControlName="peso" [minFractionDigits]="2" [maxFractionDigits]="3" suffix=" kg" (keydown)="tecla($event)" (focusout)="salir()" />`,
    );
  });

  it('valor no numérico en un input numérico: aviso', () => {
    assert.match(text(`<p-inputnumber min="cero" />`), /TODO\(caribeng\): min="cero" — min es numérico en cb-input-number/);
  });
});

describe('plantillas: multiselect', () => {
  it('API común con Select, filterPlaceHolder y maxSelectedLabels', () => {
    assert.equal(
      text(`<p-multiselect [options]="ciudades" optionLabel="nombre" [(ngModel)]="elegidas" [filter]="true" filterPlaceHolder="Buscar" maxSelectedLabels="2" appendTo="body" (onChange)="cambio($event.value)" />`),
      `<cb-multiselect [options]="ciudades" optionLabel="nombre" [(ngModel)]="elegidas" [filter]="true" filterPlaceholder="Buscar" [maxSelectedLabels]="2" (valueChange)="cambio($event)" />`,
    );
  });

  it('display="chip" y selectionLimit: aviso', () => {
    const out = text(`<p-multiSelect [options]="o" display="chip" [selectionLimit]="3" />`);
    assert.match(out, /TODO\(caribeng\): display="chip"/);
    assert.match(out, /TODO\(caribeng\): \[selectionLimit\]="3"/);
  });
});

describe('plantillas: select (números)', () => {
  it('virtualScrollItemSize estático pasa a binding', () => {
    assert.equal(text(`<p-select [options]="o" [virtualScroll]="true" virtualScrollItemSize="40" />`), `<cb-select [options]="o" [virtualScroll]="true" [virtualScrollItemSize]="40" />`);
  });
});

describe('plantillas: toggleswitch', () => {
  it('p-toggleswitch y p-inputSwitch → cb-toggle', () => {
    assert.equal(
      text(`<p-toggleswitch [(ngModel)]="activo" inputId="activo" (onChange)="guardar($event.checked)" />`),
      `<cb-toggle [(ngModel)]="activo" inputId="activo" (changed)="guardar($event)" />`,
    );
    assert.equal(text(`<p-inputSwitch formControlName="avisos"></p-inputSwitch>`), `<cb-toggle formControlName="avisos"></cb-toggle>`);
  });
});

describe('plantillas: datepicker', () => {
  it('formato, icono y edición como en PrimeNG', () => {
    assert.equal(
      text(`<p-datepicker [(ngModel)]="fecha" dateFormat="dd/mm/yy" [showIcon]="true" appendTo="body" firstDayOfWeek="1" />`),
      `<cb-datepicker [(ngModel)]="fecha" dateFormat="dd/mm/yy" [firstDayOfWeek]="1" editable />`,
    );
  });

  it('readonlyInput: no editable; con expresión, editable negado', () => {
    assert.equal(text(`<p-datepicker [(ngModel)]="f" [readonlyInput]="true" />`), `<cb-datepicker [(ngModel)]="f" />`);
    assert.equal(text(`<p-datepicker [(ngModel)]="f" [readonlyInput]="bloqueado" />`), `<cb-datepicker [(ngModel)]="f" [editable]="!(bloqueado)" />`);
  });

  it('rango, hora y p-calendar (PrimeNG < 18)', () => {
    assert.equal(
      text(`<p-calendar formControlName="viaje" selectionMode="range" [showTime]="true" hourFormat="12" (onSelect)="elegir($event)" />`),
      `<cb-datepicker formControlName="viaje" selectionMode="range" [showTime]="true" hourFormat="12" (valueChange)="elegir($event)" editable />`,
    );
  });

  it('modo multiple e inline: aviso', () => {
    const out = text(`<p-datepicker [(ngModel)]="fechas" selectionMode="multiple" [inline]="true" />`);
    assert.match(out, /TODO\(caribeng\): selectionMode="multiple"/);
    assert.match(out, /TODO\(caribeng\): \[inline\]="true"/);
  });
});

describe('plantillas: radiobutton', () => {
  it('no se convierte: aviso con la forma de agruparlos, sin repetirse en una segunda ejecución', () => {
    const html = `<div>\n  <p-radiobutton name="talla" value="M" [(ngModel)]="talla" inputId="m" />\n  <label for="m">M</label>\n</div>`;
    const once = text(html);
    assert.match(once, /<!-- TODO\(caribeng\): agrupa los radios en <cb-radio-group/);
    assert.match(once, /<p-radiobutton name="talla"/);
    const twice = migrate(once);
    assert.equal(twice.changed, false);
    assert.equal(twice.text, once);
  });
});

describe('plantillas: iconos sueltos', () => {
  it('<i class="pi pi-…"> → <cb-icon>', () => {
    assert.equal(text(`<i class="pi pi-search"></i>`), `<cb-icon name="search" />`);
    assert.equal(text(`<i class="pi pi-spin pi-spinner mr-2" aria-hidden="true"></i>`), `<cb-icon name="loader-circle" spin class="mr-2" aria-hidden="true" />`);
  });

  it('icono sin equivalente: aviso', () => {
    assert.match(text(`<i class="pi pi-no-existe"></i>`), /TODO\(caribeng\): icono de PrimeIcons sin migrar \(pi-no-existe/);
  });

  it('no toca lo que no es de PrimeNG', () => {
    const html = `<div class="pi-card"><button (click)="x()">X</button><cb-button>Y</cb-button></div>`;
    assert.equal(migrate(html).changed, false);
    assert.equal(text(html), html);
  });

  it('respeta CRLF', () => {
    assert.equal(text(`<div>\r\n  <p-button label="X" raised />\r\n</div>`), `<div>\r\n  <!-- TODO(caribeng): raised — cb-button no tiene variante elevada; usa una clase propia. -->\r\n  <cb-button>X</cb-button>\r\n</div>`);
  });

  it('plantilla con errores de sintaxis: no se toca', () => {
    const result = migrate(`<p-button label="x"`);
    assert.equal(result.changed, false);
    assert.ok(result.error);
  });
});

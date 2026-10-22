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

describe('plantillas: confirmdialog y confirmpopup', () => {
  it('se convierten en hosts del servicio', () => {
    assert.equal(text(`<p-confirmdialog />`), `<cb-confirm-dialog service />`);
    assert.equal(text(`<p-confirmpopup />`), `<cb-confirm-popup service />`);
  });

  it('conserva key y los textos por defecto; avisa de iconos y Escape desactivado', () => {
    const out = text(`<p-confirmDialog key="borrar" header="Atención" icon="pi pi-exclamation-triangle" [closeOnEscape]="false" [dismissableMask]="true" />`);
    assert.match(out, /<cb-confirm-dialog key="borrar" header="Atención" service \/>$/);
    assert.match(out, /TODO\(caribeng\): icon="pi pi-exclamation-triangle" — las confirmaciones de CaribeNG no tienen iconos/);
    assert.match(out, /TODO\(caribeng\): \[closeOnEscape\]="false" — cb-confirm-dialog siempre se cancela con Escape/);
  });

  it('plantillas personalizadas: aviso', () => {
    assert.match(text(`<p-confirmdialog><ng-template #message let-m>{{ m.message }}</ng-template></p-confirmdialog>`), /TODO\(caribeng\): las confirmaciones de CaribeNG no admiten plantillas/);
  });
});

describe('plantillas: menús', () => {
  it('p-menu emergente: model → items, onHide → hidden', () => {
    assert.equal(
      text(`<p-menu #menu [model]="acciones" [popup]="true" appendTo="body" (onHide)="cerrado()" />`),
      `<cb-menu #menu [items]="acciones" (hidden)="cerrado()" />`,
    );
  });

  it('p-menu fijo (sin popup): aviso', () => {
    assert.match(text(`<p-menu [model]="acciones" />`), /TODO\(caribeng\): p-menu sin \[popup\]="true" era un menú fijo/);
  });

  it('p-menubar con #start/#end: aviso en las plantillas', () => {
    const out = text(`<p-menubar [model]="items">\n  <ng-template #start><img src="logo.svg" /></ng-template>\n</p-menubar>`);
    assert.match(out, /^<cb-menubar \[items\]="items">\n  <!-- TODO\(caribeng\): cb-menubar no tiene zonas #start\/#end/);
  });

  it('p-breadcrumb: home y model se unen en items', () => {
    assert.equal(
      text(`<p-breadcrumb [home]="inicio" [model]="ruta" (onItemClick)="ir($event.item)" />`),
      `<cb-breadcrumb [items]="[inicio, ...ruta]" (itemClick)="ir($event)" />`,
    );
    assert.equal(text(`<p-breadcrumb [model]="ruta" />`), `<cb-breadcrumb [items]="ruta" />`);
  });

  it('p-panelmenu y p-tieredmenu', () => {
    assert.equal(text(`<p-panelmenu [model]="items" [multiple]="true" />`), `<cb-panelmenu [items]="items" [multiple]="true" />`);
    assert.match(text(`<p-tieredmenu #t [model]="items" [popup]="true" />`), /TODO\(caribeng\): cb-tieredmenu muestra su propio botón de apertura.*-->\n<cb-tieredmenu #t \[items\]="items" \/>/);
  });

  it('p-splitbutton → cb-split-button', () => {
    assert.equal(
      text(`<p-splitbutton label="Guardar" icon="pi pi-check" [model]="mas" severity="success" [outlined]="true" (onClick)="guardar()" />`),
      `<cb-split-button label="Guardar" icon="check" [items]="mas" severity="success" variant="outlined" (primaryClick)="guardar()" />`,
    );
  });

  it('p-contextmenu: no se convierte, aviso para envolver el área', () => {
    const out = text(`<p-contextmenu [target]="tabla" [model]="items" />`);
    assert.match(out, /TODO\(caribeng\): envuelve el área con <cb-contextmenu/);
    assert.match(out, /<p-contextmenu \[target\]="tabla"/);
  });
});

describe('plantillas: tabs', () => {
  const tabs = [
    '<p-tabs value="0">',
    '  <p-tablist>',
    '    <p-tab value="0">Resumen</p-tab>',
    '    <p-tab value="1" [disabled]="!admin">Pedidos ({{ total }})</p-tab>',
    '  </p-tablist>',
    '  <p-tabpanels>',
    '    <p-tabpanel value="0">',
    '      <p>Hola</p>',
    '    </p-tabpanel>',
    '    <p-tabpanel value="1">',
    '      <p-button label="Ver" />',
    '    </p-tabpanel>',
    '  </p-tabpanels>',
    '</p-tabs>',
  ].join('\n');

  it('p-tabs (PrimeNG 18+): empareja pestañas y paneles por value y migra su contenido', () => {
    assert.equal(
      text(tabs),
      [
        '<cb-tabs>',
        '    <cb-tab label="Resumen">',
        '      <p>Hola</p>',
        '    </cb-tab>',
        '    <cb-tab label="Pedidos ({{ total }})" [disabled]="!admin">',
        '      <cb-button>Ver</cb-button>',
        '    </cb-tab>',
        '</cb-tabs>',
      ].join('\n'),
    );
  });

  it('pestaña activa distinta de la primera: aviso', () => {
    assert.match(text(tabs.replace('<p-tabs value="0">', '<p-tabs [(value)]="activa">')), /TODO\(caribeng\): \[\(value\)\]="activa" — cb-tabs no expone la pestaña activa/);
  });

  it('pestañas con @for o cabeceras con iconos: no se toca, aviso con el motivo', () => {
    const conFor = `<p-tabs value="0"><p-tablist>@for (t of tabs; track t.id) {<p-tab [value]="t.id">{{ t.titulo }}</p-tab>}</p-tablist><p-tabpanels></p-tabpanels></p-tabs>`;
    assert.match(text(conFor), /^<!-- TODO\(caribeng\): las pestañas se generan con @for\/@if/);
    assert.match(text(conFor), /<p-tabs value="0">/);
    const conIcono = tabs.replace('>Resumen<', '><i class="pi pi-home"></i> Resumen<');
    assert.match(text(conIcono), /TODO\(caribeng\): una cabecera tiene marcado/);
  });

  it('p-tabView / p-tabPanel (PrimeNG 17)', () => {
    assert.equal(
      text(`<p-tabView><p-tabPanel header="Uno">A</p-tabPanel><p-tabPanel header="Dos" [disabled]="true">B</p-tabPanel></p-tabView>`),
      `<cb-tabs><cb-tab label="Uno">A</cb-tab><cb-tab label="Dos" [disabled]="true">B</cb-tab></cb-tabs>`,
    );
  });
});

describe('plantillas: accordion', () => {
  it('p-accordion-panel (PrimeNG 18+): la cabecera pasa a header y el contenido se desenvuelve', () => {
    assert.equal(
      text(
        [
          '<p-accordion [multiple]="true">',
          '  <p-accordion-panel value="0">',
          '    <p-accordion-header>Envío</p-accordion-header>',
          '    <p-accordion-content>',
          '      <p>Llega en 24 h</p>',
          '    </p-accordion-content>',
          '  </p-accordion-panel>',
          '</p-accordion>',
        ].join('\n'),
      ),
      ['<cb-accordion [multiple]="true">', '  <cb-accordion-panel header="Envío">', '      <p>Llega en 24 h</p>', '  </cb-accordion-panel>', '</cb-accordion>'].join('\n'),
    );
  });

  it('p-accordionTab (PrimeNG 17)', () => {
    assert.equal(
      text(`<p-accordion><p-accordionTab header="Uno">A</p-accordionTab></p-accordion>`),
      `<cb-accordion><cb-accordion-panel header="Uno">A</cb-accordion-panel></cb-accordion>`,
    );
  });

  it('panel abierto al inicio: aviso', () => {
    assert.match(text(`<p-accordion value="0"></p-accordion>`), /TODO\(caribeng\): value="0" — cb-accordion empieza con los paneles cerrados/);
  });
});

describe('plantillas: table', () => {
  const productos = [
    '<p-table #dt [value]="productos" [paginator]="true" rows="5" dataKey="id" [stripedRows]="true" [tableStyle]="{ \'min-width\': \'50rem\' }">',
    '  <ng-template #header>',
    '    <tr>',
    '      <th pSortableColumn="codigo" style="width: 20%">Código <p-sortIcon field="codigo" /></th>',
    '      <th>Nombre <p-columnFilter type="text" field="nombre" matchMode="startsWith" /></th>',
    '      <th>Cliente</th>',
    '      <th pSortableColumn="precio">Precio <p-sortIcon field="precio" /></th>',
    '      <th>Estado</th>',
    '    </tr>',
    '  </ng-template>',
    '  <ng-template #body let-producto>',
    '    <tr>',
    '      <td>{{ producto.codigo }}</td>',
    '      <td>{{ producto.nombre }}</td>',
    '      <td>{{ producto.cliente.nombre }}</td>',
    '      <td>{{ producto.precio | currency: \'EUR\' }}</td>',
    '      <td><p-tag [value]="producto.estado" severity="warn" /></td>',
    '    </tr>',
    '  </ng-template>',
    '  <ng-template #emptymessage>',
    '    <tr><td colspan="5">No hay productos.</td></tr>',
    '  </ng-template>',
    '</p-table>',
  ].join('\n');

  it('columnas estáticas → [columns] y plantillas cbTableCell con el contenido migrado', () => {
    const out = text(productos);
    assert.match(out, /^<!-- TODO\(caribeng\): \[tableStyle\]=.* — ajusta el ancho mínimo con CSS sobre cb-table\. -->\n<cb-table\n  #dt\n  \[value\]="productos"\n  \[paginator\]="true"\n  \[rows\]="5"\n  dataKey="id"\n  \[striped\]="true"\n  emptyMessage="No hay productos\."/);
    assert.match(out, /\{ field: 'codigo', header: 'Código', sortable: true, width: '20%' \},/);
    assert.match(out, /\{ field: 'nombre', header: 'Nombre', filter: true, filterMatchMode: 'startsWith' \},/);
    assert.match(out, /\{ field: 'cliente\.nombre', header: 'Cliente' \},/);
    assert.match(out, /\{ field: 'precio', header: 'Precio', sortable: true \},/);
    assert.match(out, /\{ field: 'estado', header: 'Estado' \}\n/);
    assert.match(out, /<ng-template cbTableCell="precio" let-producto>\{\{ producto\.precio \| currency: 'EUR' \}\}<\/ng-template>/);
    assert.match(out, /<ng-template cbTableCell="estado" let-producto><cb-tag \[value\]="producto\.estado" severity="warning" \/><\/ng-template>/);
    assert.doesNotMatch(out, /cbTableCell="codigo"|cbTableCell="cliente/, 'las celdas {{ fila.campo }} no necesitan plantilla');
    assert.doesNotMatch(out, /p-table|p-sortIcon|p-columnFilter|<tr>/);
  });

  it('selección con checkbox, expansión de filas y cabecera con interpolación', () => {
    const out = text(
      [
        '<p-table [value]="pedidos" [(selection)]="elegidos" dataKey="id" (onRowExpand)="abrir($event.data)">',
        '  <ng-template #header>',
        '    <tr><th><p-tableHeaderCheckbox /></th><th></th><th>{{ "Pedido" }}</th><th>Total ({{ moneda }})</th></tr>',
        '  </ng-template>',
        '  <ng-template #body let-pedido let-expanded="expanded">',
        '    <tr><td><p-tableCheckbox [value]="pedido" /></td><td><button type="button" [pRowToggler]="pedido"></button></td><td>{{ pedido.id }}</td><td>{{ pedido.total }}</td></tr>',
        '  </ng-template>',
        '  <ng-template #rowexpansion let-pedido>',
        '    <tr><td colspan="4"><p-button label="Ver" /></td></tr>',
        '  </ng-template>',
        '</p-table>',
      ].join('\n'),
    );
    assert.match(out, /\[\(selection\)\]="elegidos"/);
    assert.match(out, /selectionMode="multiple"/);
    assert.match(out, /\(rowExpand\)="abrir\(\$event\)"/);
    assert.match(out, /\{ field: 'id', header: \("Pedido"\) \},/);
    assert.match(out, /\{ field: 'total', header: 'Total \(' \+ \(moneda\) \+ '\)' \}\n/);
    assert.match(out, /<ng-template cbTableRowExpansion let-pedido><cb-button>Ver<\/cb-button><\/ng-template>/);
    assert.doesNotMatch(out, /Checkbox|pRowToggler/);
  });

  it('caption con filtro global: se mueve antes de la tabla y filterGlobal pierde el matchMode', () => {
    const out = text(
      [
        '<p-table #dt [value]="filas" [globalFilterFields]="[\'nombre\']">',
        '  <ng-template #caption><input pInputText (input)="dt.filterGlobal($any($event.target).value, \'contains\')" /></ng-template>',
        '  <ng-template #header><tr><th>Nombre</th></tr></ng-template>',
        '  <ng-template #body let-f><tr><td>{{ f.nombre }}</td></tr></ng-template>',
        '</p-table>',
      ].join('\n'),
    );
    assert.match(out, /TODO\(caribeng\): el contenido de #caption de p-table está antes de cb-table/);
    assert.match(out, /<cb-input \(input\)="dt\.filterGlobal\(\$any\(\$event\.target\)\.value\)" \/>\n<cb-table\n  #dt/);
  });

  it('columnas dinámicas, varias filas o plantillas sin equivalente: no se toca, aviso con el motivo', () => {
    const dinamica = `<p-table [value]="filas" [columns]="cols"><ng-template #header let-columns><tr>@for (c of columns; track c.field) {<th>{{ c.header }}</th>}</tr></ng-template><ng-template #body let-f let-columns="columns"><tr>@for (c of columns; track c.field) {<td>{{ f[c.field] }}</td>}</tr></ng-template></p-table>`;
    const out = text(dinamica);
    assert.match(out, /^<!-- TODO\(caribeng\): las celdas se generan con @for\/@if \(columnas dinámicas\)\./);
    assert.match(out, /<p-table \[value\]="filas"/);
    assert.match(text(dinamica.replace('#header', '#groupheader')), /TODO\(caribeng\): p-table usa la plantilla "groupheader"/);
    assert.match(text(productos.replace('let-producto>', 'let-producto let-i="rowIndex">').replace('{{ producto.codigo }}', '{{ i }}')), /TODO\(caribeng\): las celdas usan i, que cbTableCell no ofrece/);
  });

  it('estilos de celda y atributos de fila: aviso, pero la tabla se convierte', () => {
    const out = text(
      `<p-table [value]="f"><ng-template #header><tr><th>A</th></tr></ng-template><ng-template #body let-r><tr [class.rojo]="r.mal"><td class="num">{{ r.a }}</td></tr></ng-template></p-table>`,
    );
    assert.match(out, /TODO\(caribeng\): la celda de "A" tenía class="num"/);
    assert.match(out, /TODO\(caribeng\): la fila tenía \[class\.rojo\]="r\.mal"/);
    assert.match(out, /<cb-table/);
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

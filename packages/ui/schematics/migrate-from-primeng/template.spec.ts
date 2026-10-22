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

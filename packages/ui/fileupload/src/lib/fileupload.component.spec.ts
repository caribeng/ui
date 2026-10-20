import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbFileRejectEvent, CbFileUpload, CbFileUploadEvent } from './fileupload.component';

@Component({
  imports: [CbFileUpload],
  template: `
    <cb-file-upload
      [multiple]="multiple()"
      [accept]="accept()"
      [maxFileSize]="maxFileSize()"
      [disabled]="disabled()"
      (selectFiles)="selected = $event"
      (uploadHandler)="uploaded = $event"
      (rejectFiles)="rejected = $event"
    />
  `,
})
class HostComponent {
  multiple = signal(true);
  accept = signal('');
  maxFileSize = signal<number | null>(null);
  disabled = signal(false);
  selected: CbFileUploadEvent | null = null;
  uploaded: CbFileUploadEvent | null = null;
  rejected: CbFileRejectEvent | null = null;
}

const file = (name: string, size = 4, type = 'text/plain') =>
  new File([new Uint8Array(size)], name, { type, lastModified: 1 });

function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  const cmp = fixture.debugElement.children[0].componentInstance as CbFileUpload;
  const add = (...files: File[]) => {
    cmp.addFiles(files);
    fixture.detectChanges();
  };
  const names = () => Array.from(el.querySelectorAll('.cb-file-upload__name')).map((n) => n.textContent);
  const drop = (files: File[]) => {
    const event = new Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'dataTransfer', { value: { files } });
    el.querySelector('.cb-file-upload__dropzone')!.dispatchEvent(event);
    fixture.detectChanges();
  };
  return { fixture, el, cmp, add, names, drop, host: fixture.componentInstance };
}

describe('CbFileUpload', () => {
  it('agrega y elimina archivos de la lista', () => {
    const { el, add, names, fixture } = setup();
    add(file('reporte.txt'));
    expect(names()).toEqual(['reporte.txt']);

    const remove = el.querySelector<HTMLButtonElement>('.cb-file-upload__remove')!;
    expect(remove.getAttribute('aria-label')).toContain('reporte.txt');
    remove.click();
    fixture.detectChanges();
    expect(el.querySelector('.cb-file-upload__item')).toBeNull();
  });

  it('con multiple acumula archivos e ignora los repetidos', () => {
    const { add, names, host } = setup();
    add(file('a.txt'), file('b.txt'));
    add(file('a.txt'), file('c.txt'));
    expect(names()).toEqual(['a.txt', 'b.txt', 'c.txt']);
    expect(host.selected!.files).toHaveLength(3);
  });

  it('sin multiple se queda solo con el último archivo elegido', () => {
    const { fixture, add, names } = setup();
    fixture.componentInstance.multiple.set(false);
    fixture.detectChanges();
    add(file('a.txt'), file('b.txt'));
    add(file('c.txt'));
    expect(names()).toEqual(['c.txt']);
  });

  it('descarta los archivos que superan maxFileSize y avisa con role="alert"', () => {
    const { fixture, el, add, names, host } = setup();
    fixture.componentInstance.maxFileSize.set(1024);
    fixture.detectChanges();
    add(file('ok.txt', 100), file('grande.txt', 2048));
    expect(names()).toEqual(['ok.txt']);
    expect(host.rejected!.files).toEqual([{ file: expect.any(File), reason: 'size' }]);
    const alert = el.querySelector('[role="alert"]')!;
    expect(alert.textContent).toContain('grande.txt');
    expect(alert.textContent).toContain('1.0 KB');
  });

  it('filtra por accept (extensión, tipo y comodín) también al soltar archivos', () => {
    const { fixture, el, drop, names, host } = setup();
    fixture.componentInstance.accept.set('.pdf, image/*');
    fixture.detectChanges();
    drop([file('doc.pdf', 4, 'application/pdf'), file('foto.png', 4, 'image/png'), file('nota.txt')]);
    expect(names()).toEqual(['doc.pdf', 'foto.png']);
    expect(host.rejected!.files.map((r) => [r.file.name, r.reason])).toEqual([['nota.txt', 'type']]);
    expect(el.querySelector('[role="alert"]')!.textContent).toContain('nota.txt');
  });

  it('muestra el estado de arrastre y lo quita al salir', () => {
    const { fixture, el } = setup();
    const zone = el.querySelector('.cb-file-upload__dropzone')!;
    const host = el.querySelector('cb-file-upload')!;
    zone.dispatchEvent(new Event('dragover', { cancelable: true }));
    fixture.detectChanges();
    expect(host.classList).toContain('cb-is-dragover');
    zone.dispatchEvent(new Event('dragleave', { cancelable: true }));
    fixture.detectChanges();
    expect(host.classList).not.toContain('cb-is-dragover');
  });

  it('emite uploadHandler con los archivos y clear vacía la lista y los avisos', () => {
    const { fixture, el, add, names, host } = setup();
    fixture.componentInstance.maxFileSize.set(10);
    fixture.detectChanges();
    add(file('a.txt'), file('enorme.txt', 50));
    const buttons = () => Array.from(el.querySelectorAll<HTMLButtonElement>('.cb-file-upload__btn'));
    buttons()[1].click();
    expect(host.uploaded!.files.map((f) => f.name)).toEqual(['a.txt']);

    buttons()[2].click();
    fixture.detectChanges();
    expect(names()).toEqual([]);
    expect(el.querySelector('[role="alert"]')).toBeNull();
  });

  it('deshabilitado no acepta archivos soltados', () => {
    const { fixture, el, drop, names } = setup();
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    drop([file('a.txt')]);
    expect(names()).toEqual([]);
    expect(el.querySelector<HTMLButtonElement>('.cb-file-upload__btn')!.disabled).toBe(true);
    expect(el.querySelector<HTMLInputElement>('input[type="file"]')!.disabled).toBe(true);
  });

  it('muestra tamaños en B, KB y MB', () => {
    const { add, el } = setup();
    add(file('b.txt', 500), file('kb.txt', 2048), file('mb.txt', 3 * 1024 * 1024));
    const sizes = Array.from(el.querySelectorAll('.cb-file-upload__size')).map((s) => s.textContent);
    expect(sizes).toEqual(['500 B', '2.0 KB', '3.0 MB']);
  });
});

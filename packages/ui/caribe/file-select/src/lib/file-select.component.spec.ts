import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbFileSelect } from './file-select.component';

@Component({
  imports: [CbFileSelect],
  template: `
    <cb-file-select
      label="Adjunta tu cédula"
      accept=".pdf"
      [multiple]="multiple()"
      [disabled]="disabled()"
      [(files)]="files"
      (filesSelected)="emitted = $event"
    />
  `,
})
class HostComponent {
  multiple = signal(true);
  disabled = signal(false);
  files = signal<File[]>([]);
  emitted: File[] | null = null;
}

function setup() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  const input = () => el.querySelector<HTMLInputElement>('input[type="file"]')!;
  const choose = (files: File[]) => {
    Object.defineProperty(input(), 'files', { value: files, configurable: true });
    input().dispatchEvent(new Event('change'));
    fixture.detectChanges();
  };
  return { fixture, el, input, choose };
}

describe('CbFileSelect', () => {
  it('el input de archivo está dentro de la etiqueta con título y formatos', () => {
    const { el, input } = setup();
    const label = input().closest('label')!;
    expect(label.textContent).toContain('Adjunta tu cédula');
    expect(label.textContent).toContain('.pdf');
    expect(input().accept).toBe('.pdf');
    expect(input().multiple).toBe(true);
    expect(el.querySelector('.cb-file-select__icon')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('al elegir archivos actualiza el modelo, emite filesSelected y anuncia la cantidad', () => {
    const { fixture, el, choose } = setup();
    const count = el.querySelector('.cb-file-select__count')!;
    expect(count.getAttribute('aria-live')).toBe('polite');
    expect(count.textContent!.trim()).toBe('');

    const files = [new File(['a'], 'a.pdf'), new File(['b'], 'b.pdf')];
    choose(files);
    expect(fixture.componentInstance.files()).toEqual(files);
    expect(fixture.componentInstance.emitted).toEqual(files);
    expect(count.textContent!.trim()).toContain('2');
  });

  it('deshabilitado desactiva el input y marca la tarjeta', () => {
    const { fixture, el, input } = setup();
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    expect(input().disabled).toBe(true);
    expect(el.querySelector('.cb-file-select')!.classList).toContain('cb-is-disabled');
  });
});

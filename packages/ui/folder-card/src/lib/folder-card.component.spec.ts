import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CbFolderCard } from './folder-card.component';

describe('CbFolderCard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CbFolderCard] });
  });

  it('muestra nombre, archivos y tamaño', () => {
    const fixture = TestBed.createComponent(CbFolderCard);
    fixture.componentRef.setInput('name', 'Imágenes');
    fixture.componentRef.setInput('files', 345);
    fixture.componentRef.setInput('size', '26.4 GB');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.cb-folder-card__name')!.textContent).toContain('Imágenes');
    expect(el.querySelector('.cb-folder-card__meta')!.textContent).toContain('345');
    expect(el.querySelector('.cb-folder-card__meta')!.textContent).toContain('26.4 GB');
  });

  it('no muestra la etiqueta de archivos sin número y usa filesLabel si se indica', () => {
    const fixture = TestBed.createComponent(CbFolderCard);
    fixture.componentRef.setInput('name', 'Vacía');
    fixture.detectChanges();
    const meta = () => (fixture.nativeElement as HTMLElement).querySelector('.cb-folder-card__meta')!.textContent!.trim();
    expect(meta()).toBe('');

    fixture.componentRef.setInput('files', 3);
    fixture.componentRef.setInput('filesLabel', 'documentos');
    fixture.detectChanges();
    expect(meta()).toBe('3 documentos');
  });
});

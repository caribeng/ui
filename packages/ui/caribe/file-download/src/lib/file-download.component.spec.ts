import { TestBed } from '@angular/core/testing';
import { CbFileDownload } from './file-download.component';

describe('CbFileDownload', () => {
  it('emite el evento download con el nombre del archivo al hacer clic', () => {
    const fixture = TestBed.createComponent(CbFileDownload);
    fixture.componentRef.setInput('fileName', 'Extracto.pdf');
    fixture.detectChanges();

    let downloaded = '';
    fixture.componentInstance.download.subscribe((name) => (downloaded = name));
    fixture.nativeElement.querySelector('button').click();
    expect(downloaded).toBe('Extracto.pdf');
  });

  it('muestra la extensión, el tamaño y describe el botón con el nombre del archivo', () => {
    const fixture = TestBed.createComponent(CbFileDownload);
    fixture.componentRef.setInput('fileName', 'Certificado.pdf');
    fixture.componentRef.setInput('fileSize', '420 KB');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.cb-file-download__icon')!.textContent).toBe('PDF');
    expect(el.querySelector('.cb-file-download__size')!.textContent).toBe('420 KB');
    const name = el.querySelector('.cb-file-download__name')!;
    expect(el.querySelector('button')!.getAttribute('aria-describedby')).toBe(name.id);
  });

  it('con href es un enlace de descarga nativo que también emite download', () => {
    const fixture = TestBed.createComponent(CbFileDownload);
    fixture.componentRef.setInput('fileName', 'Extracto.pdf');
    fixture.componentRef.setInput('href', '/files/extracto.pdf');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const link = el.querySelector<HTMLAnchorElement>('a.cb-file-download__btn')!;
    expect(el.querySelector('button')).toBeNull();
    expect(link.getAttribute('href')).toBe('/files/extracto.pdf');
    expect(link.getAttribute('download')).toBe('Extracto.pdf');
    let downloaded = '';
    fixture.componentInstance.download.subscribe((n) => (downloaded = n));
    link.addEventListener('click', (e) => e.preventDefault());
    link.click();
    expect(downloaded).toBe('Extracto.pdf');
  });

  it('deshabilitado muestra un botón deshabilitado aunque haya href', () => {
    const fixture = TestBed.createComponent(CbFileDownload);
    fixture.componentRef.setInput('href', '/files/x.pdf');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('a')).toBeNull();
    expect(el.querySelector('button')!.disabled).toBe(true);
  });
});

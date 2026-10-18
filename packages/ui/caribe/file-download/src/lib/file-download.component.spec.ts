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
});

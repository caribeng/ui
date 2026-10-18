import { TestBed } from '@angular/core/testing';
import { CbFileDownloadComponent } from './file-download.component';

describe('CbFileDownloadComponent', () => {
  it('emite el evento download con el nombre del archivo al hacer clic', () => {
    const fixture = TestBed.createComponent(CbFileDownloadComponent);
    fixture.componentRef.setInput('fileName', 'Extracto.pdf');
    fixture.detectChanges();

    let downloaded = '';
    fixture.componentInstance.download.subscribe((name) => (downloaded = name));
    fixture.nativeElement.querySelector('button').click();
    expect(downloaded).toBe('Extracto.pdf');
  });
});

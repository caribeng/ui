import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CbDataView } from './dataview.component';
describe('CbDataView',()=>{it('renders records and updates selection',()=>{TestBed.configureTestingModule({imports:[CbDataView]});const f=TestBed.createComponent(CbDataView);f.componentRef.setInput('value',[{id:1,title:'Alpha'}]);f.detectChanges();expect(f.nativeElement.textContent).toContain('Alpha');f.nativeElement.querySelector('button').click();expect(f.componentInstance.selection()?.id).toBe(1);});it('shows empty message',()=>{TestBed.configureTestingModule({imports:[CbDataView]});const f=TestBed.createComponent(CbDataView);f.detectChanges();expect(f.nativeElement.textContent).toContain('Sin resultados');});});

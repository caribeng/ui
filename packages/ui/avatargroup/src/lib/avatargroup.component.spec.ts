import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbAvatar } from '@caribeng/ui/avatar';
import { CbAvatarGroup } from './avatargroup.component';

@Component({
  imports: [CbAvatarGroup, CbAvatar],
  template: `
    <cb-avatar-group>
      <cb-avatar label="OZ" />
      <cb-avatar label="MZ" />
    </cb-avatar-group>
  `,
})
class HostComponent {}

describe('CbAvatarGroup', () => {
  it('renderiza role="group" y proyecta avatares hijos', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const group = fixture.nativeElement.querySelector('cb-avatar-group') as HTMLElement;
    expect(group.getAttribute('role')).toBe('group');
    expect(group.querySelectorAll('cb-avatar').length).toBe(2);
  });

  it('acepta un nombre accesible para el grupo', () => {
    const fixture = TestBed.createComponent(CbAvatarGroup);
    fixture.componentRef.setInput('ariaLabel', 'Participantes');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).getAttribute('aria-label')).toBe('Participantes');
  });
});

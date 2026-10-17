import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CbAvatarComponent } from '@caribeng/ui/avatar';
import { CbAvatarGroupComponent } from './avatargroup.component';

@Component({
  imports: [CbAvatarGroupComponent, CbAvatarComponent],
  template: `
    <cb-avatar-group>
      <cb-avatar label="OZ" />
      <cb-avatar label="MZ" />
    </cb-avatar-group>
  `,
})
class HostComponent {}

describe('CbAvatarGroupComponent', () => {
  it('renderiza role="group" y proyecta avatares hijos', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const group = fixture.nativeElement.querySelector('cb-avatar-group') as HTMLElement;
    expect(group.getAttribute('role')).toBe('group');
    expect(group.querySelectorAll('cb-avatar').length).toBe(2);
  });
});

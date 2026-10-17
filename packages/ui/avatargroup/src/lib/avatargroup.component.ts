import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';

/**
 * AvatarGroup de CaribeNG: agrupa varios `<cb-avatar>` con superposición visual.
 */
@Component({
  selector: 'cb-avatar-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'cb-avatar-group',
    role: 'group',
  },
  template: `<ng-content />`,
  styleUrl: './avatargroup.component.css',
})
export class CbAvatarGroupComponent {}

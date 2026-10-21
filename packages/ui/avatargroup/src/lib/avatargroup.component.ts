import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
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
    '[attr.aria-label]': 'ariaLabel() || null',
  },
  template: `<ng-content />`,
  styleUrl: './avatargroup.component.css',
})
export class CbAvatarGroup {
  /** Nombre accesible del grupo (p. ej. "Participantes"). */
  readonly ariaLabel = input<string | undefined>(undefined);
}

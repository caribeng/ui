import { SEVERITY_VALUES, drop, iconName, renderAttr, styleClass, unsupported, values } from './rules';
import type { AttrRule, ComponentMapping } from './types';

/**
 * `<p-avatar label="AP" icon="pi pi-user" shape="circle" size="large" />`
 * → `<cb-avatar label="AP" icon="user" shape="circle" size="lg" />`
 *
 * `<p-avatargroup><p-avatar … /></p-avatargroup>`
 * → `<cb-avatar-group><cb-avatar … /></cb-avatar-group>`
 */

const SIZE_AVATAR: Readonly<Record<string, string>> = {
  normal: 'md',
  large: 'lg',
  xlarge: 'xl',
};

const avatarRules: Record<string, AttrRule> = {
  icon: iconName(),
  size: values('size', SIZE_AVATAR),
  shape: values('shape', { circle: 'circle', square: 'square' }),
  severity: values('severity', SEVERITY_VALUES),
  styleClass: styleClass(),
  style: unsupported('aplica estilos al host de cb-avatar directamente.'),
};

export const avatar: ComponentMapping = {
  name: 'avatar',
  entry: '@caribeng/ui/avatar',
  symbol: 'CbAvatar',
  modules: {
    'primeng/avatar': {
      AvatarModule: 'CbAvatar',
      Avatar: 'CbAvatar',
      AvatarGroupModule: { name: 'CbAvatarGroup', entry: '@caribeng/ui/avatargroup' },
      AvatarGroup: { name: 'CbAvatarGroup', entry: '@caribeng/ui/avatargroup' },
    },
    'primeng/avatargroup': {
      AvatarGroupModule: { name: 'CbAvatarGroup', entry: '@caribeng/ui/avatargroup' },
      AvatarGroup: { name: 'CbAvatarGroup', entry: '@caribeng/ui/avatargroup' },
    },
  },
  elements: [
    {
      tag: 'p-avatar',
      to: 'cb-avatar',
      selfClosing: true,
      rules: avatarRules,
      same: ['label', 'image', 'ariaLabel'],
    },
    {
      tag: 'p-avatargroup',
      to: 'cb-avatar-group',
      symbol: 'CbAvatarGroup',
      entry: '@caribeng/ui/avatargroup',
      rules: { styleClass: styleClass() },
      same: ['ariaLabel'],
    },
  ],
};

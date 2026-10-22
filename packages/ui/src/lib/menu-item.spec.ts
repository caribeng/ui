import { describe, expect, it, vi } from 'vitest';
import { cbRunCommand, cbVisibleItems } from './menu-item';

describe('cbVisibleItems', () => {
  it('quita los items con visible: false, también en submenús', () => {
    const items = [
      { label: 'A' },
      { label: 'Oculto', visible: false },
      { label: 'B', items: [{ label: 'B1' }, { label: 'B2', visible: false }] },
    ];
    expect(cbVisibleItems(items)).toEqual([{ label: 'A' }, { label: 'B', items: [{ label: 'B1' }] }]);
  });

  it('devuelve los mismos objetos si no cambia nada (la selección emite el original)', () => {
    const items = [{ label: 'A' }, { label: 'B', items: [{ label: 'B1' }] }];
    const result = cbVisibleItems(items);
    expect(result[0]).toBe(items[0]);
    expect(result[1]).toBe(items[1]);
  });

  it('filtra grupos y enlaces de MegaMenu', () => {
    const items = [
      {
        label: 'Productos',
        groups: [
          { label: 'Ropa', items: [{ label: 'Camisas' }, { label: 'Sombreros', visible: false }] },
          { label: 'Oculto', visible: false, items: [] },
        ],
      },
    ];
    expect(cbVisibleItems(items)).toEqual([{ label: 'Productos', groups: [{ label: 'Ropa', items: [{ label: 'Camisas' }] }] }]);
  });
});

describe('cbRunCommand', () => {
  it('llama a command con el item y el evento', () => {
    const command = vi.fn();
    const item = { label: 'Nuevo', command };
    const event = new MouseEvent('click');
    cbRunCommand(item, event);
    expect(command).toHaveBeenCalledWith({ item, originalEvent: event });
  });

  it('no falla si el item no tiene command', () => {
    expect(() => cbRunCommand({ label: 'Nada' })).not.toThrow();
  });
});

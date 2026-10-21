import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { injectCbTranslation } from '@caribeng/ui';

export interface CbTerminalEntry {
  command: string;
  response?: string;
}

/**
 * Terminal de CaribeNG: consola interactiva basada en señales con historial de comandos.
 */
@Component({
  selector: 'cb-terminal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-terminal' },
  template: `
    @if (welcomeMessage()) {
      <div class="cb-terminal__welcome">{{ welcomeMessage() }}</div>
    }
    <div class="cb-terminal__history" role="log" aria-live="polite">
      @for (entry of entries(); track $index) {
        <div class="cb-terminal__entry">
          <div class="cb-terminal__line">
            <span class="cb-terminal__prompt">{{ prompt() }}</span>
            <span class="cb-terminal__cmd">{{ entry.command }}</span>
          </div>
          @if (entry.response) {
            <div class="cb-terminal__response">{{ entry.response }}</div>
          }
        </div>
      }
    </div>
    <div class="cb-terminal__input-row">
      <span class="cb-terminal__prompt">{{ prompt() }}</span>
      <input
        #commandInput
        type="text"
        class="cb-terminal__input"
        [value]="currentCommand()"
        [attr.aria-label]="prompt() || t().command"
        (input)="onInput($event)"
        (keydown.enter)="submitCommand()"
        (keydown.arrowup)="recall($event, -1)"
        (keydown.arrowdown)="recall($event, 1)"
      />
    </div>
  `,
  styleUrl: './terminal.component.css',
})
export class CbTerminal {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  readonly welcomeMessage = input<string>('');
  readonly prompt = input<string>('caribeng $');

  readonly commandEntered = output<string>();

  readonly entries = signal<CbTerminalEntry[]>([]);
  readonly currentCommand = signal<string>('');

  /** Posición en el historial al recorrerlo con flechas (`null` = escribiendo uno nuevo). */
  private historyIndex: number | null = null;
  private readonly commandInput = viewChild<ElementRef<HTMLInputElement>>('commandInput');

  /** Fija el comando actual también en el DOM (el binding no detecta '' → '' si no hubo render entre medias). */
  private setCommand(value: string): void {
    this.currentCommand.set(value);
    const input = this.commandInput()?.nativeElement;
    if (input) input.value = value;
  }

  protected onInput(event: Event): void {
    this.currentCommand.set((event.target as HTMLInputElement).value);
  }

  submitCommand(): void {
    const cmd = this.currentCommand().trim();
    if (!cmd) return;
    if (cmd === 'clear') {
      this.entries.set([]);
      this.setCommand('');
      return;
    }
    this.entries.update((list) => [...list, { command: cmd }]);
    this.setCommand('');
    this.historyIndex = null;
    this.commandEntered.emit(cmd);
  }

  /** Flecha arriba / abajo recorren los comandos anteriores. */
  protected recall(event: Event, step: -1 | 1): void {
    const commands = this.entries().map((e) => e.command);
    if (!commands.length) return;
    event.preventDefault();
    const next = (this.historyIndex ?? commands.length) + step;
    if (next >= commands.length) {
      this.historyIndex = null;
      this.setCommand('');
      return;
    }
    this.historyIndex = Math.max(0, next);
    this.setCommand(commands[this.historyIndex]);
  }

  sendResponse(response: string): void {
    this.entries.update((list) => {
      if (list.length === 0) return list;
      const copy = [...list];
      copy[copy.length - 1] = { ...copy[copy.length - 1], response };
      return copy;
    });
  }
}

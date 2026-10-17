import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
  signal,
} from '@angular/core';

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
    <div class="cb-terminal__history">
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
        type="text"
        class="cb-terminal__input"
        [value]="currentCommand()"
        [attr.aria-label]="prompt() || 'Comando'"
        (input)="onInput($event)"
        (keydown.enter)="submitCommand()"
      />
    </div>
  `,
  styleUrl: './terminal.component.css',
})
export class CbTerminalComponent {
  readonly welcomeMessage = input<string>('');
  readonly prompt = input<string>('caribeng $');

  readonly commandEntered = output<string>();

  readonly entries = signal<CbTerminalEntry[]>([]);
  readonly currentCommand = signal<string>('');

  protected onInput(event: Event): void {
    this.currentCommand.set((event.target as HTMLInputElement).value);
  }

  submitCommand(): void {
    const cmd = this.currentCommand().trim();
    if (!cmd) return;
    if (cmd === 'clear') {
      this.entries.set([]);
      this.currentCommand.set('');
      return;
    }
    this.entries.update((list) => [...list, { command: cmd }]);
    this.currentCommand.set('');
    this.commandEntered.emit(cmd);
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

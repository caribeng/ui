import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { CbTerminal } from '@caribeng/ui/terminal';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

@Component({
  selector: 'doc-terminal-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocA11yComponent, DocPlaygroundComponent, CbTerminal, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header eyebrow="Varios" title="Terminal" lead="Emulador de consola interactivo con historial de comandos." />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>
    <doc-section id="basic" title="Interactivo" description="Escribe 'help', 'date' o 'clear' y pulsa Enter." [code]="basicCode">
      <cb-terminal
        welcomeMessage="CaribeNG CLI — Escribe 'help' para ver comandos."
        prompt="caribeng $"
        (commandEntered)="handleCmd($event)"
        style="width: 100%"
      />
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
})
export class TerminalDocComponent {
  protected readonly docApi = DOC_API['cb-terminal'];
  protected readonly a11y = DOC_A11Y['cb-terminal'];

  protected readonly term = viewChild.required(CbTerminal);

  constructor() {
    inject(TocService).reset();
  }

  protected handleCmd(cmd: string): void {
    const resp =
      cmd === 'help'
        ? 'Comandos disponibles: help, date, clear'
        : cmd === 'date'
          ? new Date().toISOString()
          : `Comando desconocido: ${cmd}`;
    this.term().sendResponse(resp);
  }

  protected readonly importCode = `import { CbTerminal } from '@caribeng/ui/terminal';`;
  protected readonly basicCode = `<cb-terminal welcomeMessage="CaribeNG CLI" (commandEntered)="handleCmd($event)" />`;
}

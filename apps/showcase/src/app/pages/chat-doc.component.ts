import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { CbChatInput, CbChatMessage, CbChatMessages, type CbChatRole, type CbChatSendEvent, type CbChatStatus } from '@caribeng/ui/chat';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { DocA11yComponent } from '../components/doc-a11y.component';
import { DOC_A11Y } from '../components/doc-a11y-registry';
import { DocSectionComponent } from '../shared/doc-section.component';
import { CodeBlockComponent } from '../shared/code-block.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';

interface Msg {
  id: number;
  role: CbChatRole;
  text: string;
  time: string;
  status?: CbChatStatus;
  streaming?: boolean;
}

/** Respuestas de ejemplo (markdown) que el asistente simulado "escribe" palabra a palabra. */
const REPLIES: Record<string, string> = {
  saldo:
    'Tu **cuenta de ahorros** termina en `4829` y tiene un saldo disponible de **$ 4.250.000**.\n\n' +
    'Movimientos de esta semana:\n\n| Fecha | Concepto | Valor |\n|:--|:--|--:|\n| 20 oct | Nómina | $ 3.200.000 |\n| 21 oct | Supermercado | -$ 185.400 |\n| 22 oct | Transferencia a Ana | -$ 120.000 |',
  transferir:
    'Para hacer una transferencia:\n\n1. Entra en **Transferir dinero**.\n2. Elige la cuenta de origen y el destinatario.\n3. Escribe el valor y confirma con tu clave.\n\n> Las transferencias a otros bancos pueden tardar hasta 1 día hábil.',
  codigo:
    'Así puedes pintar este chat en tu app:\n\n```html\n<cb-chat-messages [busy]="generando()">\n  @for (m of mensajes(); track m.id) {\n    <cb-chat-message [role]="m.role" [text]="m.text" />\n  }\n</cb-chat-messages>\n<cb-chat-input (send)="enviar($event)" />\n```\n\nEl texto admite **markdown seguro**: el HTML que llegue se muestra como texto.',
};

function pickReply(text: string): string {
  const q = text.toLowerCase();
  if (q.includes('saldo') || q.includes('cuenta')) return REPLIES['saldo'];
  if (q.includes('transfer')) return REPLIES['transferir'];
  if (q.includes('código') || q.includes('codigo') || q.includes('angular')) return REPLIES['codigo'];
  return `Recibí tu mensaje: «${text.replace(/[*_`]/g, '')}».\n\nPrueba con **"¿Cuál es mi saldo?"**, **"¿Cómo transfiero?"** o **"Muéstrame el código"**.`;
}

@Component({
  selector: 'doc-chat-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CbChatMessages, CbChatMessage, CbChatInput, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Messages"
      title="Chat (IA)"
      lead="Kit para interfaces de chat y asistentes de IA: mensajes con markdown seguro y streaming, lista que sigue la conversación y campo de prompt con adjuntos, sugerencias y Detener."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="assistant"
      title="Asistente completo"
      description="cb-chat-messages + cb-chat-message + cb-chat-input. La respuesta llega palabra a palabra (streaming): pulsa Detener para cortarla. Escribe la palabra error para ver un mensaje fallido con Reintentar."
      [code]="assistantCode"
      [codeTs]="assistantTs"
    >
      <div class="chat-demo">
        <cb-chat-messages class="chat-demo__messages" [busy]="generating()" [typing]="thinking()">
          @for (m of messages(); track m.id) {
            <cb-chat-message
              [role]="m.role"
              [text]="m.text"
              [time]="m.time"
              [status]="m.status"
              [streaming]="!!m.streaming"
              [copyable]="m.role === 'assistant'"
              (retry)="retry(m)"
            />
          }
        </cb-chat-messages>
        <cb-chat-input
          class="chat-demo__input"
          [streaming]="generating() || thinking()"
          [suggestions]="suggestions"
          attachments
          accept="image/*,.pdf"
          (send)="send($event)"
          (stop)="stop()"
        />
      </div>
    </doc-section>

    <doc-section
      id="markdown"
      title="Markdown seguro"
      description="text se interpreta como markdown: negrita, cursiva, código, enlaces, listas (también de tareas), citas, tablas y bloques de código con lenguaje. Todo el HTML de entrada se escapa y solo se enlazan URLs http(s), mailto o relativas. Con markdown=&quot;false&quot; se muestra tal cual."
      [code]="markdownCode"
    >
      <div class="chat-stack">
        <cb-chat-message role="assistant" [text]="markdownSample" copyable />
        <cb-chat-message role="user" author="Laura Gómez" showAuthor time="10:42" text="Gracias, ¿y esto? <script>alert('hola')</script>" status="sent" />
        <cb-chat-message role="system" text="La conversación se archivará en 30 días." />
      </div>
    </doc-section>

    <doc-section
      id="parts"
      title="cb-chat-input y cb-chat-messages"
      description="Entradas y eventos de las otras dos piezas del kit. El playground de abajo es el de cb-chat-message."
    >
      @for (part of parts; track part.name) {
        <h3 class="chat-api-title"><code>&lt;{{ part.name }}&gt;</code></h3>
        <div class="chat-api-wrap">
          <table class="chat-api">
            <thead><tr><th>Nombre</th><th>Tipo</th><th>Por defecto</th><th>Descripción</th></tr></thead>
            <tbody>
              @for (row of part.rows; track row[0]) {
                <tr><td><code>{{ row[0] }}</code></td><td><code>{{ row[1] }}</code></td><td><code>{{ row[2] }}</code></td><td>{{ row[3] }}</td></tr>
              }
            </tbody>
          </table>
        </div>
      }
    </doc-section>

    <doc-a11y [data]="a11y" />

    <doc-playground [api]="docApi" />
  `,
  styles: [
    `
      .chat-demo {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        width: 100%;
        height: 32rem;
        padding: 0.75rem;
        border: 1px solid var(--cb-color-border);
        border-radius: var(--cb-radius-lg);
        background: var(--cb-color-surface-raised);
      }
      .chat-demo__messages {
        flex: 1;
      }
      .chat-api-title {
        margin: 1rem 0 0.5rem;
        font-size: 1rem;
      }
      .chat-api-wrap {
        width: 100%;
        overflow-x: auto;
      }
      .chat-api {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.85rem;
      }
      .chat-api th,
      .chat-api td {
        padding: 0.4rem 0.6rem;
        border-bottom: 1px solid var(--cb-color-border);
        text-align: left;
        vertical-align: top;
      }
      .chat-api th {
        color: var(--cb-color-text-muted);
        font-weight: 600;
      }
      .chat-stack {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
      }
    `,
  ],
})
export class ChatDocComponent {
  protected readonly docApi = DOC_API['cb-chat-message'];
  protected readonly a11y = DOC_A11Y['cb-chat'];
  private readonly destroyRef = inject(DestroyRef);

  protected readonly parts: { name: string; rows: [string, string, string, string][] }[] = [
    {
      name: 'cb-chat-input',
      rows: [
        ['value', 'string (model)', "''", 'Texto escrito.'],
        ['files', 'readonly File[] (model)', '[]', 'Archivos adjuntos.'],
        ['streaming', 'boolean', 'false', 'Se genera una respuesta: muestra Detener y no deja enviar.'],
        ['attachments', 'boolean', 'false', 'Permite adjuntar (botón, pegar o arrastrar).'],
        ['accept', 'string', "''", 'Tipos aceptados (image/*,.pdf).'],
        ['multiple', 'boolean', 'true', 'Varios archivos.'],
        ['suggestions', 'readonly string[]', '[]', 'Sugerencias con el campo vacío; al pulsar se envían.'],
        ['maxLength', 'number', '0', 'Máximo de caracteres, con contador.'],
        ['maxRows', 'number', '8', 'Filas máximas antes de hacer scroll.'],
        ['submitOnEnter', 'boolean', 'true', 'Enter envía; con false, Ctrl/⌘ + Enter.'],
        ['clearOnSend', 'boolean', 'true', 'Vacía el campo y los adjuntos al enviar.'],
        ['placeholder / ariaLabel', 'string', 'del idioma', 'Texto de ayuda y nombre del campo.'],
        ['disabled', 'boolean', 'false', 'Deshabilita el campo.'],
        ['(send)', 'CbChatSendEvent', '', 'Mensaje enviado ({ text, files }).'],
        ['(stop)', 'void', '', 'Se pidió detener la respuesta.'],
      ],
    },
    {
      name: 'cb-chat-messages',
      rows: [
        ['busy', 'boolean', 'false', 'Una respuesta se genera: aria-busy y "Respuesta lista" al terminar.'],
        ['typing', 'boolean', 'false', 'Muestra el indicador Escribiendo…'],
        ['typingLabel', 'string', 'del idioma', 'Texto del indicador.'],
        ['ariaLabel', 'string', 'del idioma', 'Nombre del log ("Conversación").'],
        ['scrollToBottom()', 'método', '', 'Lleva la vista al último mensaje.'],
      ],
    },
  ];

  protected readonly suggestions = ['¿Cuál es mi saldo?', '¿Cómo transfiero?', 'Muéstrame el código'];
  protected readonly messages = signal<Msg[]>([
    { id: 1, role: 'assistant', text: 'Hola, soy el asistente de **Caribe Bank**. ¿En qué te ayudo?', time: this.now() },
  ]);
  protected readonly thinking = signal(false);
  protected readonly generating = signal(false);
  private nextId = 2;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    inject(TocService).reset();
    this.destroyRef.onDestroy(() => this.clearTimer());
  }

  protected send(event: CbChatSendEvent): void {
    const files = event.files.length ? `\n\n📎 ${event.files.map((f) => f.name).join(', ')}` : '';
    const failed = /\berror\b/i.test(event.text);
    const msg: Msg = { id: this.nextId++, role: 'user', text: event.text + files, time: this.now(), status: failed ? 'error' : 'sent' };
    this.messages.update((list) => [...list, msg]);
    if (!failed) this.reply(event.text);
  }

  protected retry(msg: Msg): void {
    this.messages.update((list) => list.map((m) => (m.id === msg.id ? { ...m, status: 'sent' as const } : m)));
    this.reply(msg.text.replace(/\berror\b/gi, '').trim() || 'Hola');
  }

  protected stop(): void {
    this.clearTimer();
    this.thinking.set(false);
    this.generating.set(false);
    this.messages.update((list) => list.map((m) => (m.streaming ? { ...m, streaming: false, text: m.text + ' …' } : m)));
  }

  /** Simula una respuesta: "pensando" y luego el texto palabra a palabra. */
  private reply(question: string): void {
    this.clearTimer();
    this.thinking.set(true);
    const full = pickReply(question);
    this.timer = setTimeout(() => {
      this.thinking.set(false);
      this.generating.set(true);
      const id = this.nextId++;
      this.messages.update((list) => [...list, { id, role: 'assistant', text: '', time: this.now(), streaming: true }]);
      const words = full.split(/(?<=\s)/);
      let i = 0;
      const tick = () => {
        i = Math.min(words.length, i + 2);
        const text = words.slice(0, i).join('');
        const done = i >= words.length;
        this.messages.update((list) => list.map((m) => (m.id === id ? { ...m, text, streaming: !done } : m)));
        if (done) {
          this.generating.set(false);
          this.timer = null;
        } else {
          this.timer = setTimeout(tick, 45);
        }
      };
      tick();
    }, 700);
  }

  private clearTimer(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  private now(): string {
    return new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  }

  protected readonly markdownSample =
    '### Resumen de tu tarjeta\n\nTienes **2 pagos pendientes** y un cupo disponible de *$ 3.800.000*.\n\n' +
    '- [x] Pago mínimo de octubre\n- [ ] Pago total antes del **5 de noviembre**\n\n' +
    'Consulta los detalles en [tu extracto](/extractos) o en https://caribeng.dev.\n\n```ts\nconst cupo = 3_800_000;\n```';

  protected readonly importCode = `import { CbChatMessages, CbChatMessage, CbChatInput, type CbChatSendEvent } from '@caribeng/ui/chat';`;
  protected readonly assistantCode = `<cb-chat-messages [busy]="generando()" [typing]="pensando()" style="height: 30rem">
  @for (m of mensajes(); track m.id) {
    <cb-chat-message [role]="m.role" [text]="m.text" [time]="m.hora"
      [status]="m.estado" [streaming]="m.streaming" copyable (retry)="reintentar(m)" />
  }
</cb-chat-messages>

<cb-chat-input
  [streaming]="generando()"
  [suggestions]="['¿Cuál es mi saldo?', '¿Cómo transfiero?']"
  attachments accept="image/*,.pdf"
  (send)="enviar($event)"
  (stop)="detener()" />`;
  protected readonly assistantTs = `enviar({ text, files }: CbChatSendEvent) {
  this.mensajes.update((l) => [...l, { id: crypto.randomUUID(), role: 'user', text }]);
  const id = crypto.randomUUID();
  this.mensajes.update((l) => [...l, { id, role: 'assistant', text: '', streaming: true }]);
  this.generando.set(true);

  // Cada fragmento que llega (SSE, fetch con stream, WebSocket…) se añade al texto:
  this.ia.stream(text, files).subscribe({
    next: (chunk) => this.mensajes.update((l) => l.map((m) => (m.id === id ? { ...m, text: m.text + chunk } : m))),
    complete: () => {
      this.mensajes.update((l) => l.map((m) => (m.id === id ? { ...m, streaming: false } : m)));
      this.generando.set(false);
    },
  });
}`;
  protected readonly markdownCode = `<cb-chat-message role="assistant" [text]="respuestaMarkdown" copyable />
<cb-chat-message role="user" author="Laura Gómez" showAuthor time="10:42" [text]="pregunta" status="sent" />
<cb-chat-message role="system" text="La conversación se archivará en 30 días." />`;
}

import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import {
  type CbChatAttachment,
  type CbChatFeedback,
  CbChatInput,
  CbChatMessage,
  CbChatMessages,
  CbChatReasoning,
  type CbChatRole,
  type CbChatSendEvent,
  type CbChatStatus,
  CbChatTool,
  type CbChatToolStatus,
} from '@caribeng/ui/chat';
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
  attachments?: CbChatAttachment[];
  reasoning?: { text: string; streaming: boolean; seconds?: number };
  tool?: { name: string; status: CbChatToolStatus; input: unknown; output?: unknown };
  feedback?: CbChatFeedback;
  question?: string;
}

/** Respuestas de ejemplo (markdown) que el asistente simulado "escribe" palabra a palabra. */
const REPLIES: Record<string, string> = {
  saldo:
    'Tu **cuenta de ahorros** termina en `4829` y tiene un saldo disponible de **$ 4.250.000**.\n\n' +
    'Movimientos de esta semana:\n\n| Fecha | Concepto | Valor |\n|:--|:--|--:|\n| 20 oct | Nómina | $ 3.200.000 |\n| 21 oct | Supermercado | -$ 185.400 |\n| 22 oct | Transferencia a Ana | -$ 120.000 |',
  transferir:
    'Para hacer una transferencia:\n\n1. Entra en **Transferir dinero**.\n2. Elige la cuenta de origen y el destinatario.\n3. Escribe el valor y confirma con tu clave.\n\n> Las transferencias a otros bancos pueden tardar hasta 1 día hábil.',
  codigo:
    'Así puedes pintar este chat en tu app:\n\n```html\n<cb-chat-messages [busy]="generando()">\n  @for (m of mensajes(); track m.id) {\n    <cb-chat-message [role]="m.role" [text]="m.text" />\n  }\n</cb-chat-messages>\n<cb-chat-input (send)="enviar($event)" />\n```\n\nY la respuesta en streaming:\n\n```ts\nthis.ia.stream(texto).subscribe((trozo) => {\n  this.respuesta.update((t) => t + trozo);\n});\n```',
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
  imports: [CbChatMessages, CbChatMessage, CbChatInput, CbChatReasoning, CbChatTool, DocA11yComponent, DocPlaygroundComponent, DocSectionComponent, CodeBlockComponent, DocPageHeaderComponent],
  template: `
    <doc-page-header
      eyebrow="Messages"
      title="Chat (IA)"
      lead="Kit para interfaces de chat y asistentes de IA: mensajes con markdown seguro y streaming, razonamiento y llamadas a herramientas, adjuntos, valoración y un campo de prompt con sugerencias y Detener."
    />

    <doc-section id="import" title="Importación">
      <doc-code-block [code]="importCode" lang="typescript" />
    </doc-section>

    <doc-section
      id="assistant"
      title="Asistente completo"
      description="Pregunta por tu saldo: el asistente razona (cb-chat-reasoning), consulta una herramienta (cb-chat-tool) y responde palabra a palabra con una tabla. Pulsa Detener para cortar, adjunta una imagen para verla en miniatura, valora con 👍/👎 o regenera. Escribe error para ver un mensaje fallido."
      [code]="assistantCode"
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
              [attachments]="m.attachments ?? []"
              [copyable]="m.role === 'assistant'"
              [showFeedback]="m.role === 'assistant' && m.id > 1"
              [regenerable]="m.role === 'assistant' && !!m.question"
              [feedback]="m.feedback ?? null"
              (feedbackChange)="setFeedback(m, $event)"
              (retry)="retry(m)"
              (regenerate)="regenerate(m)"
            >
              @if (m.reasoning; as r) {
                <cb-chat-reasoning [text]="r.text" [streaming]="r.streaming" [duration]="r.seconds" />
              }
              @if (m.tool; as t) {
                <cb-chat-tool [name]="t.name" [status]="t.status" [input]="t.input" [output]="t.output" />
              }
            </cb-chat-message>
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
      description="text se interpreta como markdown: negrita, cursiva, código, enlaces, listas (también de tareas), citas y tablas; los bloques de código se pintan con cb-code-block (resaltado y copiar). Todo el HTML de entrada se escapa y solo se enlazan URLs http(s), mailto o relativas."
      [code]="markdownCode"
    >
      <div class="chat-stack">
        <cb-chat-message role="assistant" [text]="markdownSample" copyable />
        <cb-chat-message role="user" author="Laura Gómez" showAuthor time="10:42" text="Gracias, ¿y esto? <script>alert('hola')</script>" status="sent" />
        <cb-chat-message role="system" text="La conversación se archivará en 30 días." />
      </div>
    </doc-section>

    <doc-section
      id="agent"
      title="Razonamiento y herramientas"
      description="cb-chat-reasoning se abre mientras llega y se pliega al terminar con la duración. cb-chat-tool muestra el estado de una llamada (Usando…, Usó…, Falló…) y, al desplegar, su entrada y resultado como JSON."
      [code]="agentCode"
    >
      <div class="chat-stack">
        <cb-chat-reasoning text="El usuario pide su saldo. Consulto la cuenta **4829** y los movimientos de la semana." [duration]="3" />
        <cb-chat-tool name="consultar_saldo" status="done" [input]="{ cuenta: '4829' }" [output]="{ disponible: 4250000, moneda: 'COP' }" />
        <cb-chat-tool name="enviar_transferencia" status="running" [input]="{ destino: 'Ana', valor: 120000 }" />
        <cb-chat-tool name="bloquear_tarjeta" title="Bloquear tarjeta" status="error" output="Tarjeta no encontrada" />
      </div>
    </doc-section>

    <doc-section id="parts" title="Las otras piezas" description="Entradas y eventos de cb-chat-input, cb-chat-messages, cb-chat-reasoning y cb-chat-tool. El playground de abajo es el de cb-chat-message.">
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
        height: 36rem;
        padding: 0.75rem;
        border: 1px solid var(--cb-color-border);
        border-radius: var(--cb-radius-lg);
        background: var(--cb-color-surface-raised);
      }
      .chat-demo__messages {
        flex: 1;
      }
      .chat-stack {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
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
        ['files', 'readonly File[] (model)', '[]', 'Archivos adjuntos (las imágenes, en miniatura).'],
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
    {
      name: 'cb-chat-reasoning',
      rows: [
        ['text', 'string', "''", 'Razonamiento (markdown).'],
        ['streaming', 'boolean', 'false', 'Sigue llegando: "Pensando…" con brillo y aria-busy.'],
        ['duration', 'number', '', 'Segundos que duró ("Razonó durante N s").'],
        ['open', 'boolean (model)', 'false', 'Desplegado.'],
        ['autoCollapse', 'boolean', 'true', 'Se abre mientras llega y se pliega al terminar.'],
      ],
    },
    {
      name: 'cb-chat-tool',
      rows: [
        ['name', 'string', "''", 'Nombre de la herramienta.'],
        ['title', 'string', "''", 'Texto en lugar del nombre.'],
        ['status', "'running' | 'done' | 'error'", "'done'", 'Estado de la llamada.'],
        ['input', 'unknown', '', 'Argumentos (objeto o JSON).'],
        ['output', 'unknown', '', 'Resultado (objeto, JSON o texto).'],
        ['open', 'boolean (model)', 'false', 'Desplegado.'],
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
  private timers: ReturnType<typeof setTimeout>[] = [];
  private readonly objectUrls: string[] = [];

  constructor() {
    inject(TocService).reset();
    this.destroyRef.onDestroy(() => {
      this.clearTimers();
      this.objectUrls.forEach((url) => URL.revokeObjectURL(url));
    });
  }

  protected send(event: CbChatSendEvent): void {
    const failed = /\berror\b/i.test(event.text);
    const attachments = event.files.map((file) => {
      const url = URL.createObjectURL(file);
      this.objectUrls.push(url);
      return { name: file.name, type: file.type, size: file.size, url };
    });
    const msg: Msg = { id: this.nextId++, role: 'user', text: event.text, time: this.now(), status: failed ? 'error' : 'sent', attachments };
    this.messages.update((list) => [...list, msg]);
    if (!failed) this.reply(event.text || 'Te envío un archivo');
  }

  protected retry(msg: Msg): void {
    this.patch(msg.id, { status: 'sent' });
    this.reply(msg.text.replace(/\berror\b/gi, '').trim() || 'Hola');
  }

  protected regenerate(msg: Msg): void {
    this.messages.update((list) => list.filter((m) => m.id !== msg.id));
    this.reply(msg.question ?? 'Hola');
  }

  protected setFeedback(msg: Msg, feedback: CbChatFeedback): void {
    this.patch(msg.id, { feedback });
  }

  protected stop(): void {
    this.clearTimers();
    this.thinking.set(false);
    this.generating.set(false);
    this.messages.update((list) =>
      list.map((m) =>
        m.streaming || m.reasoning?.streaming || m.tool?.status === 'running'
          ? {
              ...m,
              streaming: false,
              text: m.text ? m.text + ' …' : '_(Respuesta detenida)_',
              reasoning: m.reasoning && { ...m.reasoning, streaming: false },
              tool: m.tool && (m.tool.status === 'running' ? { ...m.tool, status: 'error' as const, output: 'Cancelada' } : m.tool),
            }
          : m,
      ),
    );
  }

  /** Simula una respuesta: razona, (a veces) usa una herramienta y escribe palabra a palabra. */
  private reply(question: string): void {
    this.clearTimers();
    const full = pickReply(question);
    const usesTool = full === REPLIES['saldo'];
    const id = this.nextId++;
    const started = Date.now();
    this.generating.set(true);
    this.messages.update((list) => [
      ...list,
      { id, role: 'assistant', text: '', time: this.now(), streaming: true, question, reasoning: { text: '', streaming: true } },
    ]);

    // 1) Razonamiento que llega en trozos.
    const thoughts = usesTool
      ? 'El usuario quiere su **saldo**. Consulto la cuenta de ahorros y los movimientos de la última semana para darle una tabla.'
      : 'Busco la mejor forma de responder con pasos claros.';
    const words = thoughts.split(/(?<=\s)/);
    words.forEach((_w, i) =>
      this.later(i * 40, () => this.patchReasoning(id, { text: words.slice(0, i + 1).join(''), streaming: true })),
    );
    const afterThinking = words.length * 40 + 200;
    this.later(afterThinking, () => this.patchReasoning(id, { text: thoughts, streaming: false, seconds: (Date.now() - started) / 1000 }));

    // 2) Herramienta (solo para el saldo).
    let afterTool = afterThinking;
    if (usesTool) {
      this.later(afterThinking + 50, () => this.patch(id, { tool: { name: 'consultar_saldo', status: 'running', input: { cuenta: '4829', dias: 7 } } }));
      afterTool = afterThinking + 1100;
      this.later(afterTool, () =>
        this.patch(id, {
          tool: {
            name: 'consultar_saldo',
            status: 'done',
            input: { cuenta: '4829', dias: 7 },
            output: { disponible: 4250000, moneda: 'COP', movimientos: 3 },
          },
        }),
      );
    }

    // 3) Respuesta palabra a palabra.
    const answer = full.split(/(?<=\s)/);
    for (let i = 2; i <= answer.length + 1; i += 2) {
      const done = i >= answer.length;
      this.later(afterTool + 100 + (i / 2) * 45, () => {
        this.patch(id, { text: answer.slice(0, Math.min(i, answer.length)).join(''), streaming: !done });
        if (done) this.generating.set(false);
      });
    }
  }

  private patch(id: number, changes: Partial<Msg>): void {
    this.messages.update((list) => list.map((m) => (m.id === id ? { ...m, ...changes } : m)));
  }

  private patchReasoning(id: number, reasoning: Msg['reasoning']): void {
    this.patch(id, { reasoning });
  }

  private later(ms: number, fn: () => void): void {
    this.timers.push(setTimeout(fn, ms));
  }

  private clearTimers(): void {
    this.timers.forEach((t) => clearTimeout(t));
    this.timers = [];
  }

  private now(): string {
    return new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  }

  protected readonly markdownSample =
    '### Resumen de tu tarjeta\n\nTienes **2 pagos pendientes** y un cupo disponible de *$ 3.800.000*.\n\n' +
    '- [x] Pago mínimo de octubre\n- [ ] Pago total antes del **5 de noviembre**\n\n' +
    'Consulta los detalles en [tu extracto](/extractos) o en https://caribeng.dev.\n\n```ts\nconst cupo = 3_800_000; // COP\n```';

  protected readonly importCode = `import {
  CbChatMessages, CbChatMessage, CbChatInput, CbChatReasoning, CbChatTool,
  type CbChatSendEvent,
} from '@caribeng/ui/chat';`;
  protected readonly assistantCode = `<cb-chat-messages [busy]="generating()" [typing]="thinking()" style="height: 30rem">
  @for (m of messages(); track m.id) {
    <cb-chat-message
      [role]="m.role"
      [text]="m.text"
      [time]="m.time"
      [status]="m.status"
      [streaming]="!!m.streaming"
      [attachments]="m.attachments ?? []"
      [copyable]="m.role === 'assistant'"
      [showFeedback]="m.role === 'assistant' && m.id > 1"
      [regenerable]="m.role === 'assistant' && !!m.question"
      [feedback]="m.feedback ?? null"
      (feedbackChange)="setFeedback(m, $event)"
      (retry)="retry(m)"
      (regenerate)="regenerate(m)"
    >
      @if (m.reasoning; as r) {
        <cb-chat-reasoning [text]="r.text" [streaming]="r.streaming" [duration]="r.seconds" />
      }
      @if (m.tool; as t) {
        <cb-chat-tool [name]="t.name" [status]="t.status" [input]="t.input" [output]="t.output" />
      }
    </cb-chat-message>
  }
</cb-chat-messages>
<cb-chat-input
  [streaming]="generating() || thinking()"
  [suggestions]="suggestions"
  attachments
  accept="image/*,.pdf"
  (send)="send($event)"
  (stop)="stop()"
/>`;
  protected readonly markdownCode = `<cb-chat-message role="assistant" [text]="markdownSample" copyable />
<cb-chat-message role="user" author="Laura Gómez" showAuthor time="10:42" text="Gracias, ¿y esto? <script>alert('hola')</script>" status="sent" />
<cb-chat-message role="system" text="La conversación se archivará en 30 días." />`;
  protected readonly agentCode = `<cb-chat-reasoning text="El usuario pide su saldo. Consulto la cuenta **4829** y los movimientos de la semana." [duration]="3" />
<cb-chat-tool name="consultar_saldo" status="done" [input]="{ cuenta: '4829' }" [output]="{ disponible: 4250000, moneda: 'COP' }" />
<cb-chat-tool name="enviar_transferencia" status="running" [input]="{ destino: 'Ana', valor: 120000 }" />
<cb-chat-tool name="bloquear_tarjeta" title="Bloquear tarjeta" status="error" output="Tarjeta no encontrada" />`;
}

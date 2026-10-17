import { Injectable } from '@angular/core';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-bash';

export type CodeLang = 'typescript' | 'markup' | 'bash';

/** Resalta código con Prism y devuelve HTML seguro (entrada controlada por la app). */
@Injectable({ providedIn: 'root' })
export class HighlightService {
  highlight(code: string, lang: CodeLang): string {
    const grammar = Prism.languages[lang] ?? Prism.languages['markup'];
    return Prism.highlight(code.trim(), grammar, lang);
  }
}

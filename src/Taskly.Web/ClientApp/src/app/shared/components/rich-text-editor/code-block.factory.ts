/**
 * Supported programming languages for code blocks.
 */
export enum CodeLanguage {
  CSharp = 'csharp',
  TypeScript = 'typescript',
  JavaScript = 'javascript',
  Html = 'html',
  Css = 'css',
  Sql = 'sql',
  Json = 'json',
  PlainText = 'plaintext',
}

/**
 * Language configuration for code blocks.
 */
export interface LanguageConfig {
  id: CodeLanguage;
  label: string;
  aliases: string[];
}

/**
 * Default supported languages for code blocks.
 * Exported for use in SSR and component initialization.
 */
export const DEFAULT_SUPPORTED_LANGUAGES: readonly LanguageConfig[] = [
  { id: CodeLanguage.CSharp, label: 'C#', aliases: ['cs', 'c#'] },
  { id: CodeLanguage.TypeScript, label: 'TypeScript', aliases: ['ts'] },
  { id: CodeLanguage.JavaScript, label: 'JavaScript', aliases: ['js'] },
  { id: CodeLanguage.Html, label: 'HTML', aliases: [] },
  { id: CodeLanguage.Css, label: 'CSS', aliases: ['scss', 'sass'] },
  { id: CodeLanguage.Sql, label: 'SQL', aliases: [] },
  { id: CodeLanguage.Json, label: 'JSON', aliases: [] },
  { id: CodeLanguage.PlainText, label: 'Plain Text', aliases: ['text', 'txt'] },
];

/**
 * Default language for new code blocks.
 */
export const DEFAULT_CODE_LANGUAGE: CodeLanguage = CodeLanguage.CSharp;

/**
 * Factory for creating and managing code blocks with syntax highlighting.
 * Handles code block insertion, syntax highlighting for multiple languages,
 * and live re-highlighting via MutationObserver.
 */
export class CodeBlockFactory {
  /**
   * Supported languages for code blocks.
   */
  public readonly supportedLanguages: readonly LanguageConfig[] = DEFAULT_SUPPORTED_LANGUAGES;

  /**
   * Default language for new code blocks.
   */
  public readonly defaultLanguage: CodeLanguage = DEFAULT_CODE_LANGUAGE;

  private mutationObserver: MutationObserver | null = null;
  private highlightTimeout: ReturnType<typeof setTimeout> | null = null;
  private pendingHighlights = new Set<Element>();

  constructor(
    private readonly document: Document,
    private readonly getEditor: () => HTMLElement | undefined
  ) {}

  /**
   * Cleans up resources when the factory is destroyed.
   */
  public destroy(): void {
    this.mutationObserver?.disconnect();
    this.mutationObserver = null;

    if (this.highlightTimeout) {
      clearTimeout(this.highlightTimeout);
      this.highlightTimeout = null;
    }

    this.pendingHighlights.clear();
  }

  /**
   * Sets up a MutationObserver to watch for code block changes.
   */
  public setupMutationObserver(): void {
    const editor = this.getEditor();
    if (!editor) {
      return;
    }

    this.mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') {
          const codeElement = this.findParentCodeBlock(mutation.target);
          if (codeElement) {
            this.scheduleHighlight(codeElement);
          }
        }
      }
    });

    this.mutationObserver.observe(editor, {
      characterData: true,
      subtree: true,
    });
  }

  /**
   * Inserts a code block with the specified language.
   * @returns true if the code block was inserted successfully.
   */
  public insertCodeBlock(language: CodeLanguage): boolean {
    const editor = this.getEditor();
    if (!editor) {
      return false;
    }

    editor.focus();

    const selection = this.document.defaultView?.getSelection();
    if (!selection) {
      return false;
    }

    // Create the code block structure
    const pre = this.document.createElement('pre');
    const code = this.document.createElement('code');
    const blockId = this.generateBlockId();

    pre.className = 'rte-code-block';
    pre.setAttribute('data-language', language);
    pre.setAttribute('data-block-id', blockId);
    code.className = `language-${language}`;
    code.setAttribute('contenteditable', 'true');
    code.setAttribute('spellcheck', 'false');

    // Get selected text or use placeholder
    let initialContent = '// Enter your code here';
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString().trim();
      if (selectedText) {
        initialContent = selectedText;
        range.deleteContents();
      }
    }

    code.textContent = initialContent;
    pre.appendChild(code);

    // Insert the code block
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.insertNode(pre);

      // Add a paragraph after for continued editing
      const p = this.document.createElement('p');
      p.innerHTML = '<br>';
      pre.parentNode?.insertBefore(p, pre.nextSibling);

      // Position cursor inside the code block
      range.selectNodeContents(code);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      editor.appendChild(pre);
    }

    // Apply syntax highlighting
    this.highlightCodeBlock(pre);
    return true;
  }

  /**
   * Highlights all code blocks in the editor.
   */
  public highlightAllCodeBlocks(): void {
    const editor = this.getEditor();
    if (!editor) {
      return;
    }

    const codeBlocks = editor.querySelectorAll('pre.rte-code-block');
    codeBlocks.forEach((block) => this.highlightCodeBlock(block as HTMLElement));
  }

  /**
   * Applies syntax highlighting to a code block.
   */
  public highlightCodeBlock(pre: HTMLElement): void {
    const code = pre.querySelector('code');
    if (!code) {
      return;
    }

    const language = (pre.getAttribute('data-language') as CodeLanguage) || 'plaintext';
    const rawText = code.textContent || '';

    // Store cursor position
    const selection = this.document.defaultView?.getSelection();
    let cursorOffset = 0;
    let hasFocus = false;

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (code.contains(range.startContainer)) {
        hasFocus = true;
        cursorOffset = this.getTextOffset(code, range.startContainer, range.startOffset);
      }
    }

    // Apply syntax highlighting
    const highlighted = this.highlightSyntax(rawText, language);
    const lines = highlighted.split('\n');

    // Build HTML with line numbers
    const linesHtml = lines
      .map((line, index) => {
        const lineNum = index + 1;
        const lineContent = line || '&nbsp;';
        return `<span class="code-line" data-line="${lineNum}"><span class="line-number">${lineNum}</span><span class="line-content">${lineContent}</span></span>`;
      })
      .join('\n');

    code.innerHTML = linesHtml;

    // Restore cursor position
    if (hasFocus && selection) {
      this.restoreCursorPosition(code, cursorOffset, selection);
    }
  }

  /**
   * Schedules highlighting for a code block (debounced).
   */
  private scheduleHighlight(preElement: Element): void {
    this.pendingHighlights.add(preElement);

    if (this.highlightTimeout) {
      clearTimeout(this.highlightTimeout);
    }

    this.highlightTimeout = setTimeout(() => {
      for (const el of this.pendingHighlights) {
        this.highlightCodeBlock(el as HTMLElement);
      }
      this.pendingHighlights.clear();
      this.highlightTimeout = null;
    }, 300);
  }

  /**
   * Finds the parent code block (pre element) of a node.
   */
  private findParentCodeBlock(node: Node | null): Element | null {
    while (node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        if (el.tagName === 'PRE' && el.classList.contains('rte-code-block')) {
          return el;
        }
      }
      node = node.parentNode;
    }
    return null;
  }

  /**
   * Gets the text offset from the start of an element to a specific point.
   */
  private getTextOffset(root: Node, targetNode: Node, targetOffset: number): number {
    let offset = 0;
    const walker = this.document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

    let node = walker.nextNode();
    while (node) {
      if (node === targetNode) {
        return offset + targetOffset;
      }
      offset += node.textContent?.length ?? 0;
      node = walker.nextNode();
    }

    return offset;
  }

  /**
   * Restores the cursor position after highlighting.
   */
  private restoreCursorPosition(code: HTMLElement, offset: number, selection: Selection): void {
    const walker = this.document.createTreeWalker(code, NodeFilter.SHOW_TEXT);

    let currentOffset = 0;
    let node = walker.nextNode();

    while (node) {
      const nodeLength = node.textContent?.length ?? 0;
      if (currentOffset + nodeLength >= offset) {
        const range = this.document.createRange();
        range.setStart(node, offset - currentOffset);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        return;
      }
      currentOffset += nodeLength;
      node = walker.nextNode();
    }
  }

  /**
   * Applies syntax highlighting to code text.
   */
  private highlightSyntax(code: string, language: CodeLanguage): string {
    // Escape HTML first
    const escaped = this.escapeHtml(code);

    switch (language) {
      case CodeLanguage.CSharp:
        return this.highlightCSharp(escaped);
      case CodeLanguage.TypeScript:
      case CodeLanguage.JavaScript:
        return this.highlightTypeScript(escaped);
      case CodeLanguage.Html:
        return this.highlightHtml(escaped);
      case CodeLanguage.Css:
        return this.highlightCss(escaped);
      case CodeLanguage.Sql:
        return this.highlightSql(escaped);
      case CodeLanguage.Json:
        return this.highlightJson(escaped);
      default:
        return escaped;
    }
  }

  /**
   * Escapes HTML special characters.
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Highlights C# code.
   */
  private highlightCSharp(code: string): string {
    const keywords = [
      'abstract', 'as', 'async', 'await', 'base', 'bool', 'break', 'byte', 'case', 'catch',
      'char', 'checked', 'class', 'const', 'continue', 'decimal', 'default', 'delegate',
      'do', 'double', 'else', 'enum', 'event', 'explicit', 'extern', 'false', 'finally',
      'fixed', 'float', 'for', 'foreach', 'goto', 'if', 'implicit', 'in', 'init', 'int',
      'interface', 'internal', 'is', 'lock', 'long', 'namespace', 'new', 'null', 'object',
      'operator', 'out', 'override', 'params', 'partial', 'private', 'protected', 'public',
      'readonly', 'record', 'ref', 'required', 'return', 'sbyte', 'sealed', 'short',
      'sizeof', 'stackalloc', 'static', 'string', 'struct', 'switch', 'this', 'throw',
      'true', 'try', 'typeof', 'uint', 'ulong', 'unchecked', 'unsafe', 'ushort', 'using',
      'var', 'virtual', 'void', 'volatile', 'when', 'where', 'while', 'with', 'yield',
      'get', 'set', 'value', 'nameof', 'nint', 'nuint', 'not', 'and', 'or', 'file', 'scoped',
    ];

    let result = code;

    // Strings (including verbatim and interpolated)
    result = result.replace(
      /(@&quot;[^&]*(?:&quot;&quot;[^&]*)*&quot;|&quot;(?:[^&\\]|\\.)*&quot;)/g,
      '<span class="token string">$1</span>'
    );

    // Single-quoted chars
    result = result.replace(
      /(&#039;(?:[^&\\]|\\.)*&#039;)/g,
      '<span class="token string">$1</span>'
    );

    // Numbers
    result = result.replace(
      /\b(\d+(?:\.\d+)?[fFdDmMlLuU]?)\b/g,
      '<span class="token number">$1</span>'
    );

    // Keywords
    const keywordPattern = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    result = result.replace(keywordPattern, '<span class="token keyword">$1</span>');

    // Types (PascalCase identifiers)
    result = result.replace(
      /\b([A-Z][a-zA-Z0-9]*(?:&lt;[^&]+&gt;)?)\b/g,
      '<span class="token type">$1</span>'
    );

    // Attributes
    result = result.replace(
      /(\[[A-Za-z][A-Za-z0-9]*(?:\([^)]*\))?\])/g,
      '<span class="token attribute">$1</span>'
    );

    // Single-line comments
    result = result.replace(
      /(\/\/.*?)$/gm,
      '<span class="token comment">$1</span>'
    );

    // Multi-line comments
    result = result.replace(
      /(\/\*[\s\S]*?\*\/)/g,
      '<span class="token comment">$1</span>'
    );

    // XML doc comments
    result = result.replace(
      /(\/\/\/.*?)$/gm,
      '<span class="token doc-comment">$1</span>'
    );

    return result;
  }

  /**
   * Highlights TypeScript/JavaScript code.
   */
  private highlightTypeScript(code: string): string {
    const keywords = [
      'abstract', 'any', 'as', 'async', 'await', 'boolean', 'break', 'case', 'catch',
      'class', 'const', 'constructor', 'continue', 'debugger', 'declare', 'default',
      'delete', 'do', 'else', 'enum', 'export', 'extends', 'false', 'finally', 'for',
      'from', 'function', 'get', 'if', 'implements', 'import', 'in', 'infer',
      'instanceof', 'interface', 'is', 'keyof', 'let', 'module', 'namespace', 'never',
      'new', 'null', 'number', 'object', 'of', 'package', 'private', 'protected',
      'public', 'readonly', 'require', 'return', 'satisfies', 'set', 'static', 'string',
      'super', 'switch', 'symbol', 'this', 'throw', 'true', 'try', 'type', 'typeof',
      'undefined', 'unknown', 'var', 'void', 'while', 'with', 'yield',
    ];

    let result = code;

    // Template literals
    result = result.replace(
      /(`[^`]*`)/g,
      '<span class="token string">$1</span>'
    );

    // Strings
    result = result.replace(
      /(&quot;(?:[^&\\]|\\.)*&quot;|&#039;(?:[^&\\]|\\.)*&#039;)/g,
      '<span class="token string">$1</span>'
    );

    // Numbers
    result = result.replace(
      /\b(\d+(?:\.\d+)?)\b/g,
      '<span class="token number">$1</span>'
    );

    // Keywords
    const keywordPattern = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    result = result.replace(keywordPattern, '<span class="token keyword">$1</span>');

    // Decorators
    result = result.replace(
      /(@[A-Za-z][A-Za-z0-9]*)/g,
      '<span class="token decorator">$1</span>'
    );

    // Comments
    result = result.replace(
      /(\/\/.*?)$/gm,
      '<span class="token comment">$1</span>'
    );

    result = result.replace(
      /(\/\*[\s\S]*?\*\/)/g,
      '<span class="token comment">$1</span>'
    );

    return result;
  }

  /**
   * Highlights HTML code.
   */
  private highlightHtml(code: string): string {
    let result = code;

    // Tags
    result = result.replace(
      /(&lt;\/?[a-zA-Z][a-zA-Z0-9-]*)/g,
      '<span class="token tag">$1</span>'
    );

    // Attributes
    result = result.replace(
      /\s([a-zA-Z-]+)=/g,
      ' <span class="token attr-name">$1</span>='
    );

    // Attribute values
    result = result.replace(
      /=(&quot;[^&]*&quot;)/g,
      '=<span class="token attr-value">$1</span>'
    );

    // Comments
    result = result.replace(
      /(&lt;!--[\s\S]*?--&gt;)/g,
      '<span class="token comment">$1</span>'
    );

    return result;
  }

  /**
   * Highlights CSS code.
   */
  private highlightCss(code: string): string {
    let result = code;

    // Selectors
    result = result.replace(
      /^([.#]?[a-zA-Z][a-zA-Z0-9_-]*(?:\s*,\s*[.#]?[a-zA-Z][a-zA-Z0-9_-]*)*)\s*\{/gm,
      '<span class="token selector">$1</span> {'
    );

    // Properties
    result = result.replace(
      /([a-zA-Z-]+)\s*:/g,
      '<span class="token property">$1</span>:'
    );

    // Values with units
    result = result.replace(
      /:\s*([^;{}]+)/g,
      ': <span class="token value">$1</span>'
    );

    // Comments
    result = result.replace(
      /(\/\*[\s\S]*?\*\/)/g,
      '<span class="token comment">$1</span>'
    );

    return result;
  }

  /**
   * Highlights SQL code.
   */
  private highlightSql(code: string): string {
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'INSERT', 'INTO', 'VALUES', 'UPDATE',
      'SET', 'DELETE', 'CREATE', 'TABLE', 'DROP', 'ALTER', 'ADD', 'INDEX', 'JOIN',
      'INNER', 'LEFT', 'RIGHT', 'OUTER', 'ON', 'AS', 'ORDER', 'BY', 'GROUP', 'HAVING',
      'LIMIT', 'OFFSET', 'UNION', 'ALL', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MAX',
      'MIN', 'NULL', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'EXISTS', 'CASE', 'WHEN', 'THEN',
      'ELSE', 'END', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'DEFAULT', 'CHECK',
      'CONSTRAINT', 'UNIQUE', 'CASCADE', 'TRUNCATE', 'BEGIN', 'COMMIT', 'ROLLBACK',
      'TRANSACTION', 'DECLARE', 'EXEC', 'EXECUTE', 'PROCEDURE', 'FUNCTION', 'RETURNS',
      'VARCHAR', 'INT', 'INTEGER', 'BIGINT', 'SMALLINT', 'DECIMAL', 'NUMERIC', 'FLOAT',
      'REAL', 'DATE', 'DATETIME', 'TIMESTAMP', 'TIME', 'BOOLEAN', 'BIT', 'TEXT', 'NVARCHAR',
    ];

    let result = code;

    // Strings
    result = result.replace(
      /(&#039;(?:[^&\\]|\\.)*&#039;)/g,
      '<span class="token string">$1</span>'
    );

    // Numbers
    result = result.replace(
      /\b(\d+(?:\.\d+)?)\b/g,
      '<span class="token number">$1</span>'
    );

    // Keywords (case-insensitive)
    const keywordPattern = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
    result = result.replace(keywordPattern, '<span class="token keyword">$1</span>');

    // Comments
    result = result.replace(
      /(--.*?)$/gm,
      '<span class="token comment">$1</span>'
    );

    result = result.replace(
      /(\/\*[\s\S]*?\*\/)/g,
      '<span class="token comment">$1</span>'
    );

    return result;
  }

  /**
   * Highlights JSON code.
   */
  private highlightJson(code: string): string {
    let result = code;

    // Property names
    result = result.replace(
      /(&quot;[^&]+&quot;)\s*:/g,
      '<span class="token property">$1</span>:'
    );

    // String values
    result = result.replace(
      /:\s*(&quot;[^&]*&quot;)/g,
      ': <span class="token string">$1</span>'
    );

    // Numbers
    result = result.replace(
      /:\s*(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
      ': <span class="token number">$1</span>'
    );

    // Booleans and null
    result = result.replace(
      /:\s*(true|false|null)\b/g,
      ': <span class="token keyword">$1</span>'
    );

    return result;
  }

  /**
   * Generates a unique block ID.
   */
  private generateBlockId(): string {
    return `code-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

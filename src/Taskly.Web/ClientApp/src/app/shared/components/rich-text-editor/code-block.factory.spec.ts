import { CodeBlockFactory, CodeLanguage, DEFAULT_CODE_LANGUAGE, DEFAULT_SUPPORTED_LANGUAGES } from './code-block.factory';

describe('CodeBlockFactory', () => {
  let factory: CodeBlockFactory;
  let mockDocument: Document;
  let mockEditor: HTMLDivElement;

  beforeEach(() => {
    // Create a real DOM environment for testing
    mockEditor = document.createElement('div');
    mockEditor.setAttribute('contenteditable', 'true');
    document.body.appendChild(mockEditor);

    mockDocument = document;
    factory = new CodeBlockFactory(mockDocument, () => mockEditor);
  });

  afterEach(() => {
    factory.destroy();
    mockEditor.remove();
  });

  describe('constants', () => {
    it('should export DEFAULT_SUPPORTED_LANGUAGES with all expected languages', () => {
      expect(DEFAULT_SUPPORTED_LANGUAGES).toBeDefined();
      expect(DEFAULT_SUPPORTED_LANGUAGES.length).toBe(8);

      const languageIds = DEFAULT_SUPPORTED_LANGUAGES.map((l) => l.id);
      expect(languageIds).toContain(CodeLanguage.CSharp);
      expect(languageIds).toContain(CodeLanguage.TypeScript);
      expect(languageIds).toContain(CodeLanguage.JavaScript);
      expect(languageIds).toContain(CodeLanguage.Html);
      expect(languageIds).toContain(CodeLanguage.Css);
      expect(languageIds).toContain(CodeLanguage.Sql);
      expect(languageIds).toContain(CodeLanguage.Json);
      expect(languageIds).toContain(CodeLanguage.PlainText);
    });

    it('should export DEFAULT_CODE_LANGUAGE as csharp', () => {
      expect(DEFAULT_CODE_LANGUAGE).toBe(CodeLanguage.CSharp);
    });

    it('should have C# as the first language in supported languages', () => {
      expect(DEFAULT_SUPPORTED_LANGUAGES[0].id).toBe(CodeLanguage.CSharp);
      expect(DEFAULT_SUPPORTED_LANGUAGES[0].label).toBe('C#');
    });
  });

  describe('factory properties', () => {
    it('should expose supportedLanguages', () => {
      expect(factory.supportedLanguages).toBeDefined();
      expect(factory.supportedLanguages.length).toBe(8);
    });

    it('should expose defaultLanguage as csharp', () => {
      expect(factory.defaultLanguage).toBe(CodeLanguage.CSharp);
    });

    it('should have matching supported languages with exported constant', () => {
      expect(factory.supportedLanguages).toBe(DEFAULT_SUPPORTED_LANGUAGES);
    });
  });

  describe('insertCodeBlock', () => {
    it('should return false when editor is not available', () => {
      const noEditorFactory = new CodeBlockFactory(mockDocument, () => undefined);
      const result = noEditorFactory.insertCodeBlock(CodeLanguage.CSharp);
      expect(result).toBe(false);
      noEditorFactory.destroy();
    });

    it('should insert a code block with the specified language', () => {
      mockEditor.focus();

      // Create a selection in the editor
      const range = document.createRange();
      range.setStart(mockEditor, 0);
      range.collapse(true);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);

      const result = factory.insertCodeBlock(CodeLanguage.TypeScript);

      expect(result).toBe(true);

      const preElement = mockEditor.querySelector('pre.rte-code-block');
      expect(preElement).toBeTruthy();
      expect(preElement?.getAttribute('data-language')).toBe('typescript');

      const codeElement = preElement?.querySelector('code');
      expect(codeElement).toBeTruthy();
      expect(codeElement?.classList.contains('language-typescript')).toBe(true);
    });

    it('should set contenteditable and spellcheck attributes on code element', () => {
      mockEditor.focus();
      const range = document.createRange();
      range.setStart(mockEditor, 0);
      range.collapse(true);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);

      factory.insertCodeBlock(CodeLanguage.JavaScript);

      const codeElement = mockEditor.querySelector('code');
      expect(codeElement?.getAttribute('contenteditable')).toBe('true');
      expect(codeElement?.getAttribute('spellcheck')).toBe('false');
    });

    it('should add a paragraph after the code block for continued editing', () => {
      mockEditor.focus();
      const range = document.createRange();
      range.setStart(mockEditor, 0);
      range.collapse(true);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);

      factory.insertCodeBlock(CodeLanguage.Html);

      const preElement = mockEditor.querySelector('pre.rte-code-block');
      const nextSibling = preElement?.nextElementSibling;
      expect(nextSibling?.tagName).toBe('P');
    });

    it('should generate unique block IDs', () => {
      mockEditor.focus();
      const range = document.createRange();
      range.setStart(mockEditor, 0);
      range.collapse(true);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);

      factory.insertCodeBlock(CodeLanguage.Css);

      // Insert second code block
      const range2 = document.createRange();
      const lastElement = mockEditor.lastElementChild ?? mockEditor;
      range2.setStartAfter(lastElement);
      range2.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range2);

      factory.insertCodeBlock(CodeLanguage.Sql);

      const preElements = mockEditor.querySelectorAll('pre.rte-code-block');
      expect(preElements.length).toBe(2);

      const id1 = preElements[0].getAttribute('data-block-id');
      const id2 = preElements[1].getAttribute('data-block-id');
      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });
  });

  describe('highlightAllCodeBlocks', () => {
    it('should highlight all existing code blocks', () => {
      // Manually add a code block
      const pre = document.createElement('pre');
      pre.className = 'rte-code-block';
      pre.setAttribute('data-language', 'javascript');

      const code = document.createElement('code');
      code.textContent = 'const x = 1;';
      pre.appendChild(code);
      mockEditor.appendChild(pre);

      factory.highlightAllCodeBlocks();

      // Check that line numbers were added
      const lineNumbers = code.querySelectorAll('.line-number');
      expect(lineNumbers.length).toBeGreaterThan(0);
    });

    it('should not throw when editor has no code blocks', () => {
      expect(() => factory.highlightAllCodeBlocks()).not.toThrow();
    });
  });

  describe('highlightCodeBlock', () => {
    it('should add line numbers to code', () => {
      const pre = document.createElement('pre');
      pre.className = 'rte-code-block';
      pre.setAttribute('data-language', 'plaintext');

      const code = document.createElement('code');
      code.textContent = 'Line 1\nLine 2\nLine 3';
      pre.appendChild(code);
      mockEditor.appendChild(pre);

      factory.highlightCodeBlock(pre);

      const lineElements = code.querySelectorAll('.code-line');
      expect(lineElements.length).toBe(3);

      const lineNumbers = code.querySelectorAll('.line-number');
      expect(lineNumbers[0].textContent).toBe('1');
      expect(lineNumbers[1].textContent).toBe('2');
      expect(lineNumbers[2].textContent).toBe('3');
    });

    it('should not throw when code element is missing', () => {
      const pre = document.createElement('pre');
      pre.className = 'rte-code-block';

      expect(() => factory.highlightCodeBlock(pre)).not.toThrow();
    });

    it('should use plaintext when language attribute is missing', () => {
      const pre = document.createElement('pre');
      pre.className = 'rte-code-block';
      // No data-language attribute

      const code = document.createElement('code');
      code.textContent = 'Some text';
      pre.appendChild(code);
      mockEditor.appendChild(pre);

      expect(() => factory.highlightCodeBlock(pre)).not.toThrow();
    });
  });

  describe('syntax highlighting', () => {
    const testHighlighting = (language: CodeLanguage, code: string, expectedTokenClass: string): void => {
      const pre = document.createElement('pre');
      pre.className = 'rte-code-block';
      pre.setAttribute('data-language', language);

      const codeEl = document.createElement('code');
      codeEl.textContent = code;
      pre.appendChild(codeEl);
      mockEditor.appendChild(pre);

      factory.highlightCodeBlock(pre);

      // Tokens are inside .line-content spans
      const tokens = codeEl.querySelectorAll(`.line-content .token.${expectedTokenClass}`);
      expect(tokens.length).toBeGreaterThan(0);
    };

    describe('C# highlighting', () => {
      it('should highlight C# keywords', () => {
        testHighlighting(CodeLanguage.CSharp, 'public class Test { }', 'keyword');
      });

      it('should highlight C# comments', () => {
        testHighlighting(CodeLanguage.CSharp, '// This is a comment', 'comment');
      });

      it('should highlight C# types', () => {
        testHighlighting(CodeLanguage.CSharp, 'String x = null;', 'type');
      });
    });

    describe('TypeScript highlighting', () => {
      it('should highlight TypeScript keywords', () => {
        testHighlighting(CodeLanguage.TypeScript, 'const value = 1;', 'keyword');
      });

      it('should highlight TypeScript decorators', () => {
        testHighlighting(CodeLanguage.TypeScript, '@Component({ })', 'decorator');
      });

      it('should highlight TypeScript comments', () => {
        testHighlighting(CodeLanguage.TypeScript, '// comment here', 'comment');
      });
    });

    describe('JavaScript highlighting', () => {
      it('should highlight JavaScript keywords', () => {
        testHighlighting(CodeLanguage.JavaScript, 'function test() { return true; }', 'keyword');
      });
    });

    describe('HTML highlighting', () => {
      it('should highlight HTML tags', () => {
        // HTML highlighting works on escaped content: < becomes &lt;
        // The regex matches &lt;tagname patterns
        const pre = document.createElement('pre');
        pre.className = 'rte-code-block';
        pre.setAttribute('data-language', 'html');

        const codeEl = document.createElement('code');
        codeEl.textContent = '<div>content</div>';
        pre.appendChild(codeEl);
        mockEditor.appendChild(pre);

        factory.highlightCodeBlock(pre);

        // Verify the innerHTML contains the token spans with escaped content
        const innerHTML = codeEl.innerHTML;
        expect(innerHTML).toContain('token tag');
        expect(innerHTML).toContain('&lt;div');
      });

      it('should highlight HTML comments', () => {
        const pre = document.createElement('pre');
        pre.className = 'rte-code-block';
        pre.setAttribute('data-language', 'html');

        const codeEl = document.createElement('code');
        codeEl.textContent = '<!-- comment -->';
        pre.appendChild(codeEl);
        mockEditor.appendChild(pre);

        factory.highlightCodeBlock(pre);

        const innerHTML = codeEl.innerHTML;
        expect(innerHTML).toContain('token comment');
      });
    });

    describe('CSS highlighting', () => {
      it('should highlight CSS properties', () => {
        testHighlighting(CodeLanguage.Css, '.class { color: red; }', 'property');
      });

      it('should highlight CSS comments', () => {
        testHighlighting(CodeLanguage.Css, '/* comment */', 'comment');
      });
    });

    describe('SQL highlighting', () => {
      it('should highlight SQL keywords (case-insensitive)', () => {
        testHighlighting(CodeLanguage.Sql, 'SELECT * FROM users', 'keyword');
      });

      it('should highlight SQL comments', () => {
        testHighlighting(CodeLanguage.Sql, '-- comment here', 'comment');
      });
    });

    describe('JSON highlighting', () => {
      it('should highlight JSON property names', () => {
        testHighlighting(CodeLanguage.Json, '{ "key": "value" }', 'property');
      });

      it('should highlight JSON string values', () => {
        testHighlighting(CodeLanguage.Json, '{ "key": "value" }', 'string');
      });

      it('should highlight JSON keywords', () => {
        testHighlighting(CodeLanguage.Json, '{ "active": true }', 'keyword');
      });
    });
  });

  describe('destroy', () => {
    it('should disconnect mutation observer', () => {
      factory.setupMutationObserver();
      expect(() => factory.destroy()).not.toThrow();
    });

    it('should be safe to call multiple times', () => {
      factory.destroy();
      expect(() => factory.destroy()).not.toThrow();
    });
  });

  describe('setupMutationObserver', () => {
    it('should not throw when setting up observer', () => {
      expect(() => factory.setupMutationObserver()).not.toThrow();
    });

    it('should not throw when editor is unavailable', () => {
      const noEditorFactory = new CodeBlockFactory(mockDocument, () => undefined);
      expect(() => noEditorFactory.setupMutationObserver()).not.toThrow();
      noEditorFactory.destroy();
    });
  });

  describe('language configuration', () => {
    it('should have proper labels for all languages', () => {
      const expectedLabels: Record<CodeLanguage, string> = {
        [CodeLanguage.CSharp]: 'C#',
        [CodeLanguage.TypeScript]: 'TypeScript',
        [CodeLanguage.JavaScript]: 'JavaScript',
        [CodeLanguage.Html]: 'HTML',
        [CodeLanguage.Css]: 'CSS',
        [CodeLanguage.Sql]: 'SQL',
        [CodeLanguage.Json]: 'JSON',
        [CodeLanguage.PlainText]: 'Plain Text',
      };

      for (const lang of factory.supportedLanguages) {
        expect(lang.label).toBe(expectedLabels[lang.id]);
      }
    });

    it('should have aliases for common languages', () => {
      const csharp = factory.supportedLanguages.find((l) => l.id === CodeLanguage.CSharp);
      expect(csharp?.aliases).toContain('cs');
      expect(csharp?.aliases).toContain('c#');

      const typescript = factory.supportedLanguages.find((l) => l.id === CodeLanguage.TypeScript);
      expect(typescript?.aliases).toContain('ts');

      const javascript = factory.supportedLanguages.find((l) => l.id === CodeLanguage.JavaScript);
      expect(javascript?.aliases).toContain('js');
    });
  });
});

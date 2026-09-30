import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, computed, effect, type ElementRef, inject, input, output, PLATFORM_ID, signal, viewChild, afterNextRender, DestroyRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Icons, type IconDefinition } from '../../../core/icons/icon-registry';

import { CodeBlockFactory, DEFAULT_CODE_LANGUAGE, DEFAULT_SUPPORTED_LANGUAGES, type CodeLanguage } from './code-block.factory';

// Re-export types for consumers
export { CodeLanguage } from './code-block.factory';
export type { LanguageConfig } from './code-block.factory';

/**
 * Supported text formatting types.
 */
export enum FormatType {
  Bold = 'bold',
  Italic = 'italic',
  Underline = 'underline',
  OrderedList = 'orderedList',
  UnorderedList = 'unorderedList',
  Code = 'code',
}

/**
 * Toolbar action configuration.
 */
interface ToolbarAction {
  icon: IconDefinition;
  format: FormatType;
  label: string;
  tag: string;
}

/**
 * Modern rich text editor component using Selection/Range APIs.
 * Replaces deprecated document.execCommand() with standards-compliant DOM manipulation.
 *
 * Features:
 * - Bold, Italic, Underline formatting
 * - Ordered and unordered lists
 * - Code blocks
 * - Pasted or dropped files are refused: the demo stores none
 */
@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatTooltipModule, MatMenuModule, FontAwesomeModule],
  templateUrl: './rich-text-editor.component.html',
  styleUrl: './rich-text-editor.component.scss',
  host: {
    '(document:selectionchange)': 'onSelectionChange()',
  },
})
export class RichTextEditorComponent {
  private readonly destroyRef = inject(DestroyRef);

  // Inputs
  public readonly value = input('');
  public readonly placeholder = input('Add details');
  public readonly ariaLabel = input('Rich text editor');

  // Outputs
  public readonly valueChange = output<string>();

  // View children
  private readonly editorRef = viewChild<ElementRef<HTMLDivElement>>('editor');

  // Injected services
  private readonly document = inject(DOCUMENT, { optional: true });
  private readonly platformId = inject(PLATFORM_ID);

  // State
  public readonly activeFormats = signal<Set<FormatType>>(new Set());

  // Expose FormatType enum for template
  public readonly FormatType = FormatType;

  // Icons for template
  public readonly codeIcon = Icons.code;

  // Code block factory - built after render if in browser
  private readonly codeBlockFactorySignal = signal<CodeBlockFactory | null>(null);

  // Expose code block properties via computed signals for template
  public readonly supportedLanguages = computed(() =>
    this.codeBlockFactorySignal()?.supportedLanguages ?? DEFAULT_SUPPORTED_LANGUAGES
  );

  public readonly defaultLanguage = computed(() =>
    this.codeBlockFactorySignal()?.defaultLanguage ?? DEFAULT_CODE_LANGUAGE
  );

  // Toolbar configuration
  public readonly toolbar: readonly ToolbarAction[] = [
    { icon: Icons.bold, format: FormatType.Bold, label: 'Bold (Ctrl+B)', tag: 'STRONG' },
    { icon: Icons.italic, format: FormatType.Italic, label: 'Italic (Ctrl+I)', tag: 'EM' },
    { icon: Icons.underline, format: FormatType.Underline, label: 'Underline (Ctrl+U)', tag: 'U' },
    { icon: Icons.listUnordered, format: FormatType.UnorderedList, label: 'Bullet list', tag: 'UL' },
    { icon: Icons.listOrdered, format: FormatType.OrderedList, label: 'Numbered list', tag: 'OL' },
  ];

  /**
   * Effect to sync incoming value to editor content.
   */
  private readonly syncIncomingContent = effect(() => {
    const editor = this.editorRef();
    if (!editor) {
      return;
    }

    const incoming = this.value() ?? '';
    if (editor.nativeElement.innerHTML !== incoming) {
      editor.nativeElement.innerHTML = incoming;
      // Re-highlight any code blocks in the incoming content
      this.codeBlockFactorySignal()?.highlightAllCodeBlocks();
    }
  });

  public constructor() {
    afterNextRender(() => {
      // Initialize code block factory
      if (isPlatformBrowser(this.platformId) && this.document) {
        const factory = new CodeBlockFactory(
          this.document,
          () => this.editorRef()?.nativeElement
        );
        factory.setupMutationObserver();
        factory.highlightAllCodeBlocks();
        this.codeBlockFactorySignal.set(factory);
      }
    });

    this.destroyRef.onDestroy(() => {
      this.codeBlockFactorySignal()?.destroy();
    });
  }

  /**
   * Applies formatting to the current selection.
   */
  public applyFormat(format: FormatType): void {
    const editor = this.editorRef()?.nativeElement;
    if (!editor || !this.document) {
      return;
    }

    const selection = this.document.defaultView?.getSelection();
    if (!selection || selection.rangeCount === 0) {
      editor.focus();
      return;
    }

    const range = selection.getRangeAt(0);

    // Ensure selection is within editor
    if (!editor.contains(range.commonAncestorContainer)) {
      editor.focus();
      return;
    }

    if (format === FormatType.OrderedList || format === FormatType.UnorderedList) {
      this.toggleList(format, range, selection);
    } else {
      this.toggleInlineFormat(format, range, selection);
    }

    this.updateActiveFormats();
    this.emitValue();
  }

  /**
   * Handles input events from the contenteditable div.
   */
  public handleInput(): void {
    this.updateActiveFormats();
    this.emitValue();
  }

  /**
   * Handles keyboard shortcuts.
   */
  public handleKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key.toLowerCase()) {
        case 'b':
          event.preventDefault();
          this.applyFormat(FormatType.Bold);
          break;
        case 'i':
          event.preventDefault();
          this.applyFormat(FormatType.Italic);
          break;
        case 'u':
          event.preventDefault();
          this.applyFormat(FormatType.Underline);
          break;
      }
    }
  }


  /**
   * Refuses a pasted file: the demo has nowhere to keep it.
   */
  public handlePaste(event: ClipboardEvent): void {
    if (Array.from(event.clipboardData?.items ?? []).some((item) => item.kind === 'file')) {
      event.preventDefault();
    }
  }

  /**
   * Refuses a dropped file, which the browser would otherwise open in place of the app.
   */
  public handleDrop(event: DragEvent): void {
    if ((event.dataTransfer?.files.length ?? 0) > 0) {
      event.preventDefault();
    }
  }

  /**
   * Checks if a format is currently active.
   */
  public isActive(format: FormatType): boolean {
    return this.activeFormats().has(format);
  }

  /**
   * Handler for document selection change events.
   */
  public onSelectionChange(): void {
    this.updateActiveFormats();
  }

  /**
   * Inserts a code block with the specified language.
   */
  public insertCodeBlock(language: CodeLanguage): void {
    if (this.codeBlockFactorySignal()?.insertCodeBlock(language)) {
      this.emitValue();
    }
  }

  /**
   * Updates the set of currently active formats based on the selection.
   */
  private updateActiveFormats(): void {
    if (!isPlatformBrowser(this.platformId) || !this.document) {
      return;
    }

    const editor = this.editorRef()?.nativeElement;
    const selection = this.document.defaultView?.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) {
      return;
    }

    const newActive = new Set<FormatType>();
    let node: Node | null = range.commonAncestorContainer;

    // Walk up the DOM tree to find active formats
    while (node && node !== editor) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toUpperCase();

        switch (tagName) {
          case 'STRONG':
          case 'B':
            newActive.add(FormatType.Bold);
            break;
          case 'EM':
          case 'I':
            newActive.add(FormatType.Italic);
            break;
          case 'U':
            newActive.add(FormatType.Underline);
            break;
          case 'UL':
            newActive.add(FormatType.UnorderedList);
            break;
          case 'OL':
            newActive.add(FormatType.OrderedList);
            break;
        }
      }
      node = node.parentNode;
    }

    this.activeFormats.set(newActive);
  }

  /**
   * Toggles inline formatting (bold, italic, underline).
   */
  private toggleInlineFormat(format: FormatType, range: Range, selection: Selection): void {
    if (!this.document) {
      return;
    }

    const tagName = this.getTagForFormat(format);
    const isActive = this.isFormatActive(range, tagName);

    if (isActive) {
      this.removeFormat(range, tagName);
    } else {
      this.wrapSelection(range, tagName, selection);
    }
  }

  /**
   * Toggles list formatting.
   */
  private toggleList(format: FormatType, range: Range, selection: Selection): void {
    if (!this.document) {
      return;
    }

    const tagName = format === FormatType.OrderedList ? 'OL' : 'UL';
    const existingList = this.findParentWithTag(range.commonAncestorContainer, tagName);

    if (existingList) {
      // Remove list - convert back to paragraphs
      this.unwrapList(existingList);
    } else {
      // Create new list
      this.createList(range, tagName, selection);
    }
  }

  /**
   * Wraps the current selection in a formatting element.
   */
  private wrapSelection(range: Range, tagName: string, selection: Selection): void {
    if (!this.document) {
      return;
    }

    const wrapper = this.document.createElement(tagName);
    try {
      range.surroundContents(wrapper);
    } catch {
      // If surroundContents fails (e.g., crossing element boundaries),
      // extract and wrap contents manually
      const fragment = range.extractContents();
      wrapper.appendChild(fragment);
      range.insertNode(wrapper);
    }

    // Update selection to be within the wrapper
    range.selectNodeContents(wrapper);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  /**
   * Removes formatting from the selection.
   */
  private removeFormat(range: Range, tagName: string): void {
    const formattingElement = this.findParentWithTag(range.commonAncestorContainer, tagName);
    const parent = formattingElement?.parentNode;
    if (formattingElement && parent) {
      // Move children out of the formatting element
      while (formattingElement.firstChild) {
        parent.insertBefore(formattingElement.firstChild, formattingElement);
      }
      parent.removeChild(formattingElement);
    }
  }

  /**
   * Creates a new list from the current selection.
   */
  private createList(range: Range, tagName: string, selection: Selection): void {
    if (!this.document) {
      return;
    }

    const list = this.document.createElement(tagName);
    const li = this.document.createElement('LI');

    const contents = range.extractContents();
    li.appendChild(contents);
    list.appendChild(li);
    range.insertNode(list);

    // Position cursor inside the list item
    range.selectNodeContents(li);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  /**
   * Unwraps a list back to regular content.
   */
  private unwrapList(list: Element): void {
    const parent = list.parentNode;
    if (!parent) {
      return;
    }

    // Convert list items to content
    while (list.firstChild) {
      const item = list.firstChild;
      if (item.nodeType === Node.ELEMENT_NODE && (item as Element).tagName === 'LI') {
        // Move children of LI before the list
        while (item.firstChild) {
          parent.insertBefore(item.firstChild, list);
        }
        item.remove();
      } else {
        parent.insertBefore(item, list);
      }
    }
    list.remove();
  }

  /**
   * Checks if a format is active at the current range.
   */
  private isFormatActive(range: Range, tagName: string): boolean {
    return this.findParentWithTag(range.commonAncestorContainer, tagName) !== null;
  }

  /**
   * Finds a parent element with the specified tag name.
   */
  private findParentWithTag(node: Node | null, tagName: string): Element | null {
    const editor = this.editorRef()?.nativeElement;
    while (node && node !== editor) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        if (element.tagName.toUpperCase() === tagName.toUpperCase()) {
          return element;
        }
        // Also check for semantic equivalents
        if (tagName === 'STRONG' && element.tagName === 'B') {
          return element;
        }
        if (tagName === 'EM' && element.tagName === 'I') {
          return element;
        }
      }
      node = node.parentNode;
    }
    return null;
  }

  /**
   * Gets the HTML tag name for a format type.
   */
  private getTagForFormat(format: FormatType): string {
    switch (format) {
      case FormatType.Bold:
        return 'STRONG';
      case FormatType.Italic:
        return 'EM';
      case FormatType.Underline:
        return 'U';
      case FormatType.OrderedList:
        return 'OL';
      case FormatType.UnorderedList:
        return 'UL';
      case FormatType.Code:
        return 'PRE';
    }
  }

  /**
   * Emits the current editor content.
   */
  private emitValue(): void {
    const editor = this.editorRef();
    if (!editor) {
      return;
    }

    const nextValue = editor.nativeElement.innerHTML;
    if (nextValue === (this.value() ?? '')) {
      return;
    }

    this.valueChange.emit(nextValue);
  }
}

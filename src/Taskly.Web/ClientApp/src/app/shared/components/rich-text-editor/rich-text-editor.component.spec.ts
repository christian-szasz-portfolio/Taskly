import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { getFormTestProviders } from '@testing/test-helpers';
import { RichTextEditorComponent, FormatType } from './rich-text-editor.component';

describe('RichTextEditorComponent', () => {
  let component: RichTextEditorComponent;
  let fixture: ComponentFixture<RichTextEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RichTextEditorComponent],
      providers: getFormTestProviders()
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RichTextEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default placeholder', () => {
    expect(component.placeholder()).toBe('Add details');
  });

  it('should have default ariaLabel', () => {
    expect(component.ariaLabel()).toBe('Rich text editor');
  });

  it('should have toolbar actions with format types', () => {
    expect(component.toolbar.length).toBe(5);
    expect(component.toolbar[0].format).toBe(FormatType.Bold);
    expect(component.toolbar[1].format).toBe(FormatType.Italic);
    expect(component.toolbar[2].format).toBe(FormatType.Underline);
    expect(component.toolbar[3].format).toBe(FormatType.UnorderedList);
    expect(component.toolbar[4].format).toBe(FormatType.OrderedList);
  });

  describe('applyFormat', () => {
    it('should focus editor when selection is empty', () => {
      const editor = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[contenteditable="true"]')!;
      const focusSpy = spyOn(editor, 'focus');

      component.applyFormat(FormatType.Bold);

      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe('handleInput', () => {
    it('should emit valueChange on input', () => {
      const valueChangeSpy = spyOn(component.valueChange, 'emit');

      const editor = (fixture.nativeElement as HTMLElement).querySelector('[contenteditable="true"]');
      if (editor) {
        editor.innerHTML = 'New content';
        component.handleInput();

        expect(valueChangeSpy).toHaveBeenCalledWith('New content');
      }
    });

    it('should not emit if value matches input', () => {
      fixture.componentRef.setInput('value', 'Same content');
      fixture.detectChanges();

      const valueChangeSpy = spyOn(component.valueChange, 'emit');

      const editor = (fixture.nativeElement as HTMLElement).querySelector('[contenteditable="true"]');
      if (editor) {
        editor.innerHTML = 'Same content';
        component.handleInput();

        expect(valueChangeSpy).not.toHaveBeenCalled();
      }
    });
  });

  describe('handleKeydown', () => {
    it('should apply bold format on Ctrl+B', () => {
      const applyFormatSpy = spyOn(component, 'applyFormat');
      const event = new KeyboardEvent('keydown', { key: 'b', ctrlKey: true });

      component.handleKeydown(event);

      expect(applyFormatSpy).toHaveBeenCalledWith(FormatType.Bold);
    });

    it('should apply italic format on Ctrl+I', () => {
      const applyFormatSpy = spyOn(component, 'applyFormat');
      const event = new KeyboardEvent('keydown', { key: 'i', ctrlKey: true });

      component.handleKeydown(event);

      expect(applyFormatSpy).toHaveBeenCalledWith(FormatType.Italic);
    });

    it('should apply underline format on Ctrl+U', () => {
      const applyFormatSpy = spyOn(component, 'applyFormat');
      const event = new KeyboardEvent('keydown', { key: 'u', ctrlKey: true });

      component.handleKeydown(event);

      expect(applyFormatSpy).toHaveBeenCalledWith(FormatType.Underline);
    });

    it('should not apply format on regular key', () => {
      const applyFormatSpy = spyOn(component, 'applyFormat');
      const event = new KeyboardEvent('keydown', { key: 'a' });

      component.handleKeydown(event);

      expect(applyFormatSpy).not.toHaveBeenCalled();
    });
  });

  it('should render toolbar buttons', () => {
    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll('button');
    // 5 format buttons + 1 image button
    expect(buttons.length).toBeGreaterThanOrEqual(5);
  });

  it('should render contenteditable div', () => {
    const editor = (fixture.nativeElement as HTMLElement).querySelector('[contenteditable="true"]');
    expect(editor).toBeTruthy();
  });

  it('offers no image upload: the demo stores no files', () => {
    const fileInput = (fixture.nativeElement as HTMLElement).querySelector('input[type="file"]');
    expect(fileInput).toBeNull();
  });

  /** Just enough of a paste or drop event for the handlers, which jsdom cannot build with files */
  const fileEvent = (kind: 'paste' | 'drop', files: number) => {
    const preventDefault = vi.fn();
    const items = Array.from({ length: files }, () => ({ kind: 'file' }));
    const event = kind === 'paste'
      ? { clipboardData: { items }, preventDefault }
      : { dataTransfer: { files: { length: files } }, preventDefault };
    return { event, preventDefault };
  };

  describe('handlePaste', () => {
    it('refuses a pasted file', () => {
      const { event, preventDefault } = fileEvent('paste', 1);

      component.handlePaste(event as unknown as ClipboardEvent);

      expect(preventDefault).toHaveBeenCalled();
    });

    it('lets pasted text through', () => {
      const { event, preventDefault } = fileEvent('paste', 0);

      component.handlePaste(event as unknown as ClipboardEvent);

      expect(preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('handleDrop', () => {
    it('refuses a dropped file', () => {
      const { event, preventDefault } = fileEvent('drop', 1);

      component.handleDrop(event as unknown as DragEvent);

      expect(preventDefault).toHaveBeenCalled();
    });
  });

  describe('isActive', () => {
    it('should return false when format is not active', () => {
      expect(component.isActive(FormatType.Bold)).toBeFalse();
    });

    it('should return true when format is in activeFormats', () => {
      component.activeFormats.set(new Set<FormatType>([FormatType.Bold]));
      expect(component.isActive(FormatType.Bold)).toBeTrue();
    });
  });

});

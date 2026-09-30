import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { BaseFormComponent } from './base-form.component';

// Concrete implementation for testing
interface TestPayload {
  name: string;
  value: number;
}

@Component({
  selector: 'app-test-form',
  template: '',
  standalone: true
})
class TestFormComponent extends BaseFormComponent<TestPayload> {
  public readonly lastSubmittedPayload = signal<TestPayload | null>(null);

  public submit(): void {
    const payload: TestPayload = { name: 'test', value: 42 };
    this.lastSubmittedPayload.set(payload);
    this.submitted.emit(payload);
  }
}

describe('BaseFormComponent', () => {
  let component: TestFormComponent;
  let fixture: ComponentFixture<TestFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestFormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('default input values', () => {
    it('should have page as default appearance', () => {
      expect(component.appearance()).toBe('page');
    });

    it('should have form as default formId', () => {
      expect(component.formId()).toBe('form');
    });

    it('should have false as default saving', () => {
      expect(component.saving()).toBe(false);
    });

    it('should have null as default apiError', () => {
      expect(component.apiError()).toBeNull();
    });

    it('should have null as default submitLabel', () => {
      expect(component.submitLabel()).toBeNull();
    });

    it('should have Cancel as default cancelLabel', () => {
      expect(component.cancelLabel()).toBe('Cancel');
    });
  });

  describe('computed properties', () => {
    it('should compute isDialogAppearance correctly for page', () => {
      expect(component.isDialogAppearance()).toBe(false);
    });

    it('should compute isDialogAppearance correctly for dialog', () => {
      fixture.componentRef.setInput('appearance', 'dialog');
      fixture.detectChanges();

      expect(component.isDialogAppearance()).toBe(true);
    });

    it('should label the submit button Save by default', () => {
      expect(component.defaultSubmitLabel()).toBe('Save');
    });

    it('should use custom submitLabel when provided', () => {
      fixture.componentRef.setInput('submitLabel', 'Submit Form');
      fixture.detectChanges();

      expect(component.defaultSubmitLabel()).toBe('Submit Form');
    });
  });

  describe('submit', () => {
    it('should emit submitted event with payload', () => {
      let emittedPayload: TestPayload | null = null;
      component.submitted.subscribe((payload) => {
        emittedPayload = payload;
      });

      component.submit();

      expect(emittedPayload).toEqual(expect.objectContaining({ name: 'test', value: 42 }));
    });
  });

  describe('cancel', () => {
    it('should emit cancelled event', () => {
      let cancelled = false;
      component.cancelled.subscribe(() => {
        cancelled = true;
      });

      component.cancel();

      expect(cancelled).toBe(true);
    });
  });
});

// Test with input bindings
describe('BaseFormComponent with inputs', () => {
  let component: TestFormComponent;
  let fixture: ComponentFixture<TestFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestFormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestFormComponent);
    component = fixture.componentInstance;
  });

  it('should accept appearance input', () => {
    fixture.componentRef.setInput('appearance', 'dialog');
    fixture.detectChanges();

    expect(component.appearance()).toBe('dialog');
  });

  it('should accept apiError input', () => {
    fixture.componentRef.setInput('apiError', 'Something went wrong');
    fixture.detectChanges();

    expect(component.apiError()).toBe('Something went wrong');
  });

  it('should accept saving input', () => {
    fixture.componentRef.setInput('saving', true);
    fixture.detectChanges();

    expect(component.saving()).toBe(true);
  });

  it('should accept formId input', () => {
    fixture.componentRef.setInput('formId', 'my-form');
    fixture.detectChanges();

    expect(component.formId()).toBe('my-form');
  });
});

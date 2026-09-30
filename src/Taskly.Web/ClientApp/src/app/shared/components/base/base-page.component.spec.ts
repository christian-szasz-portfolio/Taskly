import { Component, PLATFORM_ID, type Signal, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { BasePageComponent } from './base-page.component';

// Concrete implementation for testing
@Component({
  selector: 'app-test-page',
  template: '',
  standalone: true
})
class TestPageComponent extends BasePageComponent {
  private readonly loadingSignal = signal(false);
  private readonly isEmptySignal = signal(true);
  private refreshCount = 0;

  public readonly loading: Signal<boolean> = this.loadingSignal.asReadonly();
  public readonly isEmpty: Signal<boolean> = this.isEmptySignal.asReadonly();

  public refresh(): void {
    this.refreshCount++;
    this.loadingSignal.set(true);
    // Simulate loading
    setTimeout(() => this.loadingSignal.set(false), 100);
  }

  public getRefreshCount(): number {
    return this.refreshCount;
  }

  public setLoading(value: boolean): void {
    this.loadingSignal.set(value);
  }

  public setEmpty(value: boolean): void {
    this.isEmptySignal.set(value);
  }

  // Expose protected methods for testing
  public testRunInBrowser(fn: () => void): void {
    this.runInBrowser(fn);
  }

  public testScrollIntoView(element: Element, options?: ScrollIntoViewOptions): void {
    this.scrollIntoView(element, options);
  }

  public testFocusElement(element: HTMLElement): void {
    this.focusElement(element);
  }

  public getIsBrowser(): boolean {
    return this.isBrowser;
  }
}

describe('BasePageComponent (Browser)', () => {
  let component: TestPageComponent;
  let fixture: ComponentFixture<TestPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestPageComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should detect browser platform', () => {
    expect(component.getIsBrowser()).toBe(true);
  });

  describe('abstract properties', () => {
    it('should have loading signal', () => {
      expect(component.loading()).toBe(false);
    });

    it('should have isEmpty signal', () => {
      expect(component.isEmpty()).toBe(true);
    });
  });

  describe('refresh', () => {
    it('should be callable', () => {
      component.refresh();

      expect(component.getRefreshCount()).toBe(1);
    });

    it('should set loading to true', () => {
      component.refresh();

      expect(component.loading()).toBe(true);
    });
  });

  describe('runInBrowser', () => {
    it('should execute function in browser', () => {
      let executed = false;

      component.testRunInBrowser(() => {
        executed = true;
      });

      expect(executed).toBe(true);
    });
  });

  describe('scrollIntoView', () => {
    it('should call scrollIntoView on element', () => {
      const element = document.createElement('div');
      spyOn(element, 'scrollIntoView');

      component.testScrollIntoView(element);

      expect(element.scrollIntoView).toHaveBeenCalled();
    });

    it('should pass options to scrollIntoView', () => {
      const element = document.createElement('div');
      spyOn(element, 'scrollIntoView');
      const options: ScrollIntoViewOptions = { behavior: 'smooth', block: 'center' };

      component.testScrollIntoView(element, options);

      expect(element.scrollIntoView).toHaveBeenCalledWith(options);
    });
  });

  describe('focusElement', () => {
    it('should call focus on element', () => {
      const element = document.createElement('button');
      spyOn(element, 'focus');

      component.testFocusElement(element);

      expect(element.focus).toHaveBeenCalled();
    });
  });
});

describe('BasePageComponent (Server)', () => {
  let component: TestPageComponent;
  let fixture: ComponentFixture<TestPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestPageComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should detect server platform', () => {
    expect(component.getIsBrowser()).toBe(false);
  });

  describe('runInBrowser', () => {
    it('should not execute function on server', () => {
      let executed = false;

      component.testRunInBrowser(() => {
        executed = true;
      });

      expect(executed).toBe(false);
    });
  });

  describe('scrollIntoView', () => {
    it('should not call scrollIntoView on server', () => {
      const element = document.createElement('div');
      spyOn(element, 'scrollIntoView');

      component.testScrollIntoView(element);

      expect(element.scrollIntoView).not.toHaveBeenCalled();
    });
  });

  describe('focusElement', () => {
    it('should not call focus on server', () => {
      const element = document.createElement('button');
      spyOn(element, 'focus');

      component.testFocusElement(element);

      expect(element.focus).not.toHaveBeenCalled();
    });
  });
});

import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { getFormTestProviders } from '@testing/test-helpers';
import { SimplePaginatorComponent, type PageChangeEvent } from './simple-paginator.component';

describe('SimplePaginatorComponent', () => {
  let component: SimplePaginatorComponent;
  let fixture: ComponentFixture<SimplePaginatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimplePaginatorComponent],
      providers: getFormTestProviders()
    }).compileComponents();

    fixture = TestBed.createComponent(SimplePaginatorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('default inputs', () => {
    it('should have default pageIndex of 0', () => {
      fixture.detectChanges();
      expect(component.pageIndex()).toBe(0);
    });

    it('should have default pageSize of 10', () => {
      fixture.detectChanges();
      expect(component.pageSize()).toBe(10);
    });

    it('should have default totalItems of 0', () => {
      fixture.detectChanges();
      expect(component.totalItems()).toBe(0);
    });
  });

  describe('totalPages computed', () => {
    it('should calculate total pages correctly', () => {
      fixture.componentRef.setInput('totalItems', 25);
      fixture.componentRef.setInput('pageSize', 10);
      fixture.detectChanges();
      expect(component.totalPages()).toBe(3);
    });

    it('should return 1 when items fit on one page', () => {
      fixture.componentRef.setInput('totalItems', 5);
      fixture.componentRef.setInput('pageSize', 10);
      fixture.detectChanges();
      expect(component.totalPages()).toBe(1);
    });

    it('should return 0 when no items', () => {
      fixture.componentRef.setInput('totalItems', 0);
      fixture.detectChanges();
      expect(component.totalPages()).toBe(0);
    });
  });

  describe('hasPreviousPage computed', () => {
    it('should return false when on first page', () => {
      fixture.componentRef.setInput('pageIndex', 0);
      fixture.detectChanges();
      expect(component.hasPreviousPage()).toBeFalse();
    });

    it('should return true when not on first page', () => {
      fixture.componentRef.setInput('pageIndex', 1);
      fixture.detectChanges();
      expect(component.hasPreviousPage()).toBeTrue();
    });
  });

  describe('hasNextPage computed', () => {
    it('should return true when there are more pages', () => {
      fixture.componentRef.setInput('pageIndex', 0);
      fixture.componentRef.setInput('pageSize', 10);
      fixture.componentRef.setInput('totalItems', 25);
      fixture.detectChanges();
      expect(component.hasNextPage()).toBeTrue();
    });

    it('should return false when on last page', () => {
      fixture.componentRef.setInput('pageIndex', 2);
      fixture.componentRef.setInput('pageSize', 10);
      fixture.componentRef.setInput('totalItems', 25);
      fixture.detectChanges();
      expect(component.hasNextPage()).toBeFalse();
    });

    it('should return false when no items', () => {
      fixture.componentRef.setInput('totalItems', 0);
      fixture.detectChanges();
      expect(component.hasNextPage()).toBeFalse();
    });
  });

  describe('rangeLabel computed', () => {
    it('should show "No items" when totalItems is 0', () => {
      fixture.componentRef.setInput('totalItems', 0);
      fixture.detectChanges();
      expect(component.rangeLabel()).toBe('No items');
    });

    it('should show correct range for first page', () => {
      fixture.componentRef.setInput('pageIndex', 0);
      fixture.componentRef.setInput('pageSize', 10);
      fixture.componentRef.setInput('totalItems', 25);
      fixture.detectChanges();
      expect(component.rangeLabel()).toBe('1–10 of 25');
    });

    it('should show correct range for middle page', () => {
      fixture.componentRef.setInput('pageIndex', 1);
      fixture.componentRef.setInput('pageSize', 10);
      fixture.componentRef.setInput('totalItems', 25);
      fixture.detectChanges();
      expect(component.rangeLabel()).toBe('11–20 of 25');
    });

    it('should show correct range for last page', () => {
      fixture.componentRef.setInput('pageIndex', 2);
      fixture.componentRef.setInput('pageSize', 10);
      fixture.componentRef.setInput('totalItems', 25);
      fixture.detectChanges();
      expect(component.rangeLabel()).toBe('21–25 of 25');
    });
  });

  describe('previousPage method', () => {
    it('should emit pageChange event when going to previous page', () => {
      fixture.componentRef.setInput('pageIndex', 1);
      fixture.componentRef.setInput('pageSize', 10);
      fixture.componentRef.setInput('totalItems', 25);
      fixture.detectChanges();

      let emittedEvent: PageChangeEvent | undefined;
      component.pageChange.subscribe((event) => {
        emittedEvent = event;
      });

      component.previousPage();

      expect(emittedEvent).toBeDefined();
      expect(emittedEvent!.pageIndex).toBe(0);
      expect(emittedEvent!.pageSize).toBe(10);
    });

    it('should not emit when on first page', () => {
      fixture.componentRef.setInput('pageIndex', 0);
      fixture.detectChanges();

      let emitted = false;
      component.pageChange.subscribe(() => {
        emitted = true;
      });

      component.previousPage();

      expect(emitted).toBeFalse();
    });
  });

  describe('nextPage method', () => {
    it('should emit pageChange event when going to next page', () => {
      fixture.componentRef.setInput('pageIndex', 0);
      fixture.componentRef.setInput('pageSize', 10);
      fixture.componentRef.setInput('totalItems', 25);
      fixture.detectChanges();

      let emittedEvent: PageChangeEvent | undefined;
      component.pageChange.subscribe((event) => {
        emittedEvent = event;
      });

      component.nextPage();

      expect(emittedEvent).toBeDefined();
      expect(emittedEvent!.pageIndex).toBe(1);
      expect(emittedEvent!.pageSize).toBe(10);
    });

    it('should not emit when on last page', () => {
      fixture.componentRef.setInput('pageIndex', 2);
      fixture.componentRef.setInput('pageSize', 10);
      fixture.componentRef.setInput('totalItems', 25);
      fixture.detectChanges();

      let emitted = false;
      component.pageChange.subscribe(() => {
        emitted = true;
      });

      component.nextPage();

      expect(emitted).toBeFalse();
    });
  });

  describe('rendering', () => {
    it('should render range label', () => {
      fixture.componentRef.setInput('totalItems', 25);
      fixture.componentRef.setInput('pageSize', 10);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('1–10 of 25');
    });

    it('should disable previous button on first page', () => {
      fixture.componentRef.setInput('pageIndex', 0);
      fixture.componentRef.setInput('totalItems', 25);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const prevButton = compiled.querySelector('button[aria-label="Previous page"]')!;
      expect((prevButton as HTMLButtonElement).disabled).toBeTrue();
    });

    it('should disable next button on last page', () => {
      fixture.componentRef.setInput('pageIndex', 2);
      fixture.componentRef.setInput('pageSize', 10);
      fixture.componentRef.setInput('totalItems', 25);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const nextButton = compiled.querySelector('button[aria-label="Next page"]')!;
      expect((nextButton as HTMLButtonElement).disabled).toBeTrue();
    });

    it('should enable both buttons on middle page', () => {
      fixture.componentRef.setInput('pageIndex', 1);
      fixture.componentRef.setInput('pageSize', 10);
      fixture.componentRef.setInput('totalItems', 25);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const prevButton = compiled.querySelector('button[aria-label="Previous page"]')!;
      const nextButton = compiled.querySelector('button[aria-label="Next page"]')!;
      expect((prevButton as HTMLButtonElement).disabled).toBeFalse();
      expect((nextButton as HTMLButtonElement).disabled).toBeFalse();
    });
  });
});

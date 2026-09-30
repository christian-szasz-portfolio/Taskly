import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { SkeletonLoaderComponent } from './skeleton-loader.component';

describe('SkeletonLoaderComponent', () => {
  let component: SkeletonLoaderComponent;
  let fixture: ComponentFixture<SkeletonLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonLoaderComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SkeletonLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render text variant by default', () => {
    const line = fixture.debugElement.query(By.css('.skeleton__line'));
    expect(line).toBeTruthy();
  });

  it('should apply animation class by default', () => {
    const skeleton = fixture.debugElement.query(By.css('.skeleton'));
    expect((skeleton.nativeElement as HTMLElement).classList.contains('skeleton--animated')).toBeTrue();
  });

  it('should not apply animation when disabled', () => {
    fixture.componentRef.setInput('animated', false);
    fixture.detectChanges();

    const skeleton = fixture.debugElement.query(By.css('.skeleton'));
    expect((skeleton.nativeElement as HTMLElement).classList.contains('skeleton--animated')).toBeFalse();
  });

  it('should render title variant', () => {
    fixture.componentRef.setInput('variant', 'title');
    fixture.detectChanges();

    const title = fixture.debugElement.query(By.css('.skeleton__title'));
    expect(title).toBeTruthy();
  });

  it('should render text-block with correct number of lines', () => {
    fixture.componentRef.setInput('variant', 'text-block');
    fixture.componentRef.setInput('lines', 4);
    fixture.detectChanges();

    const lines = fixture.debugElement.queryAll(By.css('.skeleton__text-block .skeleton__line'));
    expect(lines.length).toBe(4);
  });

  it('should render avatar variant', () => {
    fixture.componentRef.setInput('variant', 'avatar');
    fixture.detectChanges();

    const avatar = fixture.debugElement.query(By.css('.skeleton__avatar'));
    expect(avatar).toBeTruthy();
  });

  it('should render card variant', () => {
    fixture.componentRef.setInput('variant', 'card');
    fixture.detectChanges();

    const card = fixture.debugElement.query(By.css('.skeleton__card'));
    expect(card).toBeTruthy();
  });

  it('should render table with correct number of rows', () => {
    fixture.componentRef.setInput('variant', 'table');
    fixture.componentRef.setInput('rows', 3);
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('.skeleton__table-row'));
    expect(rows.length).toBe(3);
  });

  it('should render table with correct number of columns', () => {
    fixture.componentRef.setInput('variant', 'table');
    fixture.componentRef.setInput('columns', 4);
    fixture.detectChanges();

    const headerCells = fixture.debugElement.queryAll(By.css('.skeleton__header-cell'));
    expect(headerCells.length).toBe(4);
  });

  it('should render kanban-card variant', () => {
    fixture.componentRef.setInput('variant', 'kanban-card');
    fixture.detectChanges();

    const kanbanCard = fixture.debugElement.query(By.css('.skeleton__kanban-card'));
    expect(kanbanCard).toBeTruthy();
  });

  it('should render kanban-column with correct number of cards', () => {
    fixture.componentRef.setInput('variant', 'kanban-column');
    fixture.componentRef.setInput('cards', 2);
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.css('.skeleton__kanban-card'));
    expect(cards.length).toBe(2);
  });

  it('should render detail-page variant', () => {
    fixture.componentRef.setInput('variant', 'detail-page');
    fixture.detectChanges();

    const detailPage = fixture.debugElement.query(By.css('.skeleton__detail-page'));
    expect(detailPage).toBeTruthy();
  });

  it('should render form variant', () => {
    fixture.componentRef.setInput('variant', 'form');
    fixture.detectChanges();

    const form = fixture.debugElement.query(By.css('.skeleton__form'));
    expect(form).toBeTruthy();
  });

  it('should render list-item variant', () => {
    fixture.componentRef.setInput('variant', 'list-item');
    fixture.detectChanges();

    const listItem = fixture.debugElement.query(By.css('.skeleton__list-item'));
    expect(listItem).toBeTruthy();
  });

  it('should apply custom container class', () => {
    fixture.componentRef.setInput('containerClass', 'custom-class');
    fixture.detectChanges();

    const skeleton = fixture.debugElement.query(By.css('.skeleton'));
    expect((skeleton.nativeElement as HTMLElement).classList.contains('custom-class')).toBeTrue();
  });

  it('should have aria-hidden attribute', () => {
    const skeleton = fixture.debugElement.query(By.css('.skeleton'));
    expect((skeleton.nativeElement as HTMLElement).getAttribute('aria-hidden')).toBe('true');
  });

  it('should have presentation role', () => {
    const skeleton = fixture.debugElement.query(By.css('.skeleton'));
    expect((skeleton.nativeElement as HTMLElement).getAttribute('role')).toBe('presentation');
  });

  it('should return varying line widths for text-block', () => {
    const width0 = component.getLineWidth(0);
    const width1 = component.getLineWidth(1);
    const width2 = component.getLineWidth(2);

    expect(width0).toBe('100%');
    expect(width1).toBe('85%');
    expect(width2).toBe('70%');
  });
});

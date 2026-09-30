import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { getBaseTestProviders } from '@testing/test-helpers';
import { AppPrimaryNavComponent } from './app-primary-nav.component';
import { Icons } from '../../../core/icons/icon-registry';
import type { PrimaryNavLink } from '../../../core/models/navigation.models';

describe('AppPrimaryNavComponent', () => {
  let component: AppPrimaryNavComponent;
  let fixture: ComponentFixture<AppPrimaryNavComponent>;

  const mockLinks: PrimaryNavLink[] = [
    { label: 'Home', route: '/', icon: Icons.home },
    { label: 'Tasks', route: '/tasks', icon: Icons.listCheck },
    { label: 'Multi Route', route: ['/', 'multi', 'path'], icon: Icons.home }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppPrimaryNavComponent],
      providers: getBaseTestProviders()
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppPrimaryNavComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('links', mockLinks);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have links input', () => {
    expect(component.links()).toEqual(mockLinks);
  });

  it('should render navigation links', () => {
    const links = (fixture.nativeElement as HTMLElement).querySelectorAll('a');
    expect(links.length).toBe(3);
  });

  it('should display link labels', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Home');
    expect(compiled.textContent).toContain('Tasks');
    expect(compiled.textContent).toContain('Multi Route');
  });
});

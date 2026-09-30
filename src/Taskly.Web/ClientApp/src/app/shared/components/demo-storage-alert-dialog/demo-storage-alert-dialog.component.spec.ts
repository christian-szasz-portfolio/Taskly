import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { createSpyObj, type MockedObject, getFormTestProviders } from '@testing/test-helpers';
import { DemoStorageAlertDialogComponent } from './demo-storage-alert-dialog.component';
import type { DemoStorageAlertData } from './demo-storage-alert-dialog.interfaces';

describe('DemoStorageAlertDialogComponent', () => {
  let component: DemoStorageAlertDialogComponent;
  let fixture: ComponentFixture<DemoStorageAlertDialogComponent>;
  let dialogRefSpy: MockedObject<MatDialogRef<DemoStorageAlertDialogComponent>>;

  async function setup(data: DemoStorageAlertData): Promise<void> {
    dialogRefSpy = createSpyObj<MatDialogRef<DemoStorageAlertDialogComponent>>(['close']);

    await TestBed.configureTestingModule({
      imports: [DemoStorageAlertDialogComponent],
      providers: [
        ...getFormTestProviders(),
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DemoStorageAlertDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('renders the title and message', async () => {
    await setup({ title: 'Demo data removed', message: 'Some demo data was removed.', showReload: true });

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Demo data removed');
    expect(text).toContain('Some demo data was removed.');
  });

  it('shows a Reload action when showReload is true', async () => {
    await setup({ title: 'Demo data removed', message: 'x', showReload: true });

    const labels = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button')).map((b) =>
      b.textContent?.trim(),
    );
    expect(labels).toContain('Reload');
    expect(labels).toContain('Close');
  });

  it('hides the Reload action when showReload is false', async () => {
    await setup({ title: 'Storage full', message: 'x', showReload: false });

    const labels = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button')).map((b) =>
      b.textContent?.trim(),
    );
    expect(labels).not.toContain('Reload');
    expect(labels).toContain('Close');
  });

  it('dismiss closes the dialog', async () => {
    await setup({ title: 'Storage full', message: 'x', showReload: false });

    component.dismiss();

    expect(dialogRefSpy.close).toHaveBeenCalled();
  });
});

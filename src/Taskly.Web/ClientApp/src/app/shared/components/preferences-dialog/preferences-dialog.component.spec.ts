import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createSpyObj, type MockedObject } from '@testing/test-helpers';
import { PreferencesDialogComponent } from './preferences-dialog.component';
import { BrowserPreferencesService } from '../../../core/services/preferences/browser-preferences.service';

describe('PreferencesDialogComponent', () => {
  let component: PreferencesDialogComponent;
  let fixture: ComponentFixture<PreferencesDialogComponent>;
  let dialogRefSpy: MockedObject<MatDialogRef<unknown>>;
  let browserPreferencesSpy: MockedObject<BrowserPreferencesService>;

  beforeEach(async () => {
    dialogRefSpy = createSpyObj<MatDialogRef<unknown>>(['close']);

    browserPreferencesSpy = createSpyObj<BrowserPreferencesService>(
      ['getDarkMode', 'getAnimations', 'setDarkMode', 'setAnimations', 'applyDarkMode', 'applyAnimations']
    );
    browserPreferencesSpy.getDarkMode.mockReturnValue(false);
    browserPreferencesSpy.getAnimations.mockReturnValue(true);

    await TestBed.configureTestingModule({
      imports: [PreferencesDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: undefined },
        { provide: BrowserPreferencesService, useValue: browserPreferencesSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PreferencesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have Preferences as dialog title', () => {
    expect(component.dialogTitle).toBe('Preferences');
  });

  it('starts from the preferences stored in this browser', () => {
    expect(component.preferences()).toEqual({ darkModeEnabled: false, animationsEnabled: true });
  });

  it('offers appearance only: the demo delivers no notifications', () => {
    expect(component.categories().map((category) => category.id)).toEqual(['appearance']);
  });

  describe('getPreferencesForCategory', () => {
    it('should return appearance preferences for appearance category', () => {
      expect(component.getPreferencesForCategory('appearance').map((p) => p.id)).toEqual(['darkModeEnabled', 'animationsEnabled']);
    });

    it('should return empty array for unknown category', () => {
      expect(component.getPreferencesForCategory('unknown')).toEqual([]);
    });
  });

  describe('togglePreference', () => {
    it('should toggle preference value', () => {
      component.togglePreference('darkModeEnabled');

      expect(component.preferences().darkModeEnabled).toBe(true);
    });

    it('should apply dark mode immediately when toggled', () => {
      component.togglePreference('darkModeEnabled');

      expect(browserPreferencesSpy.applyDarkMode).toHaveBeenCalledWith(true);
    });

    it('should apply animations immediately when toggled', () => {
      component.togglePreference('animationsEnabled');

      expect(browserPreferencesSpy.applyAnimations).toHaveBeenCalledWith(false);
    });
  });

  describe('save', () => {
    it('should store the preferences in the browser', () => {
      component.save();

      expect(browserPreferencesSpy.setDarkMode).toHaveBeenCalledWith(false);
      expect(browserPreferencesSpy.setAnimations).toHaveBeenCalledWith(true);
    });

    it('should close dialog with the preferences', () => {
      component.save();

      expect(dialogRefSpy.close).toHaveBeenCalledWith({ darkModeEnabled: false, animationsEnabled: true });
    });
  });

  describe('cancel', () => {
    it('should revert appearance preferences', () => {
      component.togglePreference('darkModeEnabled');

      component.cancel();

      expect(browserPreferencesSpy.applyDarkMode).toHaveBeenLastCalledWith(false);
      expect(browserPreferencesSpy.applyAnimations).toHaveBeenLastCalledWith(true);
    });

    it('should close dialog', () => {
      component.cancel();

      expect(dialogRefSpy.close).toHaveBeenCalled();
    });
  });

  it('should have icons defined', () => {
    expect(component.icons.preferences).toBeDefined();
    expect(component.icons.appearance).toBeDefined();
  });
});

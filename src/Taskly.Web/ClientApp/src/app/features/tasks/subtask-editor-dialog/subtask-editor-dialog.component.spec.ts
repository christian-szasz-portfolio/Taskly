import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { createSpyObj, getDialogTestProviders, type MockedObject } from '@testing/test-helpers';
import { SubtaskEditorDialogComponent, type SubtaskEditorDialogData } from './subtask-editor-dialog.component';
import { IssuePriority, IssueStatus, SubtaskType, IssueResolution } from '../../../core/models/task.enums';
import type { Subtask } from '../../../core/models/task.interfaces';

describe('SubtaskEditorDialogComponent', () => {
  let component: SubtaskEditorDialogComponent;
  let fixture: ComponentFixture<SubtaskEditorDialogComponent>;
  let dialogRefSpy: MockedObject<MatDialogRef<SubtaskEditorDialogComponent>>;

  const mockSubtask: Subtask = {
    id: 'sub-1',
    issueKey: 'SUB-101',
    title: 'Test Subtask',
    description: 'Test description',
    dueAtUtc: null,
    isCompleted: false,
    createdAtUtc: new Date().toISOString(),
    updatedAtUtc: null,
    completedAtUtc: null,
    createdBy: 'user@test.com',
    assignedTo: null,
    category: null,
    priority: IssuePriority.Medium,
    status: IssueStatus.Open,
    subtaskType: SubtaskType.Development,
    labels: [],
    components: [],
    epicKey: null,
    resolution: IssueResolution.NotFixed,
    reporter: null,
    position: 0,
    parentTaskItemId: 'wf-1',
    timeSpentMinutes: 0
  };

  const dialogData: SubtaskEditorDialogData = { subtask: mockSubtask };

  beforeEach(async () => {
    dialogRefSpy = createSpyObj(['close']);

    await TestBed.configureTestingModule({
      imports: [SubtaskEditorDialogComponent],
      providers: [
        ...getDialogTestProviders(),
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: dialogData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubtaskEditorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return "Edit Subtask" as dialog title', () => {
    expect(component.dialogTitle).toBe('Edit Subtask');
  });

  it('should have subtask data', () => {
    expect(component.data.subtask.id).toBe('sub-1');
    expect(component.data.subtask.title).toBe('Test Subtask');
  });

  it('should close dialog with the edit on handleSubmit', () => {
    const payload = { title: 'Renamed Subtask', priority: IssuePriority.High };

    component.handleSubmit(payload);

    expect(dialogRefSpy.close).toHaveBeenCalledWith(payload);
  });

  it('should close dialog without result on handleCancel', () => {
    component.handleCancel();

    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });
});

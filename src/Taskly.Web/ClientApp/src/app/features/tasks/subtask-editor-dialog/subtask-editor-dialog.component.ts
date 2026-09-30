import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import type { Subtask } from '../../../core/models/task.interfaces';
import type { UpdateSubtaskPayload } from '../../../core/models/task.types';
import { SubtaskEditorFormComponent } from './subtask-editor-form.component';
import { DialogHeaderComponent } from '../../../shared/components/dialog-header/dialog-header.component';
import { BaseDialogComponent } from '../../../shared/components/base';

export interface SubtaskEditorDialogData {
  subtask: Subtask;
  availableLabels?: string[];
  availableComponents?: string[];
}

export type SubtaskEditorDialogResult = UpdateSubtaskPayload;

@Component({
  selector: 'app-subtask-editor-dialog',
  standalone: true,
  imports: [MatDialogModule, SubtaskEditorFormComponent, DialogHeaderComponent],
  templateUrl: './subtask-editor-dialog.component.html',
  styleUrl: './subtask-editor-dialog.component.scss'
})
export class SubtaskEditorDialogComponent extends BaseDialogComponent<SubtaskEditorDialogData, SubtaskEditorDialogResult> {
  public readonly dialogTitle = 'Edit Subtask';

  public handleSubmit(result: SubtaskEditorDialogResult): void {
    this.closeWithResult(result);
  }
}

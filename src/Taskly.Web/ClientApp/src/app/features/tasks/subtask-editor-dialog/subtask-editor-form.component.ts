import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule, type MatChipInputEvent } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule, type MatSelectChange } from '@angular/material/select';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Icons, type IconDefinition } from '../../../core/icons/icon-registry';
import { FormField, type FieldTree, type SchemaPath, form, max, maxLength, min, required, submit as submitForm } from '@angular/forms/signals';
import { IssuePriority, IssueResolution, IssueStatus, SubtaskType } from '../../../core/models/task.enums';
import type { Subtask } from '../../../core/models/task.interfaces';
import type { UpdateSubtaskPayload } from '../../../core/models/task.types';
import { DatePickerInputComponent } from '../../../shared/components/date-picker/date-picker-input.component';
import { RichTextEditorComponent } from '../../../shared/components/rich-text-editor/rich-text-editor.component';
import { ComboBoxComponent, type ComboBoxOption } from '../../../shared/components/combo-box/combo-box.component';
import { FileAttachmentListComponent } from '../../../shared/components/file-attachment-list/file-attachment-list.component';
import { UserApiService } from '../../../core/services/user/user-api.service';
import { TASK_EDITOR_PRIORITY_OPTIONS } from '../models/task-editor.constants';
import { normalizeComponents, normalizeLabels, normalizeNullableText, normalizePriorityValue, normalizeSubtaskTypeValue } from '../../../core/utilities/task.utility';
import { TaskPresentationStore } from '../services/task-presentation.service';
import { TaskStore } from '../../../core/state/task.store';
import { ProjectStore } from '../../../core/state/project.store';
import { BaseFormComponent } from '../../../shared/components/base';

interface SubtaskEditorFormModel {
  title: string;
  description: string;
  dueAtUtc: Date | null;
  assignedTo: string;
  reporter: string;
  epicKey: string;
  priority: IssuePriority;
  subtaskType: SubtaskType;
  components: string[];
  labels: string[];
  resolution: IssueResolution;
}

interface SubtaskTypeOption {
  value: SubtaskType;
  label: string;
  icon: IconDefinition;
  color: string;
}

interface ResolutionOption {
  value: IssueResolution;
  label: string;
  icon: IconDefinition;
  color: string;
}

@Component({
  selector: 'app-subtask-editor-form',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    FontAwesomeModule,
    FormField,
    DatePickerInputComponent,
    RichTextEditorComponent,
    ComboBoxComponent,
    FileAttachmentListComponent
  ],
  templateUrl: './subtask-editor-form.component.html',
  styleUrl: './subtask-editor-form.component.scss'
})
export class SubtaskEditorFormComponent extends BaseFormComponent<UpdateSubtaskPayload> {
  private readonly presentation = inject(TaskPresentationStore);
  private readonly taskStore = inject(TaskStore);
  private readonly projectStore = inject(ProjectStore);
  private readonly userService = inject(UserApiService);

  public readonly subtask = input<Subtask | null>(null);
  public readonly availableLabels = input<string[]>([]);
  public readonly availableComponents = input<string[]>([]);

  // State for image uploading

  public readonly priorityOptions = signal(TASK_EDITOR_PRIORITY_OPTIONS);
  private readonly baseSubtaskTypeOptions = [
    { value: SubtaskType.Development, label: 'Development' },
    { value: SubtaskType.Translations, label: 'Translations' },
    { value: SubtaskType.BugInDevelopment, label: 'Bug in Development' }
  ] as const;

  public readonly subtaskTypeOptions = signal<SubtaskTypeOption[]>(
    this.baseSubtaskTypeOptions.map((option) => this.enhanceSubtaskTypeOption(option))
  );

  private readonly baseResolutionOptions = [
    { value: IssueResolution.Fixed, label: 'Fixed' },
    { value: IssueResolution.Closed, label: 'Closed' }
  ] as const;

  public readonly resolutionOptions = signal<ResolutionOption[]>(
    this.baseResolutionOptions.map((option) => this.enhanceResolutionOption(option))
  );

  public readonly chipSeparatorKeys: readonly number[] = [ENTER, COMMA];
  public readonly icons = signal({
    close: Icons.close,
    attachments: Icons.attachment
  });

  private readonly formModel = signal<SubtaskEditorFormModel>(this.createFormModel(null));
  private lastHydratedToken: string | null = null;
  private hasRequestedTasks = false;

  public readonly subtaskForm = form(this.formModel, (path) => {
    required(path.title, { message: 'Title is required.' });
    maxLength(path.title, 120);
    maxLength(path.description, 4096);
    required(path.assignedTo, { message: 'Assignee is required.' });
    maxLength(path.assignedTo, 256);
    maxLength(path.reporter, 256);
    maxLength(path.epicKey, 100);
    // priority holds the numeric IssuePriority enum; min/max constrain to number | null
    // and SchemaPath is invariant in its value type, so the path is cast to satisfy it.
    const priorityPath = path.priority as unknown as SchemaPath<number | null>;
    min(priorityPath, 1);
    max(priorityPath, 5);
  });

  public readonly showResolutionField = computed(() => {
    const currentSubtask = this.subtask();
    if (!currentSubtask) {
      return false;
    }

    return currentSubtask.status === IssueStatus.Done &&
      (currentSubtask.resolution === IssueResolution.Fixed || currentSubtask.resolution === IssueResolution.Closed);
  });

  public readonly selectedResolutionOption = computed<ResolutionOption | null>(() => {
    const current = this.subtaskForm.resolution().value();
    return this.resolutionOptions().find((option) => option.value === current) ?? null;
  });

  public readonly selectedSubtaskTypeOption = computed<SubtaskTypeOption | null>(() => {
    const current = this.subtaskForm.subtaskType().value();
    return this.subtaskTypeOptions().find((option) => option.value === current) ?? null;
  });

  private readonly availableTasks = computed(() => this.taskStore.vm().todos);

  public readonly userComboOptions = computed<ComboBoxOption[]>(() => {
    // Get project contributors from the UserApiService
    // Current user appears first, followed by other contributors
    const contributorOptions = this.userService.getUserOptions();

    // Also include any users from existing subtask data that might not be contributors anymore
    const currentSubtask = this.subtask();
    const seenValues = new Set(contributorOptions.map((opt) => opt.value.toLowerCase()));
    const additionalOptions: ComboBoxOption[] = [];

    const addIfMissing = (email: string | null | undefined): void => {
      if (!email) {
        return;
      }
      const normalized = email.trim();
      if (!normalized || seenValues.has(normalized.toLowerCase())) {
        return;
      }
      seenValues.add(normalized.toLowerCase());

      // Check if this is a former contributor (not currently active)
      if (!this.userService.isActiveContributor(normalized)) {
        additionalOptions.push({
          value: normalized,
          label: `${normalized} (Former Contributor)`,
          description: 'No longer a project contributor'
        });
      } else {
        additionalOptions.push({ value: normalized, label: normalized });
      }
    };

    // Include assigned users from current subtask that might be former contributors
    if (currentSubtask) {
      addIfMissing(currentSubtask.assignedTo);
      addIfMissing(currentSubtask.reporter);
    }

    return [...contributorOptions, ...additionalOptions];
  });

  public readonly labelComboOptions = computed<ComboBoxOption[]>(() => {
    // Prefer explicit input, fall back to active project's labels
    const inputLabels = this.availableLabels();
    const projectLabels = inputLabels.length > 0
      ? inputLabels
      : this.projectStore.currentProject()?.labels ?? [];
    return projectLabels.map((label) => ({ value: label, label }));
  });

  public readonly componentComboOptions = computed<ComboBoxOption[]>(() => {
    // Prefer explicit input, fall back to active project's components
    const inputComponents = this.availableComponents();
    const projectComponents = inputComponents.length > 0
      ? inputComponents
      : this.projectStore.currentProject()?.components ?? [];
    return projectComponents.map((component) => ({ value: component, label: component }));
  });

  public readonly currentSubtaskId = computed(() => this.subtask()?.id ?? null);

  private readonly hydrateFormEffect = effect(() => {
    const subtask = this.subtask();
    const token = subtask ? `${subtask.id}-${subtask.updatedAtUtc ?? ''}` : null;

    if (token === this.lastHydratedToken) {
      return;
    }

    this.lastHydratedToken = token;
    const model = this.createFormModel(subtask);
    this.applyModel(model);
  });

  private readonly ensureTaskCatalogEffect = effect(() => {
    const snapshot = this.taskStore.vm();
    if (snapshot.loading || snapshot.todos.length > 0 || this.hasRequestedTasks) {
      return;
    }

    this.hasRequestedTasks = true;
    this.taskStore.load();
  });

  public submit(event?: Event): void {
    event?.preventDefault();

    // eslint-disable-next-line @typescript-eslint/require-await
    void submitForm(this.subtaskForm, async () => {
      const current = this.formModel();
      const sanitizedComponents = normalizeComponents(current.components);
      const sanitizedLabels = normalizeLabels(current.labels);

      const updatePayload: UpdateSubtaskPayload = {
        title: current.title.trim(),
        description: this.normalizeRichText(current.description),
        dueAtUtc: current.dueAtUtc ? current.dueAtUtc.toISOString() : null,
        assignedTo: current.assignedTo.trim(),
        reporter: normalizeNullableText(current.reporter),
        category: sanitizedComponents[0] ?? null,
        priority: current.priority,
        subtaskType: current.subtaskType,
        components: sanitizedComponents,
        labels: sanitizedLabels,
        epicKey: normalizeNullableText(current.epicKey)
      };

      const currentSubtask = this.subtask();
      if (currentSubtask?.status === IssueStatus.Done) {
        updatePayload.resolution = current.resolution;
      }

      this.submitted.emit(updatePayload);
    });
  }

  public handlePriorityChange(event: MatSelectChange): void {
    const nextValue = this.extractPriority(event.value);
    this.subtaskForm.priority().value.set(nextValue);
  }

  public handleSubtaskTypeChange(event: MatSelectChange): void {
    const nextValue = this.extractSubtaskType(event.value);
    this.subtaskForm.subtaskType().value.set(nextValue);
  }

  public handleResolutionChange(event: MatSelectChange): void {
    const nextValue = this.extractResolution(event.value);
    this.subtaskForm.resolution().value.set(nextValue);
  }

  public handleLabelsChange(event: MatSelectChange): void {
    const values = event.value as string[];
    this.subtaskForm.labels().value.set([...values]);
  }

  public handleComponentsChange(event: MatSelectChange): void {
    const values = event.value as string[];
    this.subtaskForm.components().value.set([...values]);
  }

  public handleDescriptionChange(value: string): void {
    this.subtaskForm.description().value.set(value ?? '');
  }

  public descriptionLength(): number {
    return this.stripHtml(this.subtaskForm.description().value()).trim().length;
  }

  public addComponentChip(event: MatChipInputEvent): void {
    this.addChipValue(this.subtaskForm.components, event.value ?? '', 80);
    event.chipInput?.clear();
  }

  public removeComponentChip(tag: string): void {
    this.removeChipValue(this.subtaskForm.components, tag);
  }

  public addLabelChip(event: MatChipInputEvent): void {
    this.addChipValue(this.subtaskForm.labels, event.value ?? '', 50);
    event.chipInput?.clear();
  }

  public removeLabelChip(tag: string): void {
    this.removeChipValue(this.subtaskForm.labels, tag);
  }

  public hasError(field: FieldTree<unknown>, kind: string): boolean {
    return field().errors().some((error) => error.kind === kind);
  }

  private enhanceSubtaskTypeOption(option: { value: SubtaskType; label: string }) {
    return {
      ...option,
      icon: this.presentation.subtaskTypeIcon(option.value),
      color: this.presentation.subtaskTypeColor(option.value)
    };
  }

  private enhanceResolutionOption(option: { value: IssueResolution; label: string }) {
    return {
      ...option,
      icon: this.presentation.resolutionIcon(option.value),
      color: this.presentation.resolutionColor(option.value)
    };
  }

  private createFormModel(subtask: Subtask | null): SubtaskEditorFormModel {
    return {
      title: subtask?.title ?? '',
      description: subtask?.description ?? '',
      dueAtUtc: subtask?.dueAtUtc ? new Date(subtask.dueAtUtc) : null,
      assignedTo: subtask?.assignedTo ?? '',
      reporter: subtask?.reporter ?? '',
      epicKey: subtask?.epicKey ?? '',
      priority: normalizePriorityValue(subtask?.priority ?? null),
      subtaskType: normalizeSubtaskTypeValue(subtask?.subtaskType ?? null),
      components: subtask?.components?.length
        ? [...subtask.components]
        : subtask?.category
          ? [subtask.category]
          : [],
      labels: [...(subtask?.labels ?? [])],
      resolution: subtask?.resolution ?? IssueResolution.NotFixed
    };
  }

  private applyModel(model: SubtaskEditorFormModel): void {
    this.subtaskForm.title().value.set(model.title);
    this.subtaskForm.description().value.set(model.description ?? '');
    this.subtaskForm.dueAtUtc().value.set(model.dueAtUtc);
    this.subtaskForm.assignedTo().value.set(model.assignedTo);
    this.subtaskForm.reporter().value.set(model.reporter);
    this.subtaskForm.epicKey().value.set(model.epicKey);
    this.subtaskForm.priority().value.set(model.priority);
    this.subtaskForm.subtaskType().value.set(model.subtaskType);
    this.subtaskForm.components().value.set([...model.components]);
    this.subtaskForm.labels().value.set([...model.labels]);
    this.subtaskForm.resolution().value.set(model.resolution);
  }

  private addChipValue(field: FieldTree<string[]>, rawValue: string, maxLengthValue: number): void {
    const normalized = normalizeNullableText(rawValue);
    if (!normalized) {
      return;
    }

    const truncated = normalized.length > maxLengthValue ? normalized.slice(0, maxLengthValue) : normalized;
    const control = field();
    const current = control.value();
    if (current.includes(truncated)) {
      return;
    }

    control.value.set([...current, truncated]);
  }

  private removeChipValue(field: FieldTree<string[]>, target: string): void {
    const control = field();
    const remaining = control.value().filter((label) => label !== target);
    control.value.set(remaining);
  }

  private normalizeRichText(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    const text = this.stripHtml(value).trim();
    return text.length ? value : null;
  }

  private stripHtml(value: string): string {
    if (!value) {
      return '';
    }

    if (typeof document !== 'undefined') {
      const container = document.createElement('div');
      container.innerHTML = value;
      return container.textContent ?? container.innerText ?? '';
    }

    return value.replace(/<[^>]*>/g, ' ');
  }

  private extractPriority(value: unknown): IssuePriority {
    if (typeof value === 'string' && Object.values(IssuePriority).includes(value as IssuePriority)) {
      return value as IssuePriority;
    }
    return IssuePriority.Medium;
  }

  private extractSubtaskType(value: unknown): SubtaskType {
    if (typeof value === 'string' && Object.values(SubtaskType).includes(value as SubtaskType)) {
      return value as SubtaskType;
    }
    return SubtaskType.Development;
  }

  private extractResolution(value: unknown): IssueResolution {
    if (typeof value === 'string' && Object.values(IssueResolution).includes(value as IssueResolution)) {
      return value as IssueResolution;
    }
    return IssueResolution.NotFixed;
  }
}

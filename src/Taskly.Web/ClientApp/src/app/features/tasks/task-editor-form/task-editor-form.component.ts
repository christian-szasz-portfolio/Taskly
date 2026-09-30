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
import { IssuePriority, IssueResolution, IssueStatus, IssueType } from '../../../core/models/task.enums';
import type { TaskItem } from '../../../core/models/task.interfaces';
import type { UpdateTaskPayload } from '../../../core/models/task.types';
import { DatePickerInputComponent } from '../../../shared/components/date-picker/date-picker-input.component';
import { RichTextEditorComponent } from '../../../shared/components/rich-text-editor/rich-text-editor.component';
import { ComboBoxComponent, type ComboBoxOption } from '../../../shared/components/combo-box/combo-box.component';
import { FileAttachmentListComponent } from '../../../shared/components/file-attachment-list/file-attachment-list.component';
import { UserApiService } from '../../../core/services/user/user-api.service';
import { TASK_EDITOR_PRIORITY_OPTIONS } from '../models/task-editor.constants';
import { normalizeComponents, normalizeLabels, normalizeNullableText, normalizePriorityValue } from '../../../core/utilities/task.utility';
import { TaskPresentationStore } from '../services/task-presentation.service';
import { TaskStore } from '../../../core/state/task.store';
import { ProjectStore } from '../../../core/state/project.store';
import { BaseFormComponent } from '../../../shared/components/base';

const EPIC_SYSTEM_OWNER = 'System';

interface TaskEditorFormModel {
  title: string;
  description: string;
  dueAtUtc: Date | null;
  assignedTo: string;
  reporter: string;
  epicKey: string;
  priority: IssuePriority;
  issueType: IssueType;
  components: string[];
  labels: string[];
  linkedTaskId: string;
  resolution: IssueResolution;
  projectId: string;
}

interface IssueTypeOption {
  value: IssueType;
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
  selector: 'app-task-editor-form',
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
  templateUrl: './task-editor-form.component.html',
  styleUrl: './task-editor-form.component.scss'
})
export class TaskEditorFormComponent extends BaseFormComponent<UpdateTaskPayload> {
  private readonly presentation = inject(TaskPresentationStore);
  private readonly taskStore = inject(TaskStore);
  private readonly projectStore = inject(ProjectStore);
  private readonly userService = inject(UserApiService);

  public readonly task = input<TaskItem | null>(null);
  public readonly availableLabels = input<string[]>([]);
  public readonly availableComponents = input<string[]>([]);
  public readonly projectId = input<string | null>(null);

  public readonly priorityOptions = signal(TASK_EDITOR_PRIORITY_OPTIONS);
  private readonly baseIssueTypeOptions = [
    { value: IssueType.ProblemCase, label: 'Problem Case' },
    { value: IssueType.Bug, label: 'Bug' },
    { value: IssueType.Incident, label: 'Incident' },
    { value: IssueType.Story, label: 'Story' },
    { value: IssueType.Epic, label: 'Epic' },
    { value: IssueType.Task, label: 'Task' },
    { value: IssueType.TechnicalTask, label: 'Technical Task' },
    { value: IssueType.Improvement, label: 'Improvement' },
    { value: IssueType.Documentation, label: 'Documentation' }
  ] as const;

  public readonly issueTypeOptions = signal<IssueTypeOption[]>(
    this.baseIssueTypeOptions.map((option) => this.enhanceIssueTypeOption(option))
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
  public readonly epicOwnerLabel = EPIC_SYSTEM_OWNER;

  private readonly formModel = signal<TaskEditorFormModel>(this.createFormModel(null));
  private lastHydratedToken: string | null = null;
  private hasRequestedTasks = false;

  public readonly taskForm = form(this.formModel, (path) => {
    required(path.title, { message: 'Title is required.' });
    maxLength(path.title, 120);
    maxLength(path.description, 4096);
    required(path.assignedTo, { message: 'Assignee is required.' });
    maxLength(path.assignedTo, 256);
    maxLength(path.reporter, 256);
    maxLength(path.epicKey, 100);
    maxLength(path.linkedTaskId, 64);
    // priority holds the numeric IssuePriority enum; min/max constrain to number | null
    // and SchemaPath is invariant in its value type, so the path is cast to satisfy it.
    const priorityPath = path.priority as unknown as SchemaPath<number | null>;
    min(priorityPath, 1);
    max(priorityPath, 5);
    required(path.projectId, { message: 'Project is required.' });
  });

  public readonly isEpicIssueType = computed(() => this.taskForm.issueType().value() === IssueType.Epic);

  public readonly showResolutionField = computed(() => {
    const currentTask = this.task();
    if (!currentTask) {
      return false;
    }

    // Only when the task is Done, with a resolution of Fixed or Closed
    return currentTask.status === IssueStatus.Done &&
      (currentTask.resolution === IssueResolution.Fixed || currentTask.resolution === IssueResolution.Closed);
  });

  public readonly selectedResolutionOption = computed<ResolutionOption | null>(() => {
    const current = this.taskForm.resolution().value();
    return this.resolutionOptions().find((option) => option.value === current) ?? null;
  });

  public readonly selectedIssueTypeOption = computed<IssueTypeOption | null>(() => {
    const current = this.taskForm.issueType().value();
    return this.issueTypeOptions().find((option) => option.value === current) ?? null;
  });

  private readonly availableTasks = computed(() => this.taskStore.vm().todos);

  public readonly epicComboOptions = computed<ComboBoxOption[]>(() => {
    const seen = new Set<string>();
    const options: ComboBoxOption[] = [];

    for (const item of this.availableTasks()) {
      if (item.issueType !== IssueType.Epic) {
        continue;
      }

      const epicKey = item.issueKey?.trim() ?? '';
      const fallbackLabel = item.title?.trim() ?? '';
      const value = epicKey || fallbackLabel;
      if (!value || seen.has(value)) {
        continue;
      }

      seen.add(value);
      options.push({ value, label: value, description: epicKey && fallbackLabel ? fallbackLabel : undefined });
    }

    return options.sort((left, right) => left.label.localeCompare(right.label));
  });

  public readonly userComboOptions = computed<ComboBoxOption[]>(() => {
    // Get project contributors from the UserApiService
    // Current user appears first, followed by other contributors
    const contributorOptions = this.userService.getUserOptions();

    // Also include any users from existing task data that might not be contributors anymore
    const currentTask = this.task();
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

    // Include assigned users from current task that might be former contributors
    if (currentTask) {
      addIfMissing(currentTask.assignedTo);
      addIfMissing(currentTask.reporter);
    }

    return [...contributorOptions, ...additionalOptions];
  });

  public readonly linkedTaskComboOptions = computed<ComboBoxOption[]>(() => {
    const currentId = this.task()?.id ?? null;
    const options = this.availableTasks()
      .filter((item) => item.id !== currentId)
      .map((item) => {
        const hasKey = !!item.issueKey;
        return {
          value: item.id,
          label: hasKey ? `${item.issueKey} — ${item.title}` : item.title,
          description: hasKey ? item.title : undefined
        } satisfies ComboBoxOption;
      });

    return options.sort((left, right) => left.label.localeCompare(right.label));
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

  public readonly hasProjectConstraints = computed(() =>
    this.labelComboOptions().length > 0 || this.componentComboOptions().length > 0
  );

  public readonly currentTaskId = computed(() => this.task()?.id ?? null);

  private readonly hydrateFormEffect = effect(() => {
    const task = this.task();
    const token = task ? `${task.id}-${task.updatedAtUtc ?? ''}` : null;

    if (token === this.lastHydratedToken) {
      return;
    }

    this.lastHydratedToken = token;
    const model = this.createFormModel(task);
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

  private readonly enforceEpicDefaultsEffect = effect(() => {
    if (!this.isEpicIssueType()) {
      return;
    }

    const assignedField = this.taskForm.assignedTo();
    if (assignedField.value() !== EPIC_SYSTEM_OWNER) {
      assignedField.value.set(EPIC_SYSTEM_OWNER);
    }

    const reporterField = this.taskForm.reporter();
    if (reporterField.value() !== EPIC_SYSTEM_OWNER) {
      reporterField.value.set(EPIC_SYSTEM_OWNER);
    }

    const componentsField = this.taskForm.components();
    if (componentsField.value().length > 0) {
      componentsField.value.set([]);
    }

    const labelsField = this.taskForm.labels();
    if (labelsField.value().length > 0) {
      labelsField.value.set([]);
    }

    const epicKeyField = this.taskForm.epicKey();
    if (epicKeyField.value()) {
      epicKeyField.value.set('');
    }

    const linkedField = this.taskForm.linkedTaskId();
    if (linkedField.value()) {
      linkedField.value.set('');
    }
  });

  public async submit(event?: Event): Promise<void> {
    event?.preventDefault();

    await submitForm(this.taskForm, async () => {
      await Promise.resolve();
      const current = this.formModel();
      const isEpic = current.issueType === IssueType.Epic;
      const sanitizedComponents = isEpic ? [] : normalizeComponents(current.components);
      const sanitizedLabels = isEpic ? [] : normalizeLabels(current.labels);

      // projectId is required - validation ensures it's present
      const projectIdValue = current.projectId.trim();
      if (!projectIdValue) {
        throw new Error('Project is required.');
      }

      // The status is left out, so an edit never moves the task
      const payload: UpdateTaskPayload = {
        title: current.title.trim(),
        description: this.normalizeRichText(current.description),
        dueAtUtc: current.dueAtUtc ? current.dueAtUtc.toISOString() : null,
        assignedTo: isEpic ? EPIC_SYSTEM_OWNER : current.assignedTo.trim(),
        reporter: isEpic ? EPIC_SYSTEM_OWNER : normalizeNullableText(current.reporter),
        category: isEpic ? null : sanitizedComponents[0] ?? null,
        priority: current.priority,
        issueType: current.issueType,
        components: isEpic ? null : sanitizedComponents,
        labels: isEpic ? null : sanitizedLabels,
        epicKey: isEpic ? null : normalizeNullableText(current.epicKey),
        linkedTaskId: isEpic ? null : this.resolveLinkedTaskId(current.linkedTaskId),
        projectId: projectIdValue
      };

      // Include resolution if editing a Done status item
      const currentTask = this.task();
      if (currentTask?.status === IssueStatus.Done) {
        payload.resolution = current.resolution;
      }

      this.submitted.emit(payload);
    });
  }

  public handlePriorityChange(event: MatSelectChange): void {
    const nextValue = this.extractPriority(event.value);
    this.taskForm.priority().value.set(nextValue);
  }

  public handleIssueTypeChange(event: MatSelectChange): void {
    const nextValue = this.extractIssueType(event.value);
    this.taskForm.issueType().value.set(nextValue);
  }

  public handleResolutionChange(event: MatSelectChange): void {
    const nextValue = this.extractResolution(event.value);
    this.taskForm.resolution().value.set(nextValue);
  }

  public handleLabelsChange(event: MatSelectChange): void {
    const values = event.value as string[];
    this.taskForm.labels().value.set([...values]);
  }

  public handleComponentsChange(event: MatSelectChange): void {
    const values = event.value as string[];
    this.taskForm.components().value.set([...values]);
  }

  public handleDescriptionChange(value: string): void {
    this.taskForm.description().value.set(value ?? '');
  }

  public descriptionLength(): number {
    return this.stripHtml(this.taskForm.description().value()).trim().length;
  }

  public addComponentChip(event: MatChipInputEvent): void {
    this.addChipValue(this.taskForm.components, event.value ?? '', 80);
    event.chipInput?.clear();
  }

  public removeComponentChip(tag: string): void {
    this.removeChipValue(this.taskForm.components, tag);
  }

  public addLabelChip(event: MatChipInputEvent): void {
    this.addChipValue(this.taskForm.labels, event.value ?? '', 50);
    event.chipInput?.clear();
  }

  public removeLabelChip(tag: string): void {
    this.removeChipValue(this.taskForm.labels, tag);
  }

  public hasError(field: FieldTree<unknown>, kind: string): boolean {
    return field().errors().some((error) => error.kind === kind);
  }

  private resolveLinkedTaskId(rawValue: string | null | undefined): string | null {
    const normalized = normalizeNullableText(rawValue);
    if (!normalized) {
      return null;
    }

    if (this.linkedTaskComboOptions().some((option) => option.value === normalized)) {
      return normalized;
    }

    return this.task()?.linkedTaskId === normalized ? normalized : null;
  }

  private enhanceIssueTypeOption(option: { value: IssueType; label: string }) {
    return {
      ...option,
      icon: this.presentation.issueTypeIcon(option.value),
      color: this.presentation.issueTypeColor(option.value)
    };
  }

  private enhanceResolutionOption(option: { value: IssueResolution; label: string }) {
    return {
      ...option,
      icon: this.presentation.resolutionIcon(option.value),
      color: this.presentation.resolutionColor(option.value)
    };
  }

  private createFormModel(task: TaskItem | null): TaskEditorFormModel {
    // Use task's projectId if available, otherwise use the input projectId
    const resolvedProjectId = task?.projectId ?? this.projectId() ?? '';
    return {
      title: task?.title ?? '',
      description: task?.description ?? '',
      dueAtUtc: task?.dueAtUtc ? new Date(task.dueAtUtc) : null,
      assignedTo: task?.assignedTo ?? '',
      reporter: task?.reporter ?? '',
      epicKey: task?.epicKey ?? '',
      priority: normalizePriorityValue(task?.priority ?? null),
      issueType: task?.issueType ?? IssueType.Task,
      components: task?.components?.length
        ? [...task.components]
        : task?.category
          ? [task.category]
          : [],
      labels: [...(task?.labels ?? [])],
      linkedTaskId: task?.linkedTaskId ?? '',
      resolution: task?.resolution ?? IssueResolution.NotFixed,
      projectId: resolvedProjectId
    };
  }

  private applyModel(model: TaskEditorFormModel): void {
    this.taskForm.title().value.set(model.title);
    this.taskForm.description().value.set(model.description ?? '');
    this.taskForm.dueAtUtc().value.set(model.dueAtUtc);
    this.taskForm.assignedTo().value.set(model.assignedTo);
    this.taskForm.reporter().value.set(model.reporter);
    this.taskForm.epicKey().value.set(model.epicKey);
    this.taskForm.priority().value.set(model.priority);
    this.taskForm.issueType().value.set(model.issueType);
    this.taskForm.components().value.set([...model.components]);
    this.taskForm.labels().value.set([...model.labels]);
    this.taskForm.linkedTaskId().value.set(model.linkedTaskId);
    this.taskForm.resolution().value.set(model.resolution);
    this.taskForm.projectId().value.set(model.projectId);
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

  private extractIssueType(value: unknown): IssueType {
    if (typeof value === 'string' && Object.values(IssueType).includes(value as IssueType)) {
      return value as IssueType;
    }
    return IssueType.Task;
  }

  private extractResolution(value: unknown): IssueResolution {
    if (typeof value === 'string' && Object.values(IssueResolution).includes(value as IssueResolution)) {
      return value as IssueResolution;
    }
    return IssueResolution.NotFixed;
  }
}

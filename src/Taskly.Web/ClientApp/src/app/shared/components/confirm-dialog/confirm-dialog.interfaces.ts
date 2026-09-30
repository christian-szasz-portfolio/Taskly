import type { ConfirmDialogResult } from './confirm-dialog.enums';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  defaultResult?: ConfirmDialogResult;
}

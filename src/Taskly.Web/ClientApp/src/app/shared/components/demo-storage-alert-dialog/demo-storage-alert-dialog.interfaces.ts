/** Data for the demo storage warning modal (external deletion or full storage quota). */
export interface DemoStorageAlertData {
  /** Header title. */
  title: string;
  /** Body message shown to the visitor. */
  message: string;
  /** Whether to offer a "Reload" action — true for deletion (reload restores/re-seeds), false for quota. */
  showReload: boolean;
}

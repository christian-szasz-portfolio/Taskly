/**
 * Reusable CSS/aria-label selectors for e2e tests.
 */
export const Selectors = {
  // --- Auth pages ---
  loginForm: '#login-form',
  loginEmail: '#login-email',
  loginPassword: '#login-password',
  submitButton: 'button[type="submit"]',
  forgotPasswordLink: 'a[routerLink="/auth/forgot-password"]',
  createAccountLink: 'a[routerLink="/auth/register"]',
  showPasswordButton: '[aria-label="Show password"]',
  hidePasswordButton: '[aria-label="Hide password"]',
  forgotPasswordForm: '#forgot-password-form',
  forgotPasswordEmail: '#forgot-password-email',
  registerForm: '#register-form',
  registerFirstName: '#register-firstName',
  registerLastName: '#register-lastName',
  registerEmail: '#register-email',
  registerPassword: '#register-password',
  registerConfirmPassword: '#register-confirmPassword',

  // --- License selection ---
  licenseCard: '.license-card',
  licenseSubmitButton: '.submit-button',
  selectedLicense: '.license-card.selected',

  // --- App shell ---
  appShellTopbar: '.app-shell__topbar',
  brandTitle: '.brand-title',
  primaryNav: 'nav[aria-label="Primary navigation"]',
  notificationsButton: '[aria-label="Notifications"]',
  accountMenuButton: '[aria-label="Account menu"]',
  accountMenu: '.account-menu',
  accountMenuItem: '.account-menu__item',

  // --- Home page ---
  homePage: '.home-page',
  welcomeHeading: '.home-page h1',
  createProjectButton: '[aria-label="Create new project"]',
  projectList: 'app-project-list',
  emptyState: 'app-empty-state',

  // --- Project cards ---
  activateProjectButton: '[aria-label="Activate project"]',
  deactivateProjectButton: '[aria-label="Deactivate project"]',
  editProjectButton: '[aria-label="Edit project"]',
  expandDetailsButton: '[aria-label="Expand details"]',
  collapseDetailsButton: '[aria-label="Collapse details"]',

  // --- Kanban board ---
  kanbanBoard: '.kanban',
  heroSection: 'app-task-hero-section',
  createTaskButton: '[aria-label="Create task"]',
  refreshBoardButton: '[aria-label="Refresh board"]',
  collapseSummary: '[aria-label="Collapse summary"]',
  expandSummary: '[aria-label="Expand summary"]',
  kanbanParentRow: 'app-kanban-parent-row',
  kanbanOtherRow: 'app-kanban-other-row',
  detailPanel: 'app-task-detail-panel',
  toggleRow: '[aria-label="Toggle row"]',
  viewInSidePanel: '[aria-label="View in side panel"]',
  openInNewTab: '[aria-label="Open in new tab"]',

  // --- Task detail page ---
  taskDetailPage: '.task-detail-page',
  issueKey: '.task-detail-page__issue-key',
  detailTitle: '.task-detail-page__title',
  createSubtaskButton: '[aria-label="Create subtask"]',
  editTaskButton: '[aria-label="Edit task"]',
  viewTaskButton: '[aria-label="View task"]',

  // --- Task editor form ---
  editorFormSubmit: 'button[type="submit"]',
  editorFormCancel: 'button[type="button"]',
  componentChips: '[aria-label="Components"]',
  labelChips: '[aria-label="Labels"]',

  // --- Catalog pages ---
  catalogPage: 'app-task-catalog-page',
  catalogCard: 'app-task-catalog-card',

  // --- Comments ---
  commentSection: 'app-comment-section',
  replyToComment: '[aria-label="Reply to comment"]',
  commentOptions: '[aria-label="Comment options"]',
  addReaction: '[aria-label="Add reaction"]',

  // --- Dialog ---
  dialogHeader: 'app-dialog-header',
  closeDialog: '[aria-label="Close dialog"]',

  // --- Misc ---
  skeletonLoader: 'app-skeleton-loader',
  loadingSpinner: 'mat-spinner',
  matCard: 'mat-card',
  matMenu: 'mat-menu',
  routerOutlet: 'router-outlet',

  // --- Notification items ---
  notificationItem: '.notification-item',
  notificationEmpty: '.notification-empty',
  markAllReadButton: '.mark-all-btn',
} as const;

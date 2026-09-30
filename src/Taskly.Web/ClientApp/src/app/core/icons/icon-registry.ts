/**
 * Centralized icon registry for the application.
 * All FontAwesome icons used across the app are imported here once,
 * providing tree-shaking benefits while reducing boilerplate in individual components.
 *
 * Usage in components:
 * ```typescript
 * import {
 *
 * @Component({...})
 * export class MyComponent {
 *   protected readonly icons = Icons;
 * }
 * ```
 *
 * In templates:
 * ```html
 * <fa-icon [icon]="icons.close"></fa-icon>
 * ```
 */
import {
  // Common UI icons
  faXmark,
  faTimes,
  faCheck,
  faPlus,
  faChevronDown,
  faChevronUp,
  faChevronLeft,
  faChevronRight,
  faArrowLeft,
  faArrowUpRightFromSquare,
  faExternalLinkAlt,
  faEye,
  faSearch,
  faRefresh,
  faRotateRight,
  faArrowsRotate,
  faSpinner,
  faGripLinesVertical,
  faEllipsisV,

  // Status/feedback icons
  faCircleInfo,
  faCircleExclamation,
  faTriangleExclamation,
  faCheckCircle,
  faCircleCheck,
  faCircle,

  // Actions
  faPenToSquare,
  faTrash,
  faUpload,
  faFileImport,
  faPaperPlane,
  faReply,
  faSmile,
  faPlay,
  faBan,
  faUndo,
  faPowerOff,

  // Navigation/layout
  faHouse,
  faTableColumns,
  faListCheck,
  faClipboardList,
  faClipboardCheck,
  faFolderOpen,
  faProjectDiagram,
  faSitemap,
  faCalendar,
  faCalendarDays,
  faCalendarDay,
  faCalendarWeek,
  faCalendarCheck,
  faClock,

  // User/people
  faUser,
  faUsers,

  // Content icons
  faAlignLeft,
  faFileAlt,
  faPaperclip,
  faTags,
  faCubes,
  faLayerGroup,
  faFlag,

  // Task/issue types
  faFire,
  faBug,
  faBookOpen,
  faMountain,
  faWrench,
  faLightbulb,
  faFlask,
  faCode,
  faLanguage,

  // Priority
  faAngleDoubleUp,
  faAngleUp,
  faAngleDown,

  // Status
  faCirclePlay,
  faFlagCheckered,
  faWandMagicSparkles,
  faCirclePlus,

  // Settings/system
  faSliders,
  faFilter,
  faBell,
  faEnvelope,
  faEnvelopeOpen,
  faScrewdriverWrench,
  faWaveSquare,
  faFolderPlus,
  faPalette,
  faSun,
  faMoon,

  // Rich text editor
  faBold,
  faItalic,
  faUnderline,
  faListOl,
  faListUl,

  // Auth
  faLock,

  // Misc
  faCheckDouble,

  // Comments
  faComments,
  faPen
} from '@fortawesome/free-solid-svg-icons';

/**
 * Application-wide icon registry.
 * Icons are organized by semantic purpose for easy discovery.
 */
export const Icons = {
  // ========== Common UI ==========
  /** Close/dismiss action */
  close: faXmark,
  /** Alternative close icon */
  times: faTimes,
  /** Confirm/check action */
  check: faCheck,
  /** Add/create action */
  plus: faPlus,
  /** Expand content */
  chevronDown: faChevronDown,
  /** Collapse content */
  chevronUp: faChevronUp,
  /** Previous/left navigation */
  chevronLeft: faChevronLeft,
  /** Next/right navigation */
  chevronRight: faChevronRight,
  /** Back/previous action */
  arrowLeft: faArrowLeft,
  /** Open in new window */
  externalLink: faArrowUpRightFromSquare,
  /** Alternative external link */
  externalLinkAlt: faExternalLinkAlt,
  /** View/preview action */
  eye: faEye,
  /** Search action */
  search: faSearch,
  /** Refresh action */
  refresh: faRefresh,
  /** Rotate/sync action */
  rotateRight: faRotateRight,
  /** Sync/reload action */
  sync: faArrowsRotate,
  /** Loading spinner */
  spinner: faSpinner,
  /** Drag handle */
  gripLines: faGripLinesVertical,
  /** More options menu */
  ellipsisV: faEllipsisV,

  // ========== Status/Feedback ==========
  /** Info message */
  info: faCircleInfo,
  /** Error/alert state */
  error: faCircleExclamation,
  /** Alternative warning */
  triangleExclamation: faTriangleExclamation,
  /** Success state */
  success: faCheckCircle,
  /** Alternative success */
  circleCheck: faCircleCheck,
  /** Neutral/empty circle */
  circle: faCircle,

  // ========== Actions ==========
  /** Edit action */
  edit: faPenToSquare,
  /** Delete action */
  delete: faTrash,
  /** Upload file */
  upload: faUpload,
  /** Import file */
  import: faFileImport,
  /** Send message */
  send: faPaperPlane,
  /** Reply to message */
  reply: faReply,
  /** Emoji/reaction */
  smile: faSmile,
  /** Play/start action */
  play: faPlay,
  /** Cancel/ban action */
  ban: faBan,
  /** Undo action */
  undo: faUndo,
  /** Power/toggle */
  power: faPowerOff,

  // ========== Navigation/Layout ==========
  /** Home page */
  home: faHouse,
  /** Kanban board */
  kanban: faTableColumns,
  /** Task list */
  listCheck: faListCheck,
  /** Clipboard list */
  clipboardList: faClipboardList,
  /** Clipboard check */
  clipboardCheck: faClipboardCheck,
  /** Open folder */
  folderOpen: faFolderOpen,
  /** New folder */
  folderPlus: faFolderPlus,
  /** Project diagram */
  projectDiagram: faProjectDiagram,
  /** Sitemap/hierarchy */
  sitemap: faSitemap,
  /** Calendar */
  calendar: faCalendar,
  /** Calendar with days */
  calendarDays: faCalendarDays,
  /** Single day view */
  calendarDay: faCalendarDay,
  /** Week view */
  calendarWeek: faCalendarWeek,
  /** Calendar with check */
  calendarCheck: faCalendarCheck,
  /** Clock/time */
  clock: faClock,

  // ========== User/People ==========
  /** Single user */
  user: faUser,
  /** Group of users */
  users: faUsers,

  // ========== Content Icons ==========
  /** Description/text */
  description: faAlignLeft,
  /** Document/file */
  file: faFileAlt,
  /** Attachment */
  attachment: faPaperclip,
  /** Tags/labels */
  tags: faTags,
  /** Components/modules */
  components: faCubes,
  /** Layers/groups */
  layers: faLayerGroup,
  /** Flag/priority */
  flag: faFlag,

  // ========== Issue Types ==========
  /** Problem/urgent issue */
  fire: faFire,
  /** Bug report */
  bug: faBug,
  /** Story/feature */
  story: faBookOpen,
  /** Epic/milestone */
  epic: faMountain,
  /** Technical task */
  wrench: faWrench,
  /** Improvement/idea */
  lightbulb: faLightbulb,
  /** Testing/QA */
  flask: faFlask,
  /** Code/development */
  code: faCode,
  /** Translations */
  language: faLanguage,

  // ========== Priority ==========
  /** High priority */
  priorityHigh: faAngleDoubleUp,
  /** Medium priority */
  priorityMedium: faAngleUp,
  /** Low priority */
  priorityLow: faAngleDown,

  // ========== Task Status ==========
  /** In progress */
  inProgress: faCirclePlay,
  /** Completed/finished */
  finished: faFlagCheckered,
  /** Create new */
  addCard: faCirclePlus,
  /** Magic/AI action */
  sparkles: faWandMagicSparkles,

  // ========== Settings/System ==========
  /** Preferences/adjustments */
  preferences: faSliders,
  /** Filter/funnel */
  filter: faFilter,
  /** Notifications */
  bell: faBell,
  /** Email */
  email: faEnvelope,
  /** Read email */
  emailOpen: faEnvelopeOpen,
  /** Maintenance */
  maintenance: faScrewdriverWrench,
  /** Activity/pulse */
  activity: faWaveSquare,
  /** Theme/palette */
  palette: faPalette,
  /** Light theme */
  sun: faSun,
  /** Dark theme */
  moon: faMoon,

  // ========== Rich Text Editor ==========
  /** Bold text */
  bold: faBold,
  /** Italic text */
  italic: faItalic,
  /** Underline text */
  underline: faUnderline,
  /** Ordered list */
  listOrdered: faListOl,
  /** Unordered list */
  listUnordered: faListUl,

  // ========== Read-only ==========
  /** Read-only lock */
  lock: faLock,

  // ========== Misc ==========
  /** Double check mark */
  checkDouble: faCheckDouble,
  /** Comments/discussions */
  comments: faComments,
  /** Pen/write */
  pen: faPen
} as const;

/** Re-export IconDefinition for components that need the type */
export type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

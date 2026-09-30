/**
 * Represents a comment on a task item or subtask.
 */
export interface Comment {
  /** Unique identifier. */
  id: string;

  /** Comment content in HTML format. */
  content: string;

  /** ID of the user who authored the comment. */
  authorId: string;

  /** Display name of the comment author. */
  authorName: string;

  /** Optional parent comment ID for replies. */
  parentCommentId?: string | null;

  /** Optional task item ID this comment belongs to. */
  taskItemId?: string | null;

  /** Optional subtask ID this comment belongs to. */
  subtaskId?: string | null;

  /** Whether the comment has been edited. */
  isEdited: boolean;

  /** Creation date in UTC. */
  createdAtUtc: string;

  /** Last update date in UTC. */
  updatedAtUtc?: string | null;

  /** Nested replies to this comment. */
  replies?: Comment[];

  /** Reactions on this comment. */
  reactions?: CommentReaction[];
}

/**
 * Represents an emoji reaction to a comment.
 */
export interface CommentReaction {
  /** Unique identifier. */
  id: string;

  /** Parent comment ID. */
  commentId: string;

  /** ID of the user who reacted. */
  userId: string;

  /** Emoji value. */
  emoji: string;

  /** Creation date in UTC. */
  createdAtUtc: string;
}

/**
 * Summary of reactions for a specific emoji on a comment.
 */
export interface ReactionSummary {
  /** Emoji value. */
  emoji: string;

  /** Count of users who reacted with this emoji. */
  count: number;

  /** Whether the current user has reacted with this emoji. */
  hasCurrentUserReacted: boolean;

  /** List of user IDs who reacted with this emoji. */
  userIds: string[];
}

/**
 * Payload for creating a new comment.
 */
export interface CreateCommentPayload {
  /** Comment content in HTML format. */
  content: string;

  /** Optional parent comment ID for replies. */
  parentCommentId?: string | null;

  /** Task item ID this comment belongs to. */
  taskItemId?: string | null;

  /** Subtask ID this comment belongs to. */
  subtaskId?: string | null;
}

/**
 * Payload for updating an existing comment.
 */
export interface UpdateCommentPayload {
  /** Updated comment content in HTML format. */
  content: string;
}

/**
 * Payload for toggling a reaction on a comment.
 */
export interface ToggleReactionPayload {
  /** Emoji value to react with. */
  emoji: string;
}


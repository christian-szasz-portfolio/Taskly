import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, DestroyRef, effect, inject, input, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Icons } from '../../../../core/icons/icon-registry';
import type { Comment, ReactionSummary } from '../../../../core/models/comment.interfaces';
import type { CreateCommentPayload, UpdateCommentPayload } from '../../../../core/models/comment.types';
import { CommentApiService } from '../../../../core/services/comment/comment-api.service';
import { AuthStore } from '../../../../core/state/auth.store';
import { RichTextEditorComponent } from '../../../../shared/components/rich-text-editor/rich-text-editor.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { CommentItemComponent } from '../comment-item/comment-item.component';

/**
 * Target type for comments - either a task item or a subtask.
 */
export enum CommentTarget {
  Task = 'task',
  Subtask = 'subtask'
}

/**
 * Comment section component that displays comments and allows creating/editing.
 * Supports threaded replies and emoji reactions.
 */
@Component({
  selector: 'app-comment-section',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    FontAwesomeModule,
    RichTextEditorComponent,
    SkeletonLoaderComponent,
    CommentItemComponent
  ],
  templateUrl: './comment-section.component.html',
  styleUrl: './comment-section.component.scss'
})
export class CommentSectionComponent {
  // Inputs
  public readonly targetId = input.required<string>();
  public readonly targetType = input.required<CommentTarget>();
  public readonly readonly = input(false);

  // Injected services
  private readonly commentApi = inject(CommentApiService);

  // Identifies the comment's author, nothing more. Comments sit outside the demo's create and
  // delete restrictions on purpose: the thread is the sandbox, so `readonly` (bound to !canWrite
  // by the detail page) is the only gate. See the permission matrix in AuthStore.
  private readonly authStore = inject(AuthStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Icons
  public readonly commentsIcon = Icons.comments;
  public readonly sendIcon = Icons.send;
  public readonly replyIcon = Icons.reply;
  public readonly cancelIcon = Icons.times;

  // State
  public readonly comments = signal<Comment[]>([]);
  public readonly loading = signal(false);
  public readonly submitting = signal(false);
  public readonly error = signal<string | null>(null);

  // Editor state
  public readonly editorContent = signal('');
  public readonly isEditorExpanded = signal(false);
  public readonly replyingTo = signal<Comment | null>(null);
  public readonly editingComment = signal<Comment | null>(null);

  // Computed
  public readonly currentUserId = computed(() => this.authStore.user()?.id ?? null);
  public readonly commentCount = computed(() => this.countAllComments(this.comments()));
  public readonly hasComments = computed(() => this.comments().length > 0);
  public readonly isReplying = computed(() => this.replyingTo() !== null);
  public readonly isEditing = computed(() => this.editingComment() !== null);
  public readonly editorPlaceholder = computed(() => {
    if (this.isReplying()) {
      return `Reply to ${this.replyingTo()?.authorName}...`;
    }
    if (this.isEditing()) {
      return 'Edit your comment...';
    }
    return 'Write a comment...';
  });
  public readonly submitLabel = computed(() => {
    if (this.isEditing()) {
      return 'Save changes';
    }
    if (this.isReplying()) {
      return 'Reply';
    }
    return 'Post comment';
  });

  // Load comments when target changes
  private readonly loadCommentsEffect = effect(() => {
    const id = this.targetId();
    const type = this.targetType();

    if (id && this.isBrowser) {
      this.loadComments(id, type);
    }
  });

  /**
   * Loads comments for the current target.
   */
  public loadComments(id: string, type: CommentTarget): void {
    this.loading.set(true);
    this.error.set(null);

    const request$ = type === CommentTarget.Task
      ? this.commentApi.listByTaskItem(id)
      : this.commentApi.listBySubtask(id);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (comments) => {
          this.comments.set(comments);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.error.set(this.formatError(err, 'Failed to load comments.'));
          this.loading.set(false);
        }
      });
  }

  /**
   * Expands the editor for creating a new comment.
   */
  public expandEditor(): void {
    this.isEditorExpanded.set(true);
    this.replyingTo.set(null);
    this.editingComment.set(null);
    this.editorContent.set('');
  }

  /**
   * Collapses the editor and resets state.
   */
  public collapseEditor(): void {
    this.isEditorExpanded.set(false);
    this.replyingTo.set(null);
    this.editingComment.set(null);
    this.editorContent.set('');
  }

  /**
   * Starts replying to a comment.
   */
  public startReply(comment: Comment): void {
    this.isEditorExpanded.set(true);
    this.replyingTo.set(comment);
    this.editingComment.set(null);
    this.editorContent.set('');
  }

  /**
   * Starts editing a comment.
   */
  public startEdit(comment: Comment): void {
    this.isEditorExpanded.set(true);
    this.editingComment.set(comment);
    this.replyingTo.set(null);
    this.editorContent.set(comment.content);
  }

  /**
   * Updates the editor content.
   */
  public onEditorChange(content: string): void {
    this.editorContent.set(content);
  }

  /**
   * Submits the current comment (create, reply, or edit).
   */
  public submit(): void {
    const content = this.editorContent().trim();
    if (!content) {
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    if (this.isEditing()) {
      this.updateComment(content);
    } else {
      this.createComment(content);
    }
  }

  /**
   * Handles reaction toggle on a comment.
   */
  public onReactionToggle(event: { comment: Comment; emoji: string }): void {
    this.commentApi.toggleReaction(event.comment.id, { emoji: event.emoji })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (reactions) => {
          this.updateCommentReactions(event.comment.id, reactions);
        },
        error: (err: unknown) => {
          console.error('Failed to toggle reaction:', err);
        }
      });
  }

  /**
   * Handles comment deletion.
   */
  public onDelete(comment: Comment): void {
    this.commentApi.delete(comment.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.removeCommentFromTree(comment.id);
        },
        error: (err: unknown) => {
          this.error.set(this.formatError(err, 'Failed to delete comment.'));
        }
      });
  }

  private createComment(content: string): void {
    const payload: CreateCommentPayload = {
      content,
      parentCommentId: this.replyingTo()?.id ?? null,
      taskItemId: this.targetType() === CommentTarget.Task ? this.targetId() : null,
      subtaskId: this.targetType() === CommentTarget.Subtask ? this.targetId() : null
    };

    this.commentApi.create(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (newComment) => {
          this.addCommentToTree(newComment);
          this.collapseEditor();
          this.submitting.set(false);
        },
        error: (err: unknown) => {
          this.error.set(this.formatError(err, 'Failed to create comment.'));
          this.submitting.set(false);
        }
      });
  }

  private updateComment(content: string): void {
    const editingComment = this.editingComment();
    if (!editingComment) {
      return;
    }

    const payload: UpdateCommentPayload = { content };

    this.commentApi.update(editingComment.id, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedComment) => {
          this.updateCommentInTree(updatedComment);
          this.collapseEditor();
          this.submitting.set(false);
        },
        error: (err: unknown) => {
          this.error.set(this.formatError(err, 'Failed to update comment.'));
          this.submitting.set(false);
        }
      });
  }

  private addCommentToTree(newComment: Comment): void {
    const parentId = newComment.parentCommentId;

    if (!parentId) {
      // Top-level comment
      this.comments.update(comments => [...comments, { ...newComment, replies: [] }]);
    } else {
      // Reply - find parent and add to its replies
      this.comments.update(comments => this.addReplyToParent(comments, parentId, newComment));
    }
  }

  private addReplyToParent(comments: Comment[], parentId: string, newReply: Comment): Comment[] {
    return comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies ?? []), { ...newReply, replies: [] }]
        };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: this.addReplyToParent(comment.replies, parentId, newReply)
        };
      }
      return comment;
    });
  }

  private updateCommentInTree(updatedComment: Comment): void {
    this.comments.update(comments => this.updateCommentRecursive(comments, updatedComment));
  }

  private updateCommentRecursive(comments: Comment[], updatedComment: Comment): Comment[] {
    return comments.map(comment => {
      if (comment.id === updatedComment.id) {
        return { ...updatedComment, replies: comment.replies };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: this.updateCommentRecursive(comment.replies, updatedComment)
        };
      }
      return comment;
    });
  }

  private removeCommentFromTree(commentId: string): void {
    this.comments.update(comments => this.removeCommentRecursive(comments, commentId));
  }

  private removeCommentRecursive(comments: Comment[], commentId: string): Comment[] {
    return comments
      .filter(comment => comment.id !== commentId)
      .map(comment => ({
        ...comment,
        replies: comment.replies ? this.removeCommentRecursive(comment.replies, commentId) : []
      }));
  }

  private updateCommentReactions(commentId: string, reactions: ReactionSummary[]): void {
    // Convert ReactionSummary[] back to CommentReaction[] format for the comment
    const commentReactions = reactions.flatMap(summary =>
      summary.userIds.map(userId => ({
        id: `${commentId}-${summary.emoji}-${userId}`,
        commentId,
        userId,
        emoji: summary.emoji,
        createdAtUtc: new Date().toISOString()
      }))
    );

    this.comments.update(comments => this.updateReactionsRecursive(comments, commentId, commentReactions));
  }

  private updateReactionsRecursive(comments: Comment[], commentId: string, reactions: Comment['reactions']): Comment[] {
    return comments.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, reactions };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: this.updateReactionsRecursive(comment.replies, commentId, reactions)
        };
      }
      return comment;
    });
  }

  private countAllComments(comments: Comment[]): number {
    return comments.reduce((count, comment) => {
      return count + 1 + (comment.replies ? this.countAllComments(comment.replies) : 0);
    }, 0);
  }

  private formatError(err: unknown, fallback: string): string {
    if (err instanceof Error && err.message) {
      return err.message;
    }
    return fallback;
  }
}

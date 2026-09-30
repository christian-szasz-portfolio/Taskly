import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Icons } from '../../../../core/icons/icon-registry';
import type { Comment } from '../../../../core/models/comment.interfaces';
import { CommentReactionsComponent } from '../comment-reactions/comment-reactions.component';
import { RichTextHtmlDirective } from '../../../../shared/directives/rich-text-html.directive';

/**
 * Maximum nesting depth for comment replies.
 */
const MAX_DEPTH = 3;

/**
 * Component for displaying a single comment with its metadata, actions, and nested replies.
 */
@Component({
  selector: 'app-comment-item',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    FontAwesomeModule,
    CommentReactionsComponent,
    RichTextHtmlDirective
  ],
  templateUrl: './comment-item.component.html',
  styleUrl: './comment-item.component.scss'
})
export class CommentItemComponent {
  // Inputs
  public readonly comment = input.required<Comment>();
  public readonly currentUserId = input<string | null>(null);
  public readonly depth = input(0);
  public readonly readonly = input(false);

  // Outputs
  public readonly reply = output<Comment>();
  public readonly edit = output<Comment>();
  public readonly delete = output<Comment>();
  public readonly toggleReaction = output<{ comment: Comment; emoji: string }>();

  // Icons
  public readonly replyIcon = Icons.reply;
  public readonly editIcon = Icons.pen;
  public readonly deleteIcon = Icons.delete;
  public readonly menuIcon = Icons.ellipsisV;
  public readonly emojiIcon = Icons.smile;

  // Computed
  public readonly isOwner = computed(() => {
    const userId = this.currentUserId();
    const authorId = this.comment().authorId;
    return userId !== null && userId === authorId;
  });

  public readonly hasReplies = computed(() => {
    const replies = this.comment().replies;
    return replies && replies.length > 0;
  });

  public readonly canNest = computed(() => this.depth() < MAX_DEPTH);

  public readonly nextDepth = computed(() => Math.min(this.depth() + 1, MAX_DEPTH));

  public readonly formattedDate = computed(() => {
    const date = new Date(this.comment().createdAtUtc);
    return this.formatRelativeTime(date);
  });

  public readonly editedLabel = computed(() => {
    if (!this.comment().isEdited) {
      return null;
    }
    return '(edited)';
  });

  public readonly authorInitials = computed(() => {
    const name = this.comment().authorName || 'U';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  });

  /**
   * Handles reply button click.
   */
  public onReply(): void {
    this.reply.emit(this.comment());
  }

  /**
   * Handles edit button click.
   */
  public onEdit(): void {
    this.edit.emit(this.comment());
  }

  /**
   * Handles delete button click.
   */
  public onDelete(): void {
    this.delete.emit(this.comment());
  }

  /**
   * Handles emoji reaction toggle.
   */
  public onToggleReaction(emoji: string): void {
    this.toggleReaction.emit({ comment: this.comment(), emoji });
  }

  /**
   * Propagates reply event from nested comments.
   */
  public onNestedReply(comment: Comment): void {
    this.reply.emit(comment);
  }

  /**
   * Propagates edit event from nested comments.
   */
  public onNestedEdit(comment: Comment): void {
    this.edit.emit(comment);
  }

  /**
   * Propagates delete event from nested comments.
   */
  public onNestedDelete(comment: Comment): void {
    this.delete.emit(comment);
  }

  /**
   * Propagates reaction toggle event from nested comments.
   */
  public onNestedToggleReaction(event: { comment: Comment; emoji: string }): void {
    this.toggleReaction.emit(event);
  }

  private formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return 'just now';
    }
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    }
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
}

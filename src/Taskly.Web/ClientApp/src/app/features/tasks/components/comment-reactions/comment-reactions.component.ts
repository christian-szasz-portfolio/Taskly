import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Icons } from '../../../../core/icons/icon-registry';
import type { CommentReaction } from '../../../../core/models/comment.interfaces';

/**
 * Common emoji options for reactions.
 */
export const REACTION_EMOJIS = ['👍', '👎', '❤️', '🎉', '😄', '😕', '🚀', '👀'] as const;

export type ReactionEmoji = typeof REACTION_EMOJIS[number];

/**
 * Grouped reaction data for display.
 */
interface ReactionGroup {
  emoji: string;
  count: number;
  hasCurrentUserReacted: boolean;
}

/**
 * Component for displaying and interacting with comment reactions.
 */
@Component({
  selector: 'app-comment-reactions',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    FontAwesomeModule
  ],
  templateUrl: './comment-reactions.component.html',
  styleUrl: './comment-reactions.component.scss'
})
export class CommentReactionsComponent {
  // Inputs
  public readonly reactions = input<CommentReaction[]>([]);
  public readonly currentUserId = input<string | null>(null);

  // Outputs
  public readonly toggleReaction = output<string>();

  // Icons
  public readonly emojiIcon = Icons.smile;

  // Available emojis for picker
  public readonly availableEmojis = REACTION_EMOJIS;

  // Computed
  public readonly groupedReactions = computed<ReactionGroup[]>(() => {
    const reactions = this.reactions();
    const userId = this.currentUserId();
    const groups = new Map<string, { count: number; hasCurrentUserReacted: boolean }>();

    for (const reaction of reactions) {
      const existing = groups.get(reaction.emoji);
      if (existing) {
        existing.count++;
        if (reaction.userId === userId) {
          existing.hasCurrentUserReacted = true;
        }
      } else {
        groups.set(reaction.emoji, {
          count: 1,
          hasCurrentUserReacted: reaction.userId === userId
        });
      }
    }

    return Array.from(groups.entries())
      .map(([emoji, data]) => ({
        emoji,
        count: data.count,
        hasCurrentUserReacted: data.hasCurrentUserReacted
      }))
      .sort((a, b) => b.count - a.count);
  });

  public readonly hasReactions = computed(() => this.groupedReactions().length > 0);

  /**
   * Handles clicking on an existing reaction group.
   */
  public onReactionClick(emoji: string): void {
    this.toggleReaction.emit(emoji);
  }

  /**
   * Handles picking a new emoji from the picker.
   */
  public onEmojiPick(emoji: string): void {
    this.toggleReaction.emit(emoji);
  }
}

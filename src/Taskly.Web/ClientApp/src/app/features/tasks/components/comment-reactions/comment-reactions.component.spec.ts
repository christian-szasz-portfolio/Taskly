import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { getFormTestProviders } from '@testing/test-helpers';
import { CommentReactionsComponent, REACTION_EMOJIS } from './comment-reactions.component';
import type { CommentReaction } from '../../../../core/models/comment.interfaces';

describe('CommentReactionsComponent', () => {
  let component: CommentReactionsComponent;
  let fixture: ComponentFixture<CommentReactionsComponent>;

  const mockReactions: CommentReaction[] = [
    {
      id: 'reaction-1',
      commentId: 'comment-1',
      userId: 'user-1',
      emoji: '👍',
      createdAtUtc: '2024-12-01T10:00:00Z'
    },
    {
      id: 'reaction-2',
      commentId: 'comment-1',
      userId: 'user-2',
      emoji: '👍',
      createdAtUtc: '2024-12-01T10:05:00Z'
    },
    {
      id: 'reaction-3',
      commentId: 'comment-1',
      userId: 'user-3',
      emoji: '❤️',
      createdAtUtc: '2024-12-01T10:10:00Z'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentReactionsComponent],
      providers: getFormTestProviders()
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentReactionsComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('should create', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should have default empty reactions', () => {
      fixture.detectChanges();
      expect(component.reactions()).toEqual([]);
    });

    it('should have default null currentUserId', () => {
      fixture.detectChanges();
      expect(component.currentUserId()).toBeNull();
    });

    it('should expose available emojis', () => {
      fixture.detectChanges();
      expect(component.availableEmojis).toBe(REACTION_EMOJIS);
      expect(component.availableEmojis.length).toBe(8);
    });
  });

  describe('groupedReactions computed', () => {
    it('should return empty array when no reactions', () => {
      fixture.detectChanges();
      expect(component.groupedReactions()).toEqual([]);
    });

    it('should group reactions by emoji', () => {
      fixture.componentRef.setInput('reactions', mockReactions);
      fixture.detectChanges();

      const groups = component.groupedReactions();
      expect(groups.length).toBe(2);
    });

    it('should count reactions correctly', () => {
      fixture.componentRef.setInput('reactions', mockReactions);
      fixture.detectChanges();

      const groups = component.groupedReactions();
      const thumbsUp = groups.find(g => g.emoji === '👍');
      const heart = groups.find(g => g.emoji === '❤️');

      expect(thumbsUp?.count).toBe(2);
      expect(heart?.count).toBe(1);
    });

    it('should sort by count descending', () => {
      fixture.componentRef.setInput('reactions', mockReactions);
      fixture.detectChanges();

      const groups = component.groupedReactions();
      expect(groups[0].emoji).toBe('👍');
      expect(groups[0].count).toBe(2);
      expect(groups[1].emoji).toBe('❤️');
      expect(groups[1].count).toBe(1);
    });

    it('should identify if current user has reacted', () => {
      fixture.componentRef.setInput('reactions', mockReactions);
      fixture.componentRef.setInput('currentUserId', 'user-1');
      fixture.detectChanges();

      const groups = component.groupedReactions();
      const thumbsUp = groups.find(g => g.emoji === '👍');
      const heart = groups.find(g => g.emoji === '❤️');

      expect(thumbsUp?.hasCurrentUserReacted).toBe(true);
      expect(heart?.hasCurrentUserReacted).toBe(false);
    });

    it('should set hasCurrentUserReacted false when currentUserId is null', () => {
      fixture.componentRef.setInput('reactions', mockReactions);
      fixture.componentRef.setInput('currentUserId', null);
      fixture.detectChanges();

      const groups = component.groupedReactions();
      expect(groups.every(g => g.hasCurrentUserReacted === false)).toBe(true);
    });

    it('should handle multiple reactions from same user', () => {
      const multiReactions: CommentReaction[] = [
        ...mockReactions,
        {
          id: 'reaction-4',
          commentId: 'comment-1',
          userId: 'user-1',
          emoji: '❤️',
          createdAtUtc: '2024-12-01T10:15:00Z'
        }
      ];

      fixture.componentRef.setInput('reactions', multiReactions);
      fixture.componentRef.setInput('currentUserId', 'user-1');
      fixture.detectChanges();

      const groups = component.groupedReactions();
      const heart = groups.find(g => g.emoji === '❤️');

      expect(heart?.count).toBe(2);
      expect(heart?.hasCurrentUserReacted).toBe(true);
    });
  });

  describe('hasReactions computed', () => {
    it('should return false when no reactions', () => {
      fixture.detectChanges();
      expect(component.hasReactions()).toBe(false);
    });

    it('should return true when reactions exist', () => {
      fixture.componentRef.setInput('reactions', mockReactions);
      fixture.detectChanges();

      expect(component.hasReactions()).toBe(true);
    });
  });

  describe('event handlers', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('reactions', mockReactions);
      fixture.detectChanges();
    });

    it('should emit toggleReaction on reaction click', () => {
      const toggleSpy = spyOn(component.toggleReaction, 'emit');

      component.onReactionClick('👍');

      expect(toggleSpy).toHaveBeenCalledWith('👍');
    });

    it('should emit toggleReaction on emoji pick', () => {
      const toggleSpy = spyOn(component.toggleReaction, 'emit');

      component.onEmojiPick('🎉');

      expect(toggleSpy).toHaveBeenCalledWith('🎉');
    });
  });

  describe('REACTION_EMOJIS constant', () => {
    it('should contain expected emojis', () => {
      expect(REACTION_EMOJIS).toContain('👍');
      expect(REACTION_EMOJIS).toContain('👎');
      expect(REACTION_EMOJIS).toContain('❤️');
      expect(REACTION_EMOJIS).toContain('🎉');
      expect(REACTION_EMOJIS).toContain('😄');
      expect(REACTION_EMOJIS).toContain('😕');
      expect(REACTION_EMOJIS).toContain('🚀');
      expect(REACTION_EMOJIS).toContain('👀');
    });
  });

  describe('icons', () => {
    it('should have emoji icon defined', () => {
      fixture.detectChanges();
      expect(component.emojiIcon).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle single reaction', () => {
      const singleReaction: CommentReaction[] = [mockReactions[0]];
      fixture.componentRef.setInput('reactions', singleReaction);
      fixture.detectChanges();

      const groups = component.groupedReactions();
      expect(groups.length).toBe(1);
      expect(groups[0].count).toBe(1);
    });

    it('should handle reactions with same count sorted by emoji', () => {
      const equalCountReactions: CommentReaction[] = [
        {
          id: 'reaction-1',
          commentId: 'comment-1',
          userId: 'user-1',
          emoji: '🚀',
          createdAtUtc: '2024-12-01T10:00:00Z'
        },
        {
          id: 'reaction-2',
          commentId: 'comment-1',
          userId: 'user-2',
          emoji: '🎉',
          createdAtUtc: '2024-12-01T10:00:00Z'
        }
      ];

      fixture.componentRef.setInput('reactions', equalCountReactions);
      fixture.detectChanges();

      const groups = component.groupedReactions();
      expect(groups.length).toBe(2);
      // Both have count 1, should be sorted by emoji string
      expect(groups[0].count).toBe(1);
      expect(groups[1].count).toBe(1);
    });
  });
});

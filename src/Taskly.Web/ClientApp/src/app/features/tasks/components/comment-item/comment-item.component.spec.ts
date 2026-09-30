import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { getFormTestProviders } from '@testing/test-helpers';
import { CommentItemComponent } from './comment-item.component';
import type { Comment } from '../../../../core/models/comment.interfaces';

describe('CommentItemComponent', () => {
  let component: CommentItemComponent;
  let fixture: ComponentFixture<CommentItemComponent>;

  const mockComment: Comment = {
    id: 'comment-1',
    content: '<p>Test comment content</p>',
    authorId: 'user-1',
    authorName: 'John Doe',
    parentCommentId: null,
    taskItemId: 'task-1',
    subtaskId: null,
    isEdited: false,
    createdAtUtc: new Date().toISOString(),
    updatedAtUtc: null,
    replies: [],
    reactions: []
  };

  const mockCommentWithReplies: Comment = {
    ...mockComment,
    replies: [
      {
        id: 'comment-2',
        content: '<p>Reply comment</p>',
        authorId: 'user-2',
        authorName: 'Jane Doe',
        parentCommentId: 'comment-1',
        taskItemId: 'task-1',
        subtaskId: null,
        isEdited: false,
        createdAtUtc: new Date().toISOString(),
        updatedAtUtc: null,
        replies: [],
        reactions: []
      }
    ]
  };

  const mockEditedComment: Comment = {
    ...mockComment,
    isEdited: true,
    updatedAtUtc: new Date().toISOString()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentItemComponent],
      providers: getFormTestProviders()
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentItemComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('should create', () => {
      fixture.componentRef.setInput('comment', mockComment);
      fixture.detectChanges();

      expect(component).toBeTruthy();
    });

    it('should set default depth to 0', () => {
      fixture.componentRef.setInput('comment', mockComment);
      fixture.detectChanges();

      expect(component.depth()).toBe(0);
    });

    it('should accept custom depth', () => {
      fixture.componentRef.setInput('comment', mockComment);
      fixture.componentRef.setInput('depth', 2);
      fixture.detectChanges();

      expect(component.depth()).toBe(2);
    });
  });

  describe('computed properties', () => {
    describe('isOwner', () => {
      it('should return true when currentUserId matches authorId', () => {
        fixture.componentRef.setInput('comment', mockComment);
        fixture.componentRef.setInput('currentUserId', 'user-1');
        fixture.detectChanges();

        expect(component.isOwner()).toBe(true);
      });

      it('should return false when currentUserId does not match authorId', () => {
        fixture.componentRef.setInput('comment', mockComment);
        fixture.componentRef.setInput('currentUserId', 'user-2');
        fixture.detectChanges();

        expect(component.isOwner()).toBe(false);
      });

      it('should return false when currentUserId is null', () => {
        fixture.componentRef.setInput('comment', mockComment);
        fixture.componentRef.setInput('currentUserId', null);
        fixture.detectChanges();

        expect(component.isOwner()).toBe(false);
      });
    });

    describe('hasReplies', () => {
      it('should return true when comment has replies', () => {
        fixture.componentRef.setInput('comment', mockCommentWithReplies);
        fixture.detectChanges();

        expect(component.hasReplies()).toBe(true);
      });

      it('should return false when comment has no replies', () => {
        fixture.componentRef.setInput('comment', mockComment);
        fixture.detectChanges();

        expect(component.hasReplies()).toBe(false);
      });
    });

    describe('canNest', () => {
      it('should return true when depth is less than MAX_DEPTH', () => {
        fixture.componentRef.setInput('comment', mockComment);
        fixture.componentRef.setInput('depth', 0);
        fixture.detectChanges();

        expect(component.canNest()).toBe(true);
      });

      it('should return true when depth is 2', () => {
        fixture.componentRef.setInput('comment', mockComment);
        fixture.componentRef.setInput('depth', 2);
        fixture.detectChanges();

        expect(component.canNest()).toBe(true);
      });

      it('should return false when depth equals MAX_DEPTH (3)', () => {
        fixture.componentRef.setInput('comment', mockComment);
        fixture.componentRef.setInput('depth', 3);
        fixture.detectChanges();

        expect(component.canNest()).toBe(false);
      });
    });

    describe('nextDepth', () => {
      it('should increment depth by 1', () => {
        fixture.componentRef.setInput('comment', mockComment);
        fixture.componentRef.setInput('depth', 1);
        fixture.detectChanges();

        expect(component.nextDepth()).toBe(2);
      });

      it('should cap at MAX_DEPTH', () => {
        fixture.componentRef.setInput('comment', mockComment);
        fixture.componentRef.setInput('depth', 3);
        fixture.detectChanges();

        expect(component.nextDepth()).toBe(3);
      });
    });

    describe('formattedDate', () => {
      it('should return "just now" for very recent comments', () => {
        const recentComment = {
          ...mockComment,
          createdAtUtc: new Date().toISOString()
        };
        fixture.componentRef.setInput('comment', recentComment);
        fixture.detectChanges();

        expect(component.formattedDate()).toBe('just now');
      });

      it('should return minutes ago for recent comments', () => {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const recentComment = {
          ...mockComment,
          createdAtUtc: tenMinutesAgo.toISOString()
        };
        fixture.componentRef.setInput('comment', recentComment);
        fixture.detectChanges();

        expect(component.formattedDate()).toBe('10m ago');
      });

      it('should return hours ago for comments from today', () => {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        const comment = {
          ...mockComment,
          createdAtUtc: twoHoursAgo.toISOString()
        };
        fixture.componentRef.setInput('comment', comment);
        fixture.detectChanges();

        expect(component.formattedDate()).toBe('2h ago');
      });

      it('should return days ago for recent past comments', () => {
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        const comment = {
          ...mockComment,
          createdAtUtc: threeDaysAgo.toISOString()
        };
        fixture.componentRef.setInput('comment', comment);
        fixture.detectChanges();

        expect(component.formattedDate()).toBe('3d ago');
      });
    });

    describe('editedLabel', () => {
      it('should return "(edited)" for edited comments', () => {
        fixture.componentRef.setInput('comment', mockEditedComment);
        fixture.detectChanges();

        expect(component.editedLabel()).toBe('(edited)');
      });

      it('should return null for non-edited comments', () => {
        fixture.componentRef.setInput('comment', mockComment);
        fixture.detectChanges();

        expect(component.editedLabel()).toBeNull();
      });
    });

    describe('authorInitials', () => {
      it('should return two-letter initials for full name', () => {
        fixture.componentRef.setInput('comment', mockComment);
        fixture.detectChanges();

        expect(component.authorInitials()).toBe('JD');
      });

      it('should return first two letters for single-word name', () => {
        const singleNameComment = {
          ...mockComment,
          authorName: 'Admin'
        };
        fixture.componentRef.setInput('comment', singleNameComment);
        fixture.detectChanges();

        expect(component.authorInitials()).toBe('AD');
      });

      it('should handle empty author name', () => {
        const noNameComment = {
          ...mockComment,
          authorName: ''
        };
        fixture.componentRef.setInput('comment', noNameComment);
        fixture.detectChanges();

        // Component returns 'U' as fallback, then takes first 2 chars = 'U'
        expect(component.authorInitials()).toBe('U');
      });
    });
  });

  describe('action handlers', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('comment', mockComment);
      fixture.detectChanges();
    });

    it('should emit reply event on onReply', () => {
      const replySpy = spyOn(component.reply, 'emit');

      component.onReply();

      expect(replySpy).toHaveBeenCalledWith(mockComment);
    });

    it('should emit edit event on onEdit', () => {
      const editSpy = spyOn(component.edit, 'emit');

      component.onEdit();

      expect(editSpy).toHaveBeenCalledWith(mockComment);
    });

    it('should emit delete event on onDelete', () => {
      const deleteSpy = spyOn(component.delete, 'emit');

      component.onDelete();

      expect(deleteSpy).toHaveBeenCalledWith(mockComment);
    });

    it('should emit toggleReaction event on onToggleReaction', () => {
      const toggleSpy = spyOn(component.toggleReaction, 'emit');

      component.onToggleReaction('👍');

      expect(toggleSpy).toHaveBeenCalledWith({ comment: mockComment, emoji: '👍' });
    });
  });

  describe('nested event propagation', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('comment', mockCommentWithReplies);
      fixture.detectChanges();
    });

    it('should propagate nested reply event', () => {
      const replySpy = spyOn(component.reply, 'emit');
      const nestedComment = mockCommentWithReplies.replies![0];

      component.onNestedReply(nestedComment);

      expect(replySpy).toHaveBeenCalledWith(nestedComment);
    });

    it('should propagate nested edit event', () => {
      const editSpy = spyOn(component.edit, 'emit');
      const nestedComment = mockCommentWithReplies.replies![0];

      component.onNestedEdit(nestedComment);

      expect(editSpy).toHaveBeenCalledWith(nestedComment);
    });

    it('should propagate nested delete event', () => {
      const deleteSpy = spyOn(component.delete, 'emit');
      const nestedComment = mockCommentWithReplies.replies![0];

      component.onNestedDelete(nestedComment);

      expect(deleteSpy).toHaveBeenCalledWith(nestedComment);
    });

    it('should propagate nested reaction toggle event', () => {
      const toggleSpy = spyOn(component.toggleReaction, 'emit');
      const nestedComment = mockCommentWithReplies.replies![0];
      const event = { comment: nestedComment, emoji: '❤️' };

      component.onNestedToggleReaction(event);

      expect(toggleSpy).toHaveBeenCalledWith(event);
    });
  });

  describe('icons', () => {
    it('should have all required icons defined', () => {
      fixture.componentRef.setInput('comment', mockComment);
      fixture.detectChanges();

      expect(component.replyIcon).toBeDefined();
      expect(component.editIcon).toBeDefined();
      expect(component.deleteIcon).toBeDefined();
      expect(component.menuIcon).toBeDefined();
      expect(component.emojiIcon).toBeDefined();
    });
  });
});

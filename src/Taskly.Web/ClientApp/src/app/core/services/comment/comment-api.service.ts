import { Injectable, inject } from '@angular/core';
import { type Observable, throwError } from 'rxjs';
import type { Comment, ReactionSummary } from '../../models/comment.interfaces';
import type { CreateCommentPayload, ToggleReactionPayload, UpdateCommentPayload } from '../../models/comment.types';
import { Guid } from '../../utilities/global.utility';
import { DemoDataService } from '../demo/demo-data.service';
import { demoResponse } from '../demo/demo-seed';

const COMMENTS_KEY = 'comments';
const DEMO_AUTHOR_ID = 'demo-user';
const DEMO_AUTHOR_NAME = 'Demo User';

/** Comments on tasks and subtasks, kept in this browser. The one thing a visitor may create or delete. */
@Injectable({ providedIn: 'root' })
export class CommentApiService {
  private readonly demoData = inject(DemoDataService);

  private read(): Comment[] {
    return this.demoData.readCollection<Comment>(COMMENTS_KEY, () => []);
  }

  private write(items: Comment[]): void {
    this.demoData.writeCollection(COMMENTS_KEY, items);
  }

  public listByTaskItem(taskItemId: string): Observable<Comment[]> {
    return demoResponse(this.read().filter((c) => c.taskItemId === taskItemId));
  }

  public listBySubtask(subtaskId: string): Observable<Comment[]> {
    return demoResponse(this.read().filter((c) => c.subtaskId === subtaskId));
  }

  public get(id: string): Observable<Comment> {
    const item = this.read().find((c) => c.id === id);
    return item ? demoResponse(item) : throwError(() => new Error('Comment not found'));
  }

  public create(payload: CreateCommentPayload): Observable<Comment> {
    const now = new Date().toISOString();
    const comment: Comment = {
      id: Guid.newGuid(),
      content: payload.content,
      authorId: DEMO_AUTHOR_ID,
      authorName: DEMO_AUTHOR_NAME,
      parentCommentId: payload.parentCommentId ?? null,
      taskItemId: payload.taskItemId ?? null,
      subtaskId: payload.subtaskId ?? null,
      isEdited: false,
      createdAtUtc: now,
      updatedAtUtc: now,
      replies: [],
      reactions: [],
    };
    this.write([...this.read(), comment]);
    return demoResponse(comment);
  }

  public update(id: string, payload: UpdateCommentPayload): Observable<Comment> {
    let updated: Comment | undefined;
    const items = this.read().map((c) => {
      if (c.id !== id) {
        return c;
      }
      updated = { ...c, content: payload.content, isEdited: true, updatedAtUtc: new Date().toISOString() };
      return updated;
    });
    if (!updated) {
      return throwError(() => new Error('Comment not found'));
    }
    this.write(items);
    return demoResponse(updated);
  }

  public delete(id: string): Observable<void> {
    this.write(this.read().filter((c) => c.id !== id));
    return demoResponse(undefined);
  }

  public toggleReaction(commentId: string, payload: ToggleReactionPayload): Observable<ReactionSummary[]> {
    // Lightweight demo reaction toggle: track a single current-user reaction per emoji.
    const items = this.read();
    const comment = items.find((c) => c.id === commentId);
    if (!comment) {
      return throwError(() => new Error('Comment not found'));
    }
    const reactions = comment.reactions ?? [];
    const existingIndex = reactions.findIndex((r) => r.emoji === payload.emoji && r.userId === DEMO_AUTHOR_ID);
    if (existingIndex >= 0) {
      reactions.splice(existingIndex, 1);
    } else {
      reactions.push({ id: Guid.newGuid(), commentId, userId: DEMO_AUTHOR_ID, emoji: payload.emoji, createdAtUtc: new Date().toISOString() });
    }
    comment.reactions = reactions;
    this.write(items);
    return demoResponse(this.summarize(reactions));
  }

  public getReactions(commentId: string): Observable<ReactionSummary[]> {
    const comment = this.read().find((c) => c.id === commentId);
    return demoResponse(this.summarize(comment?.reactions ?? []));
  }

  private summarize(reactions: { emoji: string; userId: string }[]): ReactionSummary[] {
    const byEmoji = new Map<string, ReactionSummary>();
    for (const r of reactions) {
      const summary = byEmoji.get(r.emoji) ?? { emoji: r.emoji, count: 0, hasCurrentUserReacted: false, userIds: [] };
      summary.count += 1;
      summary.userIds.push(r.userId);
      if (r.userId === DEMO_AUTHOR_ID) {
        summary.hasCurrentUserReacted = true;
      }
      byEmoji.set(r.emoji, summary);
    }
    return [...byEmoji.values()];
  }
}

"use client"

import { useTransition, useRef } from "react"
import { formatDistanceToNow } from "date-fns"
import { Trash2 } from "lucide-react"
import { addComment, deleteComment } from "@/lib/actions"
import type { Comment } from "@/db/schema"

interface CommentThreadProps {
  resourceId: string
  comments: Comment[]
  currentUserId: string
}

export function CommentThread({
  resourceId,
  comments,
  currentUserId,
}: CommentThreadProps) {
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const body = new FormData(e.currentTarget).get("body") as string
    if (!body.trim()) return
    startTransition(async () => {
      await addComment(resourceId, body)
      formRef.current?.reset()
    })
  }

  function handleDelete(commentId: string) {
    startTransition(() => deleteComment(commentId, resourceId))
  }

  return (
    <section className="space-y-6">
      <h2 className="font-serif text-[24px] tracking-[-0.02em]">
        Comments ({comments.length})
      </h2>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="rounded-card border border-off-black/10 bg-paper-canvas p-6"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[13px] font-medium text-ink">
                  {comment.authorName}
                </span>
                <span className="ml-2 text-[12px] text-faint-text">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              {comment.authorId === currentUserId && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  disabled={isPending}
                  className="text-faint-text transition-colors hover:text-ink disabled:opacity-40"
                  aria-label="Delete comment"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <p className="mt-2 text-[15px] leading-[1.35] text-pale-stone">
              {comment.body}
            </p>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-[14px] text-faint-text">
            No comments yet. Be the first!
          </p>
        )}
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
        <textarea
          name="body"
          rows={3}
          maxLength={1000}
          placeholder="Add a comment…"
          required
          className="w-full rounded-[16px] border border-off-black/20 bg-paper-canvas p-4 text-[14px] text-ink placeholder:text-faint-text focus:border-off-black focus:outline-none"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-button bg-off-black px-6 py-3 text-[14px] text-paper-canvas transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {isPending ? "Posting…" : "Post comment"}
        </button>
      </form>
    </section>
  )
}

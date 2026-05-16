"use client"

import { useTransition } from "react"
import { toggleUpvote } from "@/lib/actions"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface UpvoteButtonProps {
  resourceId: string
  count: number
  hasVoted: boolean
}

export function UpvoteButton({ resourceId, count, hasVoted }: UpvoteButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(() => toggleUpvote(resourceId))
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "flex items-center gap-1.5 rounded-button border px-3 py-1.5 text-[14px] transition-colors",
        hasVoted
          ? "border-ink bg-ink text-paper-canvas"
          : "border-off-black text-off-black hover:bg-off-black/5",
        isPending && "opacity-50"
      )}
    >
      <ArrowUp size={14} strokeWidth={2} />
      <span>{count}</span>
    </button>
  )
}

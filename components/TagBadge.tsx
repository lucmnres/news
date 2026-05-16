import { cn } from "@/lib/utils"

interface TagBadgeProps {
  tag: string
  active?: boolean
  onClick?: () => void
  className?: string
}

export function TagBadge({ tag, active, onClick, className }: TagBadgeProps) {
  const base =
    "inline-flex items-center rounded-tag border px-3 py-0.5 text-[12px] tracking-[0.05em] transition-colors"

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={cn(
          base,
          active
            ? "border-ink bg-ink text-paper-canvas"
            : "border-off-black text-off-black hover:bg-off-black/5",
          className
        )}
      >
        {tag}
      </button>
    )
  }

  return (
    <span
      className={cn(
        base,
        "border-faint-text text-faint-text",
        className
      )}
    >
      {tag}
    </span>
  )
}

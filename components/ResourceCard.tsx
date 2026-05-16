import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ExternalLink, FileText, MessageSquare } from "lucide-react"
import { TagBadge } from "./TagBadge"
import { UpvoteButton } from "./UpvoteButton"
import type { Resource } from "@/db/schema"

interface ResourceCardProps {
  resource: Resource
  commentCount: number
  hasVoted: boolean
}

export function ResourceCard({ resource, commentCount, hasVoted }: ResourceCardProps) {
  const Icon = resource.type === "link" ? ExternalLink : FileText

  return (
    <article className="rounded-card bg-atmosphere-wash p-10 shadow-md transition-shadow hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <Icon
            size={18}
            className="mt-0.5 shrink-0 text-pale-stone"
            strokeWidth={1.5}
          />
          <div className="min-w-0">
            <Link
              href={`/r/${resource.id}`}
              className="block text-[18px] font-medium leading-snug text-ink hover:underline decoration-1 underline-offset-2"
            >
              {resource.title}
            </Link>

            {resource.note && (
              <p className="mt-1.5 line-clamp-2 text-[14px] leading-[1.3] text-pale-stone">
                {resource.note}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-faint-text">
              <span>{resource.authorName}</span>
              <span>·</span>
              <span>
                {formatDistanceToNow(new Date(resource.createdAt), {
                  addSuffix: true,
                })}
              </span>
              <span>·</span>
              <Link
                href={`/r/${resource.id}`}
                className="flex items-center gap-1 hover:text-ink"
              >
                <MessageSquare size={12} />
                {commentCount}
              </Link>
            </div>

            {resource.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {resource.tags.map((tag) => (
                  <TagBadge key={tag} tag={tag} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0">
          <UpvoteButton
            resourceId={resource.id}
            count={resource.upvotes}
            hasVoted={hasVoted}
          />
        </div>
      </div>
    </article>
  )
}

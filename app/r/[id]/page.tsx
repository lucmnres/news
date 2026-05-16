import { notFound } from "next/navigation"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ExternalLink, FileText, ArrowLeft, Trash2 } from "lucide-react"
import { db } from "@/db"
import { auth } from "@/lib/auth"
import { UpvoteButton } from "@/components/UpvoteButton"
import { CommentThread } from "@/components/CommentThread"
import { TagBadge } from "@/components/TagBadge"
import { deleteResource } from "@/lib/actions"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const resource = db.getResource(id)
  return { title: resource ? `${resource.title} — Knowledge Portal` : "Not Found" }
}

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  const userId = session?.user?.id ?? ""

  const resource = db.getResource(id)
  if (!resource) notFound()

  const resourceComments = db.getComments(id)
  const allUpvotes = db.getAllUpvotes()
  const hasVoted = allUpvotes.some((u) => u.resourceId === id && u.userId === userId)
  const isAuthor = resource.authorId === userId
  const Icon = resource.type === "link" ? ExternalLink : FileText

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[14px] text-faint-text hover:text-ink"
      >
        <ArrowLeft size={14} />
        Back to feed
      </Link>

      <article className="rounded-card bg-atmosphere-wash p-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <Icon size={20} className="mt-1 shrink-0 text-pale-stone" strokeWidth={1.5} />
            <div className="min-w-0 space-y-2">
              <h1 className="font-serif text-[28px] leading-[1.2] tracking-[-0.02em] text-ink">
                {resource.title}
              </h1>

              <div className="flex flex-wrap items-center gap-2 text-[13px] text-faint-text">
                <span>{resource.authorName}</span>
                <span>·</span>
                <span>
                  {formatDistanceToNow(resource.createdAt, { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <UpvoteButton
              resourceId={resource.id}
              count={resource.upvotes}
              hasVoted={hasVoted}
            />
            {isAuthor && (
              <form action={deleteResource.bind(null, resource.id)}>
                <button
                  type="submit"
                  className="rounded-button border border-off-black/30 p-2 text-faint-text transition-colors hover:border-ink hover:text-ink"
                  aria-label="Delete post"
                >
                  <Trash2 size={16} />
                </button>
              </form>
            )}
          </div>
        </div>

        {resource.url && (
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block truncate text-[14px] text-subtle-link underline decoration-1 underline-offset-2 hover:opacity-70"
          >
            {resource.url}
          </a>
        )}

        {resource.note && (
          <p className="mt-6 text-[16px] leading-[1.35] text-pale-stone">
            {resource.note}
          </p>
        )}

        {resource.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-1.5">
            {resource.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}
      </article>

      <CommentThread
        resourceId={resource.id}
        comments={resourceComments}
        currentUserId={userId}
      />
    </div>
  )
}

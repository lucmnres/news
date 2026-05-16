import { Suspense } from "react"
import { desc, asc, sql, eq } from "drizzle-orm"
import { db } from "@/db"
import { resources, comments, upvotes } from "@/db/schema"
import { auth } from "@/lib/auth"
import { ResourceCard } from "@/components/ResourceCard"
import { FeedFilters } from "@/components/FeedFilters"

const SORT_OPTIONS = [
  { value: "date", label: "Latest" },
  { value: "upvotes", label: "Top" },
]

interface SearchParams {
  sort?: string
  tag?: string
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { sort, tag } = await searchParams
  const session = await auth()
  const userId = session?.user?.id ?? ""

  const allResourceRows = await db
    .select({ tags: resources.tags })
    .from(resources)

  const allTags = Array.from(
    new Set(allResourceRows.flatMap((r) => r.tags))
  ).sort()

  const query = db
    .select({
      resource: resources,
      commentCount: sql<number>`count(distinct ${comments.id})`.as("comment_count"),
      hasVoted: sql<boolean>`bool_or(${upvotes.userId} = ${userId})`.as("has_voted"),
    })
    .from(resources)
    .leftJoin(comments, eq(comments.resourceId, resources.id))
    .leftJoin(upvotes, eq(upvotes.resourceId, resources.id))
    .groupBy(resources.id)

  const rows = await query
    .orderBy(
      sort === "upvotes"
        ? desc(resources.upvotes)
        : desc(resources.createdAt)
    )

  const filtered = tag
    ? rows.filter((r) => r.resource.tags.includes(tag))
    : rows

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-serif text-[40px] leading-[1.2] tracking-[-0.02em]">
          Knowledge Feed
        </h1>
      </div>

      <Suspense>
        <FeedFilters allTags={allTags} sortOptions={SORT_OPTIONS} />
      </Suspense>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-[15px] text-faint-text">
          Nothing here yet.{" "}
          <a href="/submit" className="underline decoration-1 underline-offset-2 hover:text-ink">
            Be the first to share something.
          </a>
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1">
          {filtered.map(({ resource, commentCount, hasVoted }) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              commentCount={Number(commentCount)}
              hasVoted={Boolean(hasVoted)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

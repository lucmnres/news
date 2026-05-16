"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { TagBadge } from "./TagBadge"

interface FeedFiltersProps {
  allTags: string[]
  sortOptions: Array<{ value: string; label: string }>
}

export function FeedFilters({ allTags, sortOptions }: FeedFiltersProps) {
  const router = useRouter()
  const params = useSearchParams()
  const activeTag = params.get("tag") ?? ""
  const activeSort = params.get("sort") ?? "date"

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    router.push(`/?${next.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex gap-1">
        {sortOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setParam("sort", opt.value)}
            className={
              activeSort === opt.value
                ? "rounded-button bg-off-black px-4 py-2 text-[13px] text-paper-canvas"
                : "rounded-button border border-off-black px-4 py-2 text-[13px] text-off-black hover:bg-off-black/5"
            }
          >
            {opt.label}
          </button>
        ))}
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {allTags.map((tag) => (
            <TagBadge
              key={tag}
              tag={tag}
              active={activeTag === tag}
              onClick={() => setParam("tag", activeTag === tag ? "" : tag)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

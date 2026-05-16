"use client"

import { useState, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import { createResource } from "@/lib/actions"
import { Link2, FileText } from "lucide-react"

export function SubmitForm() {
  const [type, setType] = useState<"link" | "file">("link")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault()
      const tag = tagInput.trim().toLowerCase()
      if (!tags.includes(tag)) setTags((prev) => [...prev, tag])
      setTagInput("")
    }
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const data = new FormData(e.currentTarget)
    data.set("type", type)
    data.set("tags", tags.join(","))

    startTransition(async () => {
      try {
        await createResource(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong")
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {/* Type toggle */}
      <div className="flex gap-2">
        {(["link", "file"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex items-center gap-2 rounded-button border px-5 py-3 text-[14px] capitalize transition-colors ${
              type === t
                ? "border-ink bg-ink text-paper-canvas"
                : "border-off-black text-off-black hover:bg-off-black/5"
            }`}
          >
            {t === "link" ? (
              <Link2 size={15} strokeWidth={1.5} />
            ) : (
              <FileText size={15} strokeWidth={1.5} />
            )}
            {t}
          </button>
        ))}
      </div>

      {/* URL or File */}
      {type === "link" ? (
        <div className="space-y-1.5">
          <label className="block text-[13px] text-pale-stone" htmlFor="url">
            URL *
          </label>
          <input
            id="url"
            name="url"
            type="url"
            placeholder="https://…"
            required
            className="w-full rounded-[16px] border border-off-black/20 bg-paper-canvas px-4 py-3 text-[15px] text-ink placeholder:text-faint-text focus:border-off-black focus:outline-none"
          />
        </div>
      ) : (
        <div className="space-y-1.5">
          <label className="block text-[13px] text-pale-stone" htmlFor="file">
            File * (max 10 MB)
          </label>
          <input
            id="file"
            name="file"
            type="file"
            required
            className="w-full rounded-[16px] border border-off-black/20 bg-paper-canvas px-4 py-3 text-[14px] text-ink file:mr-4 file:rounded-button file:border-0 file:bg-off-black file:px-3 file:py-1 file:text-[13px] file:text-paper-canvas focus:border-off-black focus:outline-none"
          />
        </div>
      )}

      {/* Title */}
      <div className="space-y-1.5">
        <label className="block text-[13px] text-pale-stone" htmlFor="title">
          Title *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="Give it a clear, descriptive title"
          required
          maxLength={200}
          className="w-full rounded-[16px] border border-off-black/20 bg-paper-canvas px-4 py-3 text-[15px] text-ink placeholder:text-faint-text focus:border-off-black focus:outline-none"
        />
      </div>

      {/* Note */}
      <div className="space-y-1.5">
        <label className="block text-[13px] text-pale-stone" htmlFor="note">
          Why is this interesting?{" "}
          <span className="text-faint-text">(optional)</span>
        </label>
        <textarea
          id="note"
          name="note"
          rows={4}
          maxLength={2000}
          placeholder="Share what caught your attention…"
          className="w-full rounded-[16px] border border-off-black/20 bg-paper-canvas px-4 py-3 text-[15px] text-ink placeholder:text-faint-text focus:border-off-black focus:outline-none"
        />
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <label className="block text-[13px] text-pale-stone">
          Tags <span className="text-faint-text">(optional — press Enter or comma)</span>
        </label>
        <div className="flex flex-wrap items-center gap-2 rounded-[16px] border border-off-black/20 bg-paper-canvas px-4 py-3 focus-within:border-off-black">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-tag border border-faint-text px-3 py-0.5 text-[12px] text-faint-text"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-0.5 text-faint-text hover:text-ink"
              >
                ×
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={addTag}
            placeholder={tags.length === 0 ? "ai, research, tools…" : ""}
            className="flex-1 min-w-[120px] bg-transparent text-[14px] text-ink placeholder:text-faint-text focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <p className="text-[13px] text-red-600">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-button bg-off-black px-8 py-4 text-[15px] text-paper-canvas transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {isPending ? "Publishing…" : "Publish"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-button border border-off-black px-8 py-4 text-[15px] text-off-black transition-opacity hover:opacity-70"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

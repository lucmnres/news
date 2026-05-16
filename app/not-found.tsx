import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
      <h1 className="font-serif text-[80px] leading-[1.2] tracking-[-0.02em] text-ink">
        404
      </h1>
      <p className="text-[18px] text-pale-stone">This page doesn't exist.</p>
      <Link
        href="/"
        className="rounded-button border border-off-black px-8 py-4 text-[15px] text-off-black hover:bg-off-black/5"
      >
        Back to feed
      </Link>
    </div>
  )
}

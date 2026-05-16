"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"

export function NavBar() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 border-b border-off-black/10 bg-paper-canvas">
      <div className="mx-auto flex max-w-[1432px] items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-serif text-[20px] tracking-[-0.02em] text-ink"
        >
          Knowledge Portal
        </Link>

        <nav className="flex items-center gap-2">
          {session?.user ? (
            <>
              <span className="mr-2 text-[14px] text-faint-text">
                {session.user.name ?? session.user.email}
              </span>
              <Link
                href="/submit"
                className="rounded-button bg-off-black px-4 py-2 text-[14px] text-paper-canvas transition-opacity hover:opacity-80"
              >
                + Submit
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/sign-in" })}
                className="rounded-button border border-off-black px-4 py-2 text-[14px] text-off-black transition-opacity hover:opacity-70"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/sign-in"
              className="rounded-button bg-off-black px-4 py-2 text-[14px] text-paper-canvas transition-opacity hover:opacity-80"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

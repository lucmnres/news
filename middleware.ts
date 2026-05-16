import { auth } from "@/lib/auth"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isPublic =
    pathname.startsWith("/api/auth") || pathname.startsWith("/sign-in")

  if (!req.auth && !isPublic) {
    const url = new URL("/sign-in", req.url)
    url.searchParams.set("callbackUrl", pathname)
    return Response.redirect(url)
  }
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

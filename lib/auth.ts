import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      id: "dev-bypass",
      name: "Dev Bypass",
      credentials: {},
      authorize() {
        return { id: "dev-user", name: "Dev User", email: "dev@botpress.com" }
      },
    }),
  ],
  callbacks: {
    signIn({ profile, account }) {
      if (account?.provider === "dev-bypass") return true
      return profile?.email?.endsWith("@botpress.com") ?? false
    },
    jwt({ token, profile, account, user }) {
      if (account?.provider === "dev-bypass") {
        token.sub = user.id!
        token.name = user.name!
      } else if (profile) {
        token.sub = profile.sub as string
        token.name = (profile.name ?? profile.email) as string
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.sub!
      session.user.name = token.name as string
      return session
    },
  },
  pages: {
    signIn: "/sign-in",
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

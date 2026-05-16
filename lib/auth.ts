import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    signIn({ profile }) {
      return profile?.email?.endsWith("@botpress.com") ?? false
    },
    jwt({ token, profile }) {
      if (profile) {
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

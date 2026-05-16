import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"

export const authConfig: NextAuthConfig = {
  providers: [
    {
      id: "botpress",
      name: "Botpress SSO",
      type: "oidc",
      issuer: process.env.AUTH_BOTPRESS_ISSUER,
      clientId: process.env.AUTH_BOTPRESS_ID,
      clientSecret: process.env.AUTH_BOTPRESS_SECRET,
      profile(profile) {
        return {
          id: profile.sub as string,
          name: (profile.name ?? profile.preferred_username ?? profile.email) as string,
          email: profile.email as string,
          image: (profile.picture ?? null) as string | null,
        }
      },
    },
  ],
  callbacks: {
    jwt({ token, profile }) {
      if (profile) {
        token.sub = profile.sub as string
        token.name = (profile.name ?? profile.preferred_username ?? profile.email) as string
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

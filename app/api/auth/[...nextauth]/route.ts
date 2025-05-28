import NextAuth from 'next-auth'
import TwitterProvider from 'next-auth/providers/twitter'
import { SupabaseAdapter } from '@auth/supabase-adapter'

const handler = NextAuth({
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
    })
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  callbacks: {
    async session({ session, user }) {
      // Add custom fields to session
      if (session?.user) {
        session.user.id = user.id
        session.user.username = user.username
      }
      return session
    },
    async jwt({ token, user, profile }) {
      if (user) {
        token.id = user.id
        if (profile && 'username' in profile) {
          token.username = profile.username as string
        }
      }
      return token
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
})

export { handler as GET, handler as POST } 
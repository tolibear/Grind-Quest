import NextAuth from 'next-auth'
import TwitterProvider from 'next-auth/providers/twitter'
import { SupabaseAdapter } from '@auth/supabase-adapter'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const authOptions = {
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
    async session({ session, token, user }: any) {
      // Add custom fields to session
      if (session?.user) {
        session.user.id = user.id
        session.user.handle = user.username || user.email?.split('@')[0]
      }
      return session
    },
    async jwt({ token, user, account, profile }: any) {
      if (user) {
        token.id = user.id
        token.handle = profile?.username || user.email?.split('@')[0]
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
    strategy: 'jwt' as const,
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 
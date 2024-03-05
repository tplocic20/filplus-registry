import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import { useContext } from 'react'

if (process.env.GITHUB_ID == null || process.env.GITHUB_SECRET == null) {
  throw new Error('GITHUB_ID or GITHUB_SECRET is missing!')
}

declare module 'next-auth' {
  interface Session {
    accessToken: string
    user: {
      githubUsername?: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

const handler = NextAuth({
  session: {
    strategy: 'jwt',
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (
        session.user !== undefined &&
        session.user.githubUsername === undefined
      ) {
        const userIdMatch = session.user.image?.match(/u\/(\d+)/)
        if (userIdMatch !== undefined && userIdMatch !== null) {
          const userId = userIdMatch[1]

          const response = await fetch(`https://api.github.com/user/${userId}`)
          const data = await response.json()
          session.user.githubUsername = data.login
          session.accessToken = token.accessToken as string
        }
      }

      return session
    },
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
  },
})

export { handler as GET, handler as POST }

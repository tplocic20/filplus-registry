import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'

if (process.env.GITHUB_ID == null || process.env.GITHUB_SECRET == null) {
  throw new Error('GITHUB_ID or GITHUB_SECRET is missing!')
}

declare module 'next-auth' {
  interface Session {
    user: {
      githubUsername?: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async session({ session }) {
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
        }
      }

      return session
    },
  },
})

export { handler as GET, handler as POST }

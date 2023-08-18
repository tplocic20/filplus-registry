import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'

if (process.env.GITHUB_ID == null || process.env.GITHUB_SECRET == null) {
  throw new Error('GITHUB_ID or GITHUB_SECRET is missing!')
}

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
})

export { handler as GET, handler as POST }

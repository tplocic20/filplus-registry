import NextAuth from 'next-auth'
import GithubProvider, { GithubProfile } from 'next-auth/providers/github'
import { useContext } from 'react'

if (process.env.GITHUB_ID == null || process.env.GITHUB_SECRET == null) {
  throw new Error('GITHUB_ID or GITHUB_SECRET is missing!')
}

declare module 'next-auth' {
  interface Session {
    accessToken: string
    user: {
      name?: string
      githubUsername?: string
      image?: string | null
    }
  }
  
  interface Profile {
    login: string;
  }

  interface Token {
    login: string;
    accessToken: string;
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
      profile(profile: GithubProfile) {
        return {
          id: profile.id.toString(),
          name: profile.name,
          userName: profile.login,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      if (
        session.user !== undefined &&
        session.user.githubUsername === undefined
      ) {
        const userIdMatch = session.user.image?.match(/u\/(\d+)/)
        if (userIdMatch !== undefined && userIdMatch !== null) {
          const userId = userIdMatch[1]

          if (!token.login) {
            try {
              var response = await fetch(`https://api.github.com/user/${userId}`, {
                headers: {
                  Authorization: `Bearer ${token.accessToken}`
                }
              })
              var data = await response.json()
            } catch (e) {
              console.log('github api profile fetch err: ', e)
            }
          }
          session.user.githubUsername = token.login as string || data.login;
          session.accessToken = token.accessToken as string
        }
      }

      return session
    },
    async jwt({ token, account, user, profile }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
      }

      if (profile)
        token.login = profile.login;
      return token
    },
  },
})

export { handler as GET, handler as POST }

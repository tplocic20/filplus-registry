import { getSession } from 'next-auth/react'

export const getAccessToken = async (): Promise<string | null> => {
  const session = await getSession()
  return session?.accessToken ?? null
}

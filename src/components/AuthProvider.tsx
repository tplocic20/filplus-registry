'use client'
import { type ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'

interface AuthProviderProps {
  children: ReactNode
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }: any) => {
  return <SessionProvider>{children}</SessionProvider>
}

export default AuthProvider

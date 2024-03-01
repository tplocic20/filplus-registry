'use client'
import { signIn, useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import { Github } from 'lucide-react'
import UserNav from './UserNav'
import Image from 'next/image'

const Navbar: React.FC = () => {
  const session = useSession()

  return (
    <div className="h-16 shadow-md flex items-center px-12 justify-between">
      <Link href="/">
        <Image
          src="/filplus-logo.png"
          width="150"
          height="50"
          alt="filecoin plus logo"
        />
      </Link>

      <div>
        {session.status !== 'authenticated' ? (
          <Button onClick={() => void signIn('github')}>
            <Github className="mr-2 h-4 w-4" /> Login with Github
          </Button>
        ) : (
          <UserNav />
        )}
      </div>
    </div>
  )
}

export default Navbar

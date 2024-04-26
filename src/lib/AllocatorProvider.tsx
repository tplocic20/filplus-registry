'use client'
import { type Allocator } from '@/type'
import React, { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { getAllocators } from './apiClient'
import { useQuery } from 'react-query'
import { useSession } from 'next-auth/react'

// Define the shape of your context data for TypeScript
interface AllocatorContextType {
  allocators: Allocator[] // Specify a more specific type instead of any if possible
  setAllocators: React.Dispatch<React.SetStateAction<Allocator[]>> // Adjust the type as needed
  selectedAllocator: Allocator | undefined | 'all'
  setSelectedAllocator: React.Dispatch<
    React.SetStateAction<Allocator | undefined | 'all'>
  > // Adjust the type as needed
}

// Provide a default value matching the structure
const defaultContextValue: AllocatorContextType = {
  allocators: [], // Initial data value
  setAllocators: () => {}, // No-op function for initialization
  selectedAllocator: undefined,
  setSelectedAllocator: () => {},
}

interface AllocatorProviderProps {
  children: ReactNode // This types 'children' to accept any valid React node
  // Other props here
}

const AllocatorContext =
  createContext<AllocatorContextType>(defaultContextValue)

export const AllocatorProvider: React.FunctionComponent<
  AllocatorProviderProps
> = ({ children }): React.ReactElement => {
  const [allocators, setAllocators] = useState<Allocator[]>([])
  const [selectedAllocator, setSelectedAllocator] = useState<
    Allocator | 'all'
  >()
  const session = useSession()

  const { data: allocatorsData } = useQuery({
    queryKey: ['allocator'],
    queryFn: getAllocators,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (!allocatorsData || !session?.data?.user?.githubUsername) return
    const githubUsername = session.data.user.githubUsername.toLowerCase()

    const allocatorsDataParsed = allocatorsData
      .map((e) => ({
        ...e,
        verifiers_gh_handles: (e.verifiers_gh_handles as string)
          ?.replace(/\s/g, '')
          .split(',')
          .map((el) => el.toLowerCase()),
      }))
      .filter((e) =>
        e.verifiers_gh_handles
          ? e.verifiers_gh_handles
              .map((handle) => handle.trim().toLowerCase())
              .includes(githubUsername)
          : false,
      )
    setAllocators(allocatorsDataParsed)
  }, [allocatorsData, session?.data?.user?.githubUsername])

  return (
    <AllocatorContext.Provider
      value={{
        allocators,
        setAllocators,
        selectedAllocator,
        setSelectedAllocator,
      }}
    >
      {children}
    </AllocatorContext.Provider>
  )
}

export const useAllocator = (): AllocatorContextType =>
  useContext(AllocatorContext)

'use client'
import { Allocator } from '@/type';
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { getAllocators } from './apiClient';
import { useQuery } from 'react-query';
import { useSession } from 'next-auth/react';

// Define the shape of your context data for TypeScript
interface AllocatorContextType {
  allocators: Array<Allocator>; // Specify a more specific type instead of any if possible
  setAllocators: React.Dispatch<React.SetStateAction<any>>; // Adjust the type as needed
}

// Provide a default value matching the structure
const defaultContextValue: AllocatorContextType = {
  allocators: [], // Initial data value
  setAllocators: () => {}, // No-op function for initialization
};

interface AllocatorProviderProps {
  children: ReactNode; // This types 'children' to accept any valid React node
  // Other props here
}

const AllocatorContext = createContext<AllocatorContextType>(defaultContextValue);

export const AllocatorProvider: React.FunctionComponent<AllocatorProviderProps> = ({ children }) => {
  const [allocators, setAllocators] = useState<any>(null); // Adjust the type as needed
  const session = useSession()

  const { data: allocatorsData, isLoading: allocatorsLoading, error: allocatorsError } = useQuery({
    queryKey: ['allocator'],
    queryFn: getAllocators
  })

  useEffect(() => {
    if (!allocatorsData || !session?.data?.user?.githubUsername) return;

    const allocatorsDataParsed = allocatorsData.filter((e) => e.verifiers_gh_handles.split(',').map((e) => e.trim().toLowerCase()).includes(session.data.user.githubUsername?.toLowerCase()!))

    setAllocators(allocatorsDataParsed);
  }, [allocatorsData, session?.data?.user?.githubUsername])

  return (
    <AllocatorContext.Provider value={{ allocators, setAllocators }}>
      {children}
    </AllocatorContext.Provider>
  );
};

export const useAllocator = () => useContext(AllocatorContext);